# iLearn — Confident Computing (Controlled Pilot Build)

An accessible digital-skills learning platform for supported learners. This package
is the redesigned front-end product: learner login, progress tracking, long-form
narrated lesson videos, 15 interactive activities per lesson, certificates, and a
staff/admin dashboard.

## What's in this folder
- `iLearn.dc.html` — the application (open this)
- `course-data.js` — the 16 lessons and 240 activities (15 per lesson)
- `lesson-video.js` — the narrated lesson-video engine
- `support.js` — runtime for the component
- `img/ilearn-logo.png` — brand logo

## How to run it
This uses ES modules, so serve the folder over HTTP (opening the file directly with
file:// will block the imports). From inside this folder:

    python3 -m http.server 8000

Then open: http://localhost:8000/iLearn.dc.html

## Signing in (pilot preview)
- **Learner:** type a name and press "Start my course". Progress saves under that name.
- **Staff:** switch to "I'm staff", enter any work email and a password of 6+ characters.

Data is stored in the browser (localStorage) for this preview so it is fully clickable
offline. It mirrors the REST API shape, so it maps back onto a Node/Postgres server for
the live pilot.

## Real voiceover (ElevenLabs)
The videos currently narrate with the best natural browser voice available, with
captions as the primary channel. To use recorded narration from a chosen voice:

1. Generate one MP3 per narration line (the script text lives in `lesson-video.js`).
2. Save them as `audio/lesson-1-01.mp3`, `audio/lesson-1-02.mp3`, … (lesson, then beat).
3. Add one line where the app boots: `setNarration({ base: 'audio', ext: 'mp3' });`

Any line without a matching file falls back to the browser voice automatically.

## Honest pilot status
This is a controlled-pilot build. It has NOT been independently certified for security,
accessibility (WCAG), or data protection. Treat learner data accordingly and complete
your own review before using real personal data. For live use, connect a persistent,
backed-up database.
