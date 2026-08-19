# MTG-I AR Viewer — starter

Two files: `index.html` (the viewer) and `MTGI.glb` (your model). Both must stay in the same folder — the page loads the model as a relative path.

## Why it doesn't "just work" as a chat preview
Mobile AR (camera access, Scene Viewer, AR Quick Look) only works when the page is served over **real HTTPS** from an actual domain — not from a local file, not from an embedded preview iframe. You need to deploy it. That takes about 2 minutes:

## Fastest deploy: GitHub Pages
1. Create a new public GitHub repo.
2. Upload `index.html` and `MTGI.glb` to it (drag-and-drop on github.com works fine).
3. Repo Settings → Pages → Deploy from branch → `main` / root.
4. Wait ~1 minute, then open `https://<your-username>.github.io/<repo-name>/` on your phone.

## Equally fast: Netlify Drop
1. Go to https://app.netlify.com/drop
2. Drag the whole `mtg-satellite-ar` folder onto the page.
3. You get an instant `https://random-name.netlify.app` link — open it on your phone.

## What happens on each platform
- **Android (Chrome)** — tapping "View in your space" launches Google Scene Viewer directly from the `.glb`. No extra steps.
- **iPhone (Safari)** — tapping the button launches Apple's AR Quick Look. Since no `ios-src` is set, `<model-viewer>` auto-generates a USDZ on the fly the first time — no conversion tooling needed on your end for a model this simple (single mesh, no animations).
- **Desktop / no AR support** — falls back to an orbiting 3D viewer (drag to rotate, scroll to zoom), so the link still works for anyone, it just won't be "AR."

## Sharing it
Once deployed, share the URL directly, or generate a QR code pointing to it (e.g. via a QR generator site) for physical handouts, posters, or a museum/office placard next to a screen.

## If you want to customize
- Swap colors/fonts/copy in the `<style>` block and the `<footer>` in `index.html`.
- To scale the model differently in AR, adjust `ar-scale` (`"auto"` matches real-world size estimation, or set `"fixed"` to keep exactly the size you model it at).
- To lock placement to a wall instead of the floor, change `ar-placement="floor"` to `ar-placement="wall"`.
