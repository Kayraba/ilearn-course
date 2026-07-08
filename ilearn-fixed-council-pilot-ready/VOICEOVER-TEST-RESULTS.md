# Voiceover / QA Test Results

Environment note: this review ran in a browser preview with **no terminal and no
internet**. Node/npm and Microsoft Edge TTS could **not** be executed here, so anything
requiring them is marked "must run locally" rather than claimed as passed.

| Check | Result |
|---|---|
| `lesson-video.js` loads as an ES module | PASS (imported live, timelines build for all 16 lessons) |
| No duplicate closing line across lessons | PASS (16 unique) |
| No duplicate mistake line across lessons | PASS (16 unique) |
| Old repeated template phrase removed | PASS (not present) |
| Timeline duration per lesson | PASS (~1:15–2:00 est.; longer once voiced) |
| Captions render above animation, capped height | PASS (visual check) |
| Learner login → home → lesson → activities → complete | PASS |
| Staff login → dashboard → add learner → progress tracked | PASS |
| App console errors | NONE |
| `npm ci` / `npm run voiceover:free` (Edge TTS) | NOT RUN — must run locally (no internet here) |
| Real MP3 narration generated | NO — must run locally |

## Remaining risks
- Recorded narration still needs generating locally; until then the on-device voice is
  used and will sound less human than Edge Neural TTS.
- Estimated timings are model-based; confirm against the recorded audio.
