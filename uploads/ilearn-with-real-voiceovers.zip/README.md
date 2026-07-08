# iLearn — Confident Computing (Controlled Pilot Build)

An accessible digital-skills learning platform for supported learners. This package is the redesigned front-end product: learner login, progress tracking, narrated lesson videos, 15 interactive activities per lesson, certificates, and a staff/admin dashboard.

## What's in this folder

- `iLearn.dc.html` — the application. Open this through a local web server.
- `course-data.js` — the 16 lessons and 240 activities.
- `lesson-video.js` — the narrated tutor-video engine.
- `support.js` — runtime for the component.
- `audio/` — voiceover files and generated voiceover manifest.
- `voiceover-scripts/` — exported tutor scripts for every lesson.
- `scripts/generate-voiceover-edge.mjs` — free Microsoft Edge Neural TTS generator.
- `VOICEOVER-AND-TUTOR-SCRIPT.md` — voice/caption/script notes.

## How to run it

This uses ES modules, so serve the folder over HTTP. Opening the file directly with `file://` can block imports.

From inside this folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/iLearn.dc.html
```

## Signing in for pilot preview

- **Learner:** type a name and press **Start my course**.
- **Staff:** switch to **I'm staff**, enter any work email and a password of 6+ characters.

This standalone preview stores data in the browser using `localStorage`. For a real live pilot with learner data, connect the production backend and persistent database.

## Realistic voiceover: free Microsoft Edge Neural TTS

The app now supports real MP3 narration per lesson beat. This is more reliable than browser speech and avoids ElevenLabs free-plan limits.

Install/use it with:

```bash
npm run voiceover:free
```

Default voice:

```text
en-GB-SoniaNeural at -8% speed
```

The generator creates files like:

```text
audio/lesson-01-01.mp3
audio/lesson-01-02.mp3
audio/lesson-02-01.mp3
```

It also creates:

```text
audio/voiceover-manifest.json
```

When the manifest exists, the app automatically uses the generated MP3 narration. Missing lines fall back to browser speech.

## Tutor scripts

Export the spoken script without generating audio:

```bash
npm run voiceover:script
```

Scripts are saved in:

```text
voiceover-scripts/
```

## Honest pilot status

This is a controlled-pilot build. It has not been independently certified for security, accessibility, data protection, or clinical/educational outcomes. Complete your own review before using real personal data.
