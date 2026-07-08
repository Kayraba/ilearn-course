'use strict';
/* ============================================================
   iLearn SPA - talks to the REST API, renders all views.
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const TOKEN_KEY = 'ilearn.token';

  /* ---------- tiny API client ---------- */
  const API = {
    token: () => localStorage.getItem(TOKEN_KEY),
    async call(path, opts = {}) {
      const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
      const t = API.token();
      if (t) headers.Authorization = 'Bearer ' + t;
      const res = await fetch('/api' + path, { ...opts, headers });
      if (res.status === 401) { logout(); throw new Error('Session expired'); }
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('json') ? await res.json() : await res.text();
      if (!res.ok) throw new Error((data && data.error) || 'Something went wrong');
      return data;
    },
    get: (p) => API.call(p),
    post: (p, b) => API.call(p, { method: 'POST', body: JSON.stringify(b || {}) }),
    patch: (p, b) => API.call(p, { method: 'PATCH', body: JSON.stringify(b || {}) }),
    del: (p) => API.call(p, { method: 'DELETE' }),
  };

  /* ---------- helpers ---------- */
  const COLOURS = ['#1A3E62', '#138A8C', '#0E6E70', '#168A63', '#3A6EA5', '#2B6CB0', '#4C6B8A', '#0F7E86'];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
  const initials = (n) => n.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const colourFor = (s) => COLOURS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLOURS.length];
  function avatar(el, name) { el.textContent = initials(name); el.style.background = colourFor(name); }
  function ago(iso) {
    if (!iso) return 'Never';
    // Postgres returns ISO-8601 (already has T/Z); tolerate a bare "YYYY-MM-DD HH:MM:SS" too.
    const norm = /[TZ+]/.test(iso) ? iso : iso.replace(' ', 'T') + 'Z';
    const d = new Date(norm), s = (Date.now() - d) / 1000;
    if (s < 90) return 'Just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + 'h ago';
    const days = Math.round(s / 86400);
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  let toastT;
  function toast(msg, kind = '') {
    const t = $('#toast');
    t.className = 'toast ' + kind;
    t.innerHTML = (kind === 'ok' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : '') + '<span></span>';
    t.querySelector('span').textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2800);
  }
  function mount(tplId) {
    if (window.iLearnAnim) window.iLearnAnim.stop(); // stop any animation voice when leaving a view
    const main = $('#main'); main.innerHTML = '';
    main.appendChild($('#' + tplId).content.cloneNode(true));
    return main;
  }

  /* ---------- session ---------- */
  let me = null, course = null;

  function setMe(u) {
    me = u;
    avatar($('#meAvatar'), u.name);
    $('#meName').textContent = u.name;
    $('#meSub').textContent = (u.org ? u.org.name + ' - ' : '') + (u.role === 'admin' ? 'Admin' : 'Learner');
    $('#crumb').innerHTML = `<b>${esc(u.org ? u.org.name : '')}</b> - ${u.role === 'admin' ? 'Admin' : 'My learning'}`;
  }
  function logout() {
    localStorage.removeItem(TOKEN_KEY); me = null; course = null;
    $('#app').classList.add('hidden'); $('#auth').classList.remove('hidden');
    resetAuth();
  }
  $('#signoutBtn').onclick = logout;

  /* ============================================================ AUTH */
  // Auth-endpoint POST that surfaces the real error without forcing a logout.
  async function postAuth(path, body) {
    const res = await fetch('/api' + path, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
  }
  function setAuthMode(mode) {
    $$('#authSeg button').forEach((b) => b.setAttribute('aria-selected', b.dataset.mode === mode));
    $('#learnerAuth').classList.toggle('hidden', mode !== 'learner');
    $('#staffAuth').classList.toggle('hidden', mode !== 'staff');
  }
  $('#authSeg').onclick = (e) => { const b = e.target.closest('button'); if (b) setAuthMode(b.dataset.mode); };

  function resetAuth() {
    setAuthMode('learner');
    const name = $('#learnerName'); if (name) name.value = '';
    ['#learnerErr', '#staffErr'].forEach((s) => { const el = $(s); if (el) el.textContent = ''; });
  }

  async function learnerSignin() {
    $('#learnerErr').textContent = '';
    const name = ($('#learnerName').value || '').trim().replace(/\s+/g, ' ');
    if (name.length < 2) { $('#learnerErr').textContent = 'Please enter your name.'; return; }
    try {
      const r = await postAuth('/auth/start-learning', { name });
      localStorage.setItem(TOKEN_KEY, r.token);
      await boot();
    } catch (e) { $('#learnerErr').textContent = e.message; }
  }
  $('#learnerSignin').onclick = learnerSignin;
  $('#learnerName').addEventListener('keydown', (e) => { if (e.key === 'Enter') learnerSignin(); });

  async function staffSignin() {
    $('#staffErr').textContent = '';
    try {
      const r = await postAuth('/auth/login', { email: $('#email').value, password: $('#password').value });
      localStorage.setItem(TOKEN_KEY, r.token);
      await boot();
    } catch (e) { $('#staffErr').textContent = e.message; }
  }
  $('#staffSignin').onclick = staffSignin;
  $('#password').addEventListener('keydown', (e) => { if (e.key === 'Enter') staffSignin(); });

  /* ============================================================ LEARNER HOME */
  async function showLearnerHome() {
    mount('tpl-learner-home');
    course = await API.get('/me/course');
    $('#greet').textContent = 'Hello, ' + me.name.split(' ')[0];
    $('#courseTitle').textContent = course.course.title;
    $('#courseDesc').textContent = course.course.description;
    const pct = Math.round((course.completed / course.total) * 100);
    $('#ringPct').textContent = pct + '%';
    requestAnimationFrame(() => { $('#ringFg').style.strokeDashoffset = 364 - (364 * pct / 100); });
    $('#lessonCount').textContent = course.completed + ' of ' + course.total + ' done';

    const firstIncomplete = course.lessons.findIndex((l) => !l.complete);
    const list = $('#lessonList'); list.innerHTML = '';
    course.lessons.forEach((l, i) => {
      const state = l.complete ? 'done' : (i === firstIncomplete ? 'next' : 'lock');
      const open = state !== 'lock';
      const row = document.createElement('button');
      row.className = 'lrow ' + (state === 'next' ? 'is-next' : state === 'lock' ? 'is-lock' : '');
      const ic = state === 'done'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
        : state === 'next'
          ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
      row.innerHTML = `<span class="lstate ${state}">${ic}</span><span class="lt"><b>${esc(l.title)}</b><small>${esc(l.goal)}</small></span><span class="lnum">${i + 1} / ${course.total}</span>`;
      if (open) row.onclick = () => showLesson(l, i);
      else { row.disabled = true; }
      list.appendChild(row);
    });

    const done = course.completed >= course.total;
    const cc = $('#certCard');
    cc.classList.toggle('is-locked', !done);
    $('#certCardTitle').textContent = done ? 'Certificate earned' : 'Certificate';
    $('#certCardText').textContent = done ? 'Confident Computing - completed.' : 'Unlocks when all ' + course.total + ' lessons are complete.';
    $('#viewCertBtn').disabled = !done;
    $('#viewCertBtn').onclick = showCertificate;

    $('#continueBtn').disabled = done;
    $('#continueBtn').firstChild.textContent = done ? 'Course complete ' : 'Continue learning ';
    $('#continueBtn').onclick = () => { const i = course.lessons.findIndex((l) => !l.complete); if (i >= 0) showLesson(course.lessons[i], i); };
  }

  /* ============================================================ LESSON */
  let chosenLevel = null;
  function showLesson(lesson, i) {
    mount('tpl-lesson');
    chosenLevel = null;
    $('#lessonTitle').firstChild.textContent = 'Lesson ' + (i + 1) + ' ';
    $('#lessonSub').textContent = 'Lesson ' + (i + 1) + ' of ' + course.total + ' - ' + course.course.title;
    $('#videoTitle').textContent = lesson.title;
    $('#caption').textContent = lesson.goal;
    $('#lessonGoal').textContent = lesson.goal;
    const ol = $('#lessonSteps'); ol.innerHTML = '';
    lesson.steps.forEach((s, k) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="n">${k + 1}</span><span>${esc(s)}</span>`;
      ol.appendChild(li);
    });
    $('#carerNote').innerHTML = '<b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v1H7a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h1v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2h1a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4h-2V5a3 3 0 0 0-3-3z"/></svg>For staff</b>' + esc(lesson.carerNote || '');

    // real video if available; else the animated lesson player; else a placeholder
    const v = $('#video');
    if (lesson.videoUrl) {
      v.innerHTML = `<video controls preload="metadata" src="${lesson.videoUrl}"></video>`;
    } else if (window.iLearnAnim && i < window.iLearnAnim.count) {
      v.innerHTML = '';
      window.iLearnAnim.mount(v, i);
    } else {
      $('#playBtn').onclick = () => v.classList.add('playing');
    }

    $('#levels').onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const on = b.getAttribute('aria-pressed') === 'true';
      $$('#levels button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      if (!on) { b.setAttribute('aria-pressed', 'true'); chosenLevel = b.dataset.lv; } else chosenLevel = null;
    };
    renderTasks(lesson);
    $('#lessonBack').onclick = showLearnerHome;
    $('#completeBtn').onclick = async () => {
      try {
        const r = await API.post('/me/lessons/' + lesson.id + '/complete', { promptLevel: chosenLevel });
        await showLearnerHome();
        if (r.certificate) toast('Course complete - certificate unlocked!', 'ok');
        else toast('Lesson complete - well done!', 'ok');
      } catch (e) { toast(e.message, 'bad'); }
    };
    window.scrollTo(0, 0);
  }

  /* ============================================================ INTERACTIVE TASKS */
  function renderTasks(lesson) {
    const wrap = $('#tasksWrap'), list = $('#taskList');
    const tasks = lesson.tasks || [];
    if (!tasks.length) { wrap.classList.add('hidden'); return; }
    wrap.classList.remove('hidden');
    list.innerHTML = '';
    let done = 0;
    const sub = $('#tasksSub');
    const updateSub = () => { sub.textContent = done + ' of ' + tasks.length + ' done' + (done === tasks.length ? ' - brilliant!' : ''); };
    updateSub();

    tasks.forEach((task, ti) => {
      const card = document.createElement('div');
      card.className = 'task';
      const head = `<div class="task-q"><span class="task-n">${ti + 1}</span><b>${esc(task.q)}</b></div>`;
      const fb = `<div class="task-fb" aria-live="polite"></div>`;

      const finish = (msg) => {
        if (card.classList.contains('is-done')) return;
        card.classList.add('is-done'); done++; updateSub();
        card.querySelector('.task-fb').innerHTML = '<span class="ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' + esc(msg || task.ok || 'Well done!') + '</span>';
        card.querySelectorAll('.opt,.task-check,.practice-done,input').forEach((el) => { el.disabled = true; });
        if (done === tasks.length) toast('All tasks done - well done!', 'ok');
      };
      const nudge = (m) => {
        const f = card.querySelector('.task-fb');
        f.innerHTML = '<span class="try">' + esc(m || task.hint || "Not yet. Have another go. You can't get it wrong here.") + '</span>';
      };

      if (task.type === 'practice') {
        const minutes = task.minutes ? `<span class="practice-time">${task.minutes} min</span>` : '';
        const detail = task.detail ? `<p class="practice-detail">${esc(task.detail)}</p>` : '';
        const evidence = task.evidence ? `<p class="practice-evidence"><b>Evidence:</b> ${esc(task.evidence)}</p>` : '';
        card.innerHTML = head + `<div class="practice-card">${minutes}${detail}${evidence}<button class="btn btn-primary btn-sm practice-done">Mark practice done</button></div>` + fb;
        card.querySelector('.practice-done').onclick = () => finish(task.ok || 'Practice recorded. Good work.');
      } else if (task.type === 'type') {
        card.innerHTML = head +
          `<div class="task-type"><input class="task-input" placeholder="${esc(task.placeholder || 'Type here')}" aria-label="${esc(task.q)}"><button class="btn btn-primary btn-sm task-check">Check</button></div>` + fb;
        const input = card.querySelector('.task-input');
        const check = () => {
          const val = (input.value || '').trim();
          if (!val) { nudge('Type something first, then press Check.'); return; }
          if (task.answer && !val.toLowerCase().includes(String(task.answer).toLowerCase())) { nudge(task.hint || ('Try typing: ' + task.answer)); return; }
          finish();
        };
        card.querySelector('.task-check').onclick = check;
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
      } else { // pick
        const opts = (task.options || []).map((o, oi) =>
          `<button class="opt opt-${esc(o.s || 'plain')}" data-ok="${o.ok ? 1 : 0}" data-i="${oi}">${esc(o.t)}</button>`).join('');
        card.innerHTML = head + `<div class="task-opts">${opts}</div>` + fb;
        card.querySelector('.task-opts').onclick = (e) => {
          const b = e.target.closest('.opt'); if (!b || b.disabled) return;
          if (b.dataset.ok === '1') { b.classList.add('picked'); finish(); }
          else { b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 500); nudge(); }
        };
      }
      list.appendChild(card);
    });
  }

  /* ============================================================ CERTIFICATE */
  async function showCertificate() {
    mount('tpl-cert');
    if (!course) course = await API.get('/me/course');
    $('#certName').textContent = me.name;
    $('#certCourse').textContent = course.course.title;
    $('#certOrg').textContent = me.org ? me.org.name : '';
    $('#certCode').textContent = course.certificate ? course.certificate.code : '-';
    $('#certDate').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    $('#certBack').onclick = showLearnerHome;
    $('#certPrint').onclick = () => window.print();
    window.scrollTo(0, 0);
  }

  /* ============================================================ ADMIN */
  let adminLearners = [];
  async function showAdmin() {
    mount('tpl-admin');
    $('#adminOrg').textContent = me.org.name;
    const [ov, learners] = await Promise.all([API.get('/admin/overview'), API.get('/admin/learners')]);
    adminLearners = learners;
    $('#statCards').innerHTML = `
      <div class="stat"><div class="v">${ov.learners}</div><div class="l">Learners enrolled</div></div>
      <div class="stat"><div class="v gold">${ov.avg}%</div><div class="l">Average progress</div></div>
      <div class="stat"><div class="v green">${ov.certs}</div><div class="l">Certificates earned</div></div>
      <div class="stat"><div class="v">${ov.active}</div><div class="l">Active this week</div></div>`;
    drawAdminRows('');
    $('#adminSearch').oninput = (e) => drawAdminRows(e.target.value);
    $('#addLearnerBtn').onclick = openAddLearner;
    $('#exportBtn').onclick = exportCsv;
    $('#printBtn').onclick = () => window.print();
    $('#auditBtn').onclick = openAudit;
  }
  function drawAdminRows(q) {
    const tb = $('#adminRows'); tb.innerHTML = '';
    const rows = adminLearners.filter((l) => !q || l.name.toLowerCase().includes(q.toLowerCase()));
    if (!rows.length) { tb.innerHTML = '<tr><td colspan="6"><div class="empty">No learners found.</div></td></tr>'; return; }
    rows.forEach((l) => {
      const tr = document.createElement('tr');
      const label = { completed: 'Completed', in_progress: 'In progress', new: 'Not started' }[l.status];
      tr.innerHTML = `
        <td><div class="who-cell"><div class="avatar" style="background:${colourFor(l.name)}">${esc(initials(l.name))}</div>${esc(l.name)}</div></td>
        <td>Confident Computing</td>
        <td><div style="display:flex;align-items:center;gap:10px"><div class="pbar"><i style="width:${l.pct}%"></i></div><span style="font-size:.85em;color:var(--ink-soft);font-variant-numeric:tabular-nums">${l.done}/${l.total}</span></div></td>
        <td>${independence(l)}</td>
        <td>${ago(l.lastActive)}</td>
        <td><span class="pill ${l.status}">${label}</span></td>`;
      tr.onclick = () => openDrawer(l.id);
      tb.appendChild(tr);
    });
  }
  function independence(l) {
    if (l.status === 'new') return '<span style="color:var(--ink-faint)">-</span>';
    if (l.status === 'completed') return 'Independent';
    return 'Developing';
  }

  async function openDrawer(id) {
    const d = await API.get('/admin/learners/' + id);
    const dr = $('#drawer');
    const pct = Math.round((d.done / d.total) * 100);
    let rows = '';
    d.lessons.forEach((l) => {
      rows += `<div class="drow"><span class="dt ${l.complete ? 'done' : 'todo'}">${l.complete ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ''}</span><span class="dn">${l.idx + 1}. ${esc(l.title)}</span><span class="dd">${l.complete ? esc(l.promptLevel || 'Done') : '-'}</span></div>`;
    });
    dr.innerHTML = `
      <div class="drawer-head">
        <div class="avatar" style="background:${colourFor(d.name)}">${esc(initials(d.name))}</div>
        <div><b>${esc(d.name)}</b><span>Confident Computing</span></div>
        <button class="x" id="drawerClose" aria-label="Close">x</button>
      </div>
      <div class="drawer-body">
        <div class="minis">
          <div class="m"><b>${pct}%</b><span>Progress</span></div>
          <div class="m"><b>${d.done}/${d.total}</b><span>Lessons</span></div>
          <div class="m"><b>${d.certificate ? 'Yes' : 'No'}</b><span>Certificate</span></div>
        </div>
        <div class="callout"><b>Independence:</b> ${esc(d.independence)}.<br><b>Last active:</b> ${esc(ago(d.lastActive))}.${d.certificate ? '<br><b>Certificate:</b> ' + esc(d.certificate.code) : ''}</div>
        <div class="callout ${d.consent ? 'ok' : 'warn'}">
          <b>Consent &amp; capacity:</b>
          ${d.consent
            ? `Recorded ${d.consent.recordedAt ? '- ' + ago(d.consent.recordedAt) : ''}.<br>` +
              `Given by: ${esc(d.consent.givenBy || '-')}${d.consent.relationship ? ' (' + esc(d.consent.relationship) + ')' : ''}.<br>` +
              `Mental Capacity assessed: ${d.consent.capacityAssessed ? 'Yes' : 'No'}.` +
              `${d.consent.lawfulBasis ? '<br>Lawful basis: ' + esc(d.consent.lawfulBasis) : ''}`
            : 'Not yet recorded. Add this before the course starts.'}
        </div>
        <div class="section-title" style="margin-top:4px">Lesson record</div>
        ${rows}
      </div>
      <div class="drawer-foot">
        <button class="btn btn-ghost btn-sm" id="consentBtn" style="flex:1">Consent</button>
        <button class="btn btn-danger btn-sm" id="removeLearner" style="flex:1">Remove</button>
      </div>`;
    openScrim();
    $('#drawerClose').onclick = closeDrawer;
    $('#consentBtn').onclick = () => openConsent(d);
    $('#removeLearner').onclick = async () => {
      if (!confirm('Remove ' + d.name + '? This cannot be undone.')) return;
      try { await API.del('/admin/learners/' + id); closeDrawer(); await showAdmin(); toast('Learner removed', 'ok'); } catch (e) { toast(e.message, 'bad'); }
    };
  }
  function openScrim() { $('#scrim').classList.add('open'); $('#drawer').classList.add('open'); }
  function closeDrawer() { $('#scrim').classList.remove('open'); $('#drawer').classList.remove('open'); }
  $('#scrim').onclick = closeDrawer;

  function openAddLearner() {
    const m = $('#modal');
    m.innerHTML = `
      <h3>Add a learner</h3>
      <p class="modal-lede">They'll be enrolled on Confident Computing automatically.</p>
      <div class="field"><label for="nlName">Full name</label><input id="nlName" placeholder="e.g. Sarah Jones"></div>
      <div class="field"><label for="nlNote">Support note (optional)</label><input id="nlNote" placeholder="e.g. Prefers larger text"></div>
      <div class="err" id="nlErr"></div>
      <div class="modal-foot"><button class="btn btn-ghost btn-sm" id="nlCancel">Cancel</button><button class="btn btn-primary btn-sm" id="nlSave">Add learner</button></div>`;
    $('#modalScrim').classList.add('open');
    $('#nlCancel').onclick = closeModal;
    $('#nlName').focus();
    $('#nlSave').onclick = async () => {
      const name = $('#nlName').value.trim(), note = $('#nlNote').value.trim();
      if (!name) { $('#nlErr').textContent = 'Please enter a name.'; return; }
      try { await API.post('/admin/learners', { name, supportNote: note }); closeModal(); await showAdmin(); toast('Learner added', 'ok'); }
      catch (e) { $('#nlErr').textContent = e.message; }
    };
  }
  function closeModal() { $('#modalScrim').classList.remove('open'); }
  $('#modalScrim').onclick = (e) => { if (e.target === $('#modalScrim')) closeModal(); };

  // Record consent & Mental Capacity for a learner (DPIA / safeguarding evidence).
  function openConsent(d) {
    const c = d.consent || {};
    const m = $('#modal');
    m.innerHTML = `
      <h3>Consent &amp; capacity - ${esc(d.name)}</h3>
      <p class="modal-lede">Evidence that participation and data use were agreed. Required before the course starts.</p>
      <div class="field"><label for="csGiven">Consent given by</label>
        <select id="csGiven"><option value="">Select...</option><option>Self</option><option>Relative</option><option>Best-interests decision</option><option>LPA / Deputy</option></select></div>
      <div class="field"><label for="csRel">Relationship (if not self)</label><input id="csRel" placeholder="e.g. Daughter, Social worker"></div>
      <label class="check"><input type="checkbox" id="csCap"> Mental Capacity to consent assessed</label>
      <div class="field"><label for="csBasis">Lawful basis (UK GDPR)</label>
        <select id="csBasis"><option>Consent (Art. 6(1)(a))</option><option>Public task (Art. 6(1)(e))</option><option>Legitimate interests (Art. 6(1)(f))</option></select></div>
      <div class="field"><label for="csNote">Note (optional)</label><input id="csNote" placeholder="e.g. Confirmed with support worker present"></div>
      <div class="err" id="csErr"></div>
      <div class="modal-foot"><button class="btn btn-ghost btn-sm" id="csCancel">Cancel</button><button class="btn btn-primary btn-sm" id="csSave">Save record</button></div>`;
    if (c.givenBy) $('#csGiven').value = c.givenBy;
    if (c.relationship) $('#csRel').value = c.relationship;
    if (c.capacityAssessed) $('#csCap').checked = true;
    if (c.lawfulBasis) { const s = $('#csBasis'); [...s.options].forEach((o) => { if (o.value === c.lawfulBasis) s.value = c.lawfulBasis; }); }
    if (c.note) $('#csNote').value = c.note;
    $('#modalScrim').classList.add('open');
    $('#csCancel').onclick = closeModal;
    $('#csSave').onclick = async () => {
      try {
        await API.call('/admin/learners/' + d.id + '/consent', { method: 'PUT', body: JSON.stringify({
          givenBy: $('#csGiven').value, relationship: $('#csRel').value.trim(),
          capacityAssessed: $('#csCap').checked, lawfulBasis: $('#csBasis').value, note: $('#csNote').value.trim(),
        }) });
        closeModal(); closeDrawer(); toast('Consent recorded', 'ok');
      } catch (e) { $('#csErr').textContent = e.message; }
    };
  }

  // Read-only activity log for accountability / CQC.
  async function openAudit() {
    const m = $('#modal');
    m.innerHTML = `<h3>Activity log</h3><p class="modal-lede">Recent actions on this service.</p><div id="auditList" class="audit-list">Loading...</div>
      <div class="modal-foot"><button class="btn btn-primary btn-sm" id="auCancel">Close</button></div>`;
    $('#modalScrim').classList.add('open');
    $('#auCancel').onclick = closeModal;
    try {
      const rows = await API.get('/admin/audit');
      const labels = { login: 'Signed in', login_failed: 'Failed sign-in', learner_started: 'Started learner',
        learner_created: 'Added learner', learner_removed: 'Removed learner',
        learner_updated: 'Updated learner', consent_recorded: 'Recorded consent' };
      $('#auditList').innerHTML = rows.length
        ? rows.map((r) => `<div class="aurow"><span class="auw">${esc(r.actor_name || 'System')}</span><span class="aua">${esc(labels[r.action] || r.action)}${r.detail ? ' - ' + esc(r.detail) : ''}</span><span class="aut">${esc(ago(r.created_at))}</span></div>`).join('')
        : '<div class="empty">No activity yet.</div>';
    } catch (e) { $('#auditList').innerHTML = '<div class="empty">' + e.message + '</div>'; }
  }

  async function exportCsv() {
    try {
      const res = await fetch('/api/admin/export.csv', { headers: { Authorization: 'Bearer ' + API.token() } });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = me.org.name.replace(/\s+/g, '_') + '_iLearn_report.csv';
      a.click();
      toast('Report exported', 'ok');
    } catch (e) { toast('Export failed', 'bad'); }
  }

  /* ============================================================ TEXT SIZE */
  const SIZES = [1, 1.13, 1.27]; let szi = +(localStorage.getItem('ilearn.size') || 0);
  function applySize() { document.documentElement.style.setProperty('--scale', SIZES[szi]); $('#textSizeBtn').setAttribute('aria-pressed', szi > 0); }
  $('#textSizeBtn').onclick = () => { szi = (szi + 1) % SIZES.length; localStorage.setItem('ilearn.size', szi); applySize(); };
  applySize();
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDrawer(); closeModal(); } });

  /* ============================================================ BOOT */
  async function boot() {
    try {
      me = await API.get('/auth/me');
    } catch { logout(); return; }
    $('#auth').classList.add('hidden'); $('#app').classList.remove('hidden');
    setMe(me);
    if (me.role === 'admin') await showAdmin();
    else await showLearnerHome();
  }

  (async function start() {
    if (API.token()) { try { await boot(); return; } catch {} }
    resetAuth();
  })();
})();
