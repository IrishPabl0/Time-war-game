import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PlacedBuilding, BuildingType, Villager, AgeId } from '../types';
import { createBuildingMesh, createChibiTree, createChibiRock, createChibiVillagerMesh, PALETTE } from '../game/building3DModels';
import { BUILDING_DEFINITIONS } from '../game/constants';
import { soundFx } from '../game/audio';

interface World3DProps {
  buildings: PlacedBuilding[];
  currentAge: AgeId;
  selectedBuildingId: string | null;
  onSelectBuilding: (building: PlacedBuilding | null) => void;
  placingType: BuildingType | null;
  onPlaceBuilding: (x: number, z: number) => void;
  onCancelPlacement: () => void;
  villagers: Villager[];
}

export const World3D: React.FC<World3DProps> = ({
  buildings,
  currentAge,
  selectedBuildingId,
  onSelectBuilding,
  placingType,
  onPlaceBuilding,
  onCancelPlacement,
  villagers
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const villagerMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const selectionRingRef = useRef<THREE.Mesh | null>(null);
  const placementGhostRef = useRef<THREE.Group | null>(null);
  const smokeParticlesRef = useRef<{ mesh: THREE.Mesh; initialY: number; life: number }[]>([]);

  // Camera control state
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentCameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const zoomRef = useRef<number>(28); // Ortho frustum size
  const targetZoomRef = useRef<number>(28);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);
  const hasDraggedRef = useRef<boolean>(false);
  const mouseWorldPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const velocityRef = useRef<{ vx: number; vz: number }>({ vx: 0, vz: 0 });
  const lastMoveTimeRef = useRef<number>(0);
  const keysPressedRef = useRef<Set<string>>(new Set());

  // Keyboard navigation listener (WASD, Arrow keys, Space/H to center)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      keysPressedRef.current.add(e.code);

      if (e.code === 'Space' || e.code === 'KeyH') {
        e.preventDefault();
        soundFx.playPop();
        cameraTargetRef.current.set(0, 0, 0);
        targetZoomRef.current = 28;
      } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
        targetZoomRef.current = Math.max(12, targetZoomRef.current - 5);
      } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
        targetZoomRef.current = Math.min(46, targetZoomRef.current + 5);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Crisp, clear sky background without fog wash-out
    scene.background = new THREE.Color(0x82c8ec);

    // 2. Camera setup - Isometric Orthographic view gives crisp chibi mobile presentation
    const aspect = width / height;
    const frustum = targetZoomRef.current;
    const camera = new THREE.OrthographicCamera(
      (-frustum * aspect) / 2,
      (frustum * aspect) / 2,
      frustum / 2,
      -frustum / 2,
      0.1,
      500
    );
    // Classic 45° isometric angle
    const camDist = 60;
    camera.position.set(camDist, camDist * 1.2, camDist);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 0.95);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x86efac, 0.65);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    sunLight.position.set(40, 65, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 180;
    const d = 45;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 5. Continuous 3D Chibi World & Terrain (NO TILES / NO GRIDS)
    const worldGroup = new THREE.Group();
    worldGroup.name = 'continuous_world';
    scene.add(worldGroup);

    // Main lush rolling island / valley terrain
    const terrainGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const distFromCenter = Math.sqrt(vx * vx + vz * vz);

      // Carve natural river bed (winding through x: 14 to 22)
      const riverCenterX = 18 + Math.sin(vz * 0.08) * 4;
      const distToRiver = Math.abs(vx - riverCenterX);

      let elevation = 0;

      if (distToRiver < 5) {
        // River valley depression
        elevation = -0.9 + Math.pow(distToRiver / 5, 2) * 0.9;
      } else {
        // Natural soft hills towards periphery
        const hillNoise = Math.sin(vx * 0.06) * Math.cos(vz * 0.06) * 1.2;
        if (distFromCenter > 22) {
          const edgeRise = Math.min((distFromCenter - 22) * 0.18, 5.5);
          elevation = edgeRise + hillNoise;
        } else {
          elevation = Math.max(0, hillNoise * 0.3);
        }
      }

      pos.setY(i, elevation);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshLambertMaterial({
      color: 0x72b043, // Lush spring grass
      flatShading: false,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = true;
    terrain.name = 'ground_terrain';
    worldGroup.add(terrain);

    // Natural dirt paths (curved organic splines with pebble accents connecting town areas)
    const pathMat = new THREE.MeshLambertMaterial({ color: 0xc89f68 }); // warm dirt
    const createCurvedPath = (curvePoints: THREE.Vector3[], width: number) => {
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const points = curve.getPoints(30);
      const pathGeo = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const next = points[Math.min(i + 1, points.length - 1)];
        const dir = new THREE.Vector3().subVectors(next, p).normalize();
        const normal = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

        const halfW = width * (0.85 + Math.sin(i * 0.8) * 0.15);
        vertices.push(
          p.x + normal.x * halfW, p.y + 0.06, p.z + normal.z * halfW,
          p.x - normal.x * halfW, p.y + 0.06, p.z - normal.z * halfW
        );

        if (i < points.length - 1) {
          const baseIdx = i * 2;
          indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
          indices.push(baseIdx + 1, baseIdx + 3, baseIdx + 2);
        }
      }
      pathGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      pathGeo.setIndex(indices);
      pathGeo.computeVertexNormals();

      const pathMesh = new THREE.Mesh(pathGeo, pathMat);
      pathMesh.receiveShadow = true;
      worldGroup.add(pathMesh);
    };

    // Paths connecting central hall to houses, lumber, forager and river
    createCurvedPath([
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(-4, 0.03, -1.5),
      new THREE.Vector3(-8.5, 0.04, -3.5)
    ], 1.6);

    createCurvedPath([
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(-4, 0.03, 2.5),
      new THREE.Vector3(-8.5, 0.04, 4.5)
    ], 1.6);

    createCurvedPath([
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(4.5, 0.03, -3.0),
      new THREE.Vector3(9.0, 0.04, -6.5)
    ], 1.6);

    createCurvedPath([
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(4.0, 0.03, 3.0),
      new THREE.Vector3(8.0, 0.04, 5.5)
    ], 1.6);

    createCurvedPath([
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(-0.8, 0.03, 4.0),
      new THREE.Vector3(-1.5, 0.04, 6.5)
    ], 1.5);

    // Path leading to river bridge
    createCurvedPath([
      new THREE.Vector3(8.0, 0.03, 0),
      new THREE.Vector3(12.5, 0.02, 0),
      new THREE.Vector3(17.5, -0.1, 0),
      new THREE.Vector3(23.0, 0.03, 0)
    ], 1.8);

    // Sparkling River Water Plane with wave ripple
    const riverGeo = new THREE.PlaneGeometry(12, 90, 16, 40);
    riverGeo.rotateX(-Math.PI / 2);
    const riverMat = new THREE.MeshPhongMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.82,
      shininess: 90,
      specular: 0xffffff,
      flatShading: true,
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.set(18.5, -0.4, 0);
    river.name = 'river_water';
    worldGroup.add(river);

    // Wooden Bridge across river
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(18.5, -0.05, 0);
    const bridgePlank = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.25, 2.4),
      new THREE.MeshLambertMaterial({ color: PALETTE.woodPlank })
    );
    bridgePlank.castShadow = true;
    bridgePlank.receiveShadow = true;
    bridgeGroup.add(bridgePlank);

    // Bridge railings
    [-1.05, 1.05].forEach((rz) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(7.5, 0.15, 0.12),
        new THREE.MeshLambertMaterial({ color: PALETTE.woodDark })
      );
      rail.position.set(0, 0.5, rz);
      bridgeGroup.add(rail);

      for (let rx = -3.2; rx <= 3.2; rx += 1.6) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.6, 5),
          new THREE.MeshLambertMaterial({ color: PALETTE.woodDark })
        );
        post.position.set(rx, 0.25, rz);
        bridgeGroup.add(post);
      }
    });
    worldGroup.add(bridgeGroup);

    // Natural Scatter: Stylized Trees in organic groves
    const treePositions = [
      [-16, -14, 0], [-13, -17, 1], [-19, -10, 2], [-14, -8, 3],
      [-18, 12, 0], [-15, 16, 1], [-20, 18, 2], [-12, 14, 4],
      [14, -18, 1], [18, -22, 2], [23, -16, 0], [25, -12, 3],
      [14, 18, 0], [19, 21, 1], [24, 16, 2], [26, 12, 4],
      [-5, -16, 1], [-2, -19, 0], [4, -18, 2],
      [-4, 16, 0], [2, 18, 1], [5, 15, 2],
      [-12, 0, 4], [10, -12, 0], [11, 12, 1]
    ];
    treePositions.forEach(([tx, tz, variant]) => {
      const tree = createChibiTree(variant);
      tree.position.set(tx, 0, tz);
      tree.rotation.y = Math.random() * Math.PI * 2;
      const s = 0.85 + Math.random() * 0.35;
      tree.scale.set(s, s, s);
      worldGroup.add(tree);
    });

    // Natural Scatter: Chibi Rocks & Boulders
    const rockPositions = [
      [-15, -4, 1.3], [-14, 8, 1.1], [12, -7, 0.9],
      [15, 6, 1.2], [14, -2, 0.8], [21, -2, 1.0],
      [-2, 11, 1.4], [10, 16, 1.0], [-10, 18, 1.3]
    ];
    rockPositions.forEach(([rx, rz, rScale]) => {
      const rock = createChibiRock(rScale);
      rock.position.set(rx, 0.2, rz);
      rock.rotation.y = Math.random() * Math.PI * 2;
      worldGroup.add(rock);
    });

    // Wildflower patches
    const flowerGeo = new THREE.SphereGeometry(0.12, 5, 5);
    const flowerColors = [0xffd166, 0xef476f, 0xffffff, 0x06d6a0];
    for (let f = 0; f < 35; f++) {
      const fx = (Math.random() - 0.5) * 32;
      const fz = (Math.random() - 0.5) * 32;
      if (Math.abs(fx) < 3 && Math.abs(fz) < 3) continue;
      const fMat = new THREE.MeshLambertMaterial({
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
      });
      const fl = new THREE.Mesh(flowerGeo, fMat);
      fl.position.set(fx, 0.12, fz);
      worldGroup.add(fl);
    }

    // 6. Selection Ring Mesh (Pulsing glowing ring on ground when tapped)
    const ringGeo = new THREE.RingGeometry(2.6, 3.0, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const selectionRing = new THREE.Mesh(ringGeo, ringMat);
    selectionRing.position.set(0, 0.08, 0);
    selectionRing.visible = false;
    scene.add(selectionRing);
    selectionRingRef.current = selectionRing;

    // 7. Chimney Smoke Particle System
    const smokeGeo = new THREE.SphereGeometry(0.25, 6, 6);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.6
    });
    for (let i = 0; i < 18; i++) {
      const p = new THREE.Mesh(smokeGeo, smokeMat);
      p.visible = false;
      scene.add(p);
      smokeParticlesRef.current.push({
        mesh: p,
        initialY: 0,
        life: Math.random()
      });
    }

    // 8. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Keyboard panning (WASD / Arrows)
      let kdx = 0;
      let kdy = 0;
      const keys = keysPressedRef.current;
      if (keys.has('KeyW') || keys.has('ArrowUp')) kdy -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) kdy += 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) kdx -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) kdx += 1;

      if (kdx !== 0 || kdy !== 0) {
        const norm = Math.hypot(kdx, kdy);
        const speed = (zoomRef.current / 28) * 0.48;
        const ndx = kdx / norm;
        const ndy = kdy / norm;
        const cos45 = 0.70710678;
        const pitchRatio = 1.0928;
        const kwx = (ndx * cos45 + ndy * pitchRatio) * speed;
        const kwz = (-ndx * cos45 + ndy * pitchRatio) * speed;
        cameraTargetRef.current.x += kwx;
        cameraTargetRef.current.z += kwz;
        cameraTargetRef.current.x = Math.max(-36, Math.min(36, cameraTargetRef.current.x));
        cameraTargetRef.current.z = Math.max(-36, Math.min(36, cameraTargetRef.current.z));
      }

      // Smooth inertia momentum when not dragging
      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current.vx) > 0.0005 || Math.abs(velocityRef.current.vz) > 0.0005) {
          cameraTargetRef.current.x += velocityRef.current.vx;
          cameraTargetRef.current.z += velocityRef.current.vz;
          velocityRef.current.vx *= 0.91; // Smooth friction decay
          velocityRef.current.vz *= 0.91;
          cameraTargetRef.current.x = Math.max(-36, Math.min(36, cameraTargetRef.current.x));
          cameraTargetRef.current.z = Math.max(-36, Math.min(36, cameraTargetRef.current.z));
        }
      }

      // Camera smooth interpolation - zero lag during active drag, silky smooth when released
      const followRate = isDraggingRef.current ? 0.38 : 0.15;
      currentCameraTargetRef.current.lerp(cameraTargetRef.current, followRate);
      const target = currentCameraTargetRef.current;
      const dist = 60;
      camera.position.set(target.x + dist, target.y + dist * 1.2, target.z + dist);
      camera.lookAt(target.x, target.y, target.z);

      // Smooth zoom lerp
      if (Math.abs(zoomRef.current - targetZoomRef.current) > 0.05) {
        zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.12;
        const currentAspect = container.clientWidth / container.clientHeight;
        const f = zoomRef.current;
        camera.left = (-f * currentAspect) / 2;
        camera.right = (f * currentAspect) / 2;
        camera.top = f / 2;
        camera.bottom = -f / 2;
        camera.updateProjectionMatrix();
      }

      // River water shimmer
      river.position.y = -0.4 + Math.sin(elapsed * 1.8) * 0.04;

      // Selection ring pulse animation
      if (selectionRing.visible) {
        const s = 1.0 + Math.sin(elapsed * 5.0) * 0.06;
        selectionRing.scale.set(s, s, s);
      }

      // Fire flame flicker animation in campfires
      scene.traverse((obj) => {
        if (obj.name === 'fire_flames') {
          obj.scale.y = 0.85 + Math.sin(elapsed * 12.0) * 0.25;
          obj.rotation.y = elapsed * 3.0;
        }
        if (obj.name === 'fire_light' && obj instanceof THREE.PointLight) {
          obj.intensity = 2.2 + Math.sin(elapsed * 15.0) * 0.6;
        }
      });

      // Animated smoke puffs from town hall and huts
      let smokeIdx = 0;
      buildingMeshesRef.current.forEach((group, bldId) => {
        if (group.userData.buildingType === 'town_hall' || group.userData.buildingType === 'house') {
          for (let k = 0; k < 3; k++) {
            if (smokeIdx < smokeParticlesRef.current.length) {
              const pData = smokeParticlesRef.current[smokeIdx];
              pData.life = (pData.life + delta * 0.4) % 1.0;
              pData.mesh.visible = true;

              const chimneyBaseY = group.userData.buildingType === 'town_hall' ? 4.2 : 2.6;
              const chimneyX = group.position.x + (group.userData.buildingType === 'town_hall' ? 1.2 : 0);
              const chimneyZ = group.position.z + (group.userData.buildingType === 'town_hall' ? 0.5 : 0);

              const drift = pData.life * 2.5;
              pData.mesh.position.set(
                chimneyX + Math.sin(pData.life * 6) * 0.3 + drift * 0.4,
                chimneyBaseY + drift,
                chimneyZ + Math.cos(pData.life * 6) * 0.3 - drift * 0.2
              );
              const scale = 0.5 + pData.life * 1.2;
              pData.mesh.scale.set(scale, scale, scale);
              (pData.mesh.material as THREE.MeshBasicMaterial).opacity = (1.0 - pData.life) * 0.5;

              smokeIdx++;
            }
          }
        }
      });

      // Villagers walking & bobbing animation
      villagerMeshesRef.current.forEach((vMesh) => {
        // sinusoidal walking bob
        const walkCycle = Math.sin(elapsed * 10);
        vMesh.position.y = Math.abs(walkCycle) * 0.15;

        // swing little feet
        const footL = vMesh.getObjectByName('foot_l');
        const footR = vMesh.getObjectByName('foot_r');
        if (footL && footR) {
          footL.rotation.x = walkCycle * 0.5;
          footR.rotation.x = -walkCycle * 0.5;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const asp = w / h;
      const f = zoomRef.current;
      camera.left = (-f * asp) / 2;
      camera.right = (f * asp) / 2;
      camera.top = f / 2;
      camera.bottom = -f / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Building Meshes in the 3D scene whenever buildings state changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const existingIds = new Set(buildingMeshesRef.current.keys());
    const newIds = new Set(buildings.map(b => b.id));

    // Remove deleted buildings
    existingIds.forEach(id => {
      if (!newIds.has(id)) {
        const mesh = buildingMeshesRef.current.get(id);
        if (mesh) {
          scene.remove(mesh);
          buildingMeshesRef.current.delete(id);
        }
      }
    });

    // Add or update buildings
    buildings.forEach(bld => {
      let group = buildingMeshesRef.current.get(bld.id);
      if (!group) {
        group = createBuildingMesh(bld.type, bld.level, bld.age);
        group.position.set(bld.x, 0, bld.z);
        group.rotation.y = bld.rotation;
        group.userData = {
          buildingId: bld.id,
          buildingType: bld.type,
          level: bld.level
        };

        // Make all child meshes interactable
        group.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.userData = { buildingId: bld.id, buildingType: bld.type };
          }
        });

        // Entrance landing bounce
        group.scale.set(0.01, 0.01, 0.01);
        scene.add(group);
        buildingMeshesRef.current.set(bld.id, group);

        // Pop in animation
        let prog = 0;
        const popIn = () => {
          prog += 0.1;
          const s = Math.min(1.0, prog + Math.sin(prog * Math.PI) * 0.2);
          group!.scale.set(s, s, s);
          if (prog < 1.0) requestAnimationFrame(popIn);
          else group!.scale.set(1, 1, 1);
        };
        popIn();
      } else {
        group.position.set(bld.x, 0, bld.z);
        group.rotation.y = bld.rotation;
        // If level changed, recreate mesh for visual upgrades
        if (group.userData.level !== bld.level) {
          scene.remove(group);
          const newGroup = createBuildingMesh(bld.type, bld.level, bld.age);
          newGroup.position.set(bld.x, 0, bld.z);
          newGroup.rotation.y = bld.rotation;
          newGroup.userData = { buildingId: bld.id, buildingType: bld.type, level: bld.level };
          newGroup.traverse(child => {
            if (child instanceof THREE.Mesh) {
              child.userData = { buildingId: bld.id, buildingType: bld.type };
            }
          });
          scene.add(newGroup);
          buildingMeshesRef.current.set(bld.id, newGroup);
        }
      }
    });
  }, [buildings, currentAge]);

  // Update selection ring position when selectedBuildingId changes
  useEffect(() => {
    if (!selectionRingRef.current) return;
    const ring = selectionRingRef.current;

    if (selectedBuildingId) {
      const bld = buildings.find(b => b.id === selectedBuildingId);
      if (bld) {
        const def = BUILDING_DEFINITIONS[bld.type];
        const r = Math.max(def.size.width, def.size.depth) * 0.55;
        ring.scale.set(r / 2.8, r / 2.8, r / 2.8);
        ring.position.set(bld.x, 0.08, bld.z);
        ring.visible = true;

        // Gentle bounce on selection
        const group = buildingMeshesRef.current.get(bld.id);
        if (group) {
          let t = 0;
          const bounce = () => {
            t += 0.15;
            const y = Math.sin(t) * 0.4;
            group.position.y = Math.max(0, y);
            if (t < Math.PI) requestAnimationFrame(bounce);
            else group.position.y = 0;
          };
          bounce();
        }
        return;
      }
    }
    ring.visible = false;
  }, [selectedBuildingId, buildings]);

  // Update Villager Meshes & Paths
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    villagers.forEach(v => {
      let mesh = villagerMeshesRef.current.get(v.id);
      if (!mesh) {
        const tunicColor = v.job === 'woodcutter' ? 0x16a34a :
                           v.job === 'forager' ? 0xe11d48 :
                           v.job === 'stonemason' ? 0x64748b :
                           v.job === 'guard' ? 0xd97706 : 0x3b82f6;
        mesh = createChibiVillagerMesh(tunicColor);
        mesh.position.set(v.x, 0, v.z);
        scene.add(mesh);
        villagerMeshesRef.current.set(v.id, mesh);
      }

      // Smoothly walk towards target
      const dx = v.targetX - v.x;
      const dz = v.targetZ - v.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 0.1) {
        const angle = Math.atan2(dx, dz);
        mesh.rotation.y = angle;
      }
      mesh.position.set(v.x, mesh.position.y, v.z);
    });
  }, [villagers]);

  // Ghost placement mesh for placing new buildings
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (placingType) {
      if (!placementGhostRef.current || placementGhostRef.current.userData.type !== placingType) {
        if (placementGhostRef.current) scene.remove(placementGhostRef.current);
        const ghost = createBuildingMesh(placingType, 1, currentAge);
        ghost.userData = { type: placingType, isGhost: true };
        // Semi-transparent green tint
        ghost.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshLambertMaterial({
              color: 0x4ade80,
              transparent: true,
              opacity: 0.75
            });
          }
        });
        scene.add(ghost);
        placementGhostRef.current = ghost;
      }
    } else {
      if (placementGhostRef.current) {
        scene.remove(placementGhostRef.current);
        placementGhostRef.current = null;
      }
    }
  }, [placingType, currentAge]);

  // Pointer & Touch Events: Direct 1:1 Isometric Drag, Pinch Zoom, Tap to Inspect/Place
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { vx: 0, vz: 0 };
    lastMoveTimeRef.current = performance.now();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Raycast to ground plane for mouse position in 3D world
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPt = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, intersectPt)) {
      mouseWorldPosRef.current.copy(intersectPt);
      // Update placement ghost position
      if (placementGhostRef.current) {
        placementGhostRef.current.position.set(intersectPt.x, 0, intersectPt.z);
      }
    }

    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.hypot(dx, dy) > 6) {
      hasDraggedRef.current = true;
    }

    // Direct 1:1 ground-to-screen projection:
    // Moving cursor right pulls ground right (camera moves screen-left)
    // Moving cursor down pulls ground down (camera moves screen-up)
    const scale = zoomRef.current / container.clientHeight;
    const cos45 = 0.70710678;
    const pitchRatio = 1.0928;
    const wx = (dx * cos45 + dy * pitchRatio) * scale;
    const wz = (-dx * cos45 + dy * pitchRatio) * scale;

    cameraTargetRef.current.x -= wx;
    cameraTargetRef.current.z -= wz;

    // Clamp camera within world bounds
    cameraTargetRef.current.x = Math.max(-36, Math.min(36, cameraTargetRef.current.x));
    cameraTargetRef.current.z = Math.max(-36, Math.min(36, cameraTargetRef.current.z));

    // Calculate instantaneous velocity for release momentum flick
    const now = performance.now();
    const dt = Math.max(1, now - lastMoveTimeRef.current);
    lastMoveTimeRef.current = now;
    const factor = Math.min(2.5, 16 / dt);
    velocityRef.current.vx = velocityRef.current.vx * 0.3 + (-wx * factor) * 0.7;
    velocityRef.current.vz = velocityRef.current.vz * 0.3 + (-wz * factor) * 0.7;

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;

    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch {
      // safe fallback
    }

    // If it was a clean tap (not dragged), perform raycasting
    if (!hasDraggedRef.current && containerRef.current && cameraRef.current && sceneRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      // If placing a new building, confirm placement
      if (placingType) {
        const pt = mouseWorldPosRef.current;
        soundFx.playBuild();
        onPlaceBuilding(pt.x, pt.z);
        return;
      }

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      // Collect all interactive building objects
      const candidates: THREE.Object3D[] = [];
      buildingMeshesRef.current.forEach(group => {
        group.traverse(child => {
          if (child instanceof THREE.Mesh) {
            candidates.push(child);
          }
        });
      });

      const intersects = raycaster.intersectObjects(candidates, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const bldId = hit.userData?.buildingId;
        if (bldId) {
          const matched = buildings.find(b => b.id === bldId);
          if (matched) {
            soundFx.playPop();
            onSelectBuilding(matched);
            return;
          }
        }
      }

      // If tapped empty ground, deselect
      onSelectBuilding(null);
    }
  };

  // Smooth Zoom via Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.035;
    targetZoomRef.current = Math.max(12, Math.min(46, targetZoomRef.current + zoomDelta));
  };

  // Touch Pinch-to-Zoom
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (touchDistanceRef.current !== null) {
        const delta = touchDistanceRef.current - dist;
        targetZoomRef.current = Math.max(12, Math.min(46, targetZoomRef.current + delta * 0.08));
      }
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
  };

  // Reset / Center camera function
  const handleResetCamera = () => {
    soundFx.playPop();
    cameraTargetRef.current.set(0, 0, 0);
    targetZoomRef.current = 28;
    velocityRef.current = { vx: 0, vz: 0 };
  };

  // Directional Nudge buttons
  const handleNudge = (dx: number, dy: number) => {
    soundFx.playPop();
    const speed = (zoomRef.current / 28) * 6.5;
    const cos45 = 0.70710678;
    const pitchRatio = 1.0928;
    const kwx = (dx * cos45 + dy * pitchRatio) * 0.45 * speed;
    const kwz = (-dx * cos45 + dy * pitchRatio) * 0.45 * speed;
    cameraTargetRef.current.x += kwx;
    cameraTargetRef.current.z += kwz;
    cameraTargetRef.current.x = Math.max(-36, Math.min(36, cameraTargetRef.current.x));
    cameraTargetRef.current.z = Math.max(-36, Math.min(36, cameraTargetRef.current.z));
  };

  return (
    <div
      ref={containerRef}
      id="world-3d-canvas-container"
      className="relative w-full h-full overflow-hidden bg-slate-900 cursor-grab active:cursor-grabbing touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Placement Mode Prompt Banner */}
      {placingType && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-700/90 text-white backdrop-blur-md shadow-xl border border-emerald-400/40 text-sm font-semibold animate-pulse">
          <span>Tap anywhere on the ground to place {BUILDING_DEFINITIONS[placingType].name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancelPlacement();
            }}
            className="px-2.5 py-1 bg-black/40 hover:bg-black/60 rounded-full text-xs font-bold text-emerald-200"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Floating Camera Navigation & Zoom Controls */}
      <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        {/* Directional D-Pad Nudge Controls */}
        <div className="flex flex-col items-center bg-slate-900/85 p-1.5 rounded-2xl shadow-xl border border-slate-700/70 backdrop-blur-md">
          <button
            id="btn-pan-up"
            onClick={() => handleNudge(0, -1)}
            title="Pan Up (W / Up Arrow)"
            className="w-8 h-8 rounded-lg hover:bg-slate-700/70 text-slate-200 flex items-center justify-center active:scale-95 transition-all text-xs font-bold"
          >
            ▲
          </button>
          <div className="flex gap-1.5">
            <button
              id="btn-pan-left"
              onClick={() => handleNudge(-1, 0)}
              title="Pan Left (A / Left Arrow)"
              className="w-8 h-8 rounded-lg hover:bg-slate-700/70 text-slate-200 flex items-center justify-center active:scale-95 transition-all text-xs font-bold"
            >
              ◀
            </button>
            <button
              id="btn-recenter-camera"
              onClick={handleResetCamera}
              title="Center on Town Hall (Space)"
              className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center active:scale-95 transition-all text-xs font-bold"
            >
              📍
            </button>
            <button
              id="btn-pan-right"
              onClick={() => handleNudge(1, 0)}
              title="Pan Right (D / Right Arrow)"
              className="w-8 h-8 rounded-lg hover:bg-slate-700/70 text-slate-200 flex items-center justify-center active:scale-95 transition-all text-xs font-bold"
            >
              ▶
            </button>
          </div>
          <button
            id="btn-pan-down"
            onClick={() => handleNudge(0, 1)}
            title="Pan Down (S / Down Arrow)"
            className="w-8 h-8 rounded-lg hover:bg-slate-700/70 text-slate-200 flex items-center justify-center active:scale-95 transition-all text-xs font-bold"
          >
            ▼
          </button>
        </div>

        {/* Zoom In & Out */}
        <div className="flex flex-col gap-1 bg-slate-900/85 p-1 rounded-xl shadow-xl border border-slate-700/70 backdrop-blur-md">
          <button
            id="btn-zoom-in"
            onClick={() => {
              soundFx.playPop();
              targetZoomRef.current = Math.max(12, targetZoomRef.current - 5);
            }}
            title="Zoom In (+)"
            className="w-9 h-9 rounded-lg hover:bg-slate-700/70 text-white flex items-center justify-center active:scale-95 transition-all text-lg font-bold"
          >
            +
          </button>
          <button
            id="btn-zoom-out"
            onClick={() => {
              soundFx.playPop();
              targetZoomRef.current = Math.min(46, targetZoomRef.current + 5);
            }}
            title="Zoom Out (−)"
            className="w-9 h-9 rounded-lg hover:bg-slate-700/70 text-white flex items-center justify-center active:scale-95 transition-all text-lg font-bold"
          >
            −
          </button>
        </div>
      </div>

      {/* Control navigation hint */}
      <div className="absolute bottom-2 left-4 z-10 text-[11px] text-slate-400/80 pointer-events-none font-medium bg-slate-900/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-700/30 hidden sm:block">
        Drag to pan • WASD / Arrow Keys • Scroll to zoom • Space to center
      </div>
    </div>
  );
};
