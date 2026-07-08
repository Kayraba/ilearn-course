/* ============================================================
   iLearn — Confident Computing lesson video engine
   Builds a long-form, narration-timed walkthrough per lesson.
   Timing is narration-driven: each beat lasts as long as it takes
   to say the line (est. ~150 wpm, with a floor), plus any practice
   "hold". With real ElevenLabs MP3s (audioUrl per beat) the runtime
   extends naturally to a full ~15-minute supported lesson.
   ============================================================ */
import { course, courses } from './course-data.js';

/* ---------- inline-styled scene builders ---------- */
const cur = '<span style="display:inline-block;width:3px;height:1.05em;background:#1f2d3a;margin-left:2px;vertical-align:-3px;animation:azblink 1.05s steps(1) infinite"></span>';
const tb = (bg, name) => `<div class="az-tb" style="display:flex;align-items:center;justify-content:space-between;background:${bg};color:#fff;font:600 15px/1 Inter,sans-serif;padding:11px 16px">${name}<span class="x" style="letter-spacing:4px;opacity:.92;font-size:14px">&#8211;&nbsp;&#9633;&nbsp;&#10005;</span></div>`;
const fbtn = (l, k, hot, extra) => `<div data-k="${k}" style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font:700 17px Georgia,serif;background:${hot ? '#cfe6ff' : '#fff'};border:1.5px solid ${hot ? '#3f8efc' : '#dce3ec'};color:#2a3b4d;${extra || ''}">${l}</div>`;
const fbtns = (hot) => { hot = hot || ''; return fbtn('B', 'B', hot.includes('B')) + fbtn('I', 'I', hot.includes('I'), 'font-style:italic') + fbtn('U', 'U', hot.includes('U'), 'text-decoration:underline') + fbtn('A', 'C', hot.includes('C'), 'color:#c0392b'); };
/* Full Home-tab ribbon with real, targetable buttons.
   opts: { size:'11', hot:'BIU C', align:'left|centre|right', bullets:bool } */
const ribbon = (o) => {
  o = o || {}; const hot = o.hot || ''; const grp = (inner) => `<div style="display:flex;align-items:center;gap:5px;padding:0 10px;border-right:1px solid #e2e8f1">${inner}</div>`;
  const rb = (l, k, on, extra) => `<div data-k="${k}" style="min-width:30px;height:30px;padding:0 6px;border-radius:7px;display:flex;align-items:center;justify-content:center;font:700 15px Georgia,serif;background:${on ? '#cfe6ff' : 'transparent'};border:1.5px solid ${on ? '#3f8efc' : 'transparent'};color:#2a3b4d;${extra || ''}">${l}</div>`;
  const sizeBox = `<div data-k="size" style="display:flex;align-items:center;gap:4px;height:30px;padding:0 8px;border:1.5px solid ${o.sizeHot ? '#3f8efc' : '#dce3ec'};border-radius:7px;background:${o.sizeHot ? '#cfe6ff' : '#fff'};font:600 14px Inter,sans-serif;color:#2a3b4d">${o.size || '11'}<span style="font-size:9px;color:#7a8a99">▾</span></div>`;
  const al = (dir, lines) => `<div data-k="al-${dir}" style="width:30px;height:30px;border-radius:7px;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:0 5px;background:${o.align === dir ? '#cfe6ff' : 'transparent'};border:1.5px solid ${o.align === dir ? '#3f8efc' : 'transparent'};align-items:${dir === 'centre' ? 'center' : dir === 'right' ? 'flex-end' : 'flex-start'}">${lines.map((w) => `<span style="display:block;height:2px;width:${w}px;background:#4a5765;border-radius:2px"></span>`).join('')}</div>`;
  return `<div style="display:flex;align-items:center;padding:8px 6px;background:#f6f8fb;border-bottom:1px solid #e2e8f1">
    ${grp(sizeBox)}
    ${grp(rb('B', 'B', hot.includes('B')) + rb('I', 'I', hot.includes('I'), 'font-style:italic') + rb('U', 'U', hot.includes('U'), 'text-decoration:underline') + rb('A', 'C', hot.includes('C'), 'color:#c0392b;border-bottom:3px solid #c0392b'))}
    ${grp(`<div data-k="bullets" style="display:flex;align-items:center;gap:5px;height:30px;padding:0 7px;border-radius:7px;background:${o.bullets ? '#cfe6ff' : 'transparent'};border:1.5px solid ${o.bullets ? '#3f8efc' : 'transparent'}"><span style="display:flex;flex-direction:column;gap:3px">${[0, 1, 2].map(() => '<span style="display:flex;align-items:center;gap:4px"><span style="width:4px;height:4px;border-radius:50%;background:#4a5765"></span><span style="width:16px;height:2px;background:#8a97a4;border-radius:2px"></span></span>').join('')}</span></div>`)}
    <div style="display:flex;align-items:center;gap:3px;padding:0 8px">${al('left', [16, 12, 16, 10])}${al('centre', [16, 12, 16, 10])}${al('right', [16, 12, 16, 10])}</div>
  </div>`;
};
/* Word window that uses the full ribbon. */
const wordR = (o, page) => `<div style="width:82%;max-width:600px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#185abd', 'Document — Word')}<div style="display:flex;gap:6px;padding:7px 14px;background:#185abd;font:600 12px Inter,sans-serif"><span style="color:#fff;opacity:.75">File</span><span style="color:#fff;background:rgba(255,255,255,.2);border-radius:5px 5px 0 0;padding:2px 8px">Home</span><span style="color:#fff;opacity:.75">Insert</span><span style="color:#fff;opacity:.75">Layout</span></div>${ribbon(o)}<div style="background:#e9edf3;padding:20px;display:flex;justify-content:center"><div style="width:88%;min-height:150px;background:#fff;box-shadow:0 3px 14px rgba(0,0,0,.08);padding:24px;font:400 22px/1.5 Georgia,serif;color:#1f2d3a">${page}</div></div></div>`;
export const word = (ribbon, page) => `<div style="width:78%;max-width:560px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#185abd', 'Document — Word')}<div style="display:flex;gap:9px;padding:9px 16px;background:#f2f5f9;border-bottom:1px solid #e2e8f1">${ribbon}</div><div style="background:#e9edf3;padding:20px;display:flex;justify-content:center"><div style="width:88%;min-height:140px;background:#fff;box-shadow:0 3px 14px rgba(0,0,0,.08);padding:24px;font:400 22px/1.5 Georgia,serif;color:#1f2d3a">${page}</div></div></div>`;
/* Excel Home + Formulas ribbon with targetable buttons: Bold, £ currency, Σ AutoSum. */
const xribbon = (o) => {
  o = o || {}; const grp = (inner) => `<div style="display:flex;align-items:center;gap:5px;padding:0 10px;border-right:1px solid #e2e8f1">${inner}</div>`;
  const b = (l, k, on, extra) => `<div data-k="${k}" style="min-width:30px;height:30px;padding:0 7px;border-radius:7px;display:flex;align-items:center;gap:5px;justify-content:center;font:700 14px Inter,sans-serif;background:${on ? '#c9ecdd' : 'transparent'};border:1.5px solid ${on ? '#12a06a' : 'transparent'};color:#2a3b4d;${extra || ''}">${l}</div>`;
  const tab = (t, on) => `<span style="color:#fff;${on ? 'background:rgba(255,255,255,.22);border-radius:5px 5px 0 0' : 'opacity:.75'};padding:2px 8px">${t}</span>`;
  return `<div style="display:flex;gap:6px;padding:7px 14px;background:#107c41;font:600 12px Inter,sans-serif">${tab('File')}${tab('Home', o.tab !== 'formulas')}${tab('Insert')}${tab('Formulas', o.tab === 'formulas')}</div>
  <div style="display:flex;align-items:center;padding:8px 6px;background:#f2f7f4;border-bottom:1px solid #dce8e0">
    ${grp(b('<span style="font-family:Georgia,serif">B</span>', 'B', o.hot === 'B') + b('<span style="font-family:Georgia,serif;font-style:italic">I</span>', 'I', o.hot === 'I') + b('<span style="font-family:Georgia,serif;text-decoration:underline">U</span>', 'U'))}
    ${grp(b('£', 'money', o.hot === 'money') + b('%', 'pct'))}
    ${grp(b('&#931; AutoSum', 'autosum', o.hot === 'autosum', 'color:' + (o.hot === 'autosum' ? '#0d6a65' : '#107c41')))}
  </div>`;
};
const excelHead = (sel, formula) => `<div style="display:flex;align-items:center;gap:12px;padding:8px 16px;background:#f4f7fa;border-bottom:1px solid #e2e8f1"><div style="min-width:50px;text-align:center;font:600 14px Inter,sans-serif;color:#5b6b7d;background:#fff;border:1px solid #dbe3ec;border-radius:6px;padding:6px 8px">${sel || 'A1'}</div><div style="color:#a7b4c0;font:700 15px Inter,sans-serif">fx</div><div data-fx style="flex:1;font:400 15px Inter,sans-serif;color:#23303d">${formula || ''}</div></div>`;
const excel = (cells, sel, cls, rib) => {
  cls = cls || {}; const cols = ['A', 'B', 'C'];
  const head = '<div style="background:#eef2f7;border:1px solid #dbe3ec"></div>' + cols.map((c) => `<div style="background:#eef2f7;border:1px solid #dbe3ec;display:flex;align-items:center;justify-content:center;font:600 14px Inter,sans-serif;color:#5b6b7d;padding:7px 0">${c}</div>`).join('');
  let body = '';
  for (let r = 1; r <= 5; r++) {
    body += `<div style="background:#eef2f7;border:1px solid #dbe3ec;display:flex;align-items:center;justify-content:center;font:600 14px Inter,sans-serif;color:#5b6b7d">${r}</div>` + cols.map((c) => {
      const k = c + r, v = cells[k] || '', sl = sel === k, ex = cls[k] || '';
      const bold = r === 1 ? 'font-weight:700;' : '';
      const bg = sl ? '#e6f4f1' : ex === 'tot' ? '#fff7e6' : ex === 'sum' ? '#eaf6ff' : '#fff';
      const bd = sl ? '2px solid #1b8f8a' : '1px solid #e3e9f1';
      return `<div data-cell="${k}" style="border:${bd};background:${bg};${bold}display:flex;align-items:center;padding:7px 10px;font:400 15px Inter,sans-serif;color:#23303d;min-height:32px">${v}</div>`;
    }).join('');
  }
  return `<div style="width:78%;max-width:560px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#107c41', 'Book1 — Excel')}${xribbon(rib || {})}${excelHead(sel, (cells[sel] || ''))}<div style="display:grid;grid-template-columns:42px repeat(3,1fr);padding:13px;background:#fbfcfe">${head}${body}</div></div>`;
};
/* Excel with a NARROW column A whose data is cut off, plus a draggable column edge handle.
   phase: 'narrow' (cut off) | 'drag' (handle highlighted) | 'wide' (fixed) */
const excelWidth = (phase) => {
  const narrow = phase !== 'wide';
  const colA = narrow ? '58px' : '150px';
  const clip = narrow ? 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;' : '';
  const rows = [['bread rolls', '£2'], ['orange juice', '£3'], ['tea bags', '£4']];
  const hcell = (t, first) => `<div style="background:#eef2f7;border:1px solid #dbe3ec;position:relative;display:flex;align-items:center;justify-content:center;font:600 14px Inter,sans-serif;color:#5b6b7d;padding:7px 0">${t}${first ? `<span data-k="edge" style="position:absolute;right:-4px;top:0;bottom:0;width:8px;cursor:col-resize;display:flex;align-items:center;justify-content:center">${phase === 'drag' ? '<span style="width:3px;height:120%;background:#12857f;box-shadow:0 0 0 3px rgba(19,133,140,.25)"></span>' : '<span style="width:1px;height:100%;background:#c3cdd8"></span>'}</span>` : ''}</div>`;
  let body = '';
  rows.forEach((r, i) => {
    body += `<div style="background:#eef2f7;border:1px solid #dbe3ec;display:flex;align-items:center;justify-content:center;font:600 14px Inter,sans-serif;color:#5b6b7d">${i + 2}</div>`;
    body += `<div style="border:1px solid #e3e9f1;background:#fff;${clip}display:flex;align-items:center;padding:7px 9px;font:400 15px Inter,sans-serif;color:#23303d;min-height:32px">${r[0]}</div>`;
    body += `<div style="border:1px solid #e3e9f1;background:#fff;display:flex;align-items:center;padding:7px 9px;font:400 15px Inter,sans-serif;color:#23303d">${r[1]}</div>`;
  });
  return `<div style="width:78%;max-width:560px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#107c41', 'Book1 — Excel')}${xribbon({})}<div style="display:grid;grid-template-columns:38px ${colA} 90px;padding:14px;background:#fbfcfe;transition:grid-template-columns .5s ease">
    <div style="background:#eef2f7;border:1px solid #dbe3ec"></div>${hcell('A', true)}${hcell('B')}
    <div style="background:#eef2f7;border:1px solid #dbe3ec;display:flex;align-items:center;justify-content:center;font:600 14px Inter,sans-serif;color:#5b6b7d">1</div><div style="border:1px solid #e3e9f1;background:#fff;font-weight:700;${clip}display:flex;align-items:center;padding:7px 9px;font:700 15px Inter,sans-serif;color:#23303d">Item</div><div style="border:1px solid #e3e9f1;background:#fff;font-weight:700;display:flex;align-items:center;padding:7px 9px;font:700 15px Inter,sans-serif;color:#23303d">Cost</div>
    ${body}
  </div></div>`;
};
const deskIc = (bg, glyph, lab, key, sel) => `<div data-ic="${key}" style="width:92px;text-align:center;${sel === key ? 'background:rgba(255,255,255,.18);border-radius:10px;' : ''}padding:8px 4px"><div style="width:56px;height:56px;margin:0 auto;border-radius:12px;background:${bg};display:flex;align-items:center;justify-content:center;font:700 25px Inter,sans-serif;color:#fff;box-shadow:0 6px 16px rgba(0,0,0,.25)">${glyph}</div><div style="margin-top:7px;font:500 13px Inter,sans-serif;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)">${lab}</div></div>`;
const desk = (sel) => `<div style="width:88%;height:78%;border-radius:16px;background:linear-gradient(150deg,#1d5e7e,#2f8f7e);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 30px 70px rgba(8,30,55,.4);display:flex;gap:22px;align-items:flex-start;padding:28px">${deskIc('#5b6b7b', '&#128465;', 'Recycle', 'bin', sel)}${deskIc('#185abd', 'W', 'Word', 'w', sel)}${deskIc('#107c41', 'X', 'Excel', 'x', sel)}${deskIc('#e8a13a', '&#128193;', 'Documents', 'docs', sel)}</div>`;
const kkey = (t, flex, hot) => `<div style="flex:${flex || '0 0 auto'};min-width:38px;height:42px;display:flex;align-items:center;justify-content:center;background:${hot && hot.includes(t) ? '#1b8f8a' : '#fff'};color:${hot && hot.includes(t) ? '#fff' : '#28323d'};border-radius:8px;border:1.5px solid #dce3ec;font:600 14px Inter,sans-serif;box-shadow:0 2px 0 #d3dae3">${t}</div>`;
const krow = (inner) => `<div style="display:flex;gap:6px;justify-content:center;margin-bottom:6px">${inner}</div>`;
const keys = (hot) => `<div style="background:#eef2f6;border-radius:16px;padding:16px;box-shadow:0 30px 70px rgba(8,30,55,.4)">${krow(['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((x) => kkey(x, 0, hot)).join('') + kkey('&#9003;', '1 1 0', hot))}${krow(['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((x) => kkey(x, 0, hot)).join('') + kkey('&#9166; Enter', '1 1 0', hot))}${krow(kkey('&#8679; Shift', '1 1 0', hot) + ['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((x) => kkey(x, 0, hot)).join(''))}${krow(kkey('space', '1 1 0', hot))}</div>`;
const combo = (a, b, label) => `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:32px 42px;text-align:center"><div style="display:flex;gap:15px;align-items:center;justify-content:center"><div style="min-width:92px;height:60px;display:flex;align-items:center;justify-content:center;background:#12395f;color:#fff;border-radius:12px;font:700 19px Inter,sans-serif">${a}</div><div style="font:300 36px Inter,sans-serif;color:#1b8f8a">+</div><div style="min-width:60px;height:60px;display:flex;align-items:center;justify-content:center;background:#12395f;color:#fff;border-radius:12px;font:700 24px Inter,sans-serif">${b}</div></div><div style="margin-top:16px;font:600 23px Lexend,Inter,sans-serif;color:#12395f">${label}</div></div>`;
const con = (icon, title, pill) => `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:34px 42px;max-width:460px;text-align:center"><div style="font-size:52px;line-height:1">${icon}</div><div style="margin-top:12px;font:600 24px/1.3 Lexend,Inter,sans-serif;color:#12395f">${title}</div>${pill ? `<div style="display:inline-block;margin-top:13px;background:#e6f4f1;color:#15706b;border-radius:999px;padding:8px 18px;font:600 14px Inter,sans-serif">${pill}</div>` : ''}</div>`;
const folder = () => `<div style="width:72%;max-width:520px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#5b6b7b', '&#128193; Documents')}<div style="background:#fbfcfd;padding:28px;min-height:150px"><div data-ic="file" style="width:120px;text-align:center"><div style="font-size:54px;color:#185abd">&#128462;</div><div style="margin-top:6px;font:500 14px Inter,sans-serif;color:#2a3b4d">my first note</div></div></div></div>`;
const save = (name) => `<div style="width:74%;max-width:540px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#185abd', 'Save As')}<div style="background:#eceef1;padding:28px;display:flex;justify-content:center"><div style="background:#fff;border-radius:12px;box-shadow:0 14px 34px rgba(0,0,0,.18);padding:22px;width:90%"><div style="margin-bottom:15px;color:#52606e;font:500 15px Inter,sans-serif">&#128193; Documents</div><div style="display:flex;gap:11px;align-items:center"><span style="color:#3c4854;font:500 15px Inter,sans-serif">File name:</span><div data-fx style="flex:1;border:2px solid #185abd;border-radius:7px;padding:9px 12px;min-height:22px;font:400 16px Inter,sans-serif;color:#1f2d3a">${name || ''}</div></div><div style="text-align:right;margin-top:16px"><span data-k="save" style="display:inline-block;background:#185abd;color:#fff;padding:9px 24px;border-radius:8px;font:600 15px Inter,sans-serif">Save</span></div></div></div></div>`;
/* Save-as-PDF dialog with the file-type dropdown highlighted. */
const savePdf = (open) => `<div style="width:74%;max-width:540px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#185abd', 'Save As')}<div style="background:#eceef1;padding:26px;display:flex;justify-content:center"><div style="background:#fff;border-radius:12px;box-shadow:0 14px 34px rgba(0,0,0,.18);padding:22px;width:92%"><div style="margin-bottom:13px;color:#52606e;font:500 15px Inter,sans-serif">&#128193; Documents</div><div style="display:flex;gap:11px;align-items:center;margin-bottom:14px"><span style="color:#3c4854;font:500 14px Inter,sans-serif">File name:</span><div style="flex:1;border:1.5px solid #dce3ec;border-radius:7px;padding:8px 11px;font:400 15px Inter,sans-serif;color:#1f2d3a">my shopping list</div></div><div style="display:flex;gap:11px;align-items:center"><span style="color:#3c4854;font:500 14px Inter,sans-serif">Save as type:</span><div data-k="ftype" style="flex:1;position:relative;border:2px solid ${open ? '#c0392b' : '#185abd'};border-radius:7px;padding:8px 11px;font:600 15px Inter,sans-serif;color:${open ? '#c0392b' : '#1f2d3a'};background:#fff">${open ? 'PDF (*.pdf)' : 'Word Document (*.docx)'}<span style="position:absolute;right:10px;color:#7a8a99">▾</span></div></div>${open ? '<div style="margin-top:8px;background:#fff;border:1px solid #dce3ec;border-radius:8px;box-shadow:0 10px 24px rgba(0,0,0,.12);overflow:hidden"><div style="padding:8px 12px;font:400 14px Inter,sans-serif;color:#52606e">Word Document (*.docx)</div><div data-k="pdfopt" style="padding:8px 12px;font:600 14px Inter,sans-serif;color:#fff;background:#185abd">PDF (*.pdf)</div></div>' : ''}</div></div></div>`;
const signin = () => `<div style="width:78%;max-width:500px;border-radius:18px;background:linear-gradient(160deg,#123a63,#2f8f7e);box-shadow:0 30px 70px rgba(8,30,55,.4);padding:40px;text-align:center;color:#fff"><div style="width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,.85);margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:44px">&#128100;</div><div style="margin-top:14px;font:600 22px Lexend,Inter,sans-serif">Signing in…</div><div data-fx style="margin:16px auto 0;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.5);border-radius:8px;padding:11px 0;max-width:230px;letter-spacing:6px;font-size:20px;min-height:22px"></div></div>`;
const power = (on) => `<div style="text-align:center"><div style="width:130px;height:130px;border-radius:50%;background:${on ? '#1b8f8a' : '#12395f'};display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 18px 44px rgba(12,39,77,.5);${on ? 'animation:azpulse 2s ease-in-out infinite' : ''}"><svg viewBox="0 0 24 24" width="62" height="62" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M12 3v9"></path><path d="M6.5 7a8 8 0 1 0 11 0"></path></svg></div><div style="margin-top:18px;font:600 22px Lexend,Inter,sans-serif;color:#fff">${on ? 'Starting up…' : 'The power button'}</div></div>`;
const titleCard = (n, t, outcome) => `<div style="text-align:center;color:#fff;max-width:640px"><div style="font:600 15px Inter,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#7fd6cf">Lesson ${n}</div><div style="margin-top:11px;font:600 38px/1.2 Lexend,Inter,sans-serif">${t}</div>${outcome ? `<div style="margin-top:18px;font:400 19px/1.5 Inter,sans-serif;color:#cfe0ee">${outcome}</div>` : ''}</div>`;
const outcomeCard = (o) => `<div style="text-align:center;color:#fff;max-width:600px"><div style="font:600 14px Inter,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#7fd6cf">By the end of this lesson</div><div style="margin-top:16px;font:600 30px/1.35 Lexend,Inter,sans-serif">“${o}”</div></div>`;
const mistakeCard = (t) => `<div style="text-align:center;color:#fff;max-width:600px"><div style="width:74px;height:74px;border-radius:50%;background:#f4b740;color:#5a3d00;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto;box-shadow:0 12px 30px rgba(244,183,64,.4)">!</div><div style="margin-top:16px;font:600 15px Inter,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#f4d58a">A common mix-up</div><div style="margin-top:10px;font:500 24px/1.4 Lexend,Inter,sans-serif">${t}</div></div>`;
const tryCard = (t) => `<div style="text-align:center;color:#fff;max-width:620px"><div style="width:78px;height:78px;border-radius:50%;background:#1b8f8a;display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 12px 30px rgba(27,143,138,.5)"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></div><div style="margin-top:16px;font:600 14px Inter,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#7fd6cf">Now you try — practice time</div><div style="margin-top:10px;font:500 24px/1.4 Lexend,Inter,sans-serif">${t}</div><div data-count style="margin-top:16px;font:700 40px/1 Lexend,Inter,sans-serif;color:#7fd6cf;font-variant-numeric:tabular-nums"></div><div style="margin-top:12px;font:400 15px Inter,sans-serif;color:#bcd3e8">Try it on your computer while the timer runs. Pause any time; play again when you are ready.</div></div>`;
const doneCard = (msg) => `<div style="text-align:center;color:#fff;max-width:580px"><div style="width:92px;height:92px;border-radius:50%;background:#1b8f8a;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:48px;box-shadow:0 12px 30px rgba(27,143,138,.5)">&#10003;</div><div style="margin-top:16px;font:600 30px/1.25 Lexend,Inter,sans-serif">${msg}</div><div style="margin-top:12px;font:400 17px/1.5 Inter,sans-serif;color:#bcd3e8">That is the end of the lesson. Now scroll down and complete the activities we have just explained, with your tutor.</div></div>`;
const esc = (v) => String(v || '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const cleanTask = (t) => String(t || '')
  .replace(/Staff setup:\s*/i, 'Staff will first help you prepare: ')
  .replace(/Warm-up:\s*/i, '')
  .replace(/Guided\s+/i, '')
  .replace(/Stretch:\s*/i, '')
  .replace(/Reflection:\s*/i, '')
  .replace(/Ask the learner to/gi, 'Staff will ask you to')
  .replace(/Ask the learner/gi, 'Staff will ask you')
  .replace(/Learner practises/gi, 'You practise')
  .replace(/Learner opens/gi, 'You open')
  .replace(/Learner selects/gi, 'You select')
  .replace(/Learner points/gi, 'You point')
  .replace(/Learner decides/gi, 'You decide')
  .replace(/learner’s/gi, 'your')
  .replace(/\bthe your\b/gi, 'your')
  .replace(/the learner/gi, 'you')
  .replace(/Learner/gi, 'You')
  // after Learner→You, de-conjugate third-person verbs, incl. compounds ("You finds and presses" → "You find and press")
  .replace(/\b([Yy]ou) ((?:attempts|copies|formats|finds|presses|opens|clicks|types|takes|picks|sorts|deletes|plugs|completes|holds|names|says|sends|builds|wakes|unlocks|starts|ends|answers|reads|writes|marks|calls|helps|adjusts|charges|identifies|demonstrates|explains|chooses|creates|reaches|produces|sits|points|moves|stops|repeats|views|closes|finishes)(?:(?:, | and |, and )(?:attempts|copies|formats|finds|presses|opens|clicks|types|takes|picks|sorts|deletes|plugs|completes|holds|names|says|sends|builds|wakes|unlocks|starts|ends|answers|reads|writes|marks|calls|helps|adjusts|charges|identifies|demonstrates|explains|chooses|creates|reaches|produces|sits|points|moves|stops|repeats|views|closes|finishes))*)/g, (m, y, g) => y + ' ' + g.replace(/\b[a-z]+\b/g, (v) => (v === 'and') ? v : (v.endsWith('sses') || v.endsWith('ches') || v.endsWith('shes') ? v.slice(0, -2) : v.endsWith('ies') ? v.slice(0, -3) + 'y' : v.slice(0, -1))))
  .replace(/Staff names/gi, 'Staff will name')
  .replace(/Staff says/gi, 'Staff will say')
  .replace(/Staff signs/gi, 'Staff will sign')
  .replace(/what they are most proud of/gi, 'what you are most proud of')
  .replace(/[“”"]/g, '')
  .replace(/\s+/g, ' ')
  .replace(/[.:]+$/, '')
  .trim();
const shortTask = (t) => esc(cleanTask(t));
const activityCard = (guide) => `<div style="color:#fff;max-width:720px;width:min(88%,720px)"><div style="font:600 14px Inter,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#7fd6cf;text-align:center">Your activities will match this lesson</div><div style="margin:14px auto 0;display:grid;gap:10px">${guide.items.map((item, idx) => `<div style="display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:12px 14px;text-align:left"><div style="flex:0 0 30px;height:30px;border-radius:50%;background:#1b8f8a;color:#fff;display:flex;align-items:center;justify-content:center;font:700 14px Inter,sans-serif">${idx + 1}</div><div><div style="font:700 15px/1.25 Inter,sans-serif;color:#fff">${esc(item.head)}</div><div style="margin-top:3px;font:400 15px/1.45 Inter,sans-serif;color:#cfe0ee">${esc(item.text)}</div></div></div>`).join('')}</div><div style="margin-top:13px;text-align:center;font:400 15px/1.5 Inter,sans-serif;color:#bcd3e8">Take them in order. The quiz questions check the words, and the practice tasks check the real skill.</div></div>`;
function activityGuide(L) {
  const practice = L.tasks.filter((t) => t.type === 'practice');
  const picks = L.tasks.filter((t) => t.type === 'pick');
  const types = L.tasks.filter((t) => t.type === 'type');
  const firstPractice = practice[0]?.detail || practice[0]?.q || L.steps?.[0] || 'Start with a calm warm-up.';
  const guided = practice[1]?.detail || practice[1]?.q || L.steps?.slice(0, 2).join(', ') || 'Practise the skill with staff support.';
  const typing = types[0]?.q || picks[0]?.q || 'Answer the short checks carefully.';
  const finish = practice[practice.length - 1]?.detail || types[types.length - 1]?.q || picks[picks.length - 1]?.q || 'Finish by showing the skill again.';
  const say = `When you start the activities, they will follow the same order as this lesson. First, you do a warm-up: ${cleanTask(firstPractice)}. Then you answer quick checks, so we know the key words make sense. Next, you practise the real computer skill: ${cleanTask(guided)}. You may also type a short answer, for example: ${cleanTask(typing)}. At the end, you finish with a stretch or reflection: ${cleanTask(finish)}. Take one activity at a time. If you need help, ask staff, then try the next step yourself.`;
  return {
    say,
    items: [
      { head: 'Warm up first', text: shortTask(firstPractice) },
      { head: 'Check the key words', text: picks[0] ? shortTask(picks[0].q) : 'Answer the quick check questions carefully.' },
      { head: 'Practise on the real computer', text: shortTask(guided) },
      { head: 'Type or reflect', text: shortTask(typing) },
      { head: 'Finish with confidence', text: shortTask(finish) },
    ],
  };
}

/* ---------- per-lesson demonstration frames (authored) ----------
   Each frame: { say, html, focus?, type? }  */
const F = [
  // 1 — Turn on and sign in
  [
    { say: 'Look at the front or side of the computer for a small round button with a line through the top. That is the power button.', html: power(false) },
    { say: 'We press the power button once. Just once — a single, gentle press. Then we take our hand away and wait.', html: power(true) },
    { say: 'Waiting is part of using a computer well. The screen may be dark for a moment. That is completely normal. We stay calm and let it wake up.', html: power(true) },
    { say: 'Now the computer asks who we are. We type our password carefully, letter by letter. The dots hide it so it stays private.', html: signin(), type: { sel: '[data-fx]', txt: '••••••' } },
    { say: 'And there it is. This screen is called the desktop. It is our starting place, with our folders and programs ready to use.', html: desk() },
  ],
  // 2 — mouse & click
  [
    { say: 'Rest your hand gently on the mouse. As you slide it, watch the little arrow on screen move with you — that arrow is the pointer.', html: desk() },
    { say: 'The pointer is like our finger, reaching into the screen. We move slowly, and we stop right on the thing we want.', html: desk(), focus: '[data-ic="bin"]' },
    { say: 'To choose something, we rest the pointer on it and press the left button once. Let us choose the blue W for Word.', html: desk(), focus: '[data-ic="w"]' },
    { say: 'One click chooses it. See how it lights up? We have not opened it yet — one click simply chooses.', html: desk('w') },
  ],
  // 3 — double-click
  [
    { say: 'Point the arrow at the Documents folder. To open it, we will use two quick clicks, one after the other.', html: desk(), focus: '[data-ic="docs"]' },
    { say: 'The secret is this: keep the mouse perfectly still, and click twice quickly. Click, click. The stillness is what matters most.', html: desk(), focus: '[data-ic="docs"]' },
    { say: 'And it opens. Well done. That is a double-click. The Documents folder is now open in front of us.', html: folder() },
  ],
  // 4 — keyboard
  [
    { say: 'The keyboard has lots of keys, but three do most of the work: Space, Enter, and Backspace. Let us find them together.', html: keys(['space', '&#9166; Enter', '&#9003;']) },
    { say: 'We click where the line is flashing, and then we type, slowly. Let us type the word cat, one letter at a time.', html: word(fbtns(), '<span data-fx></span>' + cur), type: { sel: '[data-fx]', txt: 'cat' } },
    { say: 'The Space bar makes a gap between words. And if we make a mistake, the Backspace key removes the last letter. Mistakes are completely fine.', html: word(fbtns(), 'cat' + cur) },
  ],
  // 5 — open, minimise, close
  [
    { say: 'Double-click the blue W to open Word. Watch how it opens up in its own window on the screen.', html: desk(), focus: '[data-ic="w"]' },
    { say: 'Here it is, open in its own window. At the top corner are three small buttons that control the window.', html: word(fbtns(), cur) },
    { say: 'When we are finished, we find the X in the very top corner. The X means: I am done with this window.', html: word(fbtns(), cur), focus: '.az-tb .x' },
  ],
  // 6 — save
  [
    { say: 'We have written a short note. To keep it, we click the File menu at the top, and then choose Save.', html: word(fbtns(), 'My note' + cur) },
    { say: 'The computer asks for a name. We give it a simple, clear name, so we can find it again later.', html: save(''), type: { sel: '[data-fx]', txt: 'my first note' } },
    { say: 'And we always save to the same place: the Documents folder. Then we press Save.', html: save('my first note'), focus: '[data-k="save"]' },
    { say: 'Later, we open Documents, and our work is waiting for us. The same drawer, every time.', html: folder(), focus: '[data-ic="file"]' },
  ],
  // 7 — files & folders
  [
    { say: 'Here is one file. Think of a file as a single piece of work — one note, one letter, one list.', html: folder(), focus: '[data-ic="file"]' },
    { say: 'A folder is like a box that holds many files together, and keeps them tidy. Documents is the folder we use most.', html: con('&#128193;', 'A folder holds your files', 'It keeps them tidy and easy to find') },
    { say: 'So when we look for our work, we open Documents, and there it is, kept safely inside.', html: folder(), focus: '[data-ic="file"]' },
  ],
  // 8 — practice save & find
  [
    { say: 'Watch closely just once. In a moment you will try the whole thing yourself, so notice each step as I go.', html: desk(), focus: '[data-ic="w"]' },
    { say: 'First we type our note.', html: word(fbtns(), '<span data-fx></span>' + cur), type: { sel: '[data-fx]', txt: 'Hello' } },
    { say: 'Then we save it, with a name, in Documents.', html: save('my note'), focus: '[data-k="save"]' },
    { say: 'And finally we find it again in the Documents folder. This whole routine is where independence begins to show.', html: folder(), focus: '[data-ic="file"]' },
  ],
  // 9 — Word sentence
  [
    { say: 'Open Word by double-clicking the blue W, and click onto the blank white page so the cursor is ready.', html: desk(), focus: '[data-ic="w"]' },
    { say: 'A good sentence starts with a capital letter. We hold the Shift key to make that first capital.', html: word(fbtns(), '<span data-fx></span>' + cur), type: { sel: '[data-fx]', txt: 'I am learning to use a computer.' } },
    { say: 'We put a space between each word, and we finish with a full stop. There — a clear, complete sentence.', html: word(fbtns(), 'I am learning to use a computer.' + cur) },
  ],
  // 10 — copy paste undo
  [
    { say: 'First we choose the text. Put the pointer just before the word, hold the left mouse button down, and slide across it. The word turns blue — that means it is selected.', html: wordR({}, '<span style="background:#cfe2ff">Hello</span>' + cur) },
    { say: 'Now copy it. Find the Control key at the bottom-left of the keyboard. Hold it down, and while still holding, tap the letter C. Control and C together means copy.', html: combo('Ctrl', 'C', 'Hold both together = Copy') },
    { say: 'Click where you want the word to go. Then hold Control down again and, while holding, tap the letter V. Control and V together pastes your copy in.', html: combo('Ctrl', 'V', 'Hold both together = Paste') },
    { say: 'Made a mistake? Do not worry. Hold Control down and tap the letter Z. Control and Z together is Undo — it steps you back, one change at a time. Nothing here can break.', html: combo('Ctrl', 'Z', 'Hold both together = Undo') },
  ],
  // 11 — format text
  [
    { say: 'Always choose the word first. Slide the mouse across it so it turns blue. Up in the toolbar at the top is a row of buttons — that is where we change how the word looks.', html: wordR({}, '<span style="background:#cfe2ff">David</span>' + cur) },
    { say: 'Find the button with a bold letter B. Click it once. Your word becomes bold — darker and stronger, so it stands out.', html: wordR({ hot: 'B' }, '<b>David</b>' + cur), focus: '[data-k="B"]' },
    { say: 'Next to it is the slanted letter I, for italic. Click it and the letters lean over, like this.', html: wordR({ hot: 'I' }, '<b><i>David</i></b>' + cur), focus: '[data-k="I"]' },
    { say: 'Now the underlined letter U. Click the U button and a line appears under your word — that is underline, useful for something important.', html: wordR({ hot: 'U' }, '<b><i><u>David</u></i></b>' + cur), focus: '[data-k="U"]' },
    { say: 'Last is the letter A with a coloured bar under it. Click it to change the colour of your word. Remember the rule: choose the word first, then change it.', html: wordR({ hot: 'C' }, '<b><i><u style="color:#c0392b">David</u></i></b>' + cur), focus: '[data-k="C"]' },
  ],
  // 12 — title & alignment
  [
    { say: 'Type a short title at the top, then slide the mouse across it so it turns blue. In the toolbar, that little box with a number in it is the text size.', html: wordR({ size: '11' }, '<span style="font-size:22px;background:#cfe2ff">My List</span>' + cur), focus: '[data-k="size"]' },
    { say: 'Click the size box and choose a bigger number, like twenty-eight. Watch — as the number goes up, your title grows bigger on the page.', html: wordR({ size: '28', sizeHot: true }, '<span style="font-size:34px;background:#cfe2ff">My List</span>'), focus: '[data-k="size"]' },
    { say: 'Now click the bold button, the letter B, so the title is nice and strong.', html: wordR({ size: '28', hot: 'B' }, '<span style="font-size:34px;font-weight:700">My List</span>'), focus: '[data-k="B"]' },
    { say: 'To move it to the middle, look for the align buttons — small rows of lines. Click the centre one, and your title jumps neatly into the middle of the page.', html: wordR({ size: '28', hot: 'B', align: 'centre' }, '<div style="text-align:center;font-size:34px;font-weight:700">My List</div>'), focus: '[data-k="al-centre"]' },
  ],
  // 13 — lists, spell, PDF
  [
    { say: 'In the toolbar, look for the bullets button — three little dots stacked with lines beside them. Click it, and a dot appears, ready for your first list item. Type milk.', html: wordR({ bullets: true }, '<div>&#8226; milk</div>' + cur), focus: '[data-k="bullets"]' },
    { say: 'Press Enter after each item and a new dot appears on the next line for you. Milk, bread, eggs — one under the other, tidy and clear.', html: wordR({ bullets: true }, '<div>&#8226; milk</div><div>&#8226; bread</div><div>&#8226; eggs</div>' + cur) },
    { say: 'If a word gets a red wavy line under it, that is Word saying: please check the spelling. Right-click the word to see suggested corrections. It is helping you, not telling you off.', html: wordR({ bullets: true }, '<div>&#8226; milk</div><div>&#8226; <span style="text-decoration:underline wavy #d33">bred</span></div>') },
    { say: 'To share it safely, click File, then Save As. In the box that says "Save as type", click the little arrow to open the list.', html: savePdf(false), focus: '[data-k="ftype"]' },
    { say: 'From that list, choose PDF. A PDF looks exactly the same on every computer, phone or printer. Click Save, and your list is ready to send.', html: savePdf(true), focus: '[data-k="pdfopt"]' },
  ],
  // 14 — Excel cells
  [
    { say: 'Open Excel and look at the screen. Instead of a blank page, you see a grid of little boxes, like squared paper.', html: con('&#129003;', 'Excel is a grid', 'Each little box is a cell') },
    { say: 'Each little box in the grid is called a cell. The columns use letters across the top, and the rows use numbers down the side.', html: excel({}, 'A1') },
    { say: 'So the box in the very top-left corner is called A1 — column A, row 1. Every cell has a name like this.', html: excel({}, 'A1'), focus: '[data-cell="A1"]' },
  ],
  // 15 — Excel table
  [
    { say: 'Click cell A1, at the very top-left. Type your first heading, Item, then press Enter to drop down to the cell below.', html: excel({ A1: 'Item', B1: 'Cost' }, 'A1') },
    { say: 'Type your list down the column — bread rolls, orange juice, tea bags. Notice the long words get cut off, because column A is too narrow.', html: excelWidth('narrow') },
    { say: 'To make it wider, move the mouse up to the line between the A and the B, at the top. The pointer changes to a double arrow. Hold the left button down on that line.', html: excelWidth('drag'), focus: '[data-k="edge"]' },
    { say: 'Now drag to the right, and let go. The column stretches wider, and every word fits. That is how we widen a column whenever text is cut off.', html: excelWidth('wide') },
  ],
  // 16 — Excel formulas
  [
    { say: 'We have a short list of prices. Click cell B5, just under the numbers — this is where the total will go.', html: excel({ A1: 'Item', B1: 'Cost', A2: 'milk', B2: '1', A3: 'bread', B3: '2', A4: 'eggs', B4: '3', A5: 'Total' }, 'B5'), focus: '[data-cell="B5"]' },
    { say: 'Every formula begins with an equals sign. We type equals, S U M, then the cells to add, in brackets.', html: excel({ A1: 'Item', B1: 'Cost', A2: 'milk', B2: '1', A3: 'bread', B3: '2', A4: 'eggs', B4: '3', A5: 'Total' }, 'B5'), type: { sel: '[data-fx]', txt: '=SUM(B2:B4)' } },
    { say: 'We press Enter, and Excel adds it all up for us. The total is six. It did the maths, instantly.', html: excel({ A1: 'Item', B1: 'Cost', A2: 'milk', B2: '1', A3: 'bread', B3: '2', A4: 'eggs', B4: '3', A5: 'Total', B5: '6' }, 'B5', { B2: 'sum', B3: 'sum', B4: 'sum', B5: 'tot' }) },
    { say: 'The AutoSum button, marked with the Greek letter sigma, does this in a single click. A wonderful way to finish the course.', html: con('&#931;', 'AutoSum', 'One click totals a whole column') },
  ],
];

/* per-lesson closing message (headline + spoken line) — unique to each skill */
const CLOSINGS = [
  { head: 'You can start a computer!', say: 'Brilliant. You now know how to turn a computer on, wait calmly, and sign in safely — the very first step to being confident.' },
  { head: 'You can use the mouse!', say: 'Lovely work. You can move the pointer and click once to choose — the mouse is your tool now.' },
  { head: 'You can open things!', say: 'Well done. Two quick clicks, mouse held still — you have the double-click, and you know to stay calm and try again.' },
  { head: 'You can use the keyboard!', say: 'Great effort. You can type words, use Space and Enter, and fix mistakes with Backspace. Mistakes are always fine.' },
  { head: 'You can manage windows!', say: 'Nicely done. You can open a program, tuck it away, bring it back, and close it with the X when you are finished.' },
  { head: 'Your work is safe!', say: 'Wonderful. You can save your work with a clear name in Documents — and that means it will never be lost.' },
  { head: 'You can find your files!', say: 'Good work. You know a file is one piece of work and a folder holds them together — and you can find your work in Documents.' },
  { head: 'You did the whole routine!', say: 'That was excellent. Create, save, close, and find again — you put the whole routine together. This is real independence.' },
  { head: 'You can write in Word!', say: 'Beautiful writing. A capital to start, spaces between words, a full stop at the end — you wrote a proper sentence.' },
  { head: 'You can edit like a pro!', say: 'Really well done. Copy, paste and undo — three powerful tools, and undo means nothing can ever break.' },
  { head: 'You can make text stand out!', say: 'Lovely. Bold, italic, underline and colour — and you remembered the golden rule: choose first, then change.' },
  { head: 'You can design a page!', say: 'That looks smart. A big, bold, centred title with your writing underneath — your documents look professional now.' },
  { head: 'You can share your work!', say: 'Great job. Tidy lists, a spell-check to help you, and a PDF that looks the same everywhere — ready to share.' },
  { head: 'You know your way around Excel!', say: 'Well done. Cells, columns of letters, rows of numbers, and A1 in the corner — Excel is not a mystery any more.' },
  { head: 'You built a tidy table!', say: 'Excellent. Headings, data underneath, and prices shown as money — a clear table anyone can read.' },
  { head: 'You can make Excel do the maths!', say: 'What a finish. Formulas that start with equals, and AutoSum to total a column. You started at the power button and now you write formulas — be proud.' },
];

/* per-lesson "common mistake" tips */
const MISTAKES = [
  'Pressing the power button many times does not make it faster. One press, then wait.',
  'Do not press hard or click many times. A light, single click is all it takes.',
  'If it does not open, the mouse probably moved. Keep it still, and try the two clicks again.',
  'Holding a key down types the same letter over and over. A quick tap gives one letter.',
  'The X closes the window. The minus only tucks it away. Look carefully before you click.',
  'Closing without saving can lose new work. Always save first, then close.',
  'A file is one piece of work; a folder is the box. Do not mix the two up.',
  'Try not to rush. Saying each step out loud first makes the whole routine easier.',
  'A sentence needs a capital at the start and a full stop at the end — it is easy to forget the full stop.',
  'Copy does not remove the text; it leaves it where it is. Only Cut takes it away.',
  'If nothing changes when you press B, you probably forgot to select the word first.',
  'Make the title bigger than the writing below, or it will not look like a title.',
  'A red wavy line is a helpful hint, not a mistake to feel bad about.',
  'Columns are letters, rows are numbers. A cell name is always a letter and then a number.',
  'If a word looks cut off, the column is just too narrow — widen it, do not delete the word.',
  'Forgetting the equals sign is the most common slip. Every formula must start with =.',
];

/* estimate ms to speak a line at ~150 wpm, floor 2.6s */
const sayMs = (t) => Math.max(3200, Math.round((String(t).split(/\s+/).length / 128) * 60000) + 1300);

/**
 * Build the full narrated timeline for lesson index i.
 * Returns [{ say, html, focus?, type?, dur, hold?, kind }]
 * kind: 'title'|'outcome'|'demo'|'mistake'|'try'|'done'
 */
/* Optional recorded-narration manifest. To use real voices (e.g. ElevenLabs
   exports of a chosen voice), set:
     import { setNarration } from './lesson-video.js';
     setNarration({ base: 'audio', ext: 'mp3' });   // plays audio/lesson-1-01.mp3 ...
   or pass explicit per-beat URLs: setNarration({ urls: { 1: ['a.mp3', ...] } });
   Any beat without a matching file falls back to the browser voice automatically. */
let NARR = null;
/* The exact script spoken by each recorded lesson MP3 (audio/lesson-NN.mp3).
   Captions are derived from this so the on-screen words match the voice. */
const NARRATION = [
  'Today we are learning the full start-up routine. <break /> We will turn the computer on, wait calmly, sign in carefully, and check that the desktop is ready. <break /> We are not rushing. Waiting is part of using a computer well.',
  'The mouse moves the pointer. The pointer is how we reach things on the screen. <break /> Today we will move slowly, stop on the target, and click once to choose.',
  'A double-click opens things. The trick is two quick clicks while the mouse stays still. <break /> If it does not open the first time, that is okay. We calmly try again.',
  'Today the keyboard becomes a tool for messages. <break /> We will type slowly, use Space between words, Enter for a new line, and Backspace to fix mistakes.',
  'A program opens inside a window. <break /> The buttons at the top help us manage the window. X means we are finished with it.',
  'Saving means keeping our work. A good file name helps us find it later. <break /> Today we will make a real note, save it in Documents, close it, and find it again.',
  'A file is one piece of work. A folder holds files together. <break /> Today we will open Documents, create a practice folder, and place work where it belongs.',
  'Today we put the whole routine together. <break /> Open Word, type a note, save it, close it, then find it again. This is where independence starts to show.',
  'Now we use Word for real writing. <break /> A strong sentence starts with a capital letter, uses spaces between words, and ends with a full stop.',
  'Editing means changing work without starting again. <break /> Copy, paste and undo are three powerful tools. Nothing breaks today; undo can take us back.',
  'Formatting helps readers notice important words. <break /> The rule is choose first, then change. We select text before pressing B, I, U or colour.',
  'A good title tells the reader what the page is about. <break /> We will make the title bigger, bold and centred, then write normal text underneath.',
  'Lists make information easier to read. <break /> Spell check helps us improve work, and a PDF is useful because it looks the same when shared or printed.',
  'Excel is a grid. Each box is a cell. <break /> Columns use letters across the top, rows use numbers down the side, and the first cell is A1.',
  'A table keeps information tidy. <break /> Today we will make headings, enter real data, make headers bold, widen columns and format prices as money.',
  'Excel can do maths for us. A formula starts with equals. <break /> We can type a simple sum, use cell names, and use AutoSum to total a whole column.',
];
export function setNarration(cfg) { NARR = cfg || null; }
export function cleanNarrationText(text) {
  return String(text || '')
    .replace(/<\s*break\s*\/?\s*>/gi, '. ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
function audioFor(lessonNo, beatIdx) {
  if (!NARR) return null;
  if (NARR.urls && NARR.urls[lessonNo] && NARR.urls[lessonNo][beatIdx]) return NARR.urls[lessonNo][beatIdx];
  if (NARR.base) return `${NARR.base}/lesson-${String(lessonNo).padStart(2, '0')}-${String(beatIdx + 1).padStart(2, '0')}.${NARR.ext || 'mp3'}`;
  return null;
}

export function buildTimeline(i) {
  const L = course.lessons[i];
  const n = i + 1;
  const beats = [];
  const push = (b) => {
    b.say = cleanNarrationText(b.say);
    b.dur = b.dur || sayMs(b.say);
    const au = audioFor(n, beats.length);
    if (au) b.audioUrl = au;
    beats.push(b);
  };

  push({ kind: 'title', say: `Lesson ${n}: ${L.title}. I will guide you through it one step at a time.`, html: titleCard(n, L.title), dur: 5200 });
  push({ kind: 'intro', say: L.tutor, html: outcomeCard(L.outcome), dur: sayMs(L.tutor) });

  // teaching demonstration frames — the detailed step-by-step explanation
  F[i].forEach((fr) => push({ kind: 'demo', say: fr.say, html: fr.html, focus: fr.focus, type: fr.type }));

  // activity guide — makes the narration line up with the real tasks below the video
  const G = activityGuide(L);
  push({ kind: 'activity-guide', say: G.say, html: activityCard(G) });

  // common mistake
  push({ kind: 'mistake', say: `Here is one useful thing to watch for. ${MISTAKES[i]} If it happens, pause, reset, and try again calmly.`, html: mistakeCard(MISTAKES[i]) });

  // closing — a message specific to this lesson, then send them to the activities
  const C = CLOSINGS[i];
  push({ kind: 'done', say: `${C.say} Now it is your turn. Scroll down to the activities and do one step at a time. Ask staff for help if you need it — that is part of learning.`, html: doneCard(C.head) });

  return beats;
}

/** total estimated runtime (ms) for a lesson video */
export function timelineDuration(i) {
  return buildTimeline(i).reduce((a, b) => a + b.dur + (b.hold || 0), 0);
}

/* ============================================================
   Multi-course support — scene kits and narrated timelines for
   Staying Safe Online, Everyday Email, Phones & Video Calls.
   ============================================================ */

/* ---- browser / web scenes ---- */
const webWin = (url, inner, opts = {}) => `<div style="width:84%;max-width:600px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden;position:relative">
  <div style="display:flex;align-items:center;gap:10px;background:#e8edf3;padding:10px 14px">
    <span style="display:flex;gap:5px"><i style="width:10px;height:10px;border-radius:50%;background:#f26d6d;display:block"></i><i style="width:10px;height:10px;border-radius:50%;background:#f5c26b;display:block"></i><i style="width:10px;height:10px;border-radius:50%;background:#7fce7f;display:block"></i></span>
    <div data-k="addr" style="flex:1;background:#fff;border:1.5px solid ${opts.hotAddr ? '#1b8f8a' : '#d5dde7'};border-radius:999px;padding:7px 14px;font:500 13px Inter,sans-serif;color:#3c4854">&#128274; ${esc(url)}</div>
  </div>
  <div style="background:#fbfcfd;padding:22px;min-height:150px;position:relative">${inner}</div></div>`;
const weatherPage = () => `<div style="text-align:center"><div style="font:600 17px Lexend,Inter,sans-serif;color:#12395f">Today's weather</div><div style="font-size:44px;margin:8px 0">&#9925;</div><div style="font:500 15px Inter,sans-serif;color:#3c4854">14° · Cloudy with sunny spells</div></div>`;
const popupScene = (closed) => webWin('friendly-recipes.co.uk', `${closed ? weatherRecipes() : weatherRecipes() + `
  <div style="position:absolute;inset:0;background:rgba(18,30,48,.35);display:flex;align-items:center;justify-content:center">
    <div style="background:#fff;border-radius:14px;box-shadow:0 18px 44px rgba(0,0,0,.35);padding:0;width:78%;max-width:340px;overflow:hidden">
      <div style="display:flex;justify-content:flex-end;background:#f4f6f9;padding:6px 8px"><span data-k="x" style="width:26px;height:26px;border-radius:8px;background:#fff;border:1.5px solid #d5dde7;display:flex;align-items:center;justify-content:center;font:700 14px Inter,sans-serif;color:#3c4854">&#10005;</span></div>
      <div style="padding:16px;text-align:center"><div style="font:700 17px Lexend,Inter,sans-serif;color:#b45309">&#127881; You have WON a prize!</div><div style="margin-top:6px;font:400 13px Inter,sans-serif;color:#5b6b7d">Click here NOW to claim your free iPad!</div><div style="margin-top:12px;background:#f26d6d;color:#fff;border-radius:999px;padding:9px 18px;font:700 13px Inter,sans-serif;display:inline-block">CLAIM NOW!!!</div></div>
    </div></div>`}`);
const weatherRecipes = () => `<div><div style="font:600 16px Lexend,Inter,sans-serif;color:#12395f">Easy soup recipes</div><div style="margin-top:8px;font:400 13px/1.6 Inter,sans-serif;color:#5b6b7d">1. Tomato and basil<br>2. Leek and potato<br>3. Carrot and coriander</div></div>`;

/* ---- password / safety scenes ---- */
const pwChips = (words, good) => `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:28px 34px;text-align:center;max-width:480px">
  <div style="font:600 14px Inter,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${good ? '#0E8F6E' : '#c0392b'}">${good ? 'Strong password' : 'Weak password'}</div>
  <div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${words.map((w) => `<span style="background:${good ? '#E7F7F2' : '#fdeaea'};border:1.5px solid ${good ? '#0E8F6E' : '#e5a3a3'};color:${good ? '#0a5c47' : '#a33'};border-radius:12px;padding:10px 16px;font:700 17px Lexend,Inter,sans-serif">${esc(w)}</span>`).join('')}</div>
  <div style="margin-top:13px;font:400 14px Inter,sans-serif;color:#5b6b7d">${good ? 'Long, random, easy for you to remember.' : 'Short and easy for anyone to guess.'}</div></div>`;
const ruleCard = (a, b, c) => `<div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">${[a, b, c].map((t, i) => `<div style="background:#fff;border-radius:16px;box-shadow:0 22px 50px rgba(8,30,55,.35);padding:20px 22px;text-align:center;min-width:120px"><div style="width:44px;height:44px;border-radius:50%;background:#1b8f8a;color:#fff;display:flex;align-items:center;justify-content:center;font:700 18px Inter,sans-serif;margin:0 auto">${i + 1}</div><div style="margin-top:10px;font:700 17px Lexend,Inter,sans-serif;color:#12395f">${esc(t)}</div></div>`).join('')}</div>`;

/* ---- email scenes ---- */
const mailRow = (from, subj, o = {}) => `<div ${o.k ? `data-k="${o.k}"` : ''} style="display:flex;gap:12px;align-items:center;padding:11px 14px;border-bottom:1px solid #eef1f5;background:${o.sel ? '#E7F7F2' : '#fff'};${o.scam ? 'background:#fdf6ec;' : ''}">
  <div style="width:34px;height:34px;border-radius:50%;background:${o.scam ? '#e8a13a' : '#12395f'};color:#fff;display:flex;align-items:center;justify-content:center;font:700 13px Inter,sans-serif;flex:none">${esc(from.slice(0, 1).toUpperCase())}</div>
  <div style="min-width:0"><div style="font:${o.bold ? 700 : 500} 14px Inter,sans-serif;color:#1f2d3a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(from)}</div>
  <div style="font:${o.bold ? 600 : 400} 13px Inter,sans-serif;color:${o.bold ? '#1f2d3a' : '#7b8a99'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(subj)}</div></div>
  ${o.clip ? '<span style="margin-left:auto;font-size:15px">&#128206;</span>' : ''}</div>`;
const mailApp = (title, inner) => `<div style="width:84%;max-width:560px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);overflow:hidden">${tb('#0E8F6E', title)}<div style="background:#fbfcfd;min-height:170px">${inner}</div></div>`;
const inboxScene = (rows) => mailApp('&#9993; Mail — Inbox', rows.map((r) => mailRow(r[0], r[1], r[2] || {})).join(''));
const readScene = (from, subj, body, o = {}) => mailApp('&#9993; Mail', `<div style="padding:16px 18px">
  <div style="display:flex;gap:9px;margin-bottom:12px"><span data-k="back" style="border:1.5px solid #d5dde7;border-radius:9px;padding:6px 12px;font:600 13px Inter,sans-serif;color:#3c4854;background:#fff">&#8592; Inbox</span><span data-k="reply" style="border:1.5px solid ${o.hotReply ? '#1b8f8a' : '#d5dde7'};border-radius:9px;padding:6px 12px;font:600 13px Inter,sans-serif;color:${o.hotReply ? '#0a5c47' : '#3c4854'};background:${o.hotReply ? '#E7F7F2' : '#fff'}">&#8617; Reply</span><span data-k="fwd" style="border:1.5px solid #d5dde7;border-radius:9px;padding:6px 12px;font:600 13px Inter,sans-serif;color:#3c4854;background:#fff">&#8618; Forward</span></div>
  <div style="font:700 16px Lexend,Inter,sans-serif;color:#12395f">${esc(subj)}</div><div style="font:500 12px Inter,sans-serif;color:#7b8a99;margin:3px 0 10px">From: ${esc(from)}</div>
  <div style="font:400 14px/1.6 Inter,sans-serif;color:#2a3b4d">${body}</div>${o.attach ? `<div data-k="attach" style="margin-top:12px;display:inline-flex;gap:8px;align-items:center;border:1.5px solid ${o.hotAttach ? '#1b8f8a' : '#d5dde7'};border-radius:11px;padding:9px 13px;font:600 13px Inter,sans-serif;color:#12395f;background:#fff">&#128206; ${esc(o.attach)}</div>` : ''}</div>`);
const composeScene = (to, subj, body, o = {}) => mailApp('&#9993; New message', `<div style="padding:14px 18px;display:grid;gap:9px">
  <div style="display:flex;gap:9px;align-items:center"><span style="width:64px;font:600 13px Inter,sans-serif;color:#5b6b7d">To</span><div data-fx-to style="flex:1;border:1.5px solid ${o.hotTo ? '#1b8f8a' : '#d5dde7'};border-radius:9px;padding:8px 11px;font:500 14px Inter,sans-serif;color:#1f2d3a;min-height:19px">${esc(to)}</div></div>
  <div style="display:flex;gap:9px;align-items:center"><span style="width:64px;font:600 13px Inter,sans-serif;color:#5b6b7d">Subject</span><div data-fx-subj style="flex:1;border:1.5px solid #d5dde7;border-radius:9px;padding:8px 11px;font:500 14px Inter,sans-serif;color:#1f2d3a;min-height:19px">${esc(subj)}</div></div>
  <div data-fx style="border:1.5px solid #d5dde7;border-radius:9px;padding:11px;min-height:64px;font:400 14px/1.55 Inter,sans-serif;color:#2a3b4d">${body}</div>
  <div style="display:flex;gap:10px;align-items:center"><span data-k="send" style="background:${o.hotSend ? '#0E8F6E' : '#12395f'};color:#fff;border-radius:10px;padding:9px 22px;font:700 14px Inter,sans-serif;${o.hotSend ? 'box-shadow:0 0 0 4px rgba(14,143,110,.25);' : ''}">Send</span><span data-k="clip" style="width:38px;height:38px;border:1.5px solid ${o.hotClip ? '#1b8f8a' : '#d5dde7'};border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;background:${o.hotClip ? '#E7F7F2' : '#fff'}">&#128206;</span>${o.attached ? `<span style="font:600 12px Inter,sans-serif;color:#0a5c47;background:#E7F7F2;border-radius:999px;padding:6px 12px">&#128206; sunflower.jpg attached</span>` : ''}</div></div>`);

/* ---- phone scenes ---- */
const phoneShell = (inner, bg) => `<div style="width:232px;background:#0b1526;border-radius:34px;padding:12px 10px 14px;box-shadow:0 30px 70px rgba(8,30,55,.55);border:1px solid rgba(255,255,255,.16)">
  <div style="width:66px;height:16px;background:#0b1526;border-radius:0 0 11px 11px;margin:-12px auto 5px"></div>
  <div style="background:${bg || 'linear-gradient(165deg,#14385c,#1b8f8a)'};border-radius:22px;min-height:308px;padding:14px 12px;display:flex;flex-direction:column;gap:10px;position:relative;overflow:hidden">${inner}</div>
  <div style="width:78px;height:5px;border-radius:999px;background:rgba(255,255,255,.45);margin:10px auto 0" data-k="homebar"></div></div>`;
const appIc = (bg, glyph, label, key, sel) => `<div data-app="${key}" style="text-align:center;${sel === key ? 'background:rgba(255,255,255,.2);border-radius:12px;padding:5px 2px;' : ''}"><div style="width:46px;height:46px;margin:0 auto;border-radius:13px;background:${bg};display:flex;align-items:center;justify-content:center;font-size:21px;box-shadow:0 5px 14px rgba(0,0,0,.3)">${glyph}</div><div style="margin-top:4px;font:500 10px Inter,sans-serif;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)">${label}</div></div>`;
const phoneHome = (sel) => phoneShell(`<div style="font:600 26px Lexend,Inter,sans-serif;color:#fff;text-align:center;margin-top:2px">09:41</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-top:8px">${appIc('#34c759', '&#128222;', 'Phone', 'phone', sel)}${appIc('#30b0c7', '&#128172;', 'Messages', 'msg', sel)}${appIc('#8e8e93', '&#128247;', 'Camera', 'cam', sel)}${appIc('#ff9f0a', '&#127804;', 'Photos', 'photos', sel)}${appIc('#25D366', '&#128249;', 'WhatsApp', 'wa', sel)}${appIc('#5b6b7d', '&#9881;', 'Settings', 'set', sel)}</div>`);
const lockScreen = () => phoneShell(`<div style="text-align:center;margin-top:26px"><div style="font:300 44px Lexend,Inter,sans-serif;color:#fff">09:41</div><div style="font:500 13px Inter,sans-serif;color:rgba(255,255,255,.85)">Tuesday 3 June</div><div style="margin-top:34px;font-size:30px">&#128274;</div><div style="margin-top:8px;font:500 12px Inter,sans-serif;color:rgba(255,255,255,.8)">Press the side button, then unlock</div></div>`);
const callScreen = (name, o = {}) => phoneShell(`<div style="text-align:center;margin-top:14px">
  <div style="width:74px;height:74px;border-radius:50%;background:rgba(255,255,255,.9);margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:34px">&#128100;</div>
  <div style="margin-top:10px;font:600 19px Lexend,Inter,sans-serif;color:#fff">${esc(name)}</div>
  <div style="font:500 12px Inter,sans-serif;color:rgba(255,255,255,.85)">${o.state || 'calling…'}</div></div>
  <div style="margin-top:auto;display:flex;justify-content:center;gap:34px;padding-bottom:8px">
  ${o.incoming || !o.inCall ? `<div data-k="green" style="width:56px;height:56px;border-radius:50%;background:#34c759;display:flex;align-items:center;justify-content:center;font-size:23px;${o.hotGreen ? 'box-shadow:0 0 0 5px rgba(52,199,89,.4);' : ''}">&#128222;</div>` : ''}
  <div data-k="red" style="width:56px;height:56px;border-radius:50%;background:#ff3b30;display:flex;align-items:center;justify-content:center;font-size:23px;transform:rotate(135deg);${o.hotRed ? 'box-shadow:0 0 0 5px rgba(255,59,48,.4);' : ''}">&#128222;</div></div>`, o.video ? 'linear-gradient(165deg,#243b55,#141e30)' : undefined);
const contactsList = (sel) => phoneShell(`<div style="font:600 15px Lexend,Inter,sans-serif;color:#fff;text-align:center">Contacts</div>
  ${['Amara (sister)', 'Ben — support', 'Dawn (friend)'].map((n, i) => `<div data-ct="${i}" style="display:flex;gap:10px;align-items:center;background:rgba(255,255,255,${sel === i ? '.28' : '.12'});border:1px solid rgba(255,255,255,.2);border-radius:13px;padding:9px 11px"><div style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;font-size:16px">&#128100;</div><div style="font:600 13px Inter,sans-serif;color:#fff">${n}</div><div style="margin-left:auto;display:flex;gap:7px"><span data-k="call${i}" style="width:29px;height:29px;border-radius:50%;background:#34c759;display:flex;align-items:center;justify-content:center;font-size:13px">&#128222;</span><span data-k="vid${i}" style="width:29px;height:29px;border-radius:50%;background:#30b0c7;display:flex;align-items:center;justify-content:center;font-size:12px">&#128249;</span></div></div>`).join('')}`);
const bubble = (t, me) => `<div style="align-self:${me ? 'flex-end' : 'flex-start'};max-width:78%;background:${me ? '#34c759' : 'rgba(255,255,255,.95)'};color:${me ? '#fff' : '#1f2d3a'};border-radius:${me ? '15px 15px 4px 15px' : '15px 15px 15px 4px'};padding:8px 12px;font:500 12.5px/1.45 Inter,sans-serif">${esc(t)}</div>`;
const textThread = (msgs, typing, o = {}) => phoneShell(`<div style="font:600 14px Lexend,Inter,sans-serif;color:#fff;text-align:center">Amara &#128149;</div>
  <div style="flex:1;display:flex;flex-direction:column;gap:8px;margin-top:4px">${msgs.map((m) => bubble(m.t, m.me)).join('')}</div>
  <div style="display:flex;gap:7px;align-items:center"><div data-fx style="flex:1;background:rgba(255,255,255,.95);border-radius:999px;padding:9px 13px;font:500 12.5px Inter,sans-serif;color:#1f2d3a;min-height:16px">${esc(typing || '')}</div><div data-k="send" style="width:36px;height:36px;border-radius:50%;background:${o.hotSend ? '#0E8F6E' : '#34c759'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;${o.hotSend ? 'box-shadow:0 0 0 4px rgba(14,143,110,.35);' : ''}">&#10148;</div></div>`);
const cameraView = (o = {}) => phoneShell(`<div style="flex:1;background:linear-gradient(180deg,#87ceeb 58%,#7ab86f 58%);border-radius:14px;position:relative;display:flex;align-items:center;justify-content:center"><span style="font-size:52px">&#127803;</span><span style="position:absolute;inset:12px;border:1.5px solid rgba(255,255,255,.6);border-radius:10px"></span></div>
  <div style="display:flex;justify-content:center;padding:6px 0 2px"><div data-k="shutter" style="width:54px;height:54px;border-radius:50%;background:#fff;border:5px solid rgba(255,255,255,.45);${o.hotShutter ? 'box-shadow:0 0 0 5px rgba(255,255,255,.5);' : ''}"></div></div>`, 'linear-gradient(165deg,#1c1c1e,#2c2c2e)');
const galleryGrid = () => phoneShell(`<div style="font:600 15px Lexend,Inter,sans-serif;color:#fff;text-align:center">Photos</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px">${['&#127803;', '&#127803;', '&#128021;', '&#9925;', '&#127856;', '&#128144;'].map((g, i) => `<div data-ph="${i}" style="aspect-ratio:1;background:rgba(255,255,255,.92);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;${i === 0 ? 'outline:3px solid #34c759;' : ''}">${g}</div>`).join('')}</div>
  <div data-k="share" style="margin-top:auto;align-self:center;background:rgba(255,255,255,.95);border-radius:999px;padding:9px 20px;font:700 13px Inter,sans-serif;color:#12395f">&#8679; Share</div>`);
const chargeScreen = () => phoneShell(`<div style="text-align:center;margin-top:40px"><div style="display:inline-block;position:relative;width:110px;height:52px;border:4px solid rgba(255,255,255,.9);border-radius:12px"><i style="position:absolute;right:-12px;top:14px;width:8px;height:20px;background:rgba(255,255,255,.9);border-radius:0 4px 4px 0"></i><i style="position:absolute;left:4px;top:4px;bottom:4px;width:62%;background:#34c759;border-radius:6px"></i></div>
  <div data-k="bolt" style="margin-top:14px;font-size:34px">&#9889;</div><div style="font:600 14px Inter,sans-serif;color:#fff;margin-top:4px">Charging — 62%</div></div>`, 'linear-gradient(165deg,#1c1c1e,#2c2c2e)');
const settingsText = (big) => phoneShell(`<div style="font:600 15px Lexend,Inter,sans-serif;color:#fff;text-align:center">Settings &#8250; Text size</div>
  <div style="background:rgba(255,255,255,.95);border-radius:14px;padding:14px;margin-top:6px"><div style="font:${big ? 600 : 400} ${big ? '20px' : '13px'} Inter,sans-serif;color:#1f2d3a;line-height:1.5">The quick brown fox jumps over the lazy dog.</div></div>
  <div style="display:flex;align-items:center;gap:9px;margin-top:8px"><span style="font:400 12px Inter,sans-serif;color:#fff">A</span><div data-k="slider" style="flex:1;height:5px;background:rgba(255,255,255,.4);border-radius:999px;position:relative"><i style="position:absolute;left:${big ? '74%' : '22%'};top:-6px;width:17px;height:17px;border-radius:50%;background:#fff"></i></div><span style="font:700 19px Inter,sans-serif;color:#fff">A</span></div>`);

/* ---- authored demo beats for the new courses ---- */
const SAFE_DEMOS = [
  [ { say: 'Imagine roads connecting every town in the world. The internet is like that, but for computers — yours can reach helpful places everywhere, and nothing travels unless you ask.', html: con('&#127760;', 'The internet connects computers', 'Like roads connect towns') },
    { say: 'This is a web browser showing a trusted page — the weather. See the little padlock next to the address? That is a good sign: the connection is private.', html: webWin('bbc.co.uk/weather', weatherPage(), { hotAddr: true }), focus: '[data-k="addr"]' },
    { say: 'And here is the most important idea of all: nothing on the internet happens unless somebody clicks. You are always the one in control.', html: ruleCard('You', 'choose', 'clicks') } ],
  [ { say: 'Look at these two passwords. The short one, one two three four, is like a door key made of paper — anyone can guess it in a moment.', html: pwChips(['1', '2', '3', '4'], false) },
    { say: 'Now look at this one: three random words joined together. Horse, carpet, teapot. Long, strange, hard to guess — and easy for you to remember.', html: pwChips(['Horse', 'Carpet', 'Teapot'], true) },
    { say: 'And the golden rule: your password is never shared. Not with friendly strangers on the phone, not with anyone who asks by email. Only you.', html: con('&#128273;', 'Your password is a key', 'Only you hold it') } ],
  [ { say: 'Here is a scam message. Look at the warning signs: it shouts URGENT, it wants money, and the sender address is strange. Real companies never write like this.', html: inboxScene([['Parcel-Delivery-24', 'URGENT!! Pay £2.99 NOW or lose your parcel', { bold: true, scam: true, k: 'scam' }], ['Amara', 'Sunday lunch?', {}], ['Library', 'Your book is ready to collect', {}]]), focus: '[data-k="scam"]' },
    { say: 'Compare it with the real messages below it — calm, ordinary, no shouting, no rushing. Scams rush; real life waits.', html: inboxScene([['Parcel-Delivery-24', 'URGENT!! Pay £2.99 NOW or lose your parcel', { scam: true }], ['Amara', 'Sunday lunch?', { sel: true }], ['Library', 'Your book is ready to collect', {}]]) },
    { say: 'So here is our three-word rule. Stop — hands off. Check — who really sent this? Ask — show someone you trust. Nothing bad can happen while you are checking.', html: ruleCard('Stop', 'Check', 'Ask') } ],
  [ { say: 'You are quietly reading a recipe page when — pop! — a window jumps up claiming you have won a prize. You have not. It is an advert wearing a costume.', html: popupScene(false) },
    { say: 'Do not touch the big colourful button. Move your eyes to the corner and find the small X. That is the only place we click on a pop-up.', html: popupScene(false), focus: '[data-k="x"]' },
    { say: 'One calm click on the X, and it is gone. The page you wanted is still there. You are the doorkeeper — a pop-up knocks, and you may simply close the door.', html: popupScene(true) } ],
  [ { say: 'Think of your information in two piles. Public things — your favourite colour, your football team — are fine to chat about.', html: ruleCard('Film?', 'Team?', 'Colour?') },
    { say: 'Private things stay private: your full address, your bank details, your password, and photos of your home. These are keys to your life.', html: con('&#128274;', 'Private: address, bank, password', 'These are keys — keep them') },
    { say: 'When you are not sure which pile something belongs in, use the habit that always works: check first with someone you trust, before sharing anything.', html: ruleCard('Unsure?', 'Check', 'First') } ],
  [ { say: 'One day, something online will look confusing or worrying. That happens to everyone — every adult, every expert, everyone.', html: con('&#128173;', 'A worry online?', 'It happens to everyone') },
    { say: 'So we have a plan, and it is only three steps. Stop — take your hands off. Breathe — one slow breath. Tell — your trusted person, straight away.', html: ruleCard('Stop', 'Breathe', 'Tell') },
    { say: 'Nobody will ever be cross with you for telling. Telling quickly is the strongest, smartest move on the whole internet — and now it is yours.', html: con('&#128170;', 'Telling quickly is strength', 'Nobody will be cross') } ],
];

const EMAIL_DEMOS = [
  [ { say: 'An email is a letter that travels through the internet. It arrives in seconds, it costs nothing, and it waits patiently until you are ready.', html: con('&#9993;', 'Email is a letter', 'Fast, free, and patient') },
    { say: 'Every address has three parts. A name — maria. The at sign — that little a in a circle. And a place — gmail dot com. maria, at, gmail dot com.', html: con('&#64;', 'maria@gmail.com', 'name · @ · place') },
    { say: 'And this is an inbox — the tray where letters arrive. Each row is one message: who it is from, and what it is about.', html: inboxScene([['Amara', 'Sunday lunch?', { bold: true }], ['Library', 'Your book is ready', {}], ['Ben — support', 'See you Tuesday', {}]]) } ],
  [ { say: 'Look at the inbox. The bold message is new — you have not read it yet. The others you have already seen.', html: inboxScene([['Amara', 'Sunday lunch?', { bold: true, k: 'newmsg' }], ['Library', 'Your book is ready', {}], ['Ben — support', 'See you Tuesday', {}]]), focus: '[data-k="newmsg"]' },
    { say: 'One click opens it. Now we can read at our own pace — there is no timer, no rush. The letter is simply open in front of us.', html: readScene('Amara', 'Sunday lunch?', 'Hello! Would you like to come for Sunday lunch this week? We are having roast chicken. Love, Amara x') },
    { say: 'When we are done, the back arrow takes us home to the inbox. Open, read, back — that loop is the whole skill, and it always brings you home.', html: readScene('Amara', 'Sunday lunch?', 'Hello! Would you like to come for Sunday lunch this week? We are having roast chicken. Love, Amara x'), focus: '[data-k="back"]' } ],
  [ { say: 'To write a new email we press Compose. Three boxes appear. In the To box, we type the address — slowly and exactly, like dialling a phone number.', html: composeScene('', '', '', { hotTo: true }), type: { sel: '[data-fx-to]', txt: 'amara@gmail.com' } },
    { say: 'The Subject is a few words saying what the letter is about — like writing on the front of an envelope. Then the big box is for our message: short and kind is perfect.', html: composeScene('amara@gmail.com', 'Lunch on Sunday', '', {}), type: { sel: '[data-fx]', txt: 'Yes please! I would love to come. See you Sunday.' } },
    { say: 'We check it once — right person, kind words — and press Send. One calm press. The moment you press it, your letter flies.', html: composeScene('amara@gmail.com', 'Lunch on Sunday', 'Yes please! I would love to come. See you Sunday.', { hotSend: true }), focus: '[data-k="send"]' } ],
  [ { say: 'A letter has arrived with a question in it. We could write a brand-new email back — but there is a much easier way. Look at the Reply button.', html: readScene('Ben — support', 'Cuppa on Tuesday?', 'Shall we have a cup of tea when I visit on Tuesday? Ben', { hotReply: true }), focus: '[data-k="reply"]' },
    { say: 'Press Reply, and something clever happens: the To box fills itself with Ben’s address. No typing, no mistakes. We just write our answer.', html: composeScene('ben.support@havilah.org', 'Re: Cuppa on Tuesday?', '', {}), type: { sel: '[data-fx]', txt: 'Yes please, that would be lovely!' } },
    { say: 'Forward is the other button — it passes a message on to a new person. Before forwarding, we always ask: would the sender be happy? If unsure, just reply instead.', html: readScene('Ben — support', 'Cuppa on Tuesday?', 'Shall we have a cup of tea when I visit on Tuesday? Ben') } ],
  [ { say: 'See the paperclip on this message? That means it carries a parcel — a photo or a document clipped to the letter. This one is from Amara, someone we know, so it is safe to open.', html: readScene('Amara', 'Look at my sunflower!', 'It finally flowered! Photo attached. x', { attach: 'sunflower.jpg', hotAttach: true }), focus: '[data-k="attach"]' },
    { say: 'Now we send a parcel of our own. In a new message, we press the paperclip button and choose a photo from our Pictures folder.', html: composeScene('amara@gmail.com', 'My photo', 'Here is the photo I took!', { hotClip: true }), focus: '[data-k="clip"]' },
    { say: 'The photo clips on — you can see it attached — and we press Send. A letter with a parcel, delivered in seconds. Family love receiving these.', html: composeScene('amara@gmail.com', 'My photo', 'Here is the photo I took!', { attached: true, hotSend: true }), focus: '[data-k="send"]' } ],
  [ { say: 'Real letterboxes get leaflets nobody asked for, and inboxes get junk mail. Look — the app has already swept most of it into the Junk folder for you.', html: inboxScene([['WinBig-Prizes', 'You are our LUCKY winner!!!', { scam: true, k: 'junk' }], ['Amara', 'Sunday was lovely', {}], ['Library', 'Reminder: book due Friday', {}]]), focus: '[data-k="junk"]' },
    { say: 'Our job is light: junk gets deleted, never answered. Replying to junk — even to say stop — tells the sender your address is real, and more junk follows.', html: con('&#128465;', 'Junk mail: delete it', 'Never reply — not even to say stop') },
    { say: 'Delete the junk, keep the real letters, and enjoy the result: a calm, tidy inbox where everything left is something you actually want.', html: inboxScene([['Amara', 'Sunday was lovely', {}], ['Library', 'Reminder: book due Friday', {}]]) } ],
];

const PHONE_DEMOS = [
  [ { say: 'This is a phone asleep — dark screen, resting. One gentle press on the side button and it wakes, showing the time and the lock.', html: lockScreen() },
    { say: 'We unlock it our own way — a code, a fingerprint, or just our face — and here is the home screen: every app in its place, like shops on a little high street.', html: phoneHome() },
    { say: 'And here is the magic move that always works. See the little bar at the bottom? Swipe up from it — or press the home button — and wherever you are, you come safely home.', html: phoneHome(), focus: '[data-k="homebar"]' } ],
  [ { say: 'To call someone, we do not remember numbers — we open Contacts, our phone book, where the people we love are saved by name.', html: contactsList() },
    { say: 'Find your person, and tap the green button next to their name. Green means go, everywhere on the phone.', html: contactsList(0), focus: '[data-k="call0"]' },
    { say: 'The phone rings them… and you talk! When you have both said goodbye, the red button ends the call. Green to talk, red to finish.', html: callScreen('Amara (sister)', { inCall: true, state: 'on the phone · 02:14', hotRed: true }), focus: '[data-k="red"]' } ],
  [ { say: 'Ping! A text message — a tiny letter. Here is the conversation with Amara. Her messages sit on the left; ours sit on the right in green.', html: textThread([{ t: 'Hi! See you at 2 for tea?' }]) },
    { say: 'We tap the typing box and write something short. Two words is a real message — “Yes please” is perfect texting.', html: textThread([{ t: 'Hi! See you at 2 for tea?' }], ''), type: { sel: '[data-fx]', txt: 'Yes please!' } },
    { say: 'Then the little arrow sends it — whoosh — and our green bubble joins the conversation. Short and kind: that is texting.', html: textThread([{ t: 'Hi! See you at 2 for tea?' }, { t: 'Yes please!', me: true }], '', { hotSend: true }), focus: '[data-k="send"]' } ],
  [ { say: 'Here is the camera, looking at a sunflower. Hold the phone with both hands, nice and steady, and line up your picture in the frame.', html: cameraView() },
    { say: 'One gentle tap on the big circle — click — and the photo is made. Take two or three; photographers always take spares.', html: cameraView({ hotShutter: true }), focus: '[data-k="shutter"]' },
    { say: 'Your pictures live in the Photos gallery. Pick your favourite, tap Share, choose your person — and your photo travels to someone who will love it.', html: galleryGrid(), focus: '[data-k="share"]' } ],
  [ { say: 'This is the lesson everything has been building to: seeing a face while you talk. Next to each person in WhatsApp there is a little video camera symbol.', html: contactsList(0), focus: '[data-k="vid0"]' },
    { say: 'Tap it, and there they are — live! Hold the phone a little away from your face, or prop it up, so they can see your lovely smile.', html: callScreen('Amara (sister)', { inCall: true, video: true, state: 'video call · connected' }) },
    { say: 'Chat as long as you like. If the picture ever freezes, nobody did anything wrong — wait a moment, or call back. And when you say goodbye: the same red button as always.', html: callScreen('Amara (sister)', { inCall: true, video: true, state: 'video call · 12:08', hotRed: true }), focus: '[data-k="red"]' } ],
  [ { say: 'Phones need feeding. Plug the charger in gently — right way round, never forced — and look for the little lightning bolt. That is the phone saying thank you.', html: chargeScreen(), focus: '[data-k="bolt"]' },
    { say: 'The buttons on the side make sounds louder or quieter. And in Settings, we can make the text bigger — watch the words grow. Your phone should suit your eyes.', html: settingsText(true), focus: '[data-k="slider"]' },
    { say: 'Charged every night in the same spot, comfortable to read, ready for the people you love. Your phone is completely yours now.', html: phoneHome() } ],
];

const DEMO_BANK = {
  'staying-safe-online': SAFE_DEMOS,
  'everyday-email': EMAIL_DEMOS,
  'phones-and-video-calls': PHONE_DEMOS,
};

/* generic fallback if a lesson has no authored beats */
const genericDemos = (L) => (L.steps || []).slice(0, 4).map((s, k) => ({ say: `Step ${k + 1}. ${s}. Take it at your own pace — one calm step at a time.`, html: con('&#10148;', s, `Step ${k + 1}`) }));

export function courseBySlug(slug) { return courses.find((c) => c.slug === slug) || course; }

function audioForCourse(prefix, lessonNo, beatIdx) {
  if (!NARR) return null;
  if (NARR.courses && NARR.courses[prefix] && NARR.courses[prefix][lessonNo] && NARR.courses[prefix][lessonNo][beatIdx]) return NARR.courses[prefix][lessonNo][beatIdx];
  if (NARR.base) return `${NARR.base}/${prefix}-${String(lessonNo).padStart(2, '0')}-${String(beatIdx + 1).padStart(2, '0')}.${NARR.ext || 'mp3'}`;
  return null;
}

/** Narrated timeline for any course. cc keeps its original authored path. */
export function buildTimelineFor(slug, i) {
  const C = courseBySlug(slug);
  if (C === course) return buildTimeline(i);
  const L = C.lessons[i];
  const n = i + 1;
  const beats = [];
  const prefix = C.short || slug;
  const push = (b) => {
    b.say = cleanNarrationText(b.say);
    b.dur = b.dur || sayMs(b.say);
    const au = audioForCourse(prefix, n, beats.length);
    if (au) b.audioUrl = au;
    beats.push(b);
  };
  push({ kind: 'title', say: `Lesson ${n}: ${L.title}. I will guide you through it one step at a time.`, html: titleCard(n, L.title), dur: 5200 });
  push({ kind: 'intro', say: L.tutor, html: outcomeCard(L.outcome) });
  (DEMO_BANK[slug] && DEMO_BANK[slug][i] ? DEMO_BANK[slug][i] : genericDemos(L)).forEach((fr) => push({ kind: 'demo', say: fr.say, html: fr.html, focus: fr.focus, type: fr.type }));
  const G = activityGuide(L);
  push({ kind: 'activity-guide', say: G.say, html: activityCard(G) });
  push({ kind: 'mistake', say: `Here is one useful thing to watch for. ${L.mistake} If it happens, pause, reset, and try again calmly.`, html: mistakeCard(L.mistake) });
  push({ kind: 'done', say: `${L.closing} Now it is your turn. Scroll down to the activities and do one step at a time. Ask staff for help if you need it — that is part of learning.`, html: doneCard('Well done — you did it!') });
  return beats;
}

export function timelineDurationFor(slug, i) {
  return buildTimelineFor(slug, i).reduce((a, b) => a + b.dur + (b.hold || 0), 0);
}

/* ============================================================
   Academic courses — scene kit + demo beats
   (Everyday Maths, Everyday English, Everyday Science)
   ============================================================ */

/* analog clock: hands via SVG */
const clockFace = (h, m, label) => { const ha = ((h % 12) + m / 60) * 30, ma = m * 6; return `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:26px 34px;text-align:center">
  <svg viewBox="0 0 120 120" width="150" height="150"><circle cx="60" cy="60" r="55" fill="#fbfcfd" stroke="#12395f" stroke-width="4"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => `<line x1="60" y1="10" x2="60" y2="16" stroke="#5b6b7d" stroke-width="3" transform="rotate(${k * 30} 60 60)"/>`).join('')}
  <line x1="60" y1="60" x2="60" y2="32" stroke="#0891B2" stroke-width="4" stroke-linecap="round" transform="rotate(${ma} 60 60)"/>
  <line x1="60" y1="60" x2="60" y2="42" stroke="#12395f" stroke-width="6" stroke-linecap="round" transform="rotate(${ha} 60 60)"/>
  <circle cx="60" cy="60" r="4" fill="#12395f"/></svg>
  <div data-k="clocklabel" style="margin-top:8px;font:700 20px Lexend,Inter,sans-serif;color:#12395f">${esc(label)}</div></div>`; };
/* UK coins */
const coin = (v, big, gold, silver) => `<div data-coin="${v}" style="text-align:center"><div style="width:${big ? 62 : 48}px;height:${big ? 62 : 48}px;border-radius:50%;margin:0 auto;background:${gold ? 'radial-gradient(circle at 35% 30%,#f4d78a,#c9a53f)' : silver ? 'radial-gradient(circle at 35% 30%,#e9edf2,#aeb8c2)' : 'radial-gradient(circle at 35% 30%,#d9a26a,#a5713d)'};display:flex;align-items:center;justify-content:center;font:700 ${big ? 16 : 12}px Inter,sans-serif;color:#3d3325;box-shadow:0 5px 12px rgba(0,0,0,.3),inset 0 0 0 3px rgba(255,255,255,.25)">${v}</div></div>`;
const coinRow = (hot) => `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:26px 30px;text-align:center">
  <div style="display:flex;gap:13px;align-items:flex-end;justify-content:center;flex-wrap:wrap">${coin('1p')}${coin('2p')}${coin('5p', false, false, true)}${coin('10p', false, false, true)}${coin('20p', false, false, true)}${coin('50p', false, false, true)}${coin('£1', true, true)}${coin('£2', true, true)}</div>
  <div style="margin-top:12px;font:600 14px Inter,sans-serif;color:#5b6b7d">${esc(hot || 'Smallest value → biggest value')}</div></div>`;
const priceScene = (price, paid, change) => `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:24px 32px;text-align:center;min-width:290px">
  <div style="font:600 13px Inter,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#7C3AED">At the till</div>
  <div style="display:flex;justify-content:center;gap:22px;margin-top:14px;align-items:center">
    <div><div style="font:400 13px Inter,sans-serif;color:#5b6b7d">Price</div><div style="font:700 26px Lexend,Inter,sans-serif;color:#12395f">${price}</div></div>
    <div style="font:300 26px Inter,sans-serif;color:#7C3AED">→</div>
    <div><div style="font:400 13px Inter,sans-serif;color:#5b6b7d">You pay</div><div style="font:700 26px Lexend,Inter,sans-serif;color:#12395f">${paid}</div></div>
    ${change ? `<div style="font:300 26px Inter,sans-serif;color:#7C3AED">→</div><div data-k="change"><div style="font:400 13px Inter,sans-serif;color:#5b6b7d">Change</div><div style="font:700 26px Lexend,Inter,sans-serif;color:#0E8F6E">${change}</div></div>` : ''}
  </div></div>`;
/* calendar week */
const weekGrid = (today, marked) => `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:22px 26px"><div style="font:600 14px Inter,sans-serif;color:#5b6b7d;text-align:center;margin-bottom:10px">This week</div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:7px">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => `<div ${i === today ? 'data-k="today"' : ''} style="text-align:center;border-radius:11px;padding:9px 6px;background:${i === today ? '#7C3AED' : i === marked ? '#F3E8FF' : '#f4f7fa'};border:1.5px solid ${i === today ? '#7C3AED' : i === marked ? '#7C3AED' : '#e4eaf0'}"><div style="font:700 12px Inter,sans-serif;color:${i === today ? '#fff' : '#12395f'}">${d}</div><div style="font:500 15px Inter,sans-serif;color:${i === today ? '#fff' : '#5b6b7d'}">${i + 2}</div>${i === marked ? '<div style="font-size:13px">&#127880;</div>' : i === today ? '<div style="font:600 9px Inter,sans-serif;color:#fff">TODAY</div>' : '<div style="height:15px"></div>'}</div>`).join('')}</div></div>`;
/* signs */
const signBoard = (kind) => { const S = { exit: ['#0E8F6E', 'EXIT', '&#127939;&#8594;'], open: ['#0E8F6E', 'OPEN', '&#128275;'], closed: ['#c0392b', 'CLOSED', '&#128274;'], noentry: ['#c0392b', 'NO ENTRY', '&#9940;'], toilets: ['#12395f', 'TOILETS', '&#128700;'] }[kind]; return `<div data-sign="${kind}" style="text-align:center"><div style="background:${S[0]};color:#fff;border-radius:14px;padding:18px 30px;font:800 24px Inter,sans-serif;letter-spacing:2px;box-shadow:0 14px 34px rgba(8,30,55,.35);display:inline-flex;gap:12px;align-items:center"><span style="font-size:26px">${S[2]}</span>${S[1]}</div></div>`; };
const signRow = (kinds, focus) => `<div style="display:flex;gap:18px;justify-content:center;flex-wrap:wrap">${kinds.map((k) => signBoard(k)).join('')}</div>`;
/* sentence train */
const sentenceTrain = (parts, hot) => `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:28px 34px;text-align:center">
  <div style="display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap">${parts.map((p, i) => `<span data-part="${i}" style="font:700 ${p.cap ? '30px' : '24px'} Lexend,Georgia,serif;color:${p.cap ? '#DB2777' : p.stop ? '#DB2777' : '#12395f'};background:${(hot === 'cap' && p.cap) || (hot === 'stop' && p.stop) ? '#FCE7F3' : 'transparent'};border-radius:9px;padding:4px 7px">${esc(p.t)}</span>`).join('')}</div>
  <div style="margin-top:12px;font:500 14px Inter,sans-serif;color:#5b6b7d">capital first · spaces between · full stop at the end</div></div>`;
/* letter triage */
const letterScene = (hot) => `<div style="width:80%;max-width:480px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:26px 30px;font:400 14px/1.7 Inter,sans-serif;color:#3c4854;text-align:left">
  <div data-k="from" style="display:inline-block;background:${hot === 'from' ? '#FCE7F3' : '#f2f5f9'};border-radius:8px;padding:5px 11px;font:700 13px Inter,sans-serif;color:#12395f">Sunnybrook Health Centre</div>
  <div data-k="who" style="margin-top:14px;font-weight:${hot === 'who' ? 800 : 600};background:${hot === 'who' ? '#FCE7F3' : 'transparent'};display:inline-block;border-radius:7px;padding:2px 7px">Dear Sam Taylor,</div>
  <div style="margin-top:9px">We are writing about your yearly health check.</div>
  <div data-k="what" style="margin-top:9px;background:${hot === 'what' ? '#FCE7F3' : 'transparent'};border-radius:7px;padding:2px 7px"><b>Please come on Tuesday 10 June at 2pm.</b></div>
  <div style="margin-top:9px">Bring this letter with you. We look forward to seeing you.</div></div>`;
const formScene = (filled, hot) => `<div style="width:78%;max-width:440px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:24px 28px;text-align:left">
  <div style="font:700 16px Lexend,Inter,sans-serif;color:#12395f;margin-bottom:13px">Activity Club — Sign-up Form</div>
  ${[['First name', filled ? 'Sam' : ''], ['Last name', filled ? 'Taylor' : ''], ['Date of birth', filled ? '14 / 05 / 1990' : '']].map((f, i) => `<div style="margin-bottom:10px"><div style="font:600 12px Inter,sans-serif;color:#5b6b7d">${f[0]}</div><div ${i === 0 ? 'data-fx' : ''} style="border:1.5px solid ${hot && i === 0 ? '#DB2777' : '#d5dde7'};border-radius:9px;padding:9px 12px;min-height:18px;font:500 15px Inter,sans-serif;color:#12395f">${f[1]}</div></div>`).join('')}
  <div style="display:flex;gap:10px;align-items:flex-end"><div style="flex:1"><div style="font:600 12px Inter,sans-serif;color:#5b6b7d">Signature</div><div data-k="sig" style="border-bottom:2px solid #12395f;min-height:26px;font:400 19px 'Segoe Script',cursive;color:#12395f;padding:2px 6px">${filled ? 'Sam Taylor' : ''}</div></div></div></div>`;
/* balanced plate */
const plateChart = () => `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:26px 32px;text-align:center">
  <svg viewBox="0 0 120 120" width="160" height="160"><circle cx="60" cy="60" r="54" fill="#fbfcfd" stroke="#d5dde7" stroke-width="3"/>
  <path d="M60 60 L60 6 A54 54 0 0 1 60 114 Z" fill="#7ab86f" opacity=".85"/>
  <path d="M60 60 L60 114 A54 54 0 0 1 12.6 33 Z" fill="#e8a13a" opacity=".85"/>
  <path d="M60 60 L12.6 33 A54 54 0 0 1 60 6 Z" fill="#c76b6b" opacity=".85"/></svg>
  <div style="display:flex;gap:14px;justify-content:center;margin-top:10px;font:600 12px Inter,sans-serif;color:#3c4854"><span>&#129388; half: veg &amp; fruit</span><span>&#127838; energy</span><span>&#127830; building</span></div></div>`;
/* handwash steps */
const washSteps = (hot) => ruleCard('Soap', 'Scrub 20s', 'Rinse & dry');
/* plug + socket */
const plugScene = (hot) => `<div style="background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(8,30,55,.4);padding:28px 36px;text-align:center">
  <div style="display:flex;gap:26px;align-items:center;justify-content:center">
    <div data-k="plug" style="width:86px;height:86px;border-radius:16px;background:#f2f5f9;border:2px solid ${hot === 'plug' ? '#0891B2' : '#d5dde7'};display:flex;align-items:center;justify-content:center;font-size:38px">&#128268;</div>
    <div style="font:300 30px Inter,sans-serif;color:#0891B2">→</div>
    <div style="width:86px;height:86px;border-radius:16px;background:#fbfcfd;border:2px solid #d5dde7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px"><div style="display:flex;gap:9px"><i style="width:7px;height:13px;background:#3c4854;border-radius:2px"></i><i style="width:7px;height:13px;background:#3c4854;border-radius:2px"></i></div><i style="width:7px;height:15px;background:#3c4854;border-radius:2px"></i></div>
  </div>
  <div style="margin-top:14px;font:600 15px Inter,sans-serif;color:#12395f">Dry hands · hold the plug body · straight in, straight out</div></div>`;

const MATHS_DEMOS = [
  [ { say: 'Look around any room and the numbers appear: the clock on the wall, the remote control, the page of a book. Numbers are quiet helpers — today we just learn to spot them and say hello.', html: con('&#128290;', 'Numbers are everywhere', 'Doors · buses · prices · phones') },
    { say: 'Here is the trick for longer numbers: read them together, not letter by letter. This bus is the fourteen — one and four together make fourteen.', html: con('&#128652;', 'Bus 14', 'Say it together: fourteen') },
    { say: 'And your own numbers matter most: your door number, your bus route, your birthday. Those are the numbers worth knowing by heart.', html: ruleCard('Door 12', 'Bus 14', 'May 5th') } ],
  [ { say: 'Meet the coin family, lined up from smallest value to biggest: one p, two p, five p, ten p, twenty p, fifty p, one pound, two pounds.', html: coinRow() },
    { say: 'Here is the surprise: the wide copper two p is worth LESS than the small thick one pound. Size does not decide — the number on the coin is the truth.', html: coinRow('The number on the coin is the truth — not the size') },
    { say: 'And notes — five, ten and twenty pounds — beat all the coins. Paper is precious: notes live safely in the wallet, not loose in a pocket.', html: ruleCard('£5', '£10', '£20') } ],
  [ { say: 'Shopping maths, made calm. The milk costs eighty p. You hand over a one pound coin — that is more than enough.', html: priceScene('80p', '£1') },
    { say: 'The shop gives back the difference — twenty p. That is all change is: the money left over. You do not have to work it out perfectly; the till does the sum.', html: priceScene('80p', '£1', '20p') },
    { say: 'And the whole routine in five friendly words: price, pay, wait, change, thank you. It works in every shop in the country.', html: ruleCard('Price', 'Pay & wait', 'Change') } ],
  [ { say: 'This is three o’clock. The short hand is the boss — it points at the hour, the three. The long hand pointing straight up says: something o’clock, exactly.', html: clockFace(3, 0, "3 o'clock") },
    { say: 'Now the long hand has swung straight down — that means half past. The short hand is past the three, so this is half past three.', html: clockFace(3, 30, 'Half past 3') },
    { say: 'And your phone is even kinder — it just writes the time: seven three zero means half past seven. Clock or phone, the day is yours to read.', html: con('&#128241;', '7:30', 'Half past seven, written in numbers') } ],
  [ { say: 'Seven days, always in the same order, going round like a gentle wheel: Monday, Tuesday, Wednesday, Thursday, Friday — then the weekend: Saturday and Sunday.', html: weekGrid(-1, -1) },
    { say: 'A calendar is that wheel drawn flat. First job every time: find today. There it is — and tomorrow is simply the next box along.', html: weekGrid(2, -1), focus: '[data-k="today"]' },
    { say: 'Now the lovely part: mark something to look forward to. A visit on Saturday — a little balloon on the calendar, and you can count the days to it.', html: weekGrid(2, 5) } ],
  [ { say: 'Kitchen maths is friendly maths. The recipe says two spoonfuls — so we count: one… two. Level them off with a knife so each spoonful is fair.', html: con('&#129348;', 'Two level spoonfuls', 'Count them in: one, two') },
    { say: 'The scale is just a number-teller. The recipe wants two hundred grams; we pour slowly and stop when the number says two hundred. The numbers match — we are there.', html: con('&#9878;', '200 g', 'Pour until the numbers match') },
    { say: 'And the microwave wants a time: three minutes. Three, zero, zero, start. Count, pour, weigh, check — then enjoy what you made.', html: ruleCard('Count', 'Weigh', 'Time') } ],
];

const ENGLISH_DEMOS = [
  [ { say: 'The world talks to us through signs. Green signs help and guide — EXIT shows the way out, OPEN welcomes you in.', html: signRow(['exit', 'open']) },
    { say: 'Red signs warn — CLOSED means not now, NO ENTRY means not this way. Red says stop and green says go, on signs just like traffic lights.', html: signRow(['closed', 'noentry']) },
    { say: 'And some signs simply point the way to useful places. Read the whole word to the very end — CLOSED and CLOSE are different words with different jobs.', html: signRow(['toilets', 'exit']) } ],
  [ { say: 'Your name is the most important word you will ever write. It starts with a capital letter — the hat your name wears.', html: sentenceTrain([{ t: 'S', cap: true }, { t: 'am' }, { t: ' ' }, { t: 'T', cap: true }, { t: 'aylor' }], 'cap') },
    { say: 'Forms always ask for the big three: your name, your address, and your date of birth. Say them out loud until they feel like old friends.', html: ruleCard('Name', 'Address', 'Birthday') },
    { say: 'And the clever move: a little details card in your wallet with all three written down. Then any form, anywhere, is just careful copying.', html: con('&#129709;', 'Your details card', 'Name · address · date of birth') } ],
  [ { say: 'A sentence is a little train. The engine at the front is the capital letter — see how the I stands tall.', html: sentenceTrain([{ t: 'I', cap: true }, { t: 'like' }, { t: 'tea' }, { t: '.', stop: true }], 'cap') },
    { say: 'The carriages are the words, with spaces between them so each one can breathe. And the buffer at the end — the full stop — tells the reader: thought complete.', html: sentenceTrain([{ t: 'I', cap: true }, { t: 'like' }, { t: 'tea' }, { t: '.', stop: true }], 'stop') },
    { say: 'Short and real is perfect. My name is Sam. The dog is happy. Say it first, then write it — that is how clean track gets laid.', html: ruleCard('Capital', 'Words', 'Full stop') } ],
  [ { say: 'A letter arrives. Do not read every word — hunt the three answers instead. First: whose name is at the top? Dear Sam Taylor — it is for Sam.', html: letterScene('who'), focus: '[data-k="who"]' },
    { say: 'Second: who sent it? The name or logo at the top — Sunnybrook Health Centre. Now we know who is talking.', html: letterScene('from'), focus: '[data-k="from"]' },
    { say: 'Third: what do they want? Hunt for a date, a time, or the word please… there it is: Tuesday the tenth of June, two pm. Who, from, what — letter understood.', html: letterScene('what'), focus: '[data-k="what"]' } ],
  [ { say: 'A form is just questions in boxes — and you already own all the answers. Read the label on the first box: First name.', html: formScene(false, true), type: { sel: '[data-fx]', txt: 'Sam' } },
    { say: 'One box at a time: fill it, check it, move on. Copy from your details card instead of remembering — copying is what careful people do.', html: formScene(true) },
    { say: 'And at the bottom, the signature — your name, written your way. If any box confuses you, leave it empty and ask. Blank is easy to fix; wrong is a muddle.', html: formScene(true), focus: '[data-k="sig"]' } ],
  [ { say: 'Now for the most powerful English there is: your voice. Six words open every door in the country: Excuse me, can you help me, please?', html: con('&#128483;', '"Excuse me, can you help me, please?"', 'Six words that work everywhere') },
    { say: 'Then add what you need, in one line: I am looking for the toilets. I cannot find my bus. Chin up, normal voice — you are allowed to be heard.', html: ruleCard('Excuse me', 'One need', 'Thank you') },
    { say: 'Pick the right person — a name badge, someone behind a counter — and remember: asking is a strength. People who ask for help, get help.', html: con('&#129309;', 'Asking is a strength', 'People who ask, get help') } ],
];

const SCIENCE_DEMOS = [
  [ { say: 'Put two fingers on your wrist and wait… there. That gentle drumming is your heart — a pump that beats about one hundred thousand times a day and never takes a holiday.', html: con('&#10084;&#65039;', 'Your heart is a pump', '~100,000 beats a day') },
    { say: 'Your lungs are two patient balloons, trading old air for new with every breath. Three slow breaths in and out — feel them doing their quiet work.', html: con('&#127788;', 'Lungs are balloons', 'Old air out, new air in') },
    { say: 'And the machine has five ways of meeting the world — sight, hearing, smell, taste, touch — plus two big needs: water to run and sleep to repair.', html: ruleCard('5 senses', 'Water', 'Sleep') } ],
  [ { say: 'Food is fuel, and this is the winning plate. Half of it belongs to the protectors: vegetables and fruit.', html: plateChart() },
    { say: 'One quarter is the energy team — bread, rice, pasta, potatoes. The other quarter is the building team — meat, fish, eggs, beans — repairing your muscles.', html: plateChart() },
    { say: 'And treats? Treats are sometimes-foods: truly enjoyed, just not at every meal. No food is bad — balance, not banning.', html: con('&#127856;', 'Treats = sometimes-foods', 'Balance, not banning') } ],
  [ { say: 'Germs are living things so small that thousands fit on one fingertip — and they travel by hitching rides on hands.', html: con('&#129440;', 'Germs are tiny hitch-hikers', 'They travel on hands') },
    { say: 'The good news: soap is their worst enemy. Twenty seconds of soapy scrubbing — backs, thumbs, between the fingers — and they wash away down the drain.', html: washSteps() },
    { say: 'When must we wash? After the toilet and before food, always. And coughs go into the elbow, so the germs never reach your hands at all.', html: ruleCard('After toilet', 'Before food', 'Cough → elbow') } ],
  [ { say: 'Weather is the sky’s mood, and your phone reads it for you every morning. Rain symbol? The sky is asking for a coat.', html: phoneShell(`<div style="text-align:center;margin-top:20px"><div style="font:600 15px Inter,sans-serif;color:#fff">Today</div><div style="font-size:52px;margin:8px 0">&#127783;</div><div style="font:300 38px Lexend,Inter,sans-serif;color:#fff">11°</div><div style="font:500 13px Inter,sans-serif;color:rgba(255,255,255,.85)">Rain until 3pm — take a coat</div></div>`) },
    { say: 'One warning: sunshine through the window can trick you. Check the temperature number, not just the symbol — sunny and freezing love to travel together.', html: con('&#127774;', 'Sunny can still be cold', 'Check the temperature number') },
    { say: 'Behind the daily weather turns the big wheel of seasons: spring grows, summer shines, autumn falls, winter rests. Check, choose, dress — you are ready for all of it.', html: ruleCard('Check app', 'Read number', 'Dress right') } ],
  [ { say: 'Kitchen science in one line: germs grow when food is warm, sleep when it is cold, and die when it is properly hot. That is the whole secret.', html: ruleCard('Warm: grow', 'Cold: sleep', 'Hot: gone') },
    { say: 'So the fridge is the sleep-chamber: milk, meat, butter and leftovers live there. The cupboard team — tins, pasta, biscuits — are happy at room temperature.', html: con('&#129482;', 'Fridge = germs asleep', 'Milk · meat · leftovers') },
    { say: 'And when we reheat, we go piping hot — steaming all the way through, not just warm on one side. Steam is the all-clear signal.', html: con('&#9832;', 'Piping hot = steaming', 'Heat kills the germs') } ],
  [ { say: 'Electricity is the invisible helper in the walls — lighting lamps, boiling kettles, charging phones. A brilliant servant with two simple rules.', html: con('&#9889;', 'The invisible helper', 'Two simple rules keep it friendly') },
    { say: 'Rule one: water and electricity never mix — dry hands before any plug. Rule two: hold the plug body like a door handle. Never pull the cable.', html: plugScene('plug'), focus: '[data-k="plug"]' },
    { say: 'If a socket ever sparks or smells burny: do not touch — move away and tell staff at once. Respect the rules, and the helper serves you safely for life.', html: ruleCard('Dry hands', 'Hold the plug', 'Sparks? Tell!') } ],
];

DEMO_BANK['everyday-maths'] = MATHS_DEMOS;
DEMO_BANK['everyday-english'] = ENGLISH_DEMOS;
DEMO_BANK['everyday-science'] = SCIENCE_DEMOS;
