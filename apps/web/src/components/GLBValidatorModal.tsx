import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { X, CheckCircle, AlertTriangle, Upload, Box } from 'lucide-react';

interface GLBValidatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GLBValidatorModal: React.FC<GLBValidatorModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<{
    valid: boolean;
    meshCount: number;
    materialCount: number;
    textureCount: number;
    triangleCount: number;
    fileSizeKb: number;
    nodes: string[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!isOpen || !canvasMountRef.current) return;

    const mount = canvasMountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#181920');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 50);
    camera.position.set(0, 0.2, 1.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(2, 3, 2);
    scene.add(dir);

    let animId: number;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [isOpen]);

  const handleFile = async (file: File) => {
    setLoading(true);
    setErrorMsg(null);
    setReport(null);

    const loader = new GLTFLoader();
    const arrayBuffer = await file.arrayBuffer();

    loader.parse(
      arrayBuffer,
      '',
      (gltf) => {
        setLoading(false);
        const scene = sceneRef.current;
        if (scene) {
          // Clear previous model
          const toRemove: THREE.Object3D[] = [];
          scene.traverse((obj) => {
            if (obj.name.startsWith('ImportedModel')) toRemove.push(obj);
          });
          toRemove.forEach((obj) => scene.remove(obj));

          gltf.scene.name = 'ImportedModel';
          scene.add(gltf.scene);

          // Center model in view
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const center = box.getCenter(new THREE.Vector3());
          gltf.scene.position.sub(center);
        }

        // Analyze GLTF structures
        let meshes = 0;
        let triangles = 0;
        const materials = new Set<string>();
        const textures = new Set<string>();
        const nodeNames: string[] = [];

        gltf.scene.traverse((child) => {
          if (child.name) nodeNames.push(child.name);
          if ((child as THREE.Mesh).isMesh) {
            meshes++;
            const mesh = child as THREE.Mesh;
            const geom = mesh.geometry;
            if (geom.index) {
              triangles += geom.index.count / 3;
            } else if (geom.attributes.position) {
              triangles += geom.attributes.position.count / 3;
            }

            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((m) => {
                materials.add(m.uuid);
                if ((m as any).map) textures.add((m as any).map.uuid);
                if ((m as any).normalMap) textures.add((m as any).normalMap.uuid);
              });
            }
          }
        });

        setReport({
          valid: true,
          meshCount: meshes,
          materialCount: materials.size,
          textureCount: textures.size,
          triangleCount: Math.round(triangles),
          fileSizeKb: Math.round(file.size / 1024),
          nodes: nodeNames
        });
      },
      (err) => {
        setLoading(false);
        setErrorMsg('GLTF parsing failed: ' + (err.message || 'Corrupt GLB file'));
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[var(--bg-panel)] text-[var(--text-primary)] w-full max-w-3xl rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Modal Header */}
        <div className="h-12 border-b border-[var(--border)] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-semibold">Independent GLB / glTF 2.0 Validator</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[var(--text-secondary)] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Left: 3D Preview Canvas */}
          <div className="flex-1 flex flex-col">
            <div
              ref={canvasMountRef}
              className="flex-1 rounded-xl border border-[var(--border)] overflow-hidden min-h-[320px] relative bg-zinc-950"
            />
            <div className="mt-2 text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                accept=".glb,.gltf"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white text-xs font-medium shadow inline-flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Exported GLB to Validate
              </button>
            </div>
          </div>

          {/* Right: Inspection Report */}
          <div className="w-72 bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-xs flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                Validation Analysis
              </div>

              {loading && <div className="text-xs text-[var(--accent)] animate-pulse">Parsing 3D binary...</div>}

              {errorMsg && (
                <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {report && (
                <div className="space-y-2.5 font-mono">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-sans font-semibold mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Valid glTF 2.0 Binary</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-1">
                    <span className="text-[var(--text-secondary)]">File Size</span>
                    <span>{report.fileSizeKb} KB</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-1">
                    <span className="text-[var(--text-secondary)]">Mesh Nodes</span>
                    <span>{report.meshCount}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-1">
                    <span className="text-[var(--text-secondary)]">Materials</span>
                    <span>{report.materialCount}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-1">
                    <span className="text-[var(--text-secondary)]">Baked Textures</span>
                    <span>{report.textureCount}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-1">
                    <span className="text-[var(--text-secondary)]">Triangles</span>
                    <span>{report.triangleCount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {!loading && !report && !errorMsg && (
                <div className="text-center text-[var(--text-secondary)] py-8 italic">
                  Select an exported `.glb` file to independently verify mesh hierarchy, materials, and embedded textures.
                </div>
              )}
            </div>

            <div className="text-[10px] text-[var(--text-secondary)] border-t border-[var(--border)] pt-2">
              Verified by Three.js GLTFLoader engine.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
