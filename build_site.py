#!/usr/bin/env python3
"""Assemble the Builder Series static site into ./site.

Run from the project root:  python3 build_site.py
Pages that already exist (decks, report, notes, proposal) are copied with their
image paths rewritten; the campaign-kit pages are generated from the source
text and CSV files so they stay in sync with the kit itself.
"""
import csv
import html
import os
import re
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(ROOT, "site")
KIT = os.path.join(ROOT, "GoHighLevel_Campaign_Kit")

GRAPHICS = [
    ("01_follow_up_hook.png", "Your next client is waiting for a reply", "Week 1 — enquiries and follow-up gaps"),
    ("05_response_owner.png", "Who owns the next reply?", "Week 1 — naming an owner"),
    ("06_one_lead.png", "Follow one enquiry. Find the gaps", "Week 1 — tracing a single lead"),
    ("02_ai_workflow_hook.png", "Give your AI a useful next step", "Week 2 — AI that does something"),
    ("07_human_handoff.png", "Good AI knows when to hand over", "Week 2 — the human handoff"),
    ("08_start_small.png", "Start with one useful workflow", "Week 2 — starting small"),
    ("03_reach_hook.png", "Reach the right people", "Week 3 — relevant reach"),
    ("09_relevance.png", "Give people a reason to reply", "Week 3 — relevance"),
    ("10_useful_followup.png", "Make your follow-up useful", "Week 3 — useful follow-up"),
    ("04_booking_hook.png", "Make it easy to take the next step", "Week 4 — easy booking"),
    ("11_measure.png", "Measure the conversations that matter", "Week 4 — measurement"),
    ("12_review.png", "Bring one workflow. Leave with a next step", "Week 4 — the review offer"),
]

CSS = """
:root{
  --ink:#08161E;--panel:#0C1F29;--ivory:#F3EFE4;
  --dim:rgba(243,239,228,.66);--dimmer:rgba(243,239,228,.42);
  --lime:#A9D046;--brass:#D8A64E;--rose:#E0776A;
  --rule:rgba(243,239,228,.13);
  --serif:"Bodoni Moda",Georgia,"Times New Roman",serif;
  --sans:"Archivo","Helvetica Neue",Arial,sans-serif;
  color-scheme:dark;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body{margin:0;background:var(--ink);color:var(--ivory);font-family:var(--sans);
  font-size:15px;line-height:1.62;-webkit-font-smoothing:antialiased}
img{max-width:100%}
[hidden]{display:none!important}
.wrap{max-width:1020px;margin:0 auto;padding:0 clamp(18px,4vw,48px);
  padding-block:clamp(30px,4vw,56px)}
.back{display:inline-block;font-size:12px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--dimmer);text-decoration:none;margin-bottom:26px;border-bottom:1px solid transparent}
.back:hover{color:var(--lime);border-bottom-color:var(--lime)}
.kicker{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--lime);
  margin:0 0 16px;font-weight:600}
h1{font-family:var(--serif);font-weight:600;font-optical-sizing:none;
  font-variation-settings:"opsz" 11;font-size:clamp(30px,4.6vw,52px);line-height:1.07;
  letter-spacing:-.016em;margin:0 0 .4em;max-width:20ch}
h2{font-family:var(--serif);font-weight:600;font-optical-sizing:none;
  font-variation-settings:"opsz" 11;font-size:clamp(21px,2.6vw,31px);line-height:1.18;
  letter-spacing:-.012em;margin:clamp(34px,4vw,52px) 0 14px;max-width:26ch}
h3{font-size:14.5px;font-weight:600;margin:26px 0 9px;color:var(--ivory)}
p{color:var(--dim);margin:0 0 1em;max-width:74ch}
.lede{font-size:clamp(15.5px,1.4vw,18px);color:var(--ivory);max-width:62ch;line-height:1.55}
a{color:var(--lime)}
strong{color:var(--ivory);font-weight:600}
code{font-family:ui-monospace,Menlo,monospace;font-size:.88em;
  background:rgba(243,239,228,.07);padding:1px 5px;border-radius:2px;color:var(--ivory)}
ul,ol{color:var(--dim);max-width:74ch;padding-left:20px;margin:0 0 1em}
li{margin-bottom:6px}li::marker{color:var(--dimmer)}
hr{border:0;border-top:1px solid var(--rule);margin:clamp(30px,4vw,48px) 0}
.meta{display:flex;flex-wrap:wrap;gap:8px 28px;font-size:12.5px;color:var(--dimmer);
  border-bottom:1px solid var(--rule);padding-bottom:22px;margin-bottom:30px}
.meta b{color:var(--ivory);font-weight:500}
.scroller{overflow-x:auto;margin:0 0 1.2em}
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;min-width:560px}
th{text-align:left;font-size:10.5px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;
  color:var(--dimmer);padding:0 16px 10px 0;border-bottom:1px solid var(--rule);vertical-align:bottom}
td{padding:11px 16px 11px 0;border-bottom:1px solid var(--rule);color:var(--dim);
  vertical-align:top;font-size:13px;line-height:1.5}
td:first-child,th:first-child{padding-left:0}
td:last-child,th:last-child{padding-right:0}
tbody tr td:first-child{color:var(--ivory);font-weight:500}
.note{border-left:2px solid var(--brass);padding-left:clamp(14px,1.7vw,20px);
  margin:0 0 1.4em;max-width:74ch}
.note .lab{display:block;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--brass);font-weight:600;margin-bottom:6px}
.note p:last-child{margin-bottom:0}
/* gallery */
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
  gap:clamp(12px,1.8vw,22px);margin:0 0 1.5em;padding:0;list-style:none;max-width:none}
.gal li{margin:0}
.gal figure{margin:0}
.gal img{display:block;width:100%;height:auto;border:1px solid var(--rule);border-radius:2px}
.gal figcaption{margin-top:9px;font-size:12px;line-height:1.4;color:var(--dim)}
.gal figcaption b{display:block;color:var(--ivory);font-weight:600;margin-bottom:2px;font-size:12.5px}
.gal figcaption span{color:var(--dimmer);font-size:11px}
/* raw copy blocks */
.doc{border-left:1px solid var(--rule);padding-left:clamp(16px,2vw,26px);max-width:80ch}
.doc h4{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--lime);
  font-weight:600;margin:28px 0 10px}
.doc h4:first-child{margin-top:0}
.doc pre{white-space:pre-wrap;word-wrap:break-word;font-family:var(--sans);
  font-size:13.5px;line-height:1.6;color:var(--dim);margin:0 0 1.2em}
footer{border-top:1px solid var(--rule);padding-top:22px;margin-top:clamp(36px,5vw,56px);
  font-size:12.5px;color:var(--dimmer)}
footer a{color:var(--dimmer);text-decoration:none;border-bottom:1px solid var(--rule)}
footer a:hover{color:var(--lime);border-bottom-color:var(--lime)}
"""

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700'
         '&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">')


def shell(title, body, depth=1, noindex=False):
    up = "../" * depth
    robots = '\n<meta name="robots" content="noindex, nofollow">' if noindex else ""
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">{robots}
<title>{html.escape(title)}</title>
{FONTS}
<link rel="stylesheet" href="{up}assets/site.css">
<link rel="stylesheet" href="{up}assets/responsive.css?v=20260923">
<script src="{up}assets/ui.js" defer></script>
<link rel="stylesheet" href="{up}assets/experience.css?v=9ae8e9a50fa8">
<script src="{up}assets/experience.js?v=23e35d625592" defer></script>
</head>
<body class="page-doc">
<div class="wrap">
{body}
<footer>The Builder Series growth partnership · prepared by Emmanuel Olimi Kasigazi ·
<a href="{up}">back to the index</a></footer>
</div>
</body>
</html>
"""


def blocks(path):
    """Split a kit text file into (heading, body) chunks on ALL-CAPS heading lines."""
    raw = open(path, encoding="utf-8-sig").read().replace("\r\n", "\n")
    out, head, buf = [], None, []
    for line in raw.split("\n"):
        st = line.strip()
        is_head = (st and len(st) < 80 and st == st.upper()
                   and re.search(r"[A-Z]", st) and not st.startswith(("•", "-", "·")))
        if is_head:
            if head or buf:
                out.append((head, "\n".join(buf).strip()))
            head, buf = st, []
        else:
            buf.append(line)
    if head or buf:
        out.append((head, "\n".join(buf).strip()))
    return [(h, b) for h, b in out if b or h]


def doc_page(title, kicker, lede, src, depth=1):
    parts = []
    for head, body in blocks(src):
        if head:
            parts.append(f"<h4>{html.escape(head.title())}</h4>")
        if body:
            parts.append(f"<pre>{html.escape(body)}</pre>")
    return shell(title, f"""<a class="back" href="{'../'*depth}kit/">← Campaign kit</a>
<p class="kicker">{html.escape(kicker)}</p>
<h1>{html.escape(title)}</h1>
<p class="lede">{lede}</p>
<hr>
<div class="doc">
{''.join(parts)}
</div>""", depth=depth)


def csv_table(path, limit=None):
    with open(path, encoding="utf-8-sig", newline="") as fh:
        rows = list(csv.reader(fh))
    if not rows:
        return ""
    head, body = rows[0], rows[1:]
    if limit:
        body = body[:limit]
    th = "".join(f"<th>{html.escape(c)}</th>" for c in head)
    trs = []
    for r in body:
        tds = "".join(f"<td>{html.escape(c)}</td>" for c in r)
        trs.append(f"<tr>{tds}</tr>")
    return (f'<div class="scroller"><table><thead><tr>{th}</tr></thead>'
            f'<tbody>{"".join(trs)}</tbody></table></div>')


def write(rel, content):
    dest = os.path.join(SITE, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    open(dest, "w", encoding="utf-8").write(content)
    print("  wrote", rel)


def main():
    os.makedirs(os.path.join(SITE, "assets"), exist_ok=True)
    write("assets/site.css", CSS.strip() + "\n")

    # ---- campaign kit landing -------------------------------------------------
    gal = "".join(
        f'<li><figure><img src="../assets/graphics/{f}" alt="{html.escape(t)}">'
        f'<figcaption><b>{html.escape(t)}</b><span>{html.escape(w)}</span></figcaption>'
        f"</figure></li>"
        for f, t, w in GRAPHICS
    )
    write("kit/index.html", shell("Campaign Kit", f"""<a class="back" href="../">← Index</a>
<p class="kicker">Month one, finished</p>
<h1>The campaign kit</h1>
<p class="lede">Everything below was built before the pitch was written. Twelve finished
graphics, a twenty-eight day calendar, eight email sequences and the full operating
playbook — none of it sent, scheduled or published. It waits for approval and branding.</p>
<div class="meta">
  <span>Proposed run <b>21 Sep – 18 Oct 2026</b></span>
  <span>Graphics <b>12 finished</b></span>
  <span>Emails <b>8 sequences</b></span>
  <span>Status <b>Nothing sent</b></span>
</div>

<h2>The twelve graphics</h2>
<p>Raster artwork at 1122×1402, built for Instagram and LinkedIn. The navy, lime and
ivory in these files is where the whole visual identity of this project came from.</p>
<ul class="gal">{gal}</ul>

<h2>What else is in the kit</h2>
<div class="scroller"><table>
<thead><tr><th>Document</th><th>What it holds</th><th>Read</th></tr></thead>
<tbody>
<tr><td>Operating playbook</td><td>Positioning, platform configuration, six workflow specs, the AI assistant brief and its ten pre-launch test cases, measurement plan</td><td><a href="playbook/">Open</a></td></tr>
<tr><td>Email sequences</td><td>Four existing-contact emails, four cold-prospect emails, plus reply, booking, reminder, no-show and recap scripts</td><td><a href="emails/">Open</a></td></tr>
<tr><td>Social captions</td><td>Twelve posts with separate Instagram and LinkedIn copy, and alt text for each</td><td><a href="captions/">Open</a></td></tr>
<tr><td>28-day calendar</td><td>Daily actions, owners and time budgets across the four weeks</td><td><a href="calendar/">Open</a></td></tr>
</tbody></table></div>

<h2>Raw files</h2>
<p>The original text, CSV and scheduling files, exactly as produced:</p>
<ul>
<li><a href="../files/Campaign_Copy_Library.txt">Campaign_Copy_Library.txt</a> — the full playbook</li>
<li><a href="../files/Emails.txt">Emails.txt</a> · <a href="../files/Social_Captions.txt">Social_Captions.txt</a> · <a href="../files/Image_Prompts.txt">Image_Prompts.txt</a></li>
<li><a href="../files/28_Day_Execution_Calendar.csv">28_Day_Execution_Calendar.csv</a> · <a href="../files/Post_Asset_Map.csv">Post_Asset_Map.csv</a></li>
<li><a href="../files/Instagram_SocialPlanner_Drafts.csv">Instagram_SocialPlanner_Drafts.csv</a> · <a href="../files/LinkedIn_Facebook_SocialPlanner_Drafts.csv">LinkedIn_Facebook_SocialPlanner_Drafts.csv</a></li>
<li><a href="../files/Review_Checklist.txt">Review_Checklist.txt</a> · <a href="../files/README.txt">README.txt</a></li>
</ul>"""))

    # ---- kit sub-pages --------------------------------------------------------
    write("kit/playbook/index.html", doc_page(
        "Operating Playbook", "The full campaign specification",
        "Positioning and offer, platform configuration, contact and tag schema, six workflow "
        "specifications, the AI assistant brief with ten pre-launch test cases, the four-week "
        "execution plan and every piece of copy it calls for.",
        os.path.join(KIT, "Campaign_Copy_Library.txt"), depth=2))

    write("kit/emails/index.html", doc_page(
        "Email Sequences", "Written, not sent",
        "Four emails for existing contacts, four for cold prospects, and the reply, booking, "
        "reminder, no-show and recap messages around them. Placeholders in brackets are "
        "deliberate — they make missing inputs obvious before anything goes out.",
        os.path.join(KIT, "Emails.txt"), depth=2))

    write("kit/captions/index.html", doc_page(
        "Social Captions", "Twelve posts, two channels",
        "Instagram and LinkedIn copy written separately for each of the twelve graphics, "
        "with alt text. Channel-specific rather than one caption reposted twice.",
        os.path.join(KIT, "Social_Captions.txt"), depth=2))

    write("kit/calendar/index.html", shell("28-Day Calendar", f"""<a class="back" href="../">← Campaign kit</a>
<p class="kicker">Daily actions and owners</p>
<h1>The 28-day execution calendar</h1>
<p class="lede">Every day of the proposed campaign with its action, owner and time budget.
Dates are proposals and can shift together.</p>
<hr>
{csv_table(os.path.join(KIT, '28_Day_Execution_Calendar.csv'))}
<p><a href="../../files/28_Day_Execution_Calendar.csv">Download the CSV</a></p>""", depth=2))

    print("\nSite built into ./site")


if __name__ == "__main__":
    main()
