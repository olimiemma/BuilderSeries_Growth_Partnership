// Run with a local static server on :4173 and Chrome remote debugging on :9222.
// Uses browser input events, not element.click(), and leaves smooth scrolling enabled.
import assert from 'node:assert/strict';
const base = process.env.DECK_TEST_BASE_URL || 'http://127.0.0.1:4173';
const debug = process.env.DECK_TEST_DEBUG_URL || 'http://127.0.0.1:9222';
const targets = await (await fetch(`${debug}/json`)).json();
const ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, {once: true}));
let sequence = 0;
const pending = new Map();
const errors = [];
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  if (!message.id) return;
  const task = pending.get(message.id);
  pending.delete(message.id);
  message.error ? task.reject(message.error) : task.resolve(message.result);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, {resolve, reject});
  ws.send(JSON.stringify({id, method, params}));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const tap = async (x, y) => {
  await send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
  await wait(60);
  await send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await wait(1100);
};
const tapControl = async selector => {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    const rect = element.getBoundingClientRect();
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    return {x, y, reachable: x > 0 && x < innerWidth && y > 0 && y < innerHeight && element.contains(document.elementFromPoint(x, y))};
  })()`);
  assert(point.reachable, `Control is outside viewport or covered: ${selector}`);
  await tap(point.x, point.y);
};
const drag = async (x, y, dx, dy) => {
  await send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
  for (let n = 1; n <= 12; n++) {
    await send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x + dx * n / 12, y: y + dy * n / 12}]});
    await wait(30);
  }
  await send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await wait(1100);
};
const visit = async route => {
  await send('Page.navigate', {url: `${base}/${route}`});
  await wait(500);
  await evaluate('document.fonts.ready');
  await evaluate("window.__touchEvents=[]; ['touchstart','touchend','click','pointerdown','pointerup'].forEach(type=>document.addEventListener(type,e=>window.__touchEvents.push({type,target:e.target.tagName,cls:e.target.className,time:performance.now(),trusted:e.isTrusted}),true))");
};
const check = async (label, expression) => {
  const passed = await evaluate(expression);
  if (!passed) console.error(await evaluate("({hash:location.hash,scroll:scrollY,current:document.querySelector('#cur')?.textContent,tops:[...document.querySelectorAll('.slide')].slice(0,3).map(s=>s.getBoundingClientRect().top),selection:getSelection().toString(),events:window.__touchEvents})"), errors);
  assert(passed, label);
  console.log(`PASS ${label}`);
};
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', {cacheDisabled: true});
  await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'no-preference'}]});
  for (const route of process.argv[2] ? [process.argv[2]] : ['short/', 'deck/']) {
    for (const [width, height] of [[320, 568], [390, 844], [844, 390], [1024, 1366]]) {
      if (process.argv[3] && width !== Number(process.argv[3])) continue;
      const label = `${route} ${width}×${height}`;
      await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: true});
      await send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 5});
      await visit(route);
      await check(`${label}: touch reading mode`, "getComputedStyle(document.body).overflow !== 'hidden' && [...document.querySelectorAll('.slide')].every(s => getComputedStyle(s).display === 'flex')");
      await tap(width * .75, Math.min(height * .4, 300));
      await check(`${label}: native slide tap advances`, "location.hash === '#2' && Math.abs(document.querySelectorAll('.slide')[1].getBoundingClientRect().top) < 4");
      await tapControl('#deck-prev');
      await check(`${label}: previous button works`, "location.hash === '#1' && scrollY < 4");
      await tapControl('#deck-next');
      await check(`${label}: next button works`, "location.hash === '#2' && document.querySelector('#cur').textContent === '2'");
      await visit(route);
      await drag(width * .45, height * .68, 0, -height * .4);
      await check(`${label}: native vertical scroll moves document`, 'scrollY > 80');
      await check(`${label}: scroll does not snap to another slide`, "[...document.querySelectorAll('.slide')].every(s => Math.abs(s.getBoundingClientRect().top) > 4)");
      const before = await evaluate('scrollY');
      await tapControl('#gridbtn');
      await check(`${label}: overview opens from touch`, "!document.querySelector('#grid').hidden && document.querySelector('#deck').inert");
      if (width <= 844) {
        await drag(width * .45, height * .68, 0, -height * .4);
        await check(`${label}: overview scrolls independently`, "document.querySelector('#grid').scrollTop > 30");
      }
      await tapControl('.grid-close');
      assert(Math.abs(await evaluate('scrollY') - before) < 4, `${label}: close restores reading position`);
      await drag(width * .45, height * .68, 0, -height * .35);
      assert(await evaluate('scrollY') > before + 50, `${label}: document scrolls after closing overview`);
      await tapControl('#gridbtn');
      // Scroll the overview using touch until its final card is visible.
      for (let attempt = 0; attempt < 18; attempt++) {
        if (await evaluate("document.querySelector('.gcell:last-child').getBoundingClientRect().bottom < innerHeight - 15")) break;
        await drag(width * .45, height * .7, 0, -height * .45);
      }
      await tapControl('.gcell:last-child');
      await check(`${label}: touch-select final slide`, "document.querySelector('#grid').hidden && document.querySelector('#cur').textContent === String(document.querySelectorAll('.slide').length) && document.querySelector('#deck-next').disabled");
      const lastPosition = await evaluate('scrollY');
      await drag(width * .45, height * .25, 0, height * .35);
      const afterBackward = await evaluate('scrollY');
      assert(afterBackward < lastPosition - 50, `${label}: backward scroll works after final selection (${lastPosition} -> ${afterBackward})`);
      await check(`${label}: toolbar and page fit viewport`, 'document.documentElement.scrollWidth <= innerWidth');
      console.log(`PASS ${label}: overview close restores scroll; selecting final slide preserves scrolling`);
    }
  }
  // Horizontal table gestures must not be mistaken for deck navigation.
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await visit('short/#5');
  const table = await evaluate(`(() => {
    const region = document.querySelectorAll('.slide')[4].querySelector('.scroller');
    region.scrollIntoView({block:'center', behavior:'instant'});
    const rect = region.getBoundingClientRect();
    return {x: rect.right - 25, y: Math.min(rect.bottom - 20, rect.top + 100)};
  })()`);
  await wait(350);
  const hash = await evaluate('location.hash');
  await drag(table.x, table.y, -220, 0);
  await check('table swipe scrolls the table', "document.querySelectorAll('.slide')[4].querySelector('.scroller').scrollLeft > 50");
  assert.equal(await evaluate('location.hash'), hash, 'table swipe must not navigate slides');
  // Return to a mouse/keyboard desktop and verify presentation mode separately.
  await send('Emulation.setTouchEmulationEnabled', {enabled: false});
  await send('Emulation.setDeviceMetricsOverride', {width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false});
  await visit('deck/');
  await send('Input.dispatchKeyEvent', {type: 'keyDown', key: 'ArrowRight'});
  await send('Input.dispatchKeyEvent', {type: 'keyUp', key: 'ArrowRight'});
  await check('desktop keyboard navigation', "document.querySelector('#cur').textContent === '2' && [...document.querySelectorAll('.slide')].filter(s => getComputedStyle(s).display !== 'none').length === 1");
  await send('Emulation.setEmulatedMedia', {media: 'print'});
  await check('print retains all slides', "[...document.querySelectorAll('.slide')].every(s => getComputedStyle(s).display === 'flex') && getComputedStyle(document.querySelector('.footrow')).display === 'none'");
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log('PASS no browser JavaScript exceptions');
} catch (error) {
  console.error(await evaluate("({url:location.href,scroll:scrollY,position:document.body.style.position,overflow:getComputedStyle(document.body).overflow,current:document.querySelector('#cur')?.textContent,lastTop:document.querySelector('.slide:last-child')?.getBoundingClientRect().top,events:window.__touchEvents?.slice(-12)})"));
  throw error;
} finally {
  await send('Emulation.setEmulatedMedia', {media: ''});
  await send('Network.setCacheDisabled', {cacheDisabled: false});
  ws.close();
}
