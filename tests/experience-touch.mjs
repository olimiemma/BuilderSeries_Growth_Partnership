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
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Network.setCacheDisabled', {cacheDisabled: true});
  await send('Emulation.setEmulatedMedia', {features: [{name:'prefers-reduced-motion',value:'no-preference'}]});
  await send('Emulation.setTouchEmulationEnabled', {enabled:true,maxTouchPoints:5});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await visit('');
  await check('home chapter shortcuts use existing headings', "document.querySelectorAll('.chapter-rail a').length===3 && document.querySelector('.chapter-rail a').textContent==='Start here'");
  await evaluate("document.querySelector('.chapter-rail').scrollIntoView({block:'start',behavior:'instant'})");
  await wait(600);
  await tapControl('.chapter-rail a:nth-child(2)');
  await check('native chapter tap reaches section', "location.hash==='#chapter-2' && document.querySelector('#chapter-2').getBoundingClientRect().top>=90 && document.querySelector('#chapter-2').getBoundingClientRect().top<150");
  await check('chapter state tracks reading', "document.querySelector('.chapter-rail a:nth-child(2)').hasAttribute('aria-current')");
  await check('reading return appears and progress advances', "!document.querySelector('.reading-return').hidden && Number(document.querySelector('.reading-return').style.getPropertyValue('--read'))>0");
  await tapControl('.reading-return');
  await check('native return tap scrolls to top', 'scrollY<3');
  await visit('kit/');
  await evaluate("document.querySelector('.artwork-open').scrollIntoView({block:'center',behavior:'instant'})");
  await wait(700);
  const before=await evaluate('scrollY');
  await tapControl('.artwork-open');
  await check('native artwork tap opens viewer', "document.querySelector('.artwork-viewer').open && document.querySelector('.artwork-count').textContent==='01 / 12'");
  await check('viewer preserves existing caption', "document.querySelector('#artwork-title').textContent===document.querySelector('.gal figcaption b').textContent");
  await check('viewer image fits stage', "(()=>{const stage=document.querySelector('.artwork-stage').getBoundingClientRect();return stage.height>200&&stage.bottom<innerHeight-60})()");
  await tapControl('.artwork-next');
  await check('next artwork control works', "document.querySelector('.artwork-count').textContent==='02 / 12'");
  await drag(290,390,-210,0);
  await check('native left swipe advances artwork', "document.querySelector('.artwork-count').textContent==='03 / 12'");
  await drag(90,390,210,0);
  await check('native right swipe returns artwork', "document.querySelector('.artwork-count').textContent==='02 / 12'");
  await tapControl('.artwork-close');
  assert(Math.abs(await evaluate('scrollY')-before)<4,'closing viewer restores reading position');
  await check('closing viewer restores focus and scrolling', "!document.querySelector('.artwork-viewer').open && document.activeElement.classList.contains('artwork-open') && document.body.style.position!== 'fixed'");
  await drag(160,640,0,-300);
  assert(await evaluate('scrollY')>before+100,'page remains scrollable after viewer');
  await evaluate("document.querySelector('.artwork-open').scrollIntoView({block:'center',behavior:'instant'})"); await wait(500);
  await tapControl('.artwork-open');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight'});
  await check('gallery keyboard navigation', "document.querySelector('.artwork-count').textContent==='02 / 12'");
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await wait(200);
  await check('gallery Escape closes dialog', "!document.querySelector('.artwork-viewer').open");
  await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});
  await visit('kit/');
  await evaluate("document.querySelector('.artwork-open').scrollIntoView({block:'center',behavior:'instant'})");await wait(600);
  await tapControl('.artwork-open');
  await check('landscape gallery fits viewport', "document.querySelector('.artwork-viewer').scrollHeight<=innerHeight+2 && document.querySelector('.artwork-stage').getBoundingClientRect().width>300");
  await tapControl('.artwork-close');
  for(const width of [320,390,768,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<1000});
    for(const route of ['', 'kit/', 'proposal/', 'kit/playbook/','kit/emails/','kit/captions/','kit/calendar/','short/','deck/']){
      await visit(route);
      await check(`${route||'home'} fits ${width}px`, 'document.documentElement.scrollWidth<=innerWidth');
      if(route==='short/'||route==='deck/') await check(`${route} story segments match slide count`, "document.querySelectorAll('.story-progress > span').length===document.querySelectorAll('.slide').length");
    }
  }
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await visit('');
  await evaluate("document.querySelector('.door').scrollIntoView({behavior:'instant'})");await wait(200);
  await check('reduced motion keeps cards readable without animation', "getComputedStyle(document.querySelector('.door')).animationName==='none' && getComputedStyle(document.querySelector('.door')).opacity==='1'");
  await send('Emulation.setScriptExecutionDisabled',{value:true});
  await visit('kit/');
  await check('no-JavaScript gallery content stays visible', "document.querySelectorAll('.gal img').length===12 && getComputedStyle(document.querySelector('.gal li')).opacity==='1'");
  await send('Emulation.setScriptExecutionDisabled',{value:false});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await visit('');
  await evaluate("document.querySelector('.doors').scrollIntoView({block:'center',behavior:'instant'})");await wait(700);
  const fs=await import('node:fs/promises');
  await fs.writeFile('/tmp/gohighlevel-experience-home.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await visit('kit/');
  await evaluate("document.querySelector('.artwork-open').scrollIntoView({block:'center',behavior:'instant'})");await wait(600);await tapControl('.artwork-open');
  await fs.writeFile('/tmp/gohighlevel-experience-gallery.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await tapControl('.artwork-close');
  assert.equal(errors.length,0,JSON.stringify(errors));
  console.log('PASS no browser JavaScript exceptions');
} finally {
  await send('Emulation.setScriptExecutionDisabled',{value:false});
  await send('Network.setCacheDisabled',{cacheDisabled:false});
  ws.close();
}
