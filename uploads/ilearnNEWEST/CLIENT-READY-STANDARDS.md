# iLearn Client-Ready Standards Pass

This build has been tightened for professional review and pilot delivery. It is
not an official Up Learn product or template; it applies the same kind of
discipline expected from a premium learning platform: clear structure, safe
access, evidence of progress and polished learner experience.

## Completed in this pass

- Removed visible demo credentials from the learner and staff sign-in screens.
- Replaced hard-coded partner/demo wording with configurable pilot wording.
- Converted seed credentials to `SEED_*` environment variables.
- Removed voiceover generation and browser speech from the lesson player.
- Upgraded the 16-lesson curriculum to clearer, adult-facing step-by-step tasks.
- Expanded each lesson into a 60-minute supported-learning session with 8-9 activity cards.
- Cleaned learner microcopy so activities feel guided, calm and professional.
- Kept staff evidence fields: prompt level, consent/capacity, audit and CSV export.
- Updated README, deployment instructions and environment variables for handover.

## Product standard

- One learning objective per lesson.
- Steps are short enough to follow on a tablet with staff support.
- Practice activities reinforce the exact workflow from the lesson.
- Longer practice cards include time estimates, real-computer tasks and evidence prompts.
- Feedback is corrective without sounding childish.
- Staff notes support prompt fading and independence evidence.
- Completion records are useful for reporting, not just gamified progress.

## Client demo flow

1. Show the learner start screen and enter a learner name.
2. Explain that iLearn saves progress under that name.
3. Start lesson 9 or 15 to show Word or Excel progression.
4. Complete one activity and mark the prompt level.
5. Switch to staff view and show dashboard progress.
6. Open the learner drawer and show consent/capacity plus lesson records.
7. Export CSV and show the certificate screen.

## Before real learner use

- Set real `SEED_*` values before first deploy.
- Use service-approved language for consent/capacity.
- Confirm data processing responsibilities with the client.
- Test on the tablets or laptops learners will actually use.
- Let learners create real records by entering their names on the start screen.
- Set `SEED_ON_BOOT=false` after setup.
- Enable database backups and agree who manages staff accounts.

## Video production note

The app is intentionally silent. Add your own narration, captions and on-camera
tutor explanation in the edited lesson videos.
