# 3D Fashion Studio

> Browser-based 3D clothing design platform for digital fashion creators, independent apparel brands, and 3D artists.

![3D Fashion Studio Architecture](docs/architecture/overview.png)

## Overview

**3D Fashion Studio** is a professional desktop-first web platform for designing, customizing, and exporting 3D clothing. Built with React 19, TypeScript, Three.js (WebGL2), and a non-destructive document architecture, it enables creators to:

- 🎽 **Customize Modular Garments**: Modify hoodies and tees with independent components (hood styles, kangaroo pockets, cuffs, hems, drawstrings).
- 📐 **Parametric Sizing & Fit**: Control body length, chest width, sleeve length, and fit profiles (slim, regular, relaxed, oversized) in real time.
- 🧵 **Fabric & PBR Material Engine**: Apply authentic fabrics (Cotton Fleece, French Terry, Ribbed Knit, Raw Denim) with customizable roughness, sheen, and procedural normal maps.
- 🎨 **2D Artwork & Decal Studio**: Position, rotate, scale, and color graphics, logos, and custom typography across front and back UV print zones.
- 👤 **Virtual Mannequin Fitting**: Preview draping and ease against a 3D anatomical avatar with body measurements.
- 💾 **Non-destructive History & Export**: Full Undo/Redo (`Ctrl+Z` / `Ctrl+Y`), native `.fstudio` project save/load, studio render PNG snapshots, and standard GLB (glTF 2.0) export with baked textures.

---

## Monorepo Architecture

```
fashion-studio/
├── apps/
│   └── web/                   # Main React 19 + Vite + Tailwind studio editor
├── packages/
│   ├── garment-schema/        # Document schema, types, defaults, validation
│   ├── editor-core/           # Zustand store, command history undo/redo engine
│   ├── garment-engine/        # Procedural modular 3D garment & avatar generators
│   ├── material-engine/       # PBR physical fabric shaders & procedural textures
│   ├── artwork-engine/        # 2D canvas compositor & dynamic UV texture bridge
│   ├── renderer-3d/           # Three.js WebGL2 viewport, studio lighting, camera presets, raycaster
│   └── export-engine/         # GLB binary exporter, PNG snapshot, .fstudio persistence
├── tests/
│   └── core-verification.ts   # Automated regression & parity test suite
└── OPEN_SOURCE_INVENTORY.md   # Open source dependencies & licensing audit
```

---

## Quick Start

### Prerequisites
- Node.js >= 20.x (tested on v24.22.1)
- pnpm >= 10.x (or npm >= 11.x)

### Installation
```bash
# Clone the repository and enter the directory
git clone <repo-url>
cd FashionCreator

# Install workspace dependencies
pnpm install

# Approve builds if prompted by pnpm
pnpm approve-builds --all
```

### Development Server
```bash
# Start the local development server (http://localhost:3000)
pnpm dev
```

### Production Build & Test
```bash
# Run automated verification tests
pnpm test

# Build for production
pnpm build
```

---

## MVP Acceptance Criteria (12/12 Implemented)

- [x] **01. React editor shell with resizable panels**: Clean 3-pane DCC layout with mode navigation.
- [x] **02. Shared dark/light UI theme**: DCC slate theme with glowing accents and responsive controls.
- [x] **03. 3D viewport with camera controls**: OrbitControls, camera presets (3D, Front, Back, Left, Right), contact shadows.
- [x] **04. Standardized hoodie 3D asset**: Manifold 3D geometry with sub-divided panels and clean UV coordinates.
- [x] **05. Modular component selection**: Interactive raycasting part picking (body, hood, cuffs, pockets, waist, cords).
- [x] **06. Body/sleeve shape adjustments**: Real-time slider controls for length, chest, sleeves, and fit profiles.
- [x] **07. PBR fabric presets and colors**: Physical sheen, roughness, procedural knit/twill normal maps, and color picker.
- [x] **08. Front/back artwork and text**: Dynamic 2D canvas composer projecting logos and typography onto 3D mesh.
- [x] **09. Selection, property inspector & layers**: Context-sensitive properties panel reacting to active selection.
- [x] **10. Undo, redo and reset**: Command pattern history stack tracking all state mutations with hotkeys (`Ctrl+Z` / `Ctrl+Y`).
- [x] **11. Save and reopen editable project**: Native `.fstudio` JSON project format with full rehydration.
- [x] **12. Export PNG and GLB**: High-resolution studio snapshots and standard glTF 2.0 GLB binary export.

---

## License
MIT
