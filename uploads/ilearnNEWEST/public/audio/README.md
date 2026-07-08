# Lesson voiceover (ElevenLabs)

This pilot build uses **silent animated walkthroughs** — narration is added in
video editing (see the main README). The ElevenLabs generator produces that
narration audio for you:

    ELEVENLABS_API_KEY=xxx ELEVENLABS_VOICE_ID=yyy npm run voiceover

It reads the lesson narration in `src/narration.js` and writes
`lesson-01.mp3 … lesson-16.mp3` here. Use them as the voice track when you
record/screen-capture the animated lessons, or as standalone narration.

Suggested voice: a calm British voice (Alice / Charlotte / Lily).

> If you later want the animated player to speak these MP3s in-app (instead of
> silent), that's a small addition to `public/js/animations.js` — ask and it can
> be wired back in.
