# Morty PWA Icons

This directory contains the PWA icons for the Morty application.

## Required Icons

The following icon sizes are required for full PWA support:

| Size | File | Usage |
|------|------|-------|
| 72×72 | icon-72x72.png | Android Chrome (legacy) |
| 96×96 | icon-96x96.png | Android Chrome |
| 128×128 | icon-128x128.png | Chrome Web Store |
| 144×144 | icon-144x144.png | Windows tile, IE |
| 152×152 | icon-152x152.png | iOS Safari (iPad) |
| 192×192 | icon-192x192.png | Android Chrome, Apple Touch Icon |
| 384×384 | icon-384x384.png | Android Chrome (splash) |
| 512×512 | icon-512x512.png | Android Chrome (splash, maskable) |

## Icon Design

The Morty icon features:
- **Background**: Deep navy (#0f172a) or gold (#f59e0b) for maskable icons
- **Symbol**: House/home icon representing mortgage/real estate
- **Style**: Clean, minimal, professional

## Generating Icons

To generate all icon sizes from a source SVG:

```bash
# Using sharp (Node.js)
npx sharp-cli --input icon-source.svg --output public/icons/ --format png --width 72 --height 72

# Or use an online tool like:
# - https://realfavicongenerator.net/
# - https://maskable.app/
# - https://pwa-asset-generator
npx pwa-asset-generator icon-source.svg public/icons/ --manifest public/manifest.json
```

## Maskable Icons

All icons are marked as `purpose: "maskable any"` in the manifest.
Maskable icons should have the main content within the "safe zone" (center 80% of the icon).

Test maskable icons at: https://maskable.app/
