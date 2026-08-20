# MTG-I1 AR Viewer — true-scale build

Three files, all required, all in the same folder:
- `index.html` — the viewer page
- `MTGI.glb` — the model, real-world scale, for Android/WebXR
- `MTGI.usdz` — the same model, for iOS AR Quick Look

## What's different from a "normal" AR viewer
This build is set up specifically for your museum use case:

- **True scale, locked.** `ar-scale="fixed"` + `disable-zoom` mean nobody can pinch-resize the satellite bigger or smaller, in AR or in the fallback desktop viewer. What you see is the real size.
- **Real USDZ, not auto-generated.** model-viewer *can* auto-generate a USDZ for iPhones on the fly, but there's a long-standing bug where that auto-generated version ignores the scale lock — visitors could pinch-resize it. I generated a proper `MTGI.usdz` file (via Blender + Pixar's USD tools) so the lock actually holds on iOS too.
- **No zoom gesture anywhere.** In the non-AR fallback view (desktop, or a phone without AR support), scroll/pinch-zoom is disabled — you can still drag to orbit, but "getting closer" only happens by physically walking up to it once it's placed in AR.

## The actual size, and how I calibrated it
EUMETSAT/ESA publish the satellite's **stowed** (folded for launch) dimensions and mass, but not an official deployed span with solar arrays extended:

| Fact | Value | Source |
|---|---|---|
| Launch mass | 3,760 kg (~3,600–3,800 kg per different ESA pages) | ESA, Wikipedia, eoPortal |
| Stowed dimensions | 2.3 × 2.8 × 5.2 m | ESA "Facts and figures" |
| Configuration | Twin-wing solar array (two panels, one each side) | eoPortal |

Your original `.glb` already had a real-world scale baked in by whoever exported it (its Blender export used a 0.01 node scale, converting centimeter-modeled geometry to meters). I measured that model's own bounding geometry and separated it by material to identify which part is the compact bus+antenna cluster versus the two solar-array wings. The bus+antenna cluster came out to **4.92 m** on its longest side — close to, but not exactly, ESA's published 5.2 m stowed figure (a "stowed for launch" size is folded even tighter than the deployed bus, so an exact match isn't expected).

I applied a **+5.6% uniform correction** so the bus's longest side lands exactly on the documented 5.2 m, and re-baked that into the mesh (not just a display-layer scale hack — it's now physically part of the file). Final size:

- Bus + antenna cluster: **6.8 × 5.6 m** (its two largest sides)
- Full span, tip-to-tip across both deployed solar arrays: **≈ 11.8 m**

**Honest caveat:** the 11.8 m tip-to-tip figure is *not* independently verified — EUMETSAT doesn't publish a deployed solar-array span, so this scales proportionally from the bus correction, riding on the assumption that your model's original artist got the *proportions* right even if the absolute scale was a guess. If you can get an official deployed-span number from EUMETSAT/Thales Alenia Space directly, the correction factor (`1.0559`) is isolated at the top of `bake_scale.py`-equivalent logic — just tell me the number and I'll re-anchor it precisely.

## Why AR "spawn distance" isn't something you set directly
Android's Scene Viewer and iOS's Quick Look are native OS apps, not code you control — once launched, the visitor points their phone at the floor, sees a placement reticle, and taps to drop the satellite there. There's no hook to force it to "appear 5 meters away." In practice this isn't a real problem here: at ~11.8 m across, the model is too big to take in from up close, so whatever spot a visitor points at, they'll instinctively step back to see the whole thing — which is exactly the "walk around and investigate" behavior you're after. If you later want to *force* a fixed spawn distance (e.g. always appears at the far end of the gallery, no user tap), that requires dropping Scene Viewer/Quick Look and building a custom WebXR-only experience with your own placement logic — a bigger, more custom build. Happy to scope that if the default behavior doesn't feel right in the room.

## Deploying
Same as before — needs real HTTPS hosting for the camera to work (GitHub Pages, Netlify Drop, Vercel all take under 5 minutes). See the previous instructions; nothing about that has changed.

## Testing checklist for the museum floor
- [ ] Open the link on an Android phone with Chrome, tap "View in your space," confirm you can't pinch-resize the satellite.
- [ ] Open on an iPhone with Safari, same check — this is the one that needed the real USDZ fix.
- [ ] Stand at the far side of the gallery space you're planning to use, confirm there's enough room to walk around an ~11.8 m object (or plan to display it partly through a wall/floor, which visitors generally find intuitive in AR).
- [ ] Check the model doesn't clip oddly through real furniture — floor tracking is generally solid but can wander in low light or reflective floors.
