# Mobile UI, UX, and Interaction — Comprehensive Work Report

Started: September 21, 2026

Last amended: September 28, 2026

Scope: work performed in this collaboration on the existing Builder Series pitch site.

This is the continuing record for this work. Update this file as the implementation evolves; preserve the history of defects and corrections, refresh the current delivery status, and distinguish a completed change from a tested behavior or a verified production release.

## Current delivery status

- The mobile improvements, touch-navigation corrections, and social-style experience layer were committed and pushed to `origin/main` in two implementation commits, linked below.
- The latest implementation covered by this report is `e74888d34b50570be91ba5981205f3c8174e8e99`. The September 28 amendment expands documentation; it introduces no website-code changes.
- Nine public pages and their three authored source HTML documents received presentation changes. Five shared CSS/JavaScript assets and two persistent browser test scripts were added.
- Existing editorial wording, prices, dates, images, and existing anchor destinations were preserved. New interface controls and section shortcuts reuse the existing material.
- Historical local browser checks passed after the corrections. They do not establish a successful live deployment or testing on physical devices.
- Repository pushes were confirmed. A production URL, successful Cloudflare deployment, and the exact version served to the user's phone were not independently verified in this work. A Git push and a verified deployment are separate delivery milestones.

## Navigation

- [Work chronology and commits](#work-chronology-and-commits)
- [Page scope](#scope)
- [Page-by-page changes](#what-changed)
- [Content preservation](#content-preservation)
- [Initial verification and its limits](#verification-performed)
- [Touch-navigation audit and correction](#september-23-slide-navigation-and-scrolling-audit)
- [Engaging scrolling and artwork interactions](#september-23-engaging-scrolling-and-artwork-interactions)
- [Complete file inventory](#complete-file-inventory)
- [Interaction behavior and implementation decisions](#interaction-behavior-and-implementation-decisions)
- [Issue and correction ledger](#issue-and-correction-ledger)
- [Test coverage and reproduction](#test-coverage-and-reproduction)
- [Known limits and remaining verification](#known-limits-and-remaining-verification)
- [Ongoing amendment procedure](#ongoing-amendment-procedure)

## Work chronology and commits

| Date | Work performed | Record and outcome |
| --- | --- | --- |
| September 21 | Reviewed the static site, its source files, the generator, decks, proposal, and campaign pages. Added responsive layouts, readability improvements, accessible controls, and shared scripts. | Initial viewport, DOM-interaction, screenshot, and content checks completed. Initial checks missed actual mobile slide-surface taps and normal smooth-scroll behavior. |
| September 21 | Created the original report in the project root. | Kept the report outside the published `site/` folder. |
| September 23 | Investigated the user's report that tapping and scrolling still failed. Reproduced disabled phone slide taps and blocked tablet scrolling; later reproduced a long smooth jump fighting backward touch scrolling. | Fixed the implementation and introduced browser-level touch regression tests, including the previously failing cases. |
| September 23 | Committed and pushed the responsive and touch fixes, tests, README, and report. | [`f6fbae6` — Fix mobile layouts and touch navigation across pitch site](https://github.com/olimiemma/BuilderSeries_Growth_Partnership/commit/f6fbae66ddcc85a763409a4d964fd6088fb255a3). The commit changed 19 files: 859 insertions and 298 deletions. |
| September 23 | Added Stories-style progress, section shortcuts, entrance effects, touch feedback, return-to-top controls, and the artwork viewer. | Added a second browser test suite; reviewed mobile screenshots; reran the deck suite after layering in the new UI. |
| September 23 | Committed and pushed the experience layer after the user requested a push when finished. | [`e74888d` — Add mobile storytelling effects and swipeable artwork gallery](https://github.com/olimiemma/BuilderSeries_Growth_Partnership/commit/e74888d34b50570be91ba5981205f3c8174e8e99). The commit changed 18 files with 475 insertions. |
| September 25 | User requested that the report cover everything in detail and continue to be amended. | Established this as the ongoing documentation requirement. |
| September 28 | Resumed documentation, inspected the moved local repository and the published report/commits, corrected stale delivery wording, and expanded the record. | Documentation-only amendment. Earlier browser pass results are recorded as historical evidence; no new browser test run is claimed for this amendment. |

The baseline before this collaboration's implementation changes was `d51306b` — the existing pitch site. Commit file counts overlap because both implementation commits update many of the same public pages and source documents.

**Follow-up audit: September 23, 2026.** The original checks below did not establish reliable touch navigation. They used JavaScript-triggered clicks for several interactions and enabled reduced motion for deck jumps. The user subsequently reported that mobile slide taps and scrolling still failed. The correction and stronger regression coverage are documented at the end of this report.

The site’s presentation and interaction layer was updated across all nine public pages to improve mobile reading, navigation, and touch usability. Existing page wording and link destinations were preserved.

## Scope

| Page | Path |
| --- | --- |
| Landing page | `site/index.html` |
| Short deck | `site/short/index.html` |
| Full deck | `site/deck/index.html` |
| Interactive proposal | `site/proposal/index.html` |
| Campaign kit | `site/kit/index.html` |
| Execution calendar | `site/kit/calendar/index.html` |
| Operating playbook | `site/kit/playbook/index.html` |
| Email sequences | `site/kit/emails/index.html` |
| Social captions | `site/kit/captions/index.html` |

## What changed

### Landing page

- Improved heading sizes, body text, line spacing, and contrast for supporting text.
- Changed the main destination cards to a single column on small screens, with larger text, more spacing, and rounded corners.
- Stacked secondary link descriptions and metadata on phones to prevent cramped columns.
- Increased spacing around footer links and adjusted page padding for device safe areas.
- Preserved the existing colors, typography families, and visual identity.

### Short and full decks

- Expanded scrolling reading mode to screens up to 900px wide and short landscape viewports up to 500px high.
- Increased mobile paragraph and list sizes and made columns, diagrams, statistics, and images adapt to the available width.
- Kept the existing “All slides” control available on mobile, with a fixed bottom toolbar and current-slide indicator.
- Added an icon-only close button to the slide overview. This is an interface control; no editorial copy was added.
- Improved overview keyboard focus, Escape-to-close behavior, and focus restoration. Background content becomes non-interactive while the overview is open.
- Updated slide selection and progress tracking for scrolling mode and preserved the selected slide when changing between reading and presentation layouts.
- Kept native scrolling keys available in reading mode and prevented deck shortcuts from interfering with links, buttons, and scrollable tables.
- Restricted presentation swipes to deliberate horizontal gestures outside interactive controls and tables.
- Preserved the print layout and checked that printing displays all slides while hiding the toolbar.

### Interactive proposal

- Restored access to all existing section links on mobile through a horizontally scrollable navigation row.
- Reflowed the header, brand, and existing agreement button to fit small screens.
- Added section scroll offsets so anchor destinations clear the sticky header.
- Made the header non-sticky in short landscape viewports to free reading space.
- Improved card padding, heading sizes, metrics, pricing comparisons, timeline controls, and calculator layout.
- Increased range-slider touch areas to 44px and enlarged their visible handles.
- Associated sliders with their existing labels for assistive technology.
- Added tab roles, selected states, panel associations, and keyboard navigation to the existing timeline.
- Updated the active navigation state as readers scroll.
- Preserved the revenue calculation, prices, assumptions, and existing calls to action.

### Campaign kit and reference pages

- Increased document text sizes and line spacing, including long preformatted copy blocks.
- Improved gallery spacing, image presentation, and caption readability.
- Made long filenames and other unbroken strings wrap within the page.
- Increased the usable area of back links, document links, and footer links.
- Kept wide tables inside their own scrollable containers.
- Made table scroll regions keyboard-focusable and named them using existing headings.
- Added column-header associations to tables.
- Gave the execution calendar a bounded scroll area with sticky column headings and a sticky first column, so the day remains visible while scrolling across the table.

### Shared accessibility and interaction improvements

- Added visible keyboard focus indicators.
- Improved contrast for muted text in the landing page, decks, and reference pages.
- Added reduced-motion styling across the site.
- Adjusted touch interactions and device safe-area spacing.
- Scoped responsive rules by page type so the proposal and deck layouts retain their individual styling.

## Files added in the initial mobile update

| File | Purpose |
| --- | --- |
| `site/assets/responsive.css` | Shared responsive layouts, typography, spacing, focus styles, and touch-control styling. |
| `site/assets/deck.js` | Shared navigation and overview behavior for both decks, replacing duplicated inline scripts. |
| `site/assets/ui.js` | Table accessibility, proposal navigation tracking, slider labels, and timeline keyboard behavior. |

The nine public HTML pages were updated to load these assets and identify their page type. The three authored source HTML files—`BuilderSeries_ShortDeck.html`, `BuilderSeries_Growth_Partnership.html`, and `ai_studio_code.html`—also received the relevant UI wiring.

`build_site.py` was updated so regenerated campaign-kit pages retain the responsive stylesheet and shared UI script. Running the generator twice produced identical generated output.

## Content preservation

An automated comparison against the Git baseline checked all 12 tracked HTML documents: the nine public pages and three authored source documents. It excluded style and script text and compared the remaining text and existing anchor destinations.

All 12 documents preserved their text and existing link destinations. The work did not rewrite page copy, change prices or dates, replace images, or modify downloadable PDFs, CSVs, and text files. The additions were styles, interface behavior, accessibility attributes, and UI controls. Later additions include previous/next controls, section shortcuts, reading indicators, and the artwork viewer; those are presentation and navigation features, not new editorial claims.

## Verification performed

This table records the initial implementation checks. DOM-triggered clicks and reduced-motion navigation were used in that phase, so these passes did not prove native touch behavior. The later persistent suites provide stronger evidence for the corrected behaviors.

| Check | Result |
| --- | --- |
| All nine pages at widths of 320, 390, 768, 1024, and 1440px | No page-wide horizontal overflow detected across 45 page/width combinations. |
| All nine pages with mobile viewport emulation at 320 × 568 and 844 × 390 | No page-wide horizontal overflow detected across 18 additional combinations. |
| Both deck overviews | Opening, current-slide focus, focus trapping, Escape, and focus restoration passed. |
| Both deck navigation flows | Mobile slide jumps, slide counts, desktop resizing, keyboard advancement, and overview shortcuts passed. |
| Desktop deck content | Slide content tops remained reachable. |
| Deck print media | All slides displayed; toolbar hidden. |
| Proposal timeline | Selection by click and keyboard passed. |
| Revenue calculator | Changing the starter slider updated the count and calculated revenue correctly. |
| Proposal anchor navigation | Destination cleared the sticky header. |
| Slider accessibility | Existing labels were associated; controls had at least 44px height. |
| Calendar | Horizontal scrolling stayed within its container; the first column remained sticky. |
| JavaScript | Syntax checks passed; no browser JavaScript exceptions were observed during the interaction checks. |
| Generator | Repeated generation preserved the responsive wiring and produced identical output. |
| Git whitespace check | `git diff --check` passed. |

Chrome screenshots of the mobile landing page, proposal, and short deck were also visually reviewed. That review identified and corrected a wrapping issue in the proposal badge. Interaction testing identified and corrected focus restoration when closing the slide overview.

## Delivery status and limits

The initial September 21 work was local only. It was subsequently committed and pushed in `f6fbae6`, followed by the experience update in `e74888d`. The current delivery status and commit links are recorded at the start of this report. No successful production deployment was independently confirmed.

Testing used local headless Chrome with desktop and mobile viewport emulation. Physical iOS/Android devices, Safari, Firefox, and a full assistive-technology audit were not tested. The checks support the specific results above; they are not a full accessibility-conformance certification.

Existing proposal business actions and integrations were not implemented or changed. In particular, the pre-existing “Preview Deck” buttons and kickoff confirmation behavior were outside this presentation update.

This report is stored in the project root, outside the deployed `site/` directory.

## September 23: slide navigation and scrolling audit

### What the original work missed

- The slide-surface click handler returned immediately in mobile reading mode. Tapping a slide could not advance it. The original tests exercised overview buttons, not taps on the slides themselves.
- Reading mode depended only on viewport width and height. A 1024 × 1366 touch viewport used desktop presentation mode, where the body had `overflow: hidden`. A native vertical swipe left the document at scroll position zero.
- The previous test's “touch selection” label overstated its coverage: calling `element.click()` does not test browser touch recognition, hit testing, or gestures.
- Reduced-motion testing did not exercise normal smooth-scrolling navigation.
- Chrome reused an older cached script during this audit. The revised tests explicitly disable the cache; changed asset URLs also include a version so existing clients request the corrected files.

### Corrections

- Enabled native document reading mode on devices with a coarse primary pointer and no hover, including larger touch tablets. The CSS and JavaScript now use matching conditions.
- Enabled slide-surface taps in reading mode and attached handlers directly to each slide. A tap on the left side goes back; a tap elsewhere advances.
- Added accessible, icon-only previous/next buttons to both decks, with unavailable directions disabled at the first and last slides.
- Kept vertical scrolling native. Movement and long-press guards prevent a synthesized click after a drag from accidentally advancing the deck.
- Found that a long smooth jump in the full deck could keep moving forward during a user's backward swipe. A new touch now stops that animation before native panning takes over.
- Preserved horizontal table scrolling without treating it as a deck swipe.
- Made the overview lock the background at its existing scroll position, then restore that position when closed.
- Kept the current-slide indicator and URL fragment synchronized with reading position. Programmatic smooth scrolling retains its intended destination while moving.
- Updated toolbar spacing and the reserved space below the document to accommodate the added controls.
- Versioned `responsive.css` and `deck.js` references in public pages and authored sources. Generated campaign pages preserve the stylesheet version.

### Reproducible regression coverage

The new `tests/deck-touch.mjs` uses Chrome's browser input API to send trusted touch starts, moves, and ends. It checks whether controls are actually reachable at their screen coordinates before tapping them. It does not use `element.click()` for touch interactions, and smooth scrolling stays enabled.

The suite covers both decks at 320 × 568, 390 × 844, 844 × 390, and 1024 × 1366. It checks slide taps, previous/next controls, vertical document scrolling, independent overview scrolling where needed, close-and-resume behavior, selection of the final slide, backward scrolling afterward, table swipes, and desktop keyboard/print behavior.

**Final result:** the complete suite passed on September 23 after the corrections, across all eight deck/viewport combinations. The separate horizontal-table-swipe, desktop-keyboard, and print checks passed, with no browser JavaScript exceptions. A fresh comparison confirmed that the original text and anchor destinations still match the Git baseline in all 12 tracked HTML documents. JavaScript syntax, generator consistency, and `git diff --check` also passed.

Run with a local server and a dedicated Chrome debugging instance:

```bash
python3 -m http.server 4173 --directory site
google-chrome --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/gohighlevel-test-chrome about:blank
node tests/deck-touch.mjs
```

These remain local browser-emulation tests, not physical iPhone, Android, or Safari verification. The live page URL and device/browser were requested to distinguish the local implementation from the version the user is opening. The audit itself did not verify a production deployment. Its code was subsequently committed and pushed, as recorded in the chronology.

## September 23: engaging scrolling and artwork interactions

The next update adds a social-style presentation layer while preserving the original copy, images, and anchor destinations:

- Segmented Stories-style progress tracks the current slide and reading position in both decks. Other pages get a slim reading-progress indicator.
- Sticky pill-shaped shortcuts on the landing page and campaign-kit page reuse the existing section headings and show the current section.
- Cards and selected visual blocks enter with a short, one-time animation. Content stays visible before JavaScript runs and when reduced motion is requested.
- Existing destination cards gain gradient accents, arrow cues, and touch feedback. The deck overview highlights the selected slide.
- A floating return-to-top button shows reading progress in its circular outline. A new touch can interrupt its animation immediately.
- Campaign artwork opens in a full-screen native dialog with existing captions, previous/next buttons, swipe navigation, a position counter, keyboard arrows, and Escape-to-close. Closing restores the reader's scroll position and keyboard focus.

New assets: `site/assets/experience.css` and `site/assets/experience.js`. All public pages, authored source documents, and the generator reference the versioned assets. The presentation layer adds no external JavaScript dependency.

`tests/experience-touch.mjs` checks browser-level taps and swipes, chapter navigation, gallery controls, scroll/focus restoration, landscape layout, all nine routes at 320/390/768/1440px, reduced-motion behavior, and visible gallery content with JavaScript disabled. Mobile screenshots were also reviewed. The existing deck touch suite is rerun to guard the previously repaired navigation.

Both suites passed on the final implementation, with no browser JavaScript exceptions. The 12 tracked HTML documents retain their original source text and anchor destinations, and regenerating the kit preserves the final versioned asset references. These results cover Chrome emulation; physical Safari and Android device testing remains unverified.


## Complete file inventory

### New persistent implementation and verification files

| File | Responsibility | Important behavior or dependency |
| --- | --- | --- |
| `site/assets/responsive.css` | Responsive presentation across the hub, decks, proposal, and reference documents. | Page-type selectors keep layouts separate. Includes readable typography, safe-area padding, table containment, touch controls, focus styles, reduced motion, and print adjustments. |
| `site/assets/deck.js` | Shared behavior for the short and full decks. | Replaces duplicated inline deck scripts; owns navigation, overview focus/scroll locking, touch gestures, hashes, counters, and reading-mode selection. |
| `site/assets/ui.js` | Shared accessibility and proposal behaviors. | Names table regions from existing headings, associates table columns and slider labels, adds timeline tab semantics and keyboard navigation, tracks proposal sections, and measures the sticky header. |
| `site/assets/experience.css` | Visual treatment for the engagement features. | Styles progress segments, chapter pills, reading-return button, card accents, entry animations, and the full-screen artwork dialog, including landscape, reduced-motion, and print rules. |
| `site/assets/experience.js` | Engagement interactions derived from the existing content. | Builds reading progress and shortcuts, observes reveal targets, manages the return button, and provides the artwork viewer without external JavaScript dependencies. |
| `tests/deck-touch.mjs` | Persistent native-input deck regression suite. | Connects to Chrome DevTools, sends touch gestures, checks control hit targets, exercises both decks and desktop/print behavior, and fails on assertions or browser exceptions. |
| `tests/experience-touch.mjs` | Persistent native-input experience suite. | Checks chapter jumps, artwork taps/swipes, restoration of focus and scroll, landscape layout, viewport overflow, reduced motion, and the gallery's no-JavaScript fallback. |
| `MOBILE_UI_UX_REPORT.md` | Continuing work record. | Preserves scope, history, corrections, evidence, limitations, delivery status, and the amendment procedure. |

### Existing files changed

| File or group | Change made |
| --- | --- |
| `site/index.html` | Added the hub page class and shared asset references. Existing page copy and existing links remain in place. |
| `site/short/index.html`, `site/deck/index.html` | Added the deck page class and shared assets; replaced duplicated inline navigation scripts with the shared deck script. |
| `site/proposal/index.html` | Added the proposal page class and shared asset references. Existing calculator math and business-action handlers were preserved. |
| `site/kit/index.html` | Added the document page class and shared assets. Existing artwork and captions supply the new viewer. |
| `site/kit/calendar/index.html` | Added shared presentation/accessibility assets; the calendar data remains the existing table. |
| `site/kit/playbook/index.html`, `site/kit/emails/index.html`, `site/kit/captions/index.html` | Added shared presentation/accessibility assets while preserving their document text. |
| `BuilderSeries_ShortDeck.html`, `BuilderSeries_Growth_Partnership.html` | Updated authored-source asset references and the shared navigation hook to match the site versions, using paths appropriate to the project root. |
| `ai_studio_code.html` | Updated authored proposal-source asset references and page class. |
| `build_site.py` | Updated the generated page shell to retain page classes and versioned shared assets when the campaign pages are regenerated. |
| `README.md` | Documented touch navigation, the experience features, test commands, and this continuing report. |

### Material preserved or outside the implementation

- Existing graphics were reused, not regenerated or edited.
- Existing downloadable PDFs, CSVs, and text files were not rewritten for this UI work.
- The base `site/assets/site.css` is still generated from `build_site.py`; the new layers sit alongside it. Rebuilding was checked for deterministic output.
- Research inputs, source campaign copy, community figures, commercial terms, calendar dates, and revenue assumptions were not changed.
- No campaign messages were sent, no external contacts were messaged, and no GoHighLevel account/workflow deployment was performed by this UI work.
- Unrelated untracked local documents were not included in the two implementation commits. Their presence in the project directory does not mean they were created or audited in this collaboration.
- The public report remains separate from ignored internal project records and speaker notes.

## Interaction behavior and implementation decisions

### Reading versus presentation mode

The deck script and responsive stylesheet use matching conditions. Reading mode applies when the viewport is at most 900px wide, at most 500px high, or the primary input has a coarse pointer with no hover. This last condition is what fixes larger touch tablets falling into desktop presentation mode.

In reading mode, all slides remain in document flow, and vertical movement uses the browser's ordinary page scrolling. On larger mouse/keyboard layouts, the current slide is shown in presentation mode. This is an adaptive layout change; it does not replace the slide content.

### Deck control behavior

- A slide-surface tap in approximately the left 28% of the viewport goes back; other slide-surface taps advance. In reading mode, the target is calculated from the slide tapped.
- Explicit previous/next buttons provide discoverable alternatives. They disable at the first and last slides.
- Links, buttons, tables, and horizontally scrollable regions are excluded from slide-surface advancement.
- Deliberate horizontal gestures require a substantial movement and must be more horizontal than vertical. Vertical dragging remains normal reading, and multi-touch/selection guards reduce accidental navigation.
- Touch movement and long presses suppress the follow-on synthesized click that could otherwise advance a slide after scrolling.
- A new touch stops an in-progress smooth jump before panning starts. The current reading position can therefore move backward immediately instead of fighting the animation.
- The slide counter, current overview card, progress display, and numeric URL fragment track navigation. Resizing between reading and presentation modes retains the selected slide.
- The overview uses a close control, Escape, keyboard focus containment, and an inert background. Closing restores the previous reading position; selecting an overview item focuses the chosen slide without an additional focus-induced jump.

These are implementation behaviors reviewed in source and selectively covered by the tests below. They are not a claim that every gesture variation has been exercised on every browser.

### Shared proposal and document controls

The proposal retains its original navigation labels and calculator formulas. A `ResizeObserver` supplies a header offset for anchor destinations. Timeline buttons receive tab/panel associations and support arrow keys, Home, and End. Slider names come from their existing labels. The calendar keeps its tabular structure, with scrolling constrained to its container and sticky headers/first column for orientation.

### Progress and motion

The experience script adds one top progress segment per slide on decks and a single page-reading strip elsewhere. The existing numeric deck counter remains available; the visual progress strip is decorative for assistive technology. Progress updates are scheduled through `requestAnimationFrame`, and scroll listeners are passive.

Card entries use `IntersectionObserver`, run once per observed target, and do not hide the content while waiting for JavaScript. No scroll-jacking, autoplay feed, or infinite content loading was introduced. The original navy, ivory, lime, and brass styling remains the basis of the visual treatment.

Section shortcuts on the hub and kit reuse their existing headings. The return-to-top button appears after reading begins, uses a circular progress outline, and restores focus to the page title. Reduced-motion preferences turn off decorative motion and use immediate navigation where implemented.

### Artwork viewer

Existing gallery images are placed inside accessible opening buttons. The viewer uses the native `<dialog>` element, the existing full image, and existing caption text. It has a current-position counter, previous/next controls, keyboard arrows, Escape, an explicit close control, and left/right swipe gestures. Multi-touch is excluded from slide switching so pinch interaction is not treated as a swipe.

The page behind the viewer is locked at its reading position while the dialog is open. Closing restores the body styles, scroll position, and focus to the artwork that opened it. Portrait and short-landscape layouts are styled separately. If the enhancement cannot run, the original gallery images remain in the document.

### Asset loading and rebuilds

The added files are ordinary local CSS and JavaScript; no framework migration, package installation, or external animation library was introduced. Initial responsive/deck references received a version query after stale cached JavaScript complicated the touch audit. The experience asset references use content-derived version strings.

Version references occur in deployed HTML, authored source HTML, and the generator shell. A future change to an asset must update all affected references consistently; the current generator preserves the references but does not automatically recalculate every asset's content fingerprint.

## Issue and correction ledger

| ID | Observed problem or test gap | Correction and evidence |
| --- | --- | --- |
| UI-01 | Narrow pages had cramped typography, small controls, rigid columns, and wide content. | Shared responsive rules, larger reading/control areas, wrapping, and contained tables. Initial layout checks found no page-wide overflow at the tested sizes. |
| UI-02 | Proposal navigation was hidden on smaller screens. | Kept existing links in a horizontally scrollable navigation row; tested visibility, touch-target height, and heading clearance after an anchor jump. |
| UI-03 | The proposal brand badge broke awkwardly across lines. | Prevented badge shrinking/wrapping; visually reviewed the corrected mobile screenshot. |
| UI-04 | Closing the slide overview did not always restore useful focus when the opener was the document body. | Added a fallback to the overview button and verified Escape/focus restoration in the audit. |
| UI-05 | Phone slide-surface taps did nothing. | Removed the reading-mode early return and attached handlers directly to slide surfaces. Browser-level taps now advance in the regression suite. |
| UI-06 | A 1024 × 1366 touch viewport used fixed presentation mode and did not move under vertical swipes. | Matched CSS/JS reading mode to touch capability as well as dimensions. The tablet touch case passed afterward. |
| UI-07 | Long smooth navigation in the full deck continued moving forward during a backward swipe. | A new touch cancels the animation before native panning. The previously failing final-slide/backward-scroll case passed. |
| UI-08 | Chrome reused an older script during the audit, making edits appear ineffective. | Disabled browser cache in the regression harness and versioned asset URLs. This reproduced a local test issue; it does not prove caching caused the user's unverified live-site failure. |
| UI-09 | The first validation phase used DOM `.click()` calls and reduced-motion jumps. | Replaced those claims with accurately scoped historical results and added trusted browser-input tests with smooth scrolling enabled. |
| UI-10 | A draft test looked for a table on the wrong short-deck slide. | Corrected the test to the actual table on slide five. This was a test-fixture error, not a missing content defect. |
| UI-11 | A synthetic Escape key in the gallery test did not exercise native dialog closing correctly. | Supplied a complete Escape key event, including its code and virtual-key value. Native Escape then passed without adding a product-specific workaround. |
| UI-12 | The report still said the work had never been committed or pushed. | September 28 amendment records both confirmed pushes and separately leaves production deployment unverified. |

## Test coverage and reproduction

### Evidence levels

1. **Source/content inspection:** compared source text and existing anchor destinations, reviewed the scripts/styles, and checked the changed-file inventory. This establishes what changed, not how a physical phone behaves.
2. **Initial layout/DOM checks:** 45 page/width combinations plus 18 mobile portrait/landscape combinations, screenshots, calculator/tab checks, and print-media checks. These passed their assertions but missed native-touch defects.
3. **Persistent browser-input suites:** actual Chrome input events with touch emulation and coordinate hit testing, using normal smooth scrolling. These provide the recorded regression evidence for the corrected implementation.
4. **Production and physical-device verification:** not completed in this work. Repository publication alone does not establish this evidence level.

### Deck suite

`tests/deck-touch.mjs` covers both `/short/` and `/deck/` at 320 × 568, 390 × 844, 844 × 390, and 1024 × 1366: eight route/viewport combinations. Its checks include:

- Correct reading mode and visible slides on touch devices.
- Slide-surface tap advancement and previous/next button behavior.
- Native vertical movement without an accidental snap caused by a synthesized click.
- Touch opening of the overview and independent overview scrolling when needed.
- Restoration of the exact reading position on close and continued page scrolling afterward.
- Touch selection of the final slide, disabled next control at the end, and backward scrolling after that jump.
- Toolbar/page width containment.
- A separate horizontal table swipe that must scroll the table without navigating the deck.
- Desktop keyboard advancement at 1440 × 1000 after turning off touch emulation.
- Print-media visibility of all slides and hiding of the toolbar.
- Absence of browser JavaScript exceptions during the run.

The earlier audit also checked overview focus trapping, Escape restoration, resizing with a selected slide, and related keyboard shortcuts. Do not assume every earlier one-off assertion is included in the persistent script; inspect the script when extending its coverage.

### Experience suite

`tests/experience-touch.mjs` covers chapter shortcuts, active section state, return-to-top behavior, artwork opening, caption reuse, image fit, next control, native left/right swipes, reading-position and focus restoration, continued page scrolling, keyboard gallery navigation, and Escape. It includes a landscape viewer check at 844 × 390.

It also visits all nine routes at widths of 320, 390, 768, and 1440px, using an 844px viewport height: 36 page/width combinations. It checks deck segment counts, visible reduced-motion cards, and the twelve original gallery images remaining visible with JavaScript disabled. It records mobile screenshots of the home cards and artwork viewer and fails if browser JavaScript exceptions occur.

The suite does not establish a JavaScript-free desktop deck, screenshot pixel equivalence, exhaustive accessibility conformance, or measurable conversion improvement.

### Historical outcomes

Both persistent suites passed after the final experience-layer changes on September 23. Syntax checks, whitespace checks, and generator consistency checks also passed. These runs were not repeated for the September 28 documentation-only amendment; that amendment checks documentation accuracy and repository state instead.

Temporary screenshots and initial audit scripts were created under `/tmp`. They were working artifacts, not committed evidence archives, and may no longer exist. The committed scripts and implementation commits are the durable reproduction materials. No immutable CI log bundle was created for the historical local runs.

### Reproduction commands

Run from the project root. Use a dedicated Chrome instance; both suites use the first page exposed by the debugging endpoint. Run the suites sequentially against the same instance, because concurrent runs can navigate each other's test page.

Requirements are Python 3, Google Chrome, and a Node runtime with native `fetch` and `WebSocket`; the recorded runs used Node 22. No npm dependency installation is needed for these scripts.

Terminal 1:

```bash
python3 -m http.server 4173 --directory site
```

Terminal 2:

```bash
google-chrome --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/gohighlevel-test-chrome about:blank
```

Terminal 3:

```bash
node tests/deck-touch.mjs
node tests/experience-touch.mjs
```

To isolate a deck regression:

```bash
node tests/deck-touch.mjs deck/ 320
```

Both scripts accept `DECK_TEST_BASE_URL` and `DECK_TEST_DEBUG_URL` when different server/debugging endpoints are needed. The existing environment-variable names apply to both suites.

For JavaScript syntax and patch whitespace checks:

```bash
node --check site/assets/deck.js
node --check site/assets/ui.js
node --check site/assets/experience.js
node --check tests/deck-touch.mjs
node --check tests/experience-touch.mjs
git diff --check
```

Rebuilding the kit uses `python3 build_site.py`. Check its output diff before committing. The prior determinism check compared generated-file hashes before and after a rebuild; repeated generation preserved both output and asset references.

## Known limits and remaining verification

| Area | Confirmed | Still unverified or outside scope |
| --- | --- | --- |
| Git publication | Both implementation commits were pushed to `origin/main`; local and tracking refs matched after each push. | A public-site response matching either commit was not checked. |
| Deployment | README describes a Cloudflare Pages workflow using the `site` directory. | Actual deployment/build completion, production URL, cache propagation, and the user's served revision remain unconfirmed. |
| Touch interaction | Chrome native-input emulation at the listed phone, landscape, and tablet sizes. | Physical iPhones/Android devices, iOS Safari, other mobile browsers, browser chrome behavior, and all device-specific gestures. |
| Accessibility | Focus styles, labels, tab semantics, inert/modal behavior, reduced-motion behavior, and selected keyboard checks. | Full WCAG audit, screen-reader matrix, and every contrast/zoom/keyboard scenario. |
| Performance | No added external JS dependency; passive listeners, frame-scheduled progress, one-time reveals. | Lighthouse/Core Web Vitals measurements, slow-network testing, and quantified performance improvements. |
| Engagement | The requested interaction features exist and passed the recorded functional checks. | Analytics, user studies, A/B tests, conversion-rate changes, or proof that visitors prefer the effects. |
| Business actions | Existing proposal formulas and handlers were preserved. | The pre-existing Preview Deck buttons and kickoff confirmation behavior were not turned into new backend integrations. |
| Content accuracy | Editorial text and existing links were preserved during the UI work. | Community-size discrepancies, commercial assumptions, dates, citations, and business claims were not revalidated as part of the UI task. |

If a defect is reported again, record the exact URL, browser/device, viewport/orientation, served asset versions, reproduction steps, and expected/observed behavior. Reproduce the actual input sequence before describing it as fixed. A viewport-fitting screenshot alone is not evidence that a touch control works.

## Ongoing amendment procedure

The user's standing request is to keep this report comprehensive and amend it as work continues. For each subsequent work batch:

1. Add a dated entry to the chronology and describe the requested outcome.
2. Record changes by page and file, including anything added, removed, or deliberately left outside scope.
3. Add discovered defects and their causes to the issue ledger. Keep the original failures visible after a fix.
4. Record the actual checks run, environment, result, and limitations. Separate DOM simulation, native browser input, physical-device testing, and production verification.
5. Reconfirm any content-preservation promise with an appropriate comparison. If new editorial copy is authorized later, describe that exception explicitly.
6. Refresh versioned asset references and generator instructions if affected.
7. Record commit SHA, branch, and push outcome after publication. Only mark deployment verified when there is deployment or live-response evidence.
8. Update the last-amended date and the current delivery summary. Keep old results dated rather than silently presenting them as fresh tests.
9. Keep this public implementation report free of ignored internal speaker notes, private strategy documents, or unrelated local material.

Use this entry structure for future updates:

```text
Date and request:
Problem / expected outcome:
Changes by page and file:
New UI controls or dependencies:
Content changes or preservation check:
Defects found and corrections:
Checks actually run and results:
Remaining limitations:
Commit / branch / push status:
Deployment verification, if performed:
```

### September 28 documentation amendment

Reviewed the existing report, local Git history, the two published implementation commits, source behavior, test code, and generator references. Added the delivery summary, chronology, complete file inventory, interaction details, issue ledger, evidence distinctions, reproduction instructions, known limits, and this maintenance procedure. Corrected the stale no-commit/no-push wording while retaining the distinction between repository publication and a verified live deployment. This amendment changes documentation only.
