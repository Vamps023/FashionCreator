# Editor design system and UX contract

## Visual identity
Professional creative-app aesthetic: dark graphite canvas, neutral layered surfaces, light typography, restrained lavender accent for selection and actions. Avoid decorative gradients, excessive borders, and dense form clutter. Use semantic tokens—not hex values scattered in components. Include a high-quality light theme of equal functionality.

## Design tokens (initial proposal)
```css
:root[data-theme='dark'] {
  --bg-app: #15171c;
  --bg-panel: #20232b;
  --bg-elevated: #2a2e38;
  --bg-viewport: #292d35;
  --border: #393e49;
  --text-primary: #f2f3f6;
  --text-secondary: #aeb3c0;
  --accent: #a78bfa;
  --accent-hover: #bba7ff;
  --accent-subtle: #3a3252;
  --positive: #67c7a2;
  --warning: #f1c47d;
  --negative: #f28f97;
}
:root[data-theme='light'] {
  --bg-app: #eff1f5;
  --bg-panel: #ffffff;
  --bg-elevated: #f6f7f9;
  --bg-viewport: #e5e8ed;
  --border: #d4d8e1;
  --text-primary: #20232c;
  --text-secondary: #5e6572;
  --accent: #6e55cb;
  --accent-hover: #5941b5;
  --accent-subtle: #e9e3fb;
  --positive: #27775b;
  --warning: #9b691d;
  --negative: #b73f52;
}
```
Create tokens for spacing in 4px steps (4/8/12/16/24/32), radii (6/10/14), text hierarchy (12/13/14/16/20/28), control height (~32/36 px), focus rings and motion speeds. Theme via CSS custom properties; support system preference and persisted override.

## Editor layout (desktop)
```
┌──────────────────────────────────────────────────────────────────────┐
│ Logo  Project name  Saved state       Undo Redo   Preview  Export   │
├──────────────────────────────────────────────────────────────────────┤
│ Design | Fabric | Artwork | Pattern | Fitting | Render | Settings  │
├───────────────┬──────────────────────────────────────┬───────────────┤
│ Asset browser │                                      │ Inspector     │
│ Garment parts │          3D Viewport                 │ Contextual    │
│ Layer tree    │      orbit / pan / select            │ Parameters    │
│               │                                      │ Materials     │
│               │                                      │ Print options │
├───────────────┴──────────────────────────────────────┴───────────────┤
│ Status / hints / load progress / validation warnings                 │
└──────────────────────────────────────────────────────────────────────┘
```
Left and right panels independently resizable, collapsible, min/max widths; central viewport never becomes unusably small. On narrower screens collapse panels to drawers. Mode-specific inspector: Design (parts/measurements), Fabric (materials), Artwork (layer controls), Pattern (panel/curve/seams), Fitting (avatar/pose), Render (quality/output). Pattern mode can split a 2D pane and the 3D pane later.

## Interactions
- Select a garment part by viewport click or parts tree; selection stays synchronized across panels.
- Orbit: pointer drag; pan: right/middle drag or modifier; scroll/pinch zoom; implement discoverable controls and reset/focus actions.
- Undo `Ctrl/Cmd+Z`; redo `Ctrl/Cmd+Shift+Z`; save `Ctrl/Cmd+S` (prevent browser page-save only when editor focused and handled); `Delete` removes selected artwork with a confirmation when destructive; `Esc` cancels active interactions.
- Slider gestures produce immediate visual preview but one undo entry on release.
- Use clear dirty/saving/saved/error indicator. Avoid promising saved state until persistence completes.
- Every button must perform an action or be explicitly disabled with a tooltip saying why.
- All interactive controls have labels, keyboard focus, disabled states, feedback. Support high contrast and reduced motion preference.

## User-facing surfaces
### Dashboard
Recent projects, New Project, garment template tiles, local import. Empty state should explain import/create without blocking navigation. Don't expose broken cloud sign-in.
### Design mode
Garment catalog, part tree, shape/measurement sliders with units and input validation, variation chips, lock/show toggles.
### Fabric mode
Fabric swatch library, color picker, roughness/normal/tiling, material assignment by slot, reset material.
### Artwork mode
Front/back zone selector, canvas and live 3D preview, text/image creation, layers/reorder, alignment/snapping, delete, opacity and color controls.
### Pattern mode
Future: centimeters/mm rulers, 2D point/curve editing, seam inspector, validity warnings and linked 3D preview. Feature flag until tested.
### Fitting mode
Future: avatar selection, body measurements, pose. Label visual approximation, not verified physical fit.
### Render mode
Camera presets, transparent background, output resolution, export PNG/GLB and downloadable native project.

## Component library
Build `AppShell`, `AppHeader`, `ModeTabs`, `ResizablePanel`, `IconButton`, `PropertyGroup`, `PropertyField`, `UnitNumberField`, `ColorPicker`, `MaterialSwatch`, `LayerTree`, `AssetCard`, `AssetSearch`, `ViewportToolbar`, `StatusBar`, `ErrorBoundary`, `ConfirmDialog`, `Toast`, `ExportDialog`. Use shared component API and token names.

## Quality bar
- No random overlapping panels, invisible labels, uneven density, hardcoded theme colors or repeated icon buttons without tooltips.
- Focus selected element is visible and inspector displays correct values.
- Empty/loading/error/success states exist for all async flows.
- Use a consistent UI font available as a permitted open-source/web-safe font or system font; do not bundle third-party fonts without authorization.
- Capture and review visual regression screenshots for dark/light modes at desktop widths.
