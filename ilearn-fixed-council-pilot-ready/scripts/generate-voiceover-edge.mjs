#!/usr/bin/env node
/**
 * Generate realistic lesson narration with Microsoft Edge Neural TTS (free).
 *
 *   npm run voiceover:free
 *
 * Requires the 'edge-tts' Python package OR the 'msedge-tts' npm package and internet
 * access. This writes one MP3 per lesson beat into audio/ and an audio/voiceover-manifest.json
 * that the app reads to play recorded narration (browser speech is the fallback).
 *
 * Scripts are read from voiceover-scripts/all-lessons.json (regenerate with
 * scripts/export-voiceover-script.mjs whenever the lesson scripts change).
 */
import fs from 'node:fs';
import path from 'node:path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const VOICE = process.env.EDGE_VOICE || 'en-GB-SoniaNeural';
const SRC = 'voiceover-scripts/all-lessons.json';
const OUT = 'audio';

if (!fs.existsSync(SRC)) { console.error('Missing ' + SRC + ' — run: npm run voiceover:export'); process.exit(1); }
const lessons = JSON.parse(fs.readFileSync(SRC, 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

const tts = new MsEdgeTTS();
await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

const manifest = {};
for (const lesson of lessons) {
  const nn = String(lesson.n).padStart(2, '0');
  manifest[lesson.n] = [];
  for (let b = 0; b < lesson.lines.length; b++) {
    const file = `lesson-${nn}-${String(b + 1).padStart(2, '0')}.mp3`;
    const stream = tts.toStream(lesson.lines[b]);
    await new Promise((res, rej) => {
      const w = fs.createWriteStream(path.join(OUT, file));
      stream.on('data', (d) => w.write(d));
      stream.on('end', () => { w.end(); res(); });
      stream.on('error', rej);
    });
    manifest[lesson.n].push(file);
    process.stdout.write('.');
  }
}
fs.writeFileSync(path.join(OUT, 'voiceover-manifest.json'), JSON.stringify(manifest, null, 2));
console.log('\nDone. Wrote per-beat MP3s + audio/voiceover-manifest.json');
