'use strict';
/* ============================================================
   iLearn animated lesson player — pure CSS/JS, no deps.
   window.iLearnAnim.mount(stageEl, lessonIndex) plays an animation
   built from a per-lesson timeline of frames:
     { html, cap, focus, type:{sel,txt}, dur }
   ============================================================ */
(function () {
  /* ---------- scene builders (return HTML strings) ---------- */
  const winTb = (bg, name) => `<div class="az-tb" style="background:${bg}">${name}<span class="x">&#8211;&nbsp;&#9633;&nbsp;&#10005;</span></div>`;
  const fbtns = (hot) => {
    const h = (k) => (hot && hot.includes(k) ? ' hot' : '');
    return `<div class="az-btn bold${h('B')}" data-k="B">B</div><div class="az-btn it${h('I')}" data-k="I">I</div>`
      + `<div class="az-btn ul${h('U')}" data-k="U">U</div><div class="az-btn col${h('C')}" data-k="C" style="position:relative">A</div>`;
  };
  const word = (ribbon, page) => `<div class="az-win">${winTb('#185abd', 'Document1 — Word')}<div class="az-ribbon">${ribbon}</div><div class="az-page-wrap"><div class="az-page">${page}</div></div></div>`;
  const excel = (cells, sel, cls) => {
    const cols = ['A', 'B', 'C'];
    let g = '<div class="az-c h"></div>' + cols.map((c) => `<div class="az-c h">${c}</div>`).join('');
    for (let r = 1; r <= 5; r++) {
      g += `<div class="az-c h">${r}</div>` + cols.map((c) => {
        const k = c + r, ex = (cls && cls[k]) || '', sl = sel === k ? ' sel' : '', hd = r === 1 ? ' hd' : '';
        return `<div class="az-c${hd}${sl} ${ex}" data-cell="${k}">${cells[k] || ''}</div>`;
      }).join('');
    }
    return `<div class="az-xl">${winTb('#107c41', 'Book1 — Excel')}`
      + `<div class="az-fbar"><div class="az-nbox">${sel || 'A1'}</div><div class="az-fx" data-fx>${cells[sel] || ''}</div></div>`
      + `<div class="az-grid">${g}</div></div>`;
  };
  const desk = (sel) => {
    const ic = (top, bg, l, lab, key) => `<div class="az-ic${sel === key ? ' sel' : ''}" data-ic="${key}" style="top:${top}px"><div class="g" style="background:${bg};color:${bg === '#e8c15a' ? '#7a5a14' : '#fff'}">${l}</div><span>${lab}</span></div>`;
    return `<div class="az-desk">${ic(16, '#6b7785', '&#128465;', 'Recycle', 'bin')}${ic(96, '#185abd', 'W', 'Word', 'w')}${ic(176, '#107c41', 'X', 'Excel', 'x')}${ic(256, '#e8c15a', '&#128193;', 'Documents', 'docs')}</div>`;
  };
  const keys = (hot) => {
    const k = (t, cls) => `<div class="az-key ${cls || ''} ${hot && hot.includes(t) ? 'hot' : ''}">${t}</div>`;
    return `<div class="az-keys"><div class="az-krow">${['Q','W','E','R','T','Y','U','I','O','P'].map((x)=>k(x)).join('')}${k('&#9003; Back','wide')}</div>`
      + `<div class="az-krow">${['A','S','D','F','G','H','J','K','L'].map((x)=>k(x)).join('')}${k('&#9166; Enter','wide')}</div>`
      + `<div class="az-krow">${k('&#8679; Shift','wide')}${['Z','X','C','V','B','N','M'].map((x)=>k(x)).join('')}</div>`
      + `<div class="az-krow">${k('space','space')}</div></div>`;
  };
  const combo = (a, b, label) => `<div class="az-con"><div style="display:flex;gap:14px;align-items:center"><div class="az-key hot" style="min-width:84px;height:60px;font-size:18px">${a}</div><div style="font-size:34px;color:#1a3e62">+</div><div class="az-key hot" style="min-width:60px;height:60px;font-size:24px">${b}</div></div><div class="t" style="font-size:22px">${label}</div></div>`;
  const con = (icon, title, pill) => `<div class="az-con"><div class="ico">${icon}</div><div class="t">${title}</div>${pill ? `<div class="pill">${pill}</div>` : ''}</div>`;
  const folder = () => `<div class="az-win">${winTb('#5b6b7b', '&#128193; Documents')}<div style="flex:1;background:#fbfcfd;padding:26px"><div data-ic="file" style="width:120px;text-align:center"><div style="font-size:54px;color:#185abd">&#128462;</div><div style="font-size:14px;margin-top:4px">my first note</div></div></div></div>`;
  const save = (name) => `<div class="az-win">${winTb('#185abd', 'Save As')}<div style="flex:1;background:#eceef0;display:flex;align-items:center;justify-content:center"><div style="background:#fff;border-radius:10px;box-shadow:0 14px 34px rgba(0,0,0,.22);padding:22px;width:74%"><div style="margin-bottom:14px;color:#555">&#128193; Documents</div><div style="display:flex;gap:10px;align-items:center"><span style="color:#444">File name:</span><div data-fx style="flex:1;border:2px solid #185abd;border-radius:5px;padding:9px 12px;min-height:38px">${name || ''}</div></div><div style="text-align:right;margin-top:16px"><span data-k="save" style="background:#185abd;color:#fff;padding:9px 24px;border-radius:6px">Save</span></div></div></div></div>`;
  const signin = () => `<div class="az-con" style="background:linear-gradient(160deg,#123a63,#2f8f7e);color:#fff"><div style="width:92px;height:92px;border-radius:50%;background:#cdd9e3;display:flex;align-items:center;justify-content:center;font-size:46px">&#128100;</div><div class="t" style="color:#fff">David</div><div data-fx style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.45);border-radius:6px;padding:10px 44px;letter-spacing:4px;font-size:20px;min-height:42px"></div></div>`;
  const cur = '<span class="az-cursor-i"></span>';
  // opening title card for each lesson
  const title = (n, t) => `<div class="az-con az-title"><div class="az-tnum">Lesson ${n}</div><div class="t">${t}</div><div class="pill">Watch, then try it yourself</div></div>`;
  // a warm "well done" closing beat
  const done = (msg) => `<div class="az-con az-doneframe"><div class="ico">&#10003;</div><div class="t">${msg}</div></div>`;

  /* ---------- the 16 timelines (richer: title → guided steps → well done) ---------- */
  const L = [
    // 1 — turn on & sign in
    [ { html: title(1, 'Turn on and sign in'), cap: "Let's turn the computer on together.", dur: 2000 },
      { html: con('&#9211;', 'The power button', 'A round circle with a line'), cap: 'Find the power button…', dur: 2300 },
      { html: con('&#9211;', 'Press it once', 'Now wait a little moment'), cap: 'Press it once, and wait while it wakes up.', dur: 2300 },
      { html: signin(), cap: 'When it asks, type the password.', type: { sel: '[data-fx]', txt: '••••••' }, dur: 2800 },
      { html: desk(), cap: 'And there it is — the desktop, your starting place.', dur: 2200 },
      { html: done('You turned the computer on!'), cap: 'Well done.', dur: 2000 } ],
    // 2 — mouse
    [ { html: title(2, 'The mouse: moving & clicking'), cap: 'Today we meet the mouse.', dur: 2000 },
      { html: desk(), cap: 'Rest your hand on it and move slowly — the arrow moves too.', dur: 2400 },
      { html: desk(), cap: 'That arrow is your finger, reaching into the screen.', focus: '[data-ic="bin"]', dur: 2200 },
      { html: desk(), cap: 'To choose the Word icon, click it once…', focus: '[data-ic="w"]', dur: 2400 },
      { html: desk('w'), cap: 'Chosen! One click chooses something.', dur: 2000 },
      { html: done('You moved the mouse and clicked!'), cap: "That's a real skill.", dur: 1900 } ],
    // 3 — double-click
    [ { html: title(3, 'Clicking & double-clicking'), cap: 'A double-click opens things.', dur: 2000 },
      { html: desk(), cap: 'Point the arrow at a folder…', focus: '[data-ic="docs"]', dur: 2100 },
      { html: desk(), cap: 'Now two quick taps — and keep the mouse still.', focus: '[data-ic="docs"]', dur: 2100 },
      { html: folder(), cap: 'It opens! That is a double-click.', dur: 2200 },
      { html: done('You did a double-click!'), cap: 'If it does not open, just try again, nice and still.', dur: 2200 } ],
    // 4 — keyboard
    [ { html: title(4, 'The keyboard'), cap: 'Today we meet the keyboard.', dur: 2000 },
      { html: keys(['space', '&#9166; Enter', '&#9003; Back']), cap: 'The keys we use most: space, Enter and Backspace.', dur: 2800 },
      { html: word(fbtns(), '<span data-fx></span>' + cur), cap: 'Click where the line blinks, and type slowly.', type: { sel: '[data-fx]', txt: 'c a t' }, dur: 2800 },
      { html: word(fbtns(), 'cat' + cur), cap: 'Space makes a gap, Backspace fixes mistakes.', dur: 2200 },
      { html: done('You typed your first word!'), cap: 'Mistakes are completely fine.', dur: 1900 } ],
    // 5 — open & close
    [ { html: title(5, 'Open & close a program'), cap: 'Open a program, then close it.', dur: 2000 },
      { html: desk(), cap: 'Double-click an icon to open it.', focus: '[data-ic="w"]', dur: 2100 },
      { html: word(fbtns(), cur), cap: 'It opens in its own window, like a book.', dur: 2100 },
      { html: word(fbtns(), cur), cap: 'When finished, find the small X in the corner…', focus: '.az-tb .x', dur: 2300 },
      { html: done('Opened it, and closed it!'), cap: 'Click the X once, and it closes.', dur: 2000 } ],
    // 6 — save & find
    [ { html: title(6, 'Save a file & find it'), cap: 'Saving is like putting your letter in a drawer.', dur: 2100 },
      { html: word(fbtns(), 'My note' + cur), cap: 'Click File, then Save.', dur: 2000 },
      { html: save(''), cap: 'Give it a simple name.', type: { sel: '[data-fx]', txt: 'my first note' }, dur: 2600 },
      { html: save('my first note'), cap: 'We always save to Documents.', focus: '[data-k="save"]', dur: 2000 },
      { html: folder(), cap: 'Open Documents to find it again.', focus: '[data-ic="file"]', dur: 2200 },
      { html: done('Your work is safe!'), cap: 'The same drawer, every time.', dur: 1900 } ],
    // 7 — files & folders
    [ { html: title(7, 'Files & folders'), cap: 'A file is a letter; a folder is the box that holds it.', dur: 2300 },
      { html: con('&#128193;', 'A folder holds your files', 'To keep them tidy'), cap: 'A folder keeps your files tidy.', dur: 2300 },
      { html: folder(), cap: 'Open Documents…', focus: '[data-ic="file"]', dur: 2200 },
      { html: done('There is your file!'), cap: 'It waited for you.', dur: 1900 } ],
    // 8 — practice
    [ { html: title(8, 'Practice: save & find'), cap: 'Today we practise on our own.', dur: 2000 },
      { html: word(fbtns(), '<span data-fx></span>' + cur), cap: 'Open Word and type a note.', type: { sel: '[data-fx]', txt: 'Hello' }, dur: 2400 },
      { html: save('my note'), cap: 'Save it, with a name, in Documents.', focus: '[data-k="save"]', dur: 2200 },
      { html: folder(), cap: 'Then find it again in Documents.', focus: '[data-ic="file"]', dur: 2200 },
      { html: done('You did it by yourself!'), cap: 'That is real independence.', dur: 2000 } ],
    // 9 — Word: type a sentence
    [ { html: title(9, 'Word: type a sentence'), cap: 'Now we write properly, in Word.', dur: 2000 },
      { html: desk(), cap: 'Double-click the blue W to open Word.', focus: '[data-ic="w"]', dur: 2100 },
      { html: word(fbtns(), '<span data-fx></span>' + cur), cap: 'Type a sentence — a capital letter to start.', type: { sel: '[data-fx]', txt: 'I am learning to use a computer.' }, dur: 3800 },
      { html: word(fbtns(), 'I am learning to use a computer.' + cur), cap: 'End with a full stop.', dur: 2200 },
      { html: done('A real sentence on the page!'), cap: 'Wonderful.', dur: 1900 } ],
    // 10 — Word: copy, paste, undo
    [ { html: title(10, 'Word: copy, paste & undo'), cap: 'Three shortcuts — the heart of editing.', dur: 2100 },
      { html: word(fbtns(), '<span class="az-sel">Hello</span>' + cur), cap: 'First, select a word — it turns blue.', dur: 2200 },
      { html: combo('Ctrl', 'C', 'Copy'), cap: 'Copy it with Ctrl + C.', dur: 2000 },
      { html: combo('Ctrl', 'V', 'Paste'), cap: 'Paste it with Ctrl + V.', dur: 2000 },
      { html: combo('Ctrl', 'Z', 'Undo'), cap: 'Undo any mistake with Ctrl + Z — the magic go-back.', dur: 2300 },
      { html: done('Copy, paste, undo — done!'), cap: 'Nothing here can break.', dur: 1900 } ],
    // 11 — Word: bold, italic, underline, colour
    [ { html: title(11, 'Word: bold, italic & colour'), cap: 'Make a word stand out.', dur: 2000 },
      { html: word(fbtns(), '<span class="az-sel">David</span>' + cur), cap: 'Choose a word — it turns blue.', dur: 2000 },
      { html: word(fbtns('B'), '<b>David</b>' + cur), cap: 'Click B for bold.', focus: '[data-k="B"]', dur: 2100 },
      { html: word(fbtns('I'), '<b><i>David</i></b>' + cur), cap: 'Click I for italic — it leans over.', focus: '[data-k="I"]', dur: 2100 },
      { html: word(fbtns('C'), '<b><i style="color:#c0392b">David</i></b>' + cur), cap: 'The A button adds colour.', focus: '[data-k="C"]', dur: 2200 },
      { html: done('Choose first, then change!'), cap: 'You made it stand out.', dur: 1900 } ],
    // 12 — Word: title, size, alignment
    [ { html: title(12, 'Word: titles, size & alignment'), cap: 'Make a proper title.', dur: 2000 },
      { html: word(fbtns(), '<span class="big az-sel">My List</span>'), cap: 'Type a title and pick a bigger size.', dur: 2200 },
      { html: word(fbtns('B'), '<span class="big">My List</span>'), cap: 'Make it bold.', focus: '[data-k="B"]', dur: 2000 },
      { html: word(fbtns(), '<div style="text-align:center" class="big">My List</div>'), cap: 'Centre it with the centre button.', dur: 2200 },
      { html: done('That looks professional!'), cap: 'A clear, neat heading.', dur: 1900 } ],
    // 13 — Word: lists, spell-check, PDF
    [ { html: title(13, 'Word: lists, spell-check & PDF'), cap: 'Tidy lists and safe sharing.', dur: 2100 },
      { html: word(fbtns(), '<div>&#8226; milk</div>' + cur), cap: 'The bullets button makes a tidy list.', dur: 2200 },
      { html: word(fbtns(), '<div>&#8226; milk</div><div>&#8226; bread</div><div>&#8226; eggs</div>'), cap: 'One item on each line.', dur: 2200 },
      { html: word(fbtns(), '<div>I <span style="text-decoration:underline wavy #d33">lern</span> Word</div>'), cap: 'A red wavy line means: check the spelling.', dur: 2400 },
      { html: con('&#128196;', 'Save As → PDF', 'Looks the same on every device'), cap: 'Save as a PDF to share it safely.', dur: 2200 } ],
    // 14 — Excel: cells, rows, columns
    [ { html: title(14, 'Excel: cells, rows & columns'), cap: 'Excel is squared paper.', dur: 2000 },
      { html: con('&#129003;', 'Each box is a cell', 'Letters across, numbers down'), cap: 'Each little box is a cell.', dur: 2300 },
      { html: excel({}, 'A1'), cap: 'Columns are letters; rows are numbers.', dur: 2200 },
      { html: excel({}, 'A1'), cap: 'So the top-left box is A1.', focus: '[data-cell="A1"]', dur: 2200 },
      { html: done('You found your way around Excel!'), cap: 'A1 = column A, row 1.', dur: 1900 } ],
    // 15 — Excel: data & a tidy table
    [ { html: title(15, 'Excel: data & a tidy table'), cap: 'Make a tidy table.', dur: 2000 },
      { html: excel({ A1: 'Item', B1: 'Cost' }, 'A1', { A1: 'hd', B1: 'hd' }), cap: 'Type a heading, then press Enter.', dur: 2200 },
      { html: excel({ A1: 'Item', B1: 'Cost', A2: 'milk', A3: 'bread', A4: 'eggs' }, 'A2', { A1: 'hd', B1: 'hd' }), cap: 'Type your list down the column.', dur: 2400 },
      { html: excel({ A1: 'Item', B1: 'Cost', A2: 'milk', B2: '£1', A3: 'bread', B3: '£2', A4: 'eggs', B4: '£3' }, 'B2', { A1: 'hd', B1: 'hd' }), cap: 'Show prices as money with the £ button.', dur: 2400 },
      { html: done('A clear, tidy table!'), cap: 'Bold header, data underneath.', dur: 1900 } ],
    // 16 — Excel: formulas, a total
    [ { html: title(16, 'Excel: formulas & a total'), cap: 'The magic of Excel — it does the maths for you.', dur: 2200 },
      { html: excel({ A1: 'Item', B1: 'Cost', A2: 'milk', B2: '1', A3: 'bread', B3: '2', A4: 'eggs', B4: '3', A5: 'Total' }, 'B5', { A1: 'hd', B1: 'hd' }), cap: 'Click the Total cell, B5.', focus: '[data-cell="B5"]', dur: 2200 },
      { html: excel({ A1: 'Item', B1: 'Cost', A2: 'milk', B2: '1', A3: 'bread', B3: '2', A4: 'eggs', B4: '3', A5: 'Total' }, 'B5', { A1: 'hd', B1: 'hd' }), cap: 'Every formula starts with =. Type =SUM(B2:B4).', type: { sel: '[data-fx]', txt: '=SUM(B2:B4)' }, dur: 3200 },
      { html: excel({ A1: 'Item', B1: 'Cost', A2: 'milk', B2: '1', A3: 'bread', B3: '2', A4: 'eggs', B4: '3', A5: 'Total', B5: '6' }, 'B5', { A1: 'hd', B1: 'hd', B2: 'sum', B3: 'sum', B4: 'sum', B5: 'tot' }), cap: 'Press Enter — the total is 6!', dur: 2600 },
      { html: con('&#931;', 'AutoSum', 'One click totals a whole column'), cap: 'The AutoSum (Σ) button is the quick way.', dur: 2200 },
      { html: done('Now you write formulas!'), cap: 'You started at the power button. Brilliant.', dur: 2600 } ],
  ];

  /* ---------- engine ---------- */
  const CURSOR_SVG = '<svg viewBox="0 0 24 24" fill="#fff" stroke="#1A3E62" stroke-width="1.5"><path d="M5 3l14 8-6 1.5L9.5 18 5 3z"/></svg>';

  function mount(stage, idx) {
    const frames = L[idx];
    stage.classList.add('az-host');
    stage.innerHTML = `<div class="az-prog"></div><div class="az-cur">${CURSOR_SVG}</div><div class="az-rip"></div>`
      + `<div class="az-strap">Animated walkthrough</div>`
      + `<div class="az-tools">`
      +   `<button class="az-tool" data-act="replay" title="Watch again">&#8635; Replay</button>`
      +   `<button class="az-tool az-voice" data-act="voice" aria-pressed="true" title="Voice on/off">Voice</button>`
      +   `<button class="az-tool" data-act="fullscreen" title="Full screen">&#9974; Full screen</button>`
      + `</div>`
      + `<div class="az-cap"><span class="d"></span><p></p></div>`
      + `<div class="az-replay"><div class="b">&#8635; Watch again</div></div>`;
    if (!frames) { return; }
    const prog = stage.querySelector('.az-prog'), curEl = stage.querySelector('.az-cur'),
      rip = stage.querySelector('.az-rip'), capP = stage.querySelector('.az-cap p'),
      replay = stage.querySelector('.az-replay'), tools = stage.querySelector('.az-tools'),
      voiceBtn = stage.querySelector('.az-voice');
    let timers = [], intervals = [];
    const at = (t, fn) => timers.push(setTimeout(fn, t));
    const clearAll = () => { timers.forEach(clearTimeout); intervals.forEach(clearInterval); timers = []; intervals = []; };

    /* ---- voice: ElevenLabs MP3 at /audio/lesson-NN.mp3 if present, else browser speech ---- */
    const SOUND_KEY = 'ilearn.sound';
    let soundOn = localStorage.getItem(SOUND_KEY) !== 'off';
    const nn = String(idx + 1).padStart(2, '0');
    const audio = new Audio('/audio/lesson-' + nn + '.mp3');
    audio.preload = 'auto';
    let audioOk = false;
    audio.addEventListener('canplaythrough', () => { audioOk = true; }, { once: true });
    audio.addEventListener('error', () => { audioOk = false; });
    const synth = window.speechSynthesis;
    const stopVoice = () => { try { audio.pause(); audio.currentTime = 0; } catch (e) {} if (synth) synth.cancel(); };
    const speakCaption = (text) => { // browser-speech fallback when no MP3
      if (!soundOn || audioOk || !synth || !text) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92; u.pitch = 1; u.lang = 'en-GB';
      const v = synth.getVoices().find((x) => /en-GB/i.test(x.lang)) || synth.getVoices().find((x) => /^en/i.test(x.lang));
      if (v) u.voice = v;
      synth.speak(u);
    };
    const VOL_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></svg>';
    const VOL_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6"/></svg>';
    const paintVoice = () => { voiceBtn.setAttribute('aria-pressed', String(soundOn)); voiceBtn.innerHTML = (soundOn ? VOL_ON : VOL_OFF) + '<span>Voice</span>'; };
    paintVoice();

    tools.onclick = (e) => {
      const b = e.target.closest('.az-tool'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'replay') { run(); }
      else if (act === 'voice') {
        soundOn = !soundOn; localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off'); paintVoice();
        if (!soundOn) stopVoice(); else if (!useAudio) speakCaption(capP.textContent);
      } else if (act === 'fullscreen') {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (stage.requestFullscreen) stage.requestFullscreen();
      }
    };

    function rectIn(el) {
      const s = stage.getBoundingClientRect(), g = el.getBoundingClientRect();
      return { x: g.left - s.left + g.width / 2, y: g.top - s.top + g.height / 2 };
    }
    function moveCursor(sel, scene) {
      const el = scene.querySelector(sel); if (!el) return;
      const p = rectIn(el); curEl.style.left = p.x + 'px'; curEl.style.top = p.y + 'px';
      at(850, () => { rip.style.left = (p.x - 15) + 'px'; rip.style.top = (p.y - 15) + 'px'; rip.classList.remove('go'); void rip.offsetWidth; rip.classList.add('go'); });
    }
    function typeInto(sel, txt, scene) {
      const el = scene.querySelector(sel); if (!el) return;
      let i = 0; el.textContent = '';
      (function step() { if (i <= txt.length) { el.textContent = txt.slice(0, i); i++; at(85, step); } })();
    }
    function showFrame(f) {
      const scene = document.createElement('div'); scene.className = 'az-scene'; scene.innerHTML = f.html;
      stage.appendChild(scene);
      requestAnimationFrame(() => scene.classList.add('show'));
      // remove older scenes after fade
      const olds = [...stage.querySelectorAll('.az-scene')].slice(0, -1);
      at(550, () => olds.forEach((o) => o.remove()));
      capP.textContent = f.cap || '';
      if (soundOn && !useAudio) speakCaption(f.cap);
      if (f.focus) at(280, () => moveCursor(f.focus, scene));
      if (f.type) at(280, () => typeInto(f.type.sel, f.type.txt, scene));
    }
    let useAudio = false;
    function run() {
      clearAll(); stopVoice(); replay.classList.remove('show');
      stage.querySelectorAll('.az-scene').forEach((s) => s.remove());
      curEl.style.left = '50%'; curEl.style.top = '38%';
      useAudio = soundOn && (audioOk || audio.readyState >= 2);
      if (useAudio) { audio.currentTime = 0; audio.play().catch(() => { useAudio = false; }); }
      const total = frames.reduce((a, f) => a + (f.dur || 2600), 0);
      const t0 = Date.now();
      intervals.push(setInterval(() => { const e = Date.now() - t0; prog.style.width = Math.min(100, e / total * 100) + '%'; }, 120));
      let t = 0;
      frames.forEach((f) => { at(t, () => showFrame(f)); t += f.dur || 2600; });
      at(t, () => { replay.classList.add('show'); intervals.forEach(clearInterval); });
    }
    replay.querySelector('.b').onclick = run;
    if (current) current.stop();
    current = { stop: () => { clearAll(); stopVoice(); } };
    run();
  }

  let current = null;
  window.iLearnAnim = { mount, count: L.length, stop: () => { if (current) current.stop(); } };
})();
