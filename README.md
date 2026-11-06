# TimeSnap

Hide the timer, trust your gut, stop on target. Next.js 16 · React 19 · Tailwind 3. No backend.

```bash
npm install
npm run dev
```

## Modes
- **Solo**: presets (10 s, 30 s, 1 min, 2 min) or any custom time (`7.5`, `1:45`); personal records, history, instant replay (Space).
- **Play with friends**: 2, 3 or 4 players on one device. Pass it around; everyone plays the same target, times stay hidden until the round ends. 1–7 rounds, optional random target per round, cumulative standings.
- **Challenge**: seeded random targets that get longer with a shrinking pass window, 3 lives. "Challenge a friend" shares a link with the same seed and your score to beat.

## Timing
Elapsed = `stop − start` on the monotonic `performance.now()` clock, using the input events' own `timeStamp`s (no interval counting).
