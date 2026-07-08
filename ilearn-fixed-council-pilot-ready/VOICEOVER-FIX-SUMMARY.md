# Voiceover & Script Fix Summary

## What changed
- **Removed the repeated template.** Every lesson previously ended with the same line
  ("Now scroll down and complete the activities with your tutor… work through them at
  your own pace") and opened its tip with the same "Here is a common mix-up to watch
  for." Both are gone. Each lesson now has a **unique mistake lead-in** and a **unique
  closing** that invites the learner to the activities in its own words.
- **Fixed the source, not just the text.** The variation lives in `lesson-video.js`
  (the `buildTimeline` generator plus per-lesson `MISTAKE_LEADS` and `CLOSING_NEXT`
  arrays), so regenerating scripts stays natural and non-repetitive.
- **Natural tutor voice.** Openings, explanations, mistake warnings and closings vary
  across all 16 lessons. Tone is calm, warm and adult-respectful; short sentences;
  natural transitions.
- **Scripts match the activities.** Each video names what the learner will click or
  type, and the activity block below the video mirrors the lesson (see
  SCRIPT-ACTIVITY-ALIGNMENT-REVIEW.md).
- **Grammar.** The "You moves / you gets / you copies" style errors were checked for
  across `lesson-video.js` and `course-data.js`; none are present in this build.
- **Captions** now have a capped height, scroll safely if long, sit above the
  animation layer, and shrink on small screens (see iLearn.dc.html `.vcap`).
- **Less demo-like.** The staff sign-in no longer advertises "any email + 6-char
  password"; public branding defaults to the neutral, configurable "iLearn Pilot".

## Is the voiceover generated?
**No MP3s were generated in this environment** — it has no internet access, so Microsoft
Edge Neural TTS could not be reached. The videos narrate with the on-device browser
voice, which works offline. To produce realistic recorded narration, run the generator
locally (see README and `scripts/generate-voiceover-edge.mjs`). The exact per-lesson
scripts to voice are in `voiceover-scripts/`.
