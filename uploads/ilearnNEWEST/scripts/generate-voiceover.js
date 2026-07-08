'use strict';
/**
 * Generate lesson voiceover MP3s with the ElevenLabs API.
 *
 *   ELEVENLABS_API_KEY=xxx ELEVENLABS_VOICE_ID=yyy npm run voiceover
 *
 * Writes public/audio/lesson-01.mp3 … lesson-16.mp3. Run it once (or whenever the
 * narration changes). Skips files that already exist unless you pass --force.
 * The animated lesson player picks the files up automatically.
 */
const fs = require('fs');
const path = require('path');
const narration = require('../src/narration');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2'; // "Alice" — a calm British voice
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const FORCE = process.argv.includes('--force');
const OUT_DIR = path.join(__dirname, '..', 'public', 'audio');

if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY. Get one at elevenlabs.io → Profile → API Keys.');
  process.exit(1);
}
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function tts(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

(async () => {
  console.log(`Voice ${VOICE_ID} · model ${MODEL} · ${narration.length} lessons`);
  for (let i = 0; i < narration.length; i++) {
    const nn = String(i + 1).padStart(2, '0');
    const file = path.join(OUT_DIR, `lesson-${nn}.mp3`);
    if (fs.existsSync(file) && !FORCE) { console.log(`lesson-${nn}.mp3  (exists, skip)`); continue; }
    process.stdout.write(`lesson-${nn}.mp3  generating… `);
    try {
      const mp3 = await tts(narration[i]);
      fs.writeFileSync(file, mp3);
      console.log(`${(mp3.length / 1024).toFixed(0)} KB ✓`);
    } catch (e) {
      console.log('FAILED'); console.error('  ' + e.message);
      if (String(e.message).includes('401')) { console.error('  → check your API key.'); process.exit(1); }
    }
    await new Promise((r) => setTimeout(r, 400)); // be gentle on rate limits
  }
  console.log('Done. MP3s are in public/audio/ — the lesson player will use them automatically.');
})();
