import { readFileSync, writeFileSync } from "node:fs";

const cap = JSON.parse(readFileSync(process.env.OUT + "/capture.json", "utf8"));

// next/font self-hosts under /_next/static/media, which the artifact CSP will
// not fetch. Drop those @font-face rules and let the Google Fonts link supply
// the same three families — the one font host the CSP admits.
const css = cap.css.replace(/@font-face\s*{[^}]*_next\/static\/media[^}]*}/g, "");

const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500&display=swap";

const screens = cap.screens.map((s) => ({
  id: s.id,
  label: s.label,
  route: s.route,
  state: s.state,
  html: s.html,
}));

const payload = JSON.stringify({ css, screens, fonts: GOOGLE_FONTS })
  .replace(/</g, "\\u003c")
  .replace(/\u2028/g, "\\u2028")
  .replace(/\u2029/g, "\\u2029");

const page = `<title>Shaare Tzadaka Redesign</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${GOOGLE_FONTS}">

<style>
  :root {
    --bg: #e7ebf1;
    --surface: #ffffff;
    --text: #12161c;
    --muted: #5a6472;
    --line: #c9cfd8;
    --accent: #0a3d91;
    --accent-soft: #edf3fc;
    --bezel: #1a2130;
    --shadow: 0 24px 60px rgb(12 18 28 / 0.22);
  }

  :root:not([data-theme="light"]) {
    color-scheme: light;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #0c1017;
      --surface: #151b24;
      --text: #e4e9f0;
      --muted: #8e99aa;
      --line: #263041;
      --accent: #6e9cf0;
      --accent-soft: #17233a;
      --bezel: #05080d;
      --shadow: 0 24px 60px rgb(0 0 0 / 0.6);
      color-scheme: dark;
    }
  }

  :root[data-theme="dark"] {
    --bg: #0c1017;
    --surface: #151b24;
    --text: #e4e9f0;
    --muted: #8e99aa;
    --line: #263041;
    --accent: #6e9cf0;
    --accent-soft: #17233a;
    --bezel: #05080d;
    --shadow: 0 24px 60px rgb(0 0 0 / 0.6);
    color-scheme: dark;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  .wrap {
    max-width: 1080px;
    margin-inline: auto;
    padding: 32px 24px 56px;
    display: grid;
    gap: 32px;
    grid-template-columns: minmax(0, 1fr);
  }

  @media (min-width: 900px) {
    .wrap {
      grid-template-columns: 320px minmax(0, 1fr);
      align-items: start;
      padding-top: 56px;
    }
  }

  h1 {
    font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
    font-weight: 800;
    font-size: 30px;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin: 0 0 10px;
    text-wrap: balance;
  }

  .lede {
    margin: 0 0 24px;
    color: var(--muted);
    max-width: 60ch;
  }

  .eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 8px;
  }

  .picker { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }

  .picker button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 12px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: var(--text);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 140ms ease, border-color 140ms ease;
  }

  .picker button:hover { background: var(--surface); }

  .picker button[aria-current="true"] {
    background: var(--surface);
    border-color: var(--line);
  }

  .picker button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .picker .name { flex: 1; font-weight: 600; }

  .tag {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 999px;
    white-space: nowrap;
  }

  /* The tag encodes the real state of the work, not decoration: which screens
     the redesign has reached and which are still the original build. */
  .tag.done { background: var(--accent-soft); color: var(--accent); }
  .tag.pending { background: transparent; color: var(--muted); border: 1px solid var(--line); }

  .stage { display: flex; flex-direction: column; align-items: center; gap: 14px; }

  .phone {
    width: 390px;
    max-width: 100%;
    border-radius: 34px;
    padding: 10px;
    background: var(--bezel);
    box-shadow: var(--shadow);
  }

  .phone iframe {
    display: block;
    width: 100%;
    height: 780px;
    border: 0;
    border-radius: 25px;
    background: #fff;
  }

  @media (max-width: 899px) {
    .phone { border-radius: 26px; padding: 7px; }
    .phone iframe { height: 620px; border-radius: 20px; }
  }

  .caption { color: var(--muted); font-size: 13px; text-align: center; max-width: 44ch; }

  .note {
    margin-top: 28px;
    padding: 14px 16px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--surface);
    color: var(--muted);
    font-size: 13px;
  }

  .note strong { color: var(--text); }

  @media (prefers-reduced-motion: reduce) {
    * { transition-duration: 0.01ms !important; }
  }
</style>

<div class="wrap">
  <div>
    <p class="eyebrow">Uber Eats redesign · complete</p>
    <h1>Shaare Tzadaka</h1>
    <p class="lede">
      Every screen, captured from the running app at 390&nbsp;px. Tap the bottom tab bar inside the
      phone to move around, or pick a screen from the list.
    </p>

    <ul class="picker" id="picker"></ul>

    <div class="note">
      <strong>This is a static capture, not the app.</strong> Navigation between the tabs works.
      Sheets, filters, hearts and forms are inert — run it locally for those. Every organization
      shown is fictional sample data.
    </div>
  </div>

  <div class="stage">
    <div class="phone">
      <iframe id="frame" title="App screen preview" sandbox="allow-same-origin allow-scripts"></iframe>
    </div>
    <p class="caption" id="caption"></p>
  </div>
</div>

<script>
(function () {
  var DATA = ${payload};
  var frame = document.getElementById("frame");
  var picker = document.getElementById("picker");
  var caption = document.getElementById("caption");
  var current = DATA.screens[0].id;

  var CAPTIONS = {
    done: "Redesigned.",
    pending: "Still the original build."
  };

  function srcdocFor(screen) {
    return (
      '<!doctype html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=390,initial-scale=1">' +
      '<link rel="stylesheet" href="' + DATA.fonts + '">' +
      "<style>" + DATA.css + "</style></head><body>" + screen.html +
      "</body></html>"
    );
  }

  // Links are intercepted from the parent on the capture phase rather than by
  // a script inside the srcdoc: same-origin srcdoc gives us the document, and
  // capture-phase guarantees we run before the browser follows the href. An
  // uncaught href navigates the frame to a URL that does not exist here and
  // leaves a blank phone.
  frame.addEventListener("load", function () {
    var doc = frame.contentDocument;
    if (!doc) return;
    doc.addEventListener(
      "click",
      function (e) {
        var a = e.target.closest && e.target.closest("a[href]");
        if (!a) return;
        e.preventDefault();
        var href = a.getAttribute("href");
        var match = DATA.screens.filter(function (s) { return s.route === href; })[0];
        if (match) show(match.id);
      },
      true
    );
  });

  function show(id) {
    var screen = DATA.screens.filter(function (s) { return s.id === id; })[0];
    if (!screen) return;
    current = id;
    frame.srcdoc = srcdocFor(screen);
    caption.textContent = CAPTIONS[screen.state];
    Array.prototype.forEach.call(picker.querySelectorAll("button"), function (b) {
      b.setAttribute("aria-current", String(b.dataset.id === id));
    });
  }

  DATA.screens.forEach(function (screen) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.dataset.id = screen.id;
    b.innerHTML =
      '<span class="name"></span><span class="tag ' + screen.state + '"></span>';
    b.querySelector(".name").textContent = screen.label;
    b.querySelector(".tag").textContent = screen.state === "done" ? "Redesigned" : "Original";
    b.addEventListener("click", function () { show(screen.id); });
    li.appendChild(b);
    picker.appendChild(li);
  });

  show(current);
})();
<\/script>
`;

writeFileSync(process.env.OUT + "/preview.html", page);
console.log("wrote preview.html", (page.length / 1024).toFixed(0) + "kb");
