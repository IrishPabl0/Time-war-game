import * as THREE from 'three';
import { BuildingType, AgeId } from '../types';

// Palette for Stone & Early Ages (warm, vibrant, stylized chibi)
export const PALETTE = {
  woodDark: 0x5c3a21,
  woodLight: 0x9c6644,
  woodPlank: 0xc49a6c,
  thatch: 0xd4a373,
  thatchHighlight: 0xfaedcd,
  stoneDark: 0x4a5568,
  stoneLight: 0x718096,
  stoneWarm: 0x8d99ae,
  leafGreen: 0x38b000,
  leafDark: 0x007200,
  leafLight: 0x70e000,
  dirt: 0x8b5e34,
  clothRed: 0xd90429,
  clothBlue: 0x0077b6,
  clothWhite: 0xf8f9fa,
  bone: 0xedf2f4,
  fireOrange: 0xff6b35,
  fireYellow: 0xffd166,
  gold: 0xf4a261,
  metal: 0x495057,
};

/**
 * Creates a unique stylized 3D chibi model group for a building
 */
export function createBuildingMesh(
  type: BuildingType,
  level: number = 1,
  age: AgeId = 'stone'
): THREE.Group {
  const group = new THREE.Group();
  group.name = `building_${type}`;

  const matWoodDark = new THREE.MeshLambertMaterial({ color: PALETTE.woodDark });
  const matWoodLight = new THREE.MeshLambertMaterial({ color: PALETTE.woodLight });
  const matWoodPlank = new THREE.MeshLambertMaterial({ color: PALETTE.woodPlank });
  const matThatch = new THREE.MeshLambertMaterial({ color: PALETTE.thatch });
  const matThatchHigh = new THREE.MeshLambertMaterial({ color: PALETTE.thatchHighlight });
  const matStone = new THREE.MeshLambertMaterial({ color: PALETTE.stoneLight });
  const matStoneDark = new THREE.MeshLambertMaterial({ color: PALETTE.stoneDark });
  const matClothRed = new THREE.MeshLambertMaterial({ color: PALETTE.clothRed });
  const matClothBlue = new THREE.MeshLambertMaterial({ color: PALETTE.clothBlue });
  const matBone = new THREE.MeshLambertMaterial({ color: PALETTE.bone });
  const matFire = new THREE.MeshBasicMaterial({ color: PALETTE.fireOrange });
  const matFireYellow = new THREE.MeshBasicMaterial({ color: PALETTE.fireYellow });

  switch (type) {
    case 'town_hall': {
      // Base stone platform
      const baseGeo = new THREE.CylinderGeometry(2.7, 2.9, 0.4, 16);
      const baseMesh = new THREE.Mesh(baseGeo, matStone);
      baseMesh.position.y = 0.2;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Main tribal timber circular structure
      const wallGeo = new THREE.CylinderGeometry(2.2, 2.4, 1.8, 12);
      const wallMesh = new THREE.Mesh(wallGeo, matWoodLight);
      wallMesh.position.y = 1.2;
      wallMesh.castShadow = true;
      group.add(wallMesh);

      // Chunky wooden support pillars around edge
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const pillarGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.2, 6);
        const pillar = new THREE.Mesh(pillarGeo, matWoodDark);
        pillar.position.set(Math.cos(angle) * 2.3, 1.2, Math.sin(angle) * 2.3);
        pillar.castShadow = true;
        group.add(pillar);
      }

      // Grand Conical Thatch Roof with stylized overhang
      const roofGeo = new THREE.ConeGeometry(3.1, 2.2, 12);
      const roofMesh = new THREE.Mesh(roofGeo, matThatch);
      roofMesh.position.y = 3.0;
      roofMesh.castShadow = true;
      group.add(roofMesh);

      // Second tier roof dome for majestic chieftain height
      const topRoofGeo = new THREE.ConeGeometry(1.6, 1.2, 10);
      const topRoof = new THREE.Mesh(topRoofGeo, matThatchHigh);
      topRoof.position.y = 4.2;
      topRoof.castShadow = true;
      group.add(topRoof);

      // Crossed wooden poles poking out the peak
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 5);
      const pole1 = new THREE.Mesh(poleGeo, matWoodDark);
      pole1.position.y = 4.7;
      pole1.rotation.z = 0.25;
      const pole2 = new THREE.Mesh(poleGeo, matWoodDark);
      pole2.position.y = 4.7;
      pole2.rotation.z = -0.25;
      group.add(pole1, pole2);

      // Tribal Arch / Mammoth Tusks at entrance
      const tuskGeo = new THREE.TorusGeometry(0.9, 0.12, 6, 12, Math.PI * 0.7);
      const tuskL = new THREE.Mesh(tuskGeo, matBone);
      tuskL.position.set(-0.8, 1.2, 2.2);
      tuskL.rotation.set(0, Math.PI / 2, 0.5);
      const tuskR = new THREE.Mesh(tuskGeo, matBone);
      tuskR.position.set(0.8, 1.2, 2.2);
      tuskR.rotation.set(0, -Math.PI / 2, -0.5);
      group.add(tuskL, tuskR);

      // Entrance opening
      const doorGeo = new THREE.BoxGeometry(1.1, 1.3, 0.4);
      const doorMesh = new THREE.Mesh(doorGeo, matWoodDark);
      doorMesh.position.set(0, 0.9, 2.15);
      group.add(doorMesh);

      // Tribal banner with feathers
      const bannerGeo = new THREE.BoxGeometry(0.8, 1.2, 0.05);
      const banner = new THREE.Mesh(bannerGeo, matClothRed);
      banner.position.set(0, 2.4, 2.2);
      group.add(banner);

      // Little stone chimney with smoke
      const chimGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.2, 6);
      const chim = new THREE.Mesh(chimGeo, matStoneDark);
      chim.position.set(1.2, 3.8, 0.5);
      group.add(chim);
      break;
    }

    case 'house': {
      // Cozy round Stone Age thatch hut
      const baseGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.2, 10);
      const base = new THREE.Mesh(baseGeo, matStone);
      base.position.y = 0.1;
      base.receiveShadow = true;
      group.add(base);

      // Walls
      const wallGeo = new THREE.CylinderGeometry(1.3, 1.4, 1.2, 10);
      const walls = new THREE.Mesh(wallGeo, matWoodLight);
      walls.position.y = 0.8;
      walls.castShadow = true;
      group.add(walls);

      // Chunky round thatch roof
      const roofGeo = new THREE.ConeGeometry(1.9, 1.6, 10);
      const roof = new THREE.Mesh(roofGeo, matThatch);
      roof.position.y = 2.0;
      roof.castShadow = true;
      group.add(roof);

      // Little roof tip cap
      const capGeo = new THREE.SphereGeometry(0.3, 6, 6);
      const cap = new THREE.Mesh(capGeo, matThatchHigh);
      cap.position.y = 2.8;
      group.add(cap);

      // Cute wooden arched door
      const doorGeo = new THREE.BoxGeometry(0.65, 0.85, 0.2);
      const door = new THREE.Mesh(doorGeo, matWoodDark);
      door.position.set(0, 0.6, 1.32);
      group.add(door);

      // Little firewood stack beside house
      for (let i = 0; i < 3; i++) {
        const logGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6);
        const log = new THREE.Mesh(logGeo, matWoodDark);
        log.rotation.z = Math.PI / 2;
        log.position.set(1.4, 0.1 + i * 0.12, 0.8 - (i % 2) * 0.1);
        group.add(log);
      }
      break;
    }

    case 'lumber_camp': {
      // Open timber shed with wood stacks and chopping stump
      // Dirt ground patch
      const dirtGeo = new THREE.CylinderGeometry(2.1, 2.3, 0.15, 12);
      const dirt = new THREE.Mesh(dirtGeo, new THREE.MeshLambertMaterial({ color: PALETTE.dirt }));
      dirt.position.y = 0.08;
      dirt.receiveShadow = true;
      group.add(dirt);

      // 4 wooden stilt corner pillars
      const postPositions = [
        [-1.3, -1.0], [1.3, -1.0],
        [-1.3, 1.0], [1.3, 1.0]
      ];
      postPositions.forEach(([px, pz]) => {
        const postGeo = new THREE.CylinderGeometry(0.14, 0.16, 2.1, 6);
        const post = new THREE.Mesh(postGeo, matWoodDark);
        post.position.set(px, 1.05, pz);
        post.castShadow = true;
        group.add(post);
      });

      // Lean-to slanted thatch roof
      const roofGeo = new THREE.BoxGeometry(3.1, 0.25, 2.5);
      const roof = new THREE.Mesh(roofGeo, matThatch);
      roof.position.set(0, 2.2, 0);
      roof.rotation.x = -0.15;
      roof.castShadow = true;
      group.add(roof);

      // Stack of cut timber logs
      const logPlacements = [
        [-0.5, 0.3, 0.2, 0],
        [0.2, 0.3, 0.2, 0],
        [-0.15, 0.6, 0.2, 0],
        [-0.7, 0.3, -0.4, Math.PI / 16],
        [0.0, 0.3, -0.4, -Math.PI / 16],
      ];
      logPlacements.forEach(([lx, ly, lz, rot]) => {
        const logGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.4, 8);
        const logMesh = new THREE.Mesh(logGeo, matWoodLight);
        logMesh.rotation.z = Math.PI / 2 + rot;
        logMesh.position.set(lx, ly, lz);
        logMesh.castShadow = true;
        group.add(logMesh);
      });

      // Chopping block stump with axe
      const stumpGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.6, 8);
      const stump = new THREE.Mesh(stumpGeo, matWoodDark);
      stump.position.set(1.0, 0.35, 0.2);
      stump.castShadow = true;
      group.add(stump);

      // Flint axe embedded in stump
      const axeHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.7, 5),
        matWoodPlank
      );
      axeHandle.position.set(1.0, 0.85, 0.2);
      axeHandle.rotation.z = 0.4;
      const axeBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.15, 0.08),
        matStoneDark
      );
      axeBlade.position.set(0.9, 0.85, 0.2);
      group.add(axeHandle, axeBlade);
      break;
    }

    case 'forager_hut': {
      // Raised stilt hut with berry drying racks, grain sacks
      const stiltPositions = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      stiltPositions.forEach(([sx, sz]) => {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.4, 6), matWoodDark);
        stilt.position.set(sx, 0.7, sz);
        group.add(stilt);
      });

      // Wooden deck
      const deck = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 2.6), matWoodPlank);
      deck.position.y = 1.3;
      deck.castShadow = true;
      group.add(deck);

      // Woven storehut
      const hut = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 1.2, 8), matWoodLight);
      hut.position.set(-0.2, 1.9, -0.2);
      group.add(hut);

      // Conical thatch roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.3, 8), matThatch);
      roof.position.set(-0.2, 2.9, -0.2);
      roof.castShadow = true;
      group.add(roof);

      // Berry crates & sacks on the deck
      const sackGeo = new THREE.SphereGeometry(0.28, 8, 8);
      const sack1 = new THREE.Mesh(sackGeo, new THREE.MeshLambertMaterial({ color: 0xdeb887 }));
      sack1.scale.set(1, 1.3, 1);
      sack1.position.set(0.7, 1.6, 0.6);
      const sack2 = new THREE.Mesh(sackGeo, new THREE.MeshLambertMaterial({ color: 0xd2b48c }));
      sack2.scale.set(0.9, 1.2, 0.9);
      sack2.position.set(0.5, 1.55, 0.9);
      group.add(sack1, sack2);

      // Berry bowl / basket with bright berries
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.25, 8), matWoodLight);
      basket.position.set(0.8, 1.5, -0.5);
      const berries = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), matClothRed);
      berries.position.set(0.8, 1.65, -0.5);
      group.add(basket, berries);
      break;
    }

    case 'stone_quarry': {
      // Excavation pit with cut boulders, winch, and mineral cart
      const pitGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.3, 10);
      const pit = new THREE.Mesh(pitGeo, matStoneDark);
      pit.position.y = 0.15;
      group.add(pit);

      // Stacked quarried stone blocks
      const blockGeo = new THREE.BoxGeometry(0.7, 0.5, 0.6);
      const block1 = new THREE.Mesh(blockGeo, matStone);
      block1.position.set(-0.8, 0.45, -0.5);
      block1.rotation.y = 0.2;
      const block2 = new THREE.Mesh(blockGeo, matStone);
      block2.position.set(-0.4, 0.45, -0.6);
      block2.rotation.y = -0.15;
      const block3 = new THREE.Mesh(blockGeo, matStone);
      block3.position.set(-0.6, 0.85, -0.55);
      block3.rotation.y = 0.1;
      group.add(block1, block2, block3);

      // Wooden lifting crane / derrick
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.6, 6), matWoodDark);
      mast.position.set(0.8, 1.3, -0.7);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 5), matWoodDark);
      arm.position.set(0.2, 2.3, -0.3);
      arm.rotation.z = -Math.PI / 4;
      group.add(mast, arm);

      // Big raw crystal/flint boulder
      const boulderGeo = new THREE.DodecahedronGeometry(0.8, 0);
      const boulder = new THREE.Mesh(boulderGeo, new THREE.MeshLambertMaterial({ color: 0x94a3b8 }));
      boulder.position.set(0.6, 0.6, 0.6);
      boulder.rotation.set(0.4, 0.6, 0.2);
      boulder.castShadow = true;
      group.add(boulder);
      break;
    }

    case 'barracks': {
      // Tribal sparring arena with target dummy, weapon rack, and war totem
      const dirt = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, 0.12, 16), new THREE.MeshLambertMaterial({ color: PALETTE.dirt }));
      dirt.position.y = 0.06;
      group.add(dirt);

      // Wooden fence stakes around back perimeter
      for (let i = 0; i < 7; i++) {
        const ang = Math.PI * 0.6 + (i / 7) * Math.PI * 0.9;
        const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.5, 5), matWoodDark);
        stake.position.set(Math.cos(ang) * 2.2, 0.75, Math.sin(ang) * 2.2);
        group.add(stake);
      }

      // Small armory shelter tent
      const tentGeo = new THREE.ConeGeometry(1.6, 1.8, 4);
      const tent = new THREE.Mesh(tentGeo, matClothRed);
      tent.position.set(-1.0, 1.0, -0.8);
      tent.rotation.y = Math.PI / 4;
      tent.castShadow = true;
      group.add(tent);

      // Straw target dummy
      const dummyPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 5), matWoodDark);
      dummyPost.position.set(0.8, 0.7, 0.5);
      const dummyBody = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.7, 8), matThatch);
      dummyBody.position.set(0.8, 1.0, 0.5);
      const dummyHead = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), matThatchHigh);
      dummyHead.position.set(0.8, 1.5, 0.5);
      group.add(dummyPost, dummyBody, dummyHead);

      // Weapon rack with spears and clubs
      const rackBar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), matWoodDark);
      rackBar.position.set(0.5, 0.8, -1.2);
      const rackLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 5), matWoodDark);
      rackLeg1.position.set(0.0, 0.5, -1.2);
      const rackLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 5), matWoodDark);
      rackLeg2.position.set(1.0, 0.5, -1.2);
      group.add(rackBar, rackLeg1, rackLeg2);

      // War Totem / Banner
      const totemPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.8, 6), matWoodDark);
      totemPole.position.set(-1.6, 1.4, 1.2);
      const totemFlag = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.04), matClothBlue);
      totemFlag.position.set(-1.2, 2.1, 1.2);
      group.add(totemPole, totemFlag);
      break;
    }

    case 'campfire': {
      // Ring of stones
      const stoneCount = 8;
      for (let i = 0; i < stoneCount; i++) {
        const a = (i / stoneCount) * Math.PI * 2;
        const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), matStone);
        stone.position.set(Math.cos(a) * 0.9, 0.12, Math.sin(a) * 0.9);
        group.add(stone);
      }

      // Burning logs
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI;
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.1, 6), matWoodDark);
        log.rotation.x = 0.3;
        log.rotation.y = a;
        log.position.set(0, 0.2, 0);
        group.add(log);
      }

      // Flame crystals (animated in render loop)
      const flameGroup = new THREE.Group();
      flameGroup.name = 'fire_flames';
      const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 5), matFire);
      f1.position.y = 0.5;
      const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 5), matFireYellow);
      f2.position.set(0.08, 0.6, -0.05);
      flameGroup.add(f1, f2);
      group.add(flameGroup);

      // Warm point light for atmospheric glow
      const fireLight = new THREE.PointLight(0xff7700, 2.5, 9, 2);
      fireLight.position.set(0, 0.8, 0);
      fireLight.name = 'fire_light';
      group.add(fireLight);
      break;
    }

    case 'storage_pit': {
      // Elevated timber warehouse with crates and grain jars
      const platform = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 2.4), matWoodPlank);
      platform.position.y = 0.5;
      group.add(platform);

      // Stilt legs
      const stiltGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.6, 6);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => {
        const stilt = new THREE.Mesh(stiltGeo, matWoodDark);
        stilt.position.set(x, 0.3, z);
        group.add(stilt);
      });

      // Thatched barrel roof
      const shedGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.0, 10, 1, false, 0, Math.PI);
      const shed = new THREE.Mesh(shedGeo, matThatch);
      shed.rotation.z = Math.PI / 2;
      shed.position.set(0, 1.5, 0);
      shed.castShadow = true;
      group.add(shed);

      // Crates stacked in front
      const crateGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const c1 = new THREE.Mesh(crateGeo, matWoodLight);
      c1.position.set(0.5, 0.85, 0.5);
      const c2 = new THREE.Mesh(crateGeo, matWoodLight);
      c2.position.set(-0.4, 0.85, 0.6);
      group.add(c1, c2);
      break;
    }

    case 'watchtower': {
      // 4 tall timber legs
      const legGeo = new THREE.CylinderGeometry(0.12, 0.14, 3.6, 6);
      [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(legGeo, matWoodDark);
        leg.position.set(x, 1.8, z);
        leg.rotation.z = -x * 0.08;
        leg.rotation.x = z * 0.08;
        group.add(leg);
      });

      // Wooden platform
      const plat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 2.2), matWoodPlank);
      plat.position.y = 3.6;
      group.add(plat);

      // Guard railings
      const rail = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.1), matWoodDark);
      rail.position.set(0, 3.9, 1.05);
      group.add(rail);

      // Lookout roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.4, 4), matThatch);
      roof.position.set(0, 5.1, 0);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);

      // Flaming beacon torch
      const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.8, 5), matWoodDark);
      torch.position.set(0.7, 4.2, 0.7);
      const torchFlame = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 5), matFire);
      torchFlame.position.set(0.7, 4.7, 0.7);
      group.add(torch, torchFlame);
      break;
    }

    case 'farm': {
      // Bronze Age tilled crop soil
      const soil = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.2, 3.6),
        new THREE.MeshLambertMaterial({ color: 0x4a2e18 })
      );
      soil.position.y = 0.1;
      group.add(soil);

      // Crop mounds and wheat stalks
      for (let row = -1.2; row <= 1.2; row += 0.8) {
        const mound = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.25, 3.2, 6),
          new THREE.MeshLambertMaterial({ color: 0x5a381e })
        );
        mound.rotation.x = Math.PI / 2;
        mound.position.set(row, 0.2, 0);
        group.add(mound);

        // Wheat shoots
        for (let col = -1.2; col <= 1.2; col += 0.5) {
          const shoot = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.5, 5),
            new THREE.MeshLambertMaterial({ color: 0x84cc16 })
          );
          shoot.position.set(row, 0.5, col);
          group.add(shoot);
        }
      }
      break;
    }
  }

  // Add subtle level indicator flags or decorations if level > 1
  if (level > 1) {
    const starGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 5);
    const starMat = new THREE.MeshLambertMaterial({ color: PALETTE.gold });
    for (let l = 0; l < Math.min(level, 4); l++) {
      const star = new THREE.Mesh(starGeo, starMat);
      star.rotation.x = Math.PI / 2;
      star.position.set(-0.6 + l * 0.4, 0.4, 1.8);
      group.add(star);
    }
  }

  return group;
}

/**
 * Creates a cute 3D chibi tree
 */
export function createChibiTree(variant: number = 0): THREE.Group {
  const tree = new THREE.Group();
  const trunkMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodDark });

  if (variant % 2 === 0) {
    // Fluffy round deciduous tree
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 1.6, 7), trunkMat);
    trunk.position.y = 0.8;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliageMat = new THREE.MeshLambertMaterial({
      color: variant % 4 === 0 ? PALETTE.leafGreen : PALETTE.leafLight
    });
    // Multi-puff foliage
    const mainPuff = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 1), foliageMat);
    mainPuff.position.y = 2.4;
    mainPuff.scale.set(1.1, 1.0, 1.1);
    mainPuff.castShadow = true;

    const topPuff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), foliageMat);
    topPuff.position.set(0.2, 3.2, -0.1);
    topPuff.castShadow = true;

    tree.add(mainPuff, topPuff);

    // Apple tree variant
    if (variant === 4) {
      const appleMat = new THREE.MeshLambertMaterial({ color: PALETTE.clothRed });
      for (let a = 0; a < 5; a++) {
        const apple = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), appleMat);
        const theta = (a / 5) * Math.PI * 2;
        apple.position.set(Math.cos(theta) * 1.2, 2.2 + (a % 3) * 0.3, Math.sin(theta) * 1.2);
        tree.add(apple);
      }
    }
  } else {
    // Cute tiered chibi pine tree
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 1.2, 6), trunkMat);
    trunk.position.y = 0.6;
    trunk.castShadow = true;
    tree.add(trunk);

    const pineMat = new THREE.MeshLambertMaterial({ color: PALETTE.leafDark });
    const tiers = [
      { r: 1.4, h: 1.2, y: 1.4 },
      { r: 1.1, h: 1.1, y: 2.2 },
      { r: 0.75, h: 1.0, y: 3.0 }
    ];
    tiers.forEach(({ r, h, y }) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), pineMat);
      cone.position.y = y;
      cone.castShadow = true;
      tree.add(cone);
    });
  }

  return tree;
}

/**
 * Creates cute faceted chibi rocks
 */
export function createChibiRock(size: number = 1.0): THREE.Mesh {
  const geo = new THREE.DodecahedronGeometry(size, 0);
  const colors = [PALETTE.stoneLight, PALETTE.stoneDark, PALETTE.stoneWarm];
  const mat = new THREE.MeshLambertMaterial({
    color: colors[Math.floor(Math.random() * colors.length)],
    flatShading: true
  });
  const rock = new THREE.Mesh(geo, mat);
  rock.castShadow = true;
  rock.receiveShadow = true;
  rock.scale.set(1.1 + Math.random() * 0.4, 0.7 + Math.random() * 0.3, 1.0 + Math.random() * 0.4);
  return rock;
}

/**
 * Creates a cute 3D chibi villager
 */
export function createChibiVillagerMesh(tunicColor: number = 0x3b82f6): THREE.Group {
  const villager = new THREE.Group();
  villager.name = 'villager';

  const skinMat = new THREE.MeshLambertMaterial({ color: 0xffd1b3 });
  const tunicMat = new THREE.MeshLambertMaterial({ color: tunicColor });
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });

  // Big cute head (chibi proportion: 1:1.5 ratio)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), skinMat);
  head.position.y = 0.95;
  head.castShadow = true;

  // Hair cap
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
  hair.position.y = 0.98;

  // Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), eyeMat);
  eyeL.position.set(0.13, 0.98, 0.34);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), eyeMat);
  eyeR.position.set(-0.13, 0.98, 0.34);

  // Body / tunic
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.5, 8), tunicMat);
  body.position.y = 0.5;
  body.castShadow = true;

  // Feet
  const footL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.2), hairMat);
  footL.position.set(0.12, 0.07, 0.05);
  footL.name = 'foot_l';
  const footR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.2), hairMat);
  footR.position.set(-0.12, 0.07, 0.05);
  footR.name = 'foot_r';

  // Cute little hands
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), skinMat);
  handL.position.set(0.3, 0.5, 0.05);
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), skinMat);
  handR.position.set(-0.3, 0.5, 0.05);

  villager.add(head, hair, eyeL, eyeR, body, footL, footR, handL, handR);
  return villager;
}
