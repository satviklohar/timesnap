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

## Security & privacy
- **No backend, no accounts, no secrets.** Everything runs in the browser; the only stored data is your nickname, character and scores in `localStorage`. Nothing is sent anywhere.
- **Strict Content-Security-Policy** with a per-request nonce (`proxy.ts`): no third-party scripts, styles, fonts or connections; framing is denied.
- **Hardened headers** (`next.config.mjs`): `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (camera, mic, location off), HSTS, COOP; `X-Powered-By` removed.
- **Fonts are self-hosted** at build time, so visitors never contact Google.
- **Untrusted input is validated:** challenge share-link params (`s`, `b`, `l`, `n`) are sanitised and length-limited, and saved `localStorage` data is re-validated on load. User text is only ever rendered through React's escaping.
- `.env*` files, keys and local tool folders are git-ignored. Report issues by opening a GitHub issue (no sensitive data please).
