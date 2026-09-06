/* =========================================================
   THE WEB DEV NOTEBOOK — behavior
   Vanilla JS only. No build step, no dependencies.
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- THEME TOGGLE ---------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    try { localStorage.setItem("notebook-theme", theme); } catch (e) { /* storage unavailable */ }
  }
  (function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("notebook-theme"); } catch (e) { /* ignore */ }
    if (!saved) {
      saved = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    applyTheme(saved);
  })();
  themeToggle.addEventListener("click", () => {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* ---------------- DRAWER (mobile TOC) ---------------- */
  const drawer = document.getElementById("sideDrawer");
  const overlay = document.getElementById("drawerOverlay");
  const drawerToggle = document.getElementById("drawerToggle");
  const drawerClose = document.getElementById("drawerClose");

  function openDrawer() {
    drawer.classList.add("open");
    overlay.hidden = false;
    drawerToggle.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    overlay.hidden = true;
    drawerToggle.setAttribute("aria-expanded", "false");
  }
  drawerToggle.addEventListener("click", () => {
    drawer.classList.contains("open") ? closeDrawer() : openDrawer();
  });
  drawerClose.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeDrawer));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  /* ---------------- PROGRESS BAR + ACTIVE NAV ---------------- */
  const progressBar = document.getElementById("progressBar");
  const navLinks = Array.from(document.querySelectorAll(".quick-nav a"));
  const subjects = Array.from(document.querySelectorAll(".subject"));
  const backToTop = document.getElementById("backToTop");

  function onScroll() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = (doc.scrollHeight - doc.clientHeight) || 1;
    progressBar.style.width = Math.min(100, (scrollTop / scrollHeight) * 100) + "%";
    backToTop.hidden = scrollTop < 400;

    let currentId = null;
    const probeY = 120;
    for (const sec of subjects) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= probeY && rect.bottom > probeY) { currentId = sec.id; break; }
    }
    navLinks.forEach((a) => a.classList.toggle("active", a.dataset.section === currentId));
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------------- SEARCH ---------------- */
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchable = Array.from(document.querySelectorAll(".searchable"));

  function labelFor(el) {
    const heading = el.querySelector("h3, h2, caption, .quiz-question");
    if (heading) return heading.textContent.trim();
    return (el.dataset.tags || "note").split(" ").slice(0, 4).join(" ");
  }
  function sectionNameFor(el) {
    const subject = el.closest(".subject");
    return subject ? (subject.dataset.subject || "") : "";
  }

  function runSearch(query) {
    query = query.trim().toLowerCase();
    searchResults.innerHTML = "";
    if (!query) { searchResults.hidden = true; return; }

    const matches = searchable.filter((el) => {
      const tags = (el.dataset.tags || "").toLowerCase();
      const text = el.textContent.toLowerCase();
      return tags.includes(query) || text.includes(query);
    }).slice(0, 20);

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-empty">No notes match "' + escapeHtml(query) + '".</div>';
      searchResults.hidden = false;
      return;
    }
    matches.forEach((el) => {
      if (!el.id) el.id = "auto-" + Math.random().toString(36).slice(2, 9);
      const a = document.createElement("a");
      a.href = "#" + el.id;
      a.innerHTML = escapeHtml(labelFor(el)) + '<span class="sr-tag">' + escapeHtml(sectionNameFor(el)) + "</span>";
      a.addEventListener("click", () => { searchResults.hidden = true; searchInput.value = ""; });
      searchResults.appendChild(a);
    });
    searchResults.hidden = false;
  }
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  searchInput.addEventListener("input", (e) => runSearch(e.target.value));
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) searchResults.hidden = true;
  });

  /* ---------------- EXAM MODE: FLASHCARDS ---------------- */
  const FLASHCARDS = [
    { f: "What does HTML stand for?", b: "HyperText Markup Language" },
    { f: "What does CSS stand for?", b: "Cascading Style Sheets" },
    { f: "Which tag holds page metadata?", b: "<head>" },
    { f: "Self-closing tag for a line break?", b: "<br>" },
    { f: "Attribute that makes an <img> accessible?", b: "alt" },
    { f: "CSS property for space INSIDE the border?", b: "padding" },
    { f: "CSS property for space OUTSIDE the border?", b: "margin" },
    { f: "Which box-sizing includes padding+border in width?", b: "border-box" },
    { f: "Flexbox: property that aligns items on the MAIN axis?", b: "justify-content" },
    { f: "Flexbox: property that aligns items on the CROSS axis?", b: "align-items" },
    { f: "CSS selector with the HIGHEST normal specificity?", b: "ID selector (#id)" },
    { f: "Unit relative to the ROOT font-size?", b: "rem" },
    { f: "JS keyword for a constant that can't be reassigned?", b: "const" },
    { f: "Strict equality operator in JS?", b: "===" },
    { f: "Array method that transforms every element into a new array?", b: "map()" },
    { f: "Array method that keeps only matching elements?", b: "filter()" },
    { f: "Array method that folds an array into one value?", b: "reduce()" },
    { f: "Keyword pair used to pause for a Promise to resolve?", b: "async / await" },
    { f: "A function that remembers variables from its outer scope?", b: "Closure" },
    { f: "DOM method to find the first element matching a CSS selector?", b: "querySelector()" },
    { f: "Event method that stops a form from submitting normally?", b: "preventDefault()" },
    { f: "Pattern of one listener handling many child clicks?", b: "Event delegation" },
    { f: "JS: property that reads only text, ignoring HTML tags?", b: "textContent" },
    { f: "CSS function for a fluid value with min/max bounds?", b: "clamp()" }
  ];
  let flashOrder = FLASHCARDS.map((_, i) => i);
  let flashIndex = 0;

  const flashcardEl = document.getElementById("flashcard");
  const flashFront = document.getElementById("flashFront");
  const flashBack = document.getElementById("flashBack");
  const flashCount = document.getElementById("flashCount");

  function renderFlash() {
    const card = FLASHCARDS[flashOrder[flashIndex]];
    flashFront.textContent = card.f;
    flashBack.textContent = card.b;
    flashcardEl.classList.remove("flipped");
    flashCount.textContent = (flashIndex + 1) + " / " + FLASHCARDS.length;
  }
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  flashcardEl.addEventListener("click", () => flashcardEl.classList.toggle("flipped"));
  flashcardEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flashcardEl.classList.toggle("flipped"); }
  });
  document.getElementById("flashNext").addEventListener("click", () => {
    flashIndex = (flashIndex + 1) % FLASHCARDS.length; renderFlash();
  });
  document.getElementById("flashPrev").addEventListener("click", () => {
    flashIndex = (flashIndex - 1 + FLASHCARDS.length) % FLASHCARDS.length; renderFlash();
  });
  document.getElementById("flashShuffle").addEventListener("click", () => {
    flashOrder = shuffleArray(flashOrder.slice()); flashIndex = 0; renderFlash();
  });
  renderFlash();

  /* ---------------- EXAM MODE: RAPID-FIRE QUIZ ---------------- */
  const QUIZ = [
    { type: "MCQ", q: "Which tag is used for the largest heading?", options: ["<h6>", "<head>", "<h1>", "<heading>"], answer: 2 },
    { type: "MCQ", q: "Which attribute prevents a field from being edited but still submits its value?", options: ["disabled", "readonly", "required", "hidden"], answer: 1 },
    { type: "Output", q: "What does this code output?", code: "console.log(typeof null);", options: ["'null'", "'object'", "'undefined'", "Error"], answer: 1 },
    { type: "Output", q: "What is logged?", code: "let x = '5' + 3;\nconsole.log(x);", options: ["8", "'53'", "NaN", "Error"], answer: 1 },
    { type: "Output", q: "What is logged?", code: "let x = '5' - 3;\nconsole.log(x);", options: ["2", "'53'", "NaN", "'2'"], answer: 0 },
    { type: "Debug", q: "Why does this switch always run the default case?", code: "switch (1) {\n  case '1': console.log('a'); break;\n  default: console.log('b');\n}", options: ["switch doesn't support numbers", "'1' !== 1, switch uses strict equality", "default always runs first", "Missing parentheses"], answer: 1 },
    { type: "CSS Prediction", q: "Given .box{width:100px;padding:20px;box-sizing:content-box;} — total rendered width?", options: ["100px", "120px", "140px", "80px"], answer: 2 },
    { type: "CSS Prediction", q: "With display:flex and justify-content:center on the parent, items align on the...", options: ["cross axis", "main axis", "z-axis", "They don't move"], answer: 1 },
    { type: "HTML ID", q: "Which element is purely presentational with no semantic meaning?", options: ["<article>", "<section>", "<div>", "<aside>"], answer: 2 },
    { type: "MCQ", q: "Which array method does NOT mutate the original array?", options: ["push()", "splice()", "sort()", "map()"], answer: 3 },
    { type: "Debug", q: "What's wrong with this closure-based counter?", code: "function make() {\n  var count = 0;\n  return function() { count++; return count; }\n}", options: ["Nothing — it works correctly", "var is not allowed in functions", "Closures can't return functions", "count is not defined"], answer: 0 },
    { type: "Fill", q: "Fill in the missing keyword: 'a s y n c function load() { const r = ___ fetch(url); }'", answer: "await" },
    { type: "Fill", q: "Fill in the CSS property: '_________: border-box;' makes width include padding & border.", answer: "box-sizing" },
    { type: "Fill", q: "Fill in the array method: arr.________(fn) returns true if EVERY element passes the test.", answer: "every" },
    { type: "MCQ", q: "Which HTTP-adjacent Web API returns a Promise?", options: ["localStorage.getItem", "fetch()", "document.querySelector", "Math.random()"], answer: 1 },
    { type: "Output", q: "What is logged?", code: "const arr = [1,2,3];\nconst copy = arr;\ncopy.push(4);\nconsole.log(arr.length);", options: ["3", "4", "undefined", "Error"], answer: 1 },
    { type: "CSS Prediction", q: "Two rules have equal specificity. Which one applies?", options: ["The shorter selector", "The one written first", "The one written last", "Neither applies"], answer: 2 },
    { type: "HTML ID", q: "Which input type gives you a built-in date picker?", options: ["type='calendar'", "type='date'", "type='datetime'", "type='picker'"], answer: 1 },
    { type: "Fill", q: "Fill in the event method: e.____________() stops a form's default submit behavior.", answer: "preventDefault" },
    { type: "MCQ", q: "Which loop is guaranteed to run its body at least once?", options: ["for", "while", "do...while", "for...of"], answer: 2 }
  ];
  let quizPool = [];
  let quizIndex = 0;
  let quizScore = 0;

  const quizScoreEl = document.getElementById("quizScore");
  const quizNumEl = document.getElementById("quizNum");
  const quizTotalEl = document.getElementById("quizTotal");
  const quizTypeEl = document.getElementById("quizType");
  const quizQuestionEl = document.getElementById("quizQuestion");
  const quizCodeEl = document.getElementById("quizCode");
  const quizOptionsEl = document.getElementById("quizOptions");
  const quizFeedbackEl = document.getElementById("quizFeedback");
  const quizNextBtn = document.getElementById("quizNext");
  const quizQuestionWrap = document.getElementById("quizQuestionWrap");
  const quizResultEl = document.getElementById("quizResult");

  function startQuiz() {
    quizPool = shuffleArray(QUIZ.slice());
    quizIndex = 0; quizScore = 0;
    quizScoreEl.textContent = "0";
    quizTotalEl.textContent = quizPool.length;
    quizQuestionWrap.hidden = false;
    quizResultEl.hidden = true;
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const item = quizPool[quizIndex];
    quizNumEl.textContent = quizIndex + 1;
    quizTypeEl.textContent = item.type;
    quizQuestionEl.textContent = item.q;
    quizFeedbackEl.hidden = true;
    quizNextBtn.hidden = true;
    quizOptionsEl.innerHTML = "";

    if (item.code) {
      quizCodeEl.hidden = false;
      quizCodeEl.querySelector("code").textContent = item.code;
    } else {
      quizCodeEl.hidden = true;
    }

    if (item.type === "Fill") {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "quiz-fill-input";
      input.placeholder = "Type your answer…";
      input.autocomplete = "off";
      const submit = document.createElement("button");
      submit.className = "pen-btn";
      submit.textContent = "Check";
      submit.addEventListener("click", () => checkFill(input.value, item, submit, input));
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); checkFill(input.value, item, submit, input); } });
      quizOptionsEl.appendChild(input);
      quizOptionsEl.appendChild(submit);
      input.focus();
    } else {
      item.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-btn";
        btn.textContent = opt;
        btn.addEventListener("click", () => checkMcq(idx, item, btn));
        quizOptionsEl.appendChild(btn);
      });
    }
  }

  function lockOptions() {
    quizOptionsEl.querySelectorAll("button, input").forEach((el) => (el.disabled = true));
  }
  function showFeedback(isCorrect, correctText) {
    quizFeedbackEl.hidden = false;
    quizFeedbackEl.className = "quiz-feedback " + (isCorrect ? "correct" : "incorrect");
    quizFeedbackEl.textContent = isCorrect ? "✓ Correct!" : "✗ Not quite — correct answer: " + correctText;
    quizNextBtn.hidden = false;
    if (isCorrect) quizScore++;
    quizScoreEl.textContent = quizScore;
  }
  function checkMcq(idx, item, btn) {
    lockOptions();
    const buttons = quizOptionsEl.querySelectorAll(".quiz-option-btn");
    buttons[item.answer].classList.add("correct");
    if (idx !== item.answer) btn.classList.add("incorrect");
    showFeedback(idx === item.answer, item.options[item.answer]);
  }
  function checkFill(value, item, submitBtn, input) {
    lockOptions();
    const ok = value.trim().toLowerCase() === item.answer.toLowerCase();
    showFeedback(ok, item.answer);
  }
  quizNextBtn.addEventListener("click", () => {
    quizIndex++;
    if (quizIndex >= quizPool.length) {
      quizQuestionWrap.hidden = true;
      quizResultEl.hidden = false;
      document.getElementById("finalScore").textContent = quizScore + " / " + quizPool.length;
      const pct = Math.round((quizScore / quizPool.length) * 100);
      document.getElementById("finalMessage").textContent =
        pct >= 80 ? "God Mode unlocked. 🏆" : pct >= 50 ? "Solid — a bit more revision and you're there." : "Back to the notebook — you've got this. 📓";
    } else {
      renderQuizQuestion();
    }
  });
  document.getElementById("quizRestart").addEventListener("click", startQuiz);
  document.getElementById("quizRestart2").addEventListener("click", startQuiz);

  /* ---------------- EXAM MODE: TAB SWITCHING ---------------- */
  const examTabs = document.querySelectorAll(".exam-tab");
  const flashPanel = document.getElementById("flashPanel");
  const quizPanel = document.getElementById("quizPanel");
  examTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      examTabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const isFlash = tab.dataset.mode === "flash";
      flashPanel.hidden = !isFlash;
      quizPanel.hidden = isFlash;
      if (!isFlash && quizPool.length === 0) startQuiz();
    });
  });

  /* ---------------- PRACTICE PLAYGROUND ---------------- */
  const pgHtml = document.getElementById("pgHtml");
  const pgCss = document.getElementById("pgCss");
  const pgJs = document.getElementById("pgJs");
  const pgRun = document.getElementById("pgRun");
  const pgPreview = document.getElementById("pgPreview");

  function runPlayground() {
    const doc = "<!DOCTYPE html><html><head><meta charset='utf-8'><style>" +
      "body{font-family:sans-serif;padding:16px;color:#222;}" +
      pgCss.value +
      "</style></head><body>" +
      pgHtml.value +
      "<script>" + pgJs.value + "<\/script>" +
      "</body></html>";
    pgPreview.srcdoc = doc;
  }
  pgRun.addEventListener("click", runPlayground);
  if (pgPreview) runPlayground();

  /* ---------------- KEEP QUICK-NAV / TOC SYNCED ON LOAD ---------------- */
  window.addEventListener("hashchange", onScroll);

})();
