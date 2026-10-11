# Refract

Refract is a browser puzzle about drawing light through an optical bench. Trace each colored beam between its two outlined emitters, thread every filled lens of that shape, and spend every crystal charge without sharing or crossing segments.

Campaign offers 24 hand-built boards across four sets. Cascade supplies an endless sequence that adds channels, crystals, and larger boards as you solve.

## Run

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To make the self-contained production site, run `npm run build`; the result is written to `dist/` and can be hosted as static files.

## Controls

- Mouse, pen, or touch: press an emitter or beam end, then drag through adjacent nodes. Release to keep the route; drag backward along it to retract.
- Arrow keys or WASD: move menu and campaign-grid highlights.
- Enter or Space: confirm.
- Escape: back.
- R: clear every beam on the current board.
- M: mute or unmute audio.

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run format` for the project checks.
