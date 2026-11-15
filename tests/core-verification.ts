import {
  createInitialProject,
  createDefaultHoodieInstance,
  createDefaultTShirtInstance,
  FABRIC_PRESETS
} from '../packages/garment-schema/src/index';
import { HistoryManager, Command } from '../packages/editor-core/src/history';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${msg}`);
}

console.log('--- RUNNING 3D FASHION STUDIO VERIFICATION TEST SUITE ---');

// 1. Garment Schema & Initial Project Factory Test
const project = createInitialProject();
assert(project.schemaVersion === 1, 'Project schemaVersion is 1');
assert(project.garments.length === 1, 'Initial project contains 1 garment');
const activeHoodie = project.garments[0];
assert(activeHoodie.type === 'hoodie', 'Initial active garment is a hoodie');
assert(activeHoodie.parameters.bodyLength === 720, 'Default body length is 720 mm');
assert(activeHoodie.components.hood === 'double-layer', 'Default hood is double-layer');
assert(activeHoodie.components.pockets === 'kangaroo', 'Default pocket is kangaroo pouch');

// 2. Fabric Presets Validation
assert(Object.keys(FABRIC_PRESETS).length >= 6, 'Contains 6+ authentic fabric presets');
const fleece = FABRIC_PRESETS['heavy-cotton-black'];
assert(fleece.sheen > 0 && fleece.roughness > 0.5, 'PBR fabric presets have physical sheen and roughness');

// 3. Command History Undo/Redo Engine Test
const history = new HistoryManager();
let currentProj = { ...project };

// Command: Update body length from 720 to 800
const oldLength = currentProj.garments[0].parameters.bodyLength;
const newLength = 800;

const cmd: Command = {
  id: 'cmd-test-1',
  name: 'Adjust Length',
  timestamp: Date.now(),
  undo: (p) => ({
    ...p,
    garments: [{ ...p.garments[0], parameters: { ...p.garments[0].parameters, bodyLength: oldLength } }]
  }),
  redo: (p) => ({
    ...p,
    garments: [{ ...p.garments[0], parameters: { ...p.garments[0].parameters, bodyLength: newLength } }]
  })
};

currentProj = cmd.redo(currentProj);
history.push(cmd);
assert(currentProj.garments[0].parameters.bodyLength === 800, 'Parameter correctly modified to 800 mm');
assert(history.canUndo() === true, 'History allows undo');

// Undo
currentProj = history.undo(currentProj)!;
assert(currentProj.garments[0].parameters.bodyLength === 720, 'Undo restores exact previous measurement 720 mm');
assert(history.canRedo() === true, 'History allows redo');

// Redo
currentProj = history.redo(currentProj)!;
assert(currentProj.garments[0].parameters.bodyLength === 800, 'Redo restores 800 mm');

// 4. Serialization Round-trip Parity
const serialized = JSON.stringify(project);
const deserialized = JSON.parse(serialized);
assert(deserialized.projectId === project.projectId, 'Project ID preserves across JSON serialization');
assert(deserialized.garments[0].artworkLayers.length === project.garments[0].artworkLayers.length, 'Artwork layers preserve perfectly');

// 5. Alternate Garment Template (T-Shirt)
const tee = createDefaultTShirtInstance();
assert(tee.type === 'tshirt', 'T-Shirt factory generates valid t-shirt instance');
assert(tee.components.hood === 'none', 'T-Shirt has no hood');

console.log('---------------------------------------------------------');
console.log('🎉 ALL 5 TEST SUITES PASSED CLEANLY WITH ZERO ERRORS!');
