import { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Helper component to manage GLTF loading and fallback for Cabinets
const CabinetModelRenderer = ({ modelPath, proceduralGroup }: { modelPath: string | null; proceduralGroup: THREE.Group }) => {
  if (modelPath) {
    try {
      useGLTF.preload(modelPath); // Preload the model
      const { scene } = useGLTF(modelPath); // Call useGLTF hook
      if (scene) {
        return <primitive object={scene.clone()} />;
      }
    } catch (error) {
      console.error(`Failed to load cabinet model from ${modelPath}, falling back to procedural generation.`, error);
      // Fallback to procedural model if loading fails
    }
  } else {
    // console.log("No valid model path found for cabinet, using procedural generation."); // Optionally quiet this log
  }
  // Render procedural group if no path or if GLTF loading failed
  return <primitive object={proceduralGroup} />;
};

// Helper component to manage GLTF loading and fallback for Appliances
const ApplianceModelRenderer = ({ modelPath, proceduralGroup }: { modelPath: string | null; proceduralGroup: THREE.Group }) => {
  if (modelPath) {
    try {
      useGLTF.preload(modelPath); // Preload the model
      const { scene } = useGLTF(modelPath); // Call useGLTF hook
      if (scene) {
        return <primitive object={scene.clone()} />;
      }
    } catch (error) {
      console.error(`Failed to load appliance model from ${modelPath}, falling back to procedural generation.`, error);
      // Fallback to procedural model if loading fails
    }
  } else {
    // console.log("No valid model path found for appliance, using procedural generation."); // Optionally quiet this log
  }
  // Render procedural group if no path or if GLTF loading failed
  return <primitive object={proceduralGroup} />;
};

// Helper function to create a Shaker style front (door or drawer)
const createShakerFrontMesh = (
  width: number,
  height: number,
  material: THREE.Material,
  stileWidth: number = 5,
  stileThickness: number = 2,
  panelThickness: number = 1.2,
  isGlass: boolean = false
): THREE.Group => {
  const group = new THREE.Group();
  const frameMaterial = material;
  const panelMaterial = material;

  // Vertical Stiles (Left & Right)
  const leftStileGeom = new THREE.BoxGeometry(stileWidth, height, stileThickness);
  const leftStileMesh = new THREE.Mesh(leftStileGeom, frameMaterial);
  leftStileMesh.position.x = -width / 2 + stileWidth / 2;
  group.add(leftStileMesh);

  const rightStileGeom = new THREE.BoxGeometry(stileWidth, height, stileThickness);
  const rightStileMesh = new THREE.Mesh(rightStileGeom, frameMaterial);
  rightStileMesh.position.x = width / 2 - stileWidth / 2;
  group.add(rightStileMesh);

  // Horizontal Rails (Top & Bottom) - fit between vertical stiles
  const railWidth = width - 2 * stileWidth;
  if (railWidth > 0) {
    const topRailGeom = new THREE.BoxGeometry(railWidth, stileWidth, stileThickness);
    const topRailMesh = new THREE.Mesh(topRailGeom, frameMaterial);
    topRailMesh.position.y = height / 2 - stileWidth / 2;
    group.add(topRailMesh);

    const bottomRailGeom = new THREE.BoxGeometry(railWidth, stileWidth, stileThickness);
    const bottomRailMesh = new THREE.Mesh(bottomRailGeom, frameMaterial);
    bottomRailMesh.position.y = -height / 2 + stileWidth / 2;
    group.add(bottomRailMesh);
  }

  // Central Panel - fits within the frame
  const panelWidth = width - 2 * stileWidth;
  const panelHeight = height - 2 * stileWidth;
  if (panelWidth > 0 && panelHeight > 0) {
    if (isGlass) {
      const glassMaterial = new THREE.MeshPhysicalMaterial({
         color: (material as any).color ? new THREE.Color((material as any).color) : new THREE.Color(0xffffff),
         roughness: 0.1,
         transmission: 0.9,
         thickness: panelThickness / 2, // Glass is often thinner
         transparent: true,
         opacity: 0.3,
      });
      const panelGeom = new THREE.BoxGeometry(panelWidth, panelHeight, panelThickness / 2);
      const panelMesh = new THREE.Mesh(panelGeom, glassMaterial);
      panelMesh.position.z = 0;
      group.add(panelMesh);
    } else {
      const panelGeom = new THREE.BoxGeometry(panelWidth, panelHeight, panelThickness);
      const panelMesh = new THREE.Mesh(panelGeom, panelMaterial);
      panelMesh.position.z = -(stileThickness - panelThickness) / 2; // Recessed
      group.add(panelMesh);
    }
  }
  return group;
};


// Professional 3D Model Loader Component
export const CabinetModel = ({ cabinet, selected = false }: { cabinet: any; selected?: boolean }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Load cabinet model based on type and style
  const getModelPath = () => {
    const baseType = cabinet.type; // 'base', 'wall', 'tall'
    const category = cabinet.category; // 'standard-base', 'sink-base', etc.
    
    // Map to realistic model paths
    const modelPaths = {
      'base': {
        'standard-base': '/models/cabinets/base-cabinet-standard.glb',
        'sink-base': '/models/cabinets/base-cabinet-sink.glb',
        'drawer-base': '/models/cabinets/base-cabinet-drawer.glb',
        'corner-base': '/models/cabinets/base-cabinet-corner.glb',
        'cooktop-base': '/models/cabinets/base-cabinet-cooktop.glb',
      },
      'wall': {
        'standard-wall': '/models/cabinets/wall-cabinet-standard.glb',
        'microwave-wall': '/models/cabinets/wall-cabinet-microwave.glb',
        'corner-wall': '/models/cabinets/wall-cabinet-corner.glb',
        'glass-wall': '/models/cabinets/wall-cabinet-glass.glb',
      },
      'tall': {
        'pantry-tall': '/models/cabinets/tall-cabinet-pantry.glb',
        'oven-tall': '/models/cabinets/tall-cabinet-oven.glb',
        'fridge-tall': '/models/cabinets/tall-cabinet-fridge.glb',
      }
    };
    
    return modelPaths[baseType]?.[category] || '/models/cabinets/base-cabinet-standard.glb';
  };

  // Create procedural cabinet geometry when model isn't available
  const createProceduralCabinet = (effectiveHeight: number) => { // Renamed from actualHeight for clarity
    // Use effectiveHeight instead of cabinet.height for the BoxGeometry
    const geometry = new THREE.BoxGeometry(cabinet.width, effectiveHeight, cabinet.depth);
    // Create realistic materials
    const materials = {
      laminate: new THREE.MeshStandardMaterial({
        color: new THREE.Color(cabinet.color || '#8B4513'),
        roughness: 0.7,
        metalness: 0.1,
        map: createWoodTexture('laminate')
      }),
      veneer: new THREE.MeshStandardMaterial({
        color: new THREE.Color(cabinet.color || '#D2691E'),
        roughness: 0.6,
        metalness: 0.0,
        map: createWoodTexture('veneer'),
        normalMap: createWoodNormalMap()
      }),
      acrylic: new THREE.MeshStandardMaterial({
        color: new THREE.Color(cabinet.color || '#FFFFFF'),
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      }),
      matte: new THREE.MeshStandardMaterial({
        color: new THREE.Color(cabinet.color || '#696969'),
        roughness: 0.9,
        metalness: 0.0
      }),
      gloss: new THREE.MeshStandardMaterial({
        color: new THREE.Color(cabinet.color || '#FFFFFF'),
        roughness: 0.0,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0
      })
    };

    const material = materials[cabinet.finish as keyof typeof materials] || materials.laminate;
    
    return { geometry, material };
  };

  // Create wood texture procedurally
  const createWoodTexture = (type: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Create wood grain pattern
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    
    if (type === 'veneer') {
      gradient.addColorStop(0, '#8B4513');
      gradient.addColorStop(0.3, '#A0522D');
      gradient.addColorStop(0.6, '#8B4513');
      gradient.addColorStop(1, '#654321');
    } else {
      gradient.addColorStop(0, '#DEB887');
      gradient.addColorStop(0.5, '#D2B48C');
      gradient.addColorStop(1, '#BC9A6A');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add wood grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 25 + Math.random() * 10);
      ctx.lineTo(512, i * 25 + Math.random() * 10);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  };

  const createWoodNormalMap = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Create normal map for wood grain
    ctx.fillStyle = '#8080FF'; // Neutral normal
    ctx.fillRect(0, 0, 512, 512);
    
    // Add grain bumps
    for (let i = 0; i < 20; i++) {
      const gradient = ctx.createLinearGradient(0, i * 25, 0, i * 25 + 5);
      gradient.addColorStop(0, '#8080FF');
      gradient.addColorStop(0.5, '#9090FF');
      gradient.addColorStop(1, '#8080FF');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, i * 25, 512, 5);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  };

  // Create detailed cabinet with doors, handles, etc.
  const createDetailedCabinet = () => {
    const group = new THREE.Group();

    const toeKickH = (cabinet.type === 'base' && cabinet.toeKickHeight !== undefined && cabinet.toeKickHeight > 0) ? cabinet.toeKickHeight : 0;
    const toeKickD_inset = (cabinet.type === 'base' && cabinet.toeKickDepth !== undefined && cabinet.toeKickDepth > 0) ? cabinet.toeKickDepth : 0;

    // Main cabinet box
    const mainBoxEffectiveHeight = cabinet.height - toeKickH;
    const { geometry: boxGeometry, material: boxMaterial } = createProceduralCabinet(mainBoxEffectiveHeight);
    const cabinetBox = new THREE.Mesh(boxGeometry, boxMaterial);
    cabinetBox.position.y = toeKickH / 2;
    group.add(cabinetBox);

    // Add Toe Kick if applicable
    if (toeKickH > 0) {
      const toeKickGeometry = new THREE.BoxGeometry(
        cabinet.width,
        toeKickH,
        cabinet.depth - toeKickD_inset
      );
      const toeKickMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cabinet.color || '#8B4513').multiplyScalar(0.5),
        roughness: 0.8,
        metalness: 0.1,
      });
      const toeKickMesh = new THREE.Mesh(toeKickGeometry, toeKickMaterial);
      toeKickMesh.position.y = -(cabinet.height / 2) + (toeKickH / 2);
      toeKickMesh.position.z = -toeKickD_inset / 2;
      group.add(toeKickMesh);
    }

    const shelfThickness = 2;
    const shelfInsetX = 2;
    const shelfInsetZ_front = 2;

    const shelfCount = (cabinet.shelfCount !== undefined && cabinet.shelfCount > 0) ? cabinet.shelfCount : 0;

    if (shelfCount > 0 && cabinet.frontType !== 'drawer') {
      const usableShelfWidth = cabinet.width - 2 * shelfInsetX;
      const usableShelfDepth = cabinet.depth - shelfInsetZ_front;

      if (usableShelfWidth > 0 && usableShelfDepth > 0) {
        const shelfGeometry = new THREE.BoxGeometry(
          usableShelfWidth,
          shelfThickness,
          usableShelfDepth
        );

        const totalShelfThickness = shelfCount * shelfThickness;
        const remainingSpaceForGaps = mainBoxEffectiveHeight - totalShelfThickness;

        if (remainingSpaceForGaps >= 0) {
            const numberOfGaps = shelfCount + 1;
            const gapHeight = remainingSpaceForGaps / numberOfGaps;

            for (let i = 0; i < shelfCount; i++) {
                const shelfMesh = new THREE.Mesh(shelfGeometry, boxMaterial);

                const shelfCenterY = (-mainBoxEffectiveHeight / 2) + (gapHeight * (i + 1)) + (shelfThickness * i) + (shelfThickness / 2);

                shelfMesh.position.set(
                    0,
                    shelfCenterY,
                    -shelfInsetZ_front / 2
                );
                cabinetBox.add(shelfMesh);
            }
        }
      }
    }
    
    // Add doors based on front type
    const stileThickness = 2; // Default stile thickness for positioning, actual is in createShakerFrontMesh
    const handleMaterial = new THREE.MeshStandardMaterial({color: '#C0C0C0', metalness: 0.8, roughness: 0.2});

    if (cabinet.frontType === 'shutter') {
      const doorWidth = cabinet.width * 0.48;
      const doorHeight = mainBoxEffectiveHeight * 0.9; // Use effective height for door panel itself
      let leftDoorMesh, rightDoorMesh;

      if (cabinet.doorStyle === 'shaker') {
        leftDoorMesh = createShakerFrontMesh(doorWidth, doorHeight, boxMaterial);
        rightDoorMesh = createShakerFrontMesh(doorWidth, doorHeight, boxMaterial);
      } else { // Slab
        const slabDoorGeom = new THREE.BoxGeometry(doorWidth, doorHeight, stileThickness); // Use stileThickness for slab thickness
        leftDoorMesh = new THREE.Mesh(slabDoorGeom, boxMaterial);
        rightDoorMesh = new THREE.Mesh(slabDoorGeom, boxMaterial);
      }

      leftDoorMesh.position.set(-cabinet.width * 0.25, 0, cabinet.depth / 2 + stileThickness / 2);
      cabinetBox.add(leftDoorMesh);
      rightDoorMesh.position.set(cabinet.width * 0.25, 0, cabinet.depth / 2 + stileThickness / 2);
      cabinetBox.add(rightDoorMesh);
      
      const handleGeom = new THREE.CylinderGeometry(0.2, 0.2, doorHeight * 0.2, 8);
      const leftHandle = new THREE.Mesh(handleGeom, handleMaterial);
      const rightHandle = new THREE.Mesh(handleGeom, handleMaterial);

      if (cabinet.doorStyle === 'shaker') {
        leftHandle.position.set(doorWidth/2 - 5/2, 0, stileThickness / 2 + 1); // On outer stile
        rightHandle.position.set(-doorWidth/2 + 5/2, 0, stileThickness / 2 + 1); // On outer stile
      } else { // Slab
        leftHandle.position.set(doorWidth/2 - 5, 0, stileThickness / 2 + 1);
        rightHandle.position.set(-doorWidth/2 + 5, 0, stileThickness / 2 + 1);
      }
      leftDoorMesh.add(leftHandle);
      rightDoorMesh.add(rightHandle);

    } else if (cabinet.frontType === 'drawer') {
      const drawerCount = cabinet.drawers && cabinet.drawers > 0 ? cabinet.drawers : 1;
      const singleDrawerActualHeight = mainBoxEffectiveHeight / drawerCount;

      for (let i = 0; i < drawerCount; i++) {
        const drawerFaceWidth = cabinet.width * 0.95;
        const drawerFaceHeight = singleDrawerActualHeight * 0.8;
        let drawerFaceMesh;

        if (cabinet.doorStyle === 'shaker') {
          drawerFaceMesh = createShakerFrontMesh(drawerFaceWidth, drawerFaceHeight, boxMaterial);
        } else { // Slab
          const slabDrawerGeom = new THREE.BoxGeometry(drawerFaceWidth, drawerFaceHeight, stileThickness);
          drawerFaceMesh = new THREE.Mesh(slabDrawerGeom, boxMaterial);
        }

        drawerFaceMesh.position.set(
          0,
          (mainBoxEffectiveHeight / 2) - (singleDrawerActualHeight * (i + 0.5)) + (singleDrawerActualHeight * 0.1),
          cabinet.depth / 2 + stileThickness / 2
        );
        cabinetBox.add(drawerFaceMesh);
        
        const handleGeom = new THREE.CylinderGeometry(0.15, 0.15, drawerFaceWidth * 0.3, 6);
        const handle = new THREE.Mesh(handleGeom, handleMaterial);
        handle.position.set(0, 0, stileThickness / 2 + 1);
        handle.rotation.x = Math.PI / 2;
        drawerFaceMesh.add(handle);
      }
    } else if (cabinet.frontType === 'glass') {
      // Assuming glass doors are similar to shutter in setup (e.g., double doors if wide)
      const doorWidth = cabinet.width * (cabinet.category === 'standard-wall' ? 0.95 : 0.48); // Single panel for some wall, double for others
      const doorHeight = mainBoxEffectiveHeight * 0.9;
      let glassDoorMesh;

      if (cabinet.doorStyle === 'shaker') {
        glassDoorMesh = createShakerFrontMesh(doorWidth, doorHeight, boxMaterial, 5, stileThickness, 1.2, true);
      } else { // Slab glass door
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(boxMaterial.color).multiplyScalar(0.8), // Slightly darken for frame effect
            roughness: 0.1, transmission: 0.9, thickness: 1, transparent: true, opacity: 0.3,
        });
        const slabGlassGeom = new THREE.BoxGeometry(doorWidth, doorHeight, stileThickness/2); // Thinner glass door
        glassDoorMesh = new THREE.Mesh(slabGlassGeom, glassMaterial);
      }

      // Simplified positioning for single panel glass door for now
      glassDoorMesh.position.set(0, 0, cabinet.depth / 2 + stileThickness / 4);
      cabinetBox.add(glassDoorMesh);

      // Add handle (optional, can be different for glass)
      const handleGeom = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
      const handle = new THREE.Mesh(handleGeom, handleMaterial);
      if (cabinet.doorStyle === 'shaker') {
        handle.position.set(doorWidth/2 - 5/2, 0, stileThickness / 2 + 1);
      } else {
        handle.position.set(doorWidth/2 - 5, 0, stileThickness / 2 + 1);
      }
      glassDoorMesh.add(handle);
    }
    
    return group;
  };

  // Ensure useMemo dependency array includes new properties if they are accessed directly from `cabinet`
  // Since `cabinet` object itself is a dependency, changes to its properties will trigger re-computation.
  const proceduralCabinetGroup = useMemo(() => createDetailedCabinet(), [cabinet]);
  const modelPath = getModelPath();

  // Animation for selected state
  useFrame((state) => {
    if (meshRef.current && selected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <group
      ref={meshRef}
      position={[cabinet.position.x, cabinet.height / 2, cabinet.position.y]}
      rotation={[0, cabinet.rotation || 0, 0]}
    >
      <CabinetModelRenderer modelPath={modelPath} proceduralGroup={proceduralCabinetGroup} />
      
      {/* Selection indicator */}
      {selected && (
        <mesh position={[0, cabinet.height / 2 + 10, 0]}>
          <ringGeometry args={[cabinet.width / 2, cabinet.width / 2 + 5, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export const ApplianceModel = ({ appliance, selected = false }: { appliance: any; selected?: boolean }) => {
  const meshRef = useRef<THREE.Group>(null);

  const getModelPathAppliance = (currentAppliance: any): string | null => {
    // Example mapping - expand as actual models become available
    if (currentAppliance.type === "dishwasher") {
      if (currentAppliance.manufacturer === "Bosch") {
        return "/models/appliances/bosch-dishwasher-example.glb"; // Placeholder
      }
      return "/models/appliances/generic-dishwasher.glb"; // Placeholder
    }
    if (currentAppliance.type === "fridge" && currentAppliance.manufacturer === "Samsung") {
      return "/models/appliances/samsung-fridge-example.glb"; // Placeholder
    }
    // Add more specific mappings here based on type, manufacturer, model, etc.
    // e.g., if (appliance.type === 'oven' && appliance.model === 'XYZ123') return '/models/oven-XYZ123.glb';
    return null; // Default if no specific model path is found
  };

  // Original createRealisticAppliance function
  const createRealisticAppliance = () => {
    const group = new THREE.Group();
    
    // Base appliance geometry
    const geometry = new THREE.BoxGeometry(appliance.width, appliance.height, appliance.depth);
    
    // Appliance-specific materials and details
    const applianceConfigs = {
      sink: {
        color: '#E5E5E5',
        metalness: 0.8,
        roughness: 0.2,
        details: () => {
          // Add sink basin
          const basinGeometry = new THREE.CylinderGeometry(
            appliance.width * 0.3, 
            appliance.width * 0.3, 
            appliance.height * 0.3
          );
          const basinMaterial = new THREE.MeshStandardMaterial({
            color: '#F0F0F0',
            metalness: 0.9,
            roughness: 0.1
          });
          const basin = new THREE.Mesh(basinGeometry, basinMaterial);
          basin.position.set(0, appliance.height * 0.2, 0);
          return [basin];
        }
      },
      stove: {
        color: '#2C2C2C',
        metalness: 0.7,
        roughness: 0.3,
        details: () => {
          const details = [];
          // Add burners
          for (let i = 0; i < 4; i++) {
            const burnerGeometry = new THREE.CylinderGeometry(3, 3, 1);
            const burnerMaterial = new THREE.MeshStandardMaterial({
              color: '#1A1A1A',
              metalness: 0.8,
              roughness: 0.2
            });
            const burner = new THREE.Mesh(burnerGeometry, burnerMaterial);
            burner.position.set(
              (i % 2 - 0.5) * appliance.width * 0.3,
              appliance.height / 2 + 1,
              (Math.floor(i / 2) - 0.5) * appliance.depth * 0.3
            );
            details.push(burner);
          }
          return details;
        }
      },
      fridge: {
        color: '#F8F8F8',
        metalness: 0.1,
        roughness: 0.4,
        details: () => {
          const details = [];
          // Add door handles
          const handleGeometry = new THREE.BoxGeometry(2, 20, 3);
          const handleMaterial = new THREE.MeshStandardMaterial({
            color: '#C0C0C0',
            metalness: 0.8,
            roughness: 0.2
          });
          
          const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
          leftHandle.position.set(-appliance.width * 0.4, 0, appliance.depth / 2 + 2);
          details.push(leftHandle);
          
          const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
          rightHandle.position.set(appliance.width * 0.4, 0, appliance.depth / 2 + 2);
          details.push(rightHandle);
          
          return details;
        }
      },
      dishwasher: {
        color: '#E0E0E0',
        metalness: 0.6,
        roughness: 0.3,
        details: () => {
          // Add control panel
          const panelGeometry = new THREE.BoxGeometry(appliance.width * 0.8, 5, 1);
          const panelMaterial = new THREE.MeshStandardMaterial({
            color: '#1A1A1A',
            metalness: 0.1,
            roughness: 0.8
          });
          const panel = new THREE.Mesh(panelGeometry, panelMaterial);
          panel.position.set(0, appliance.height / 2 - 10, appliance.depth / 2 + 1);
          return [panel];
        }
      },
      oven: {
        color: '#1A1A1A',
        metalness: 0.7,
        roughness: 0.3,
        details: () => {
          // Add oven door window
          const windowGeometry = new THREE.BoxGeometry(
            appliance.width * 0.6,
            appliance.height * 0.4,
            0.5
          );
          const windowMaterial = new THREE.MeshPhysicalMaterial({
            color: '#000000',
            metalness: 0.0,
            roughness: 0.0,
            transmission: 0.8,
            thickness: 0.5
          });
          const window = new THREE.Mesh(windowGeometry, windowMaterial);
          window.position.set(0, 0, appliance.depth / 2 + 1);
          return [window];
        }
      },
      microwave: {
        color: '#2C2C2C',
        metalness: 0.6,
        roughness: 0.4,
        details: () => {
          // Add microwave door
          const doorGeometry = new THREE.BoxGeometry(
            appliance.width * 0.8,
            appliance.height * 0.6,
            1
          );
          const doorMaterial = new THREE.MeshStandardMaterial({
            color: '#3C3C3C',
            metalness: 0.5,
            roughness: 0.5
          });
          const door = new THREE.Mesh(doorGeometry, doorMaterial);
          door.position.set(0, 0, appliance.depth / 2 + 1);
          return [door];
        }
      },
      hood: {
        color: '#C0C0C0',
        metalness: 0.8,
        roughness: 0.2,
        details: () => {
          // Add hood fan grille
          const grillGeometry = new THREE.CylinderGeometry(
            appliance.width * 0.3,
            appliance.width * 0.3,
            2
          );
          const grillMaterial = new THREE.MeshStandardMaterial({
            color: '#808080',
            metalness: 0.9,
            roughness: 0.1
          });
          const grill = new THREE.Mesh(grillGeometry, grillMaterial);
          grill.position.set(0, -appliance.height / 2 + 5, 0);
          return [grill];
        }
      }
    };

    const config = applianceConfigs[appliance.type as keyof typeof applianceConfigs] || applianceConfigs.sink;
    
    // Main appliance body
    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      metalness: config.metalness,
      roughness: config.roughness
    });
    
    const mainBody = new THREE.Mesh(geometry, material);
    group.add(mainBody);
    
    // Add appliance-specific details
    const details = config.details();
    details.forEach(detail => group.add(detail));
    
    return group;
  };

  const proceduralApplianceGroup = useMemo(() => createRealisticAppliance(), [appliance]);
  const modelPath = getModelPathAppliance(appliance);

  // Animation for selected state
  useFrame((state) => {
    if (meshRef.current && selected) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 2;
    }
  });

  return (
    <group
      ref={meshRef}
      position={[appliance.position.x, appliance.height / 2, appliance.position.y]}
      rotation={[0, appliance.rotation || 0, 0]}
    >
      <ApplianceModelRenderer modelPath={modelPath} proceduralGroup={proceduralApplianceGroup} />
      
      {/* Selection indicator */}
      {selected && (
        <mesh position={[0, appliance.height / 2 + 15, 0]}>
          <ringGeometry args={[appliance.width / 2, appliance.width / 2 + 5, 32]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
};

// Realistic countertop model
export const CountertopModel = ({ cabinets }: { cabinets: any[] }) => {
  const createCountertop = () => {
    const group = new THREE.Group();
    
    // Generate countertop based on base cabinets
    const baseCabinets = cabinets.filter(c => c.type === 'base');
    
    baseCabinets.forEach((cabinet, index) => {
      const geometry = new THREE.BoxGeometry(
        cabinet.width + 2, // Slight overhang
        3, // Standard countertop thickness
        cabinet.depth + 2
      );
      
      // Realistic countertop material (quartz/granite)
      const material = new THREE.MeshStandardMaterial({
        color: '#F5F5DC',
        roughness: 0.3,
        metalness: 0.1,
        normalScale: new THREE.Vector2(0.5, 0.5)
      });
      
      const countertop = new THREE.Mesh(geometry, material);
      countertop.position.set(
        cabinet.position.x,
        cabinet.height + 1.5, // On top of cabinet
        cabinet.position.y
      );
      
      group.add(countertop);
    });
    
    return group;
  };

  const countertopGroup = useMemo(() => createCountertop(), [cabinets]);

  return <primitive object={countertopGroup} />;
};

// Realistic flooring model
export const FlooringModel = ({ room }: { room: any }) => {
  const createFlooring = () => {
    const geometry = new THREE.PlaneGeometry(room.width || 400, room.height || 400);
    
    // Create realistic wood flooring texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Create wood plank pattern
    const plankWidth = 128;
    const plankHeight = 1024;
    
    for (let x = 0; x < 1024; x += plankWidth) {
      const gradient = ctx.createLinearGradient(x, 0, x + plankWidth, 0);
      const baseColor = `hsl(${30 + Math.random() * 20}, 60%, ${40 + Math.random() * 20}%)`;
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(0.5, `hsl(${30 + Math.random() * 20}, 60%, ${45 + Math.random() * 15}%)`);
      gradient.addColorStop(1, baseColor);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, 0, plankWidth, plankHeight);
      
      // Add plank separators
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + plankWidth, 0);
      ctx.lineTo(x + plankWidth, plankHeight);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(room.width / 100, room.height / 100);
    
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.0
    });
    
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    
    return floor;
  };

  const floorMesh = useMemo(() => createFlooring(), [room]);

  return <primitive object={floorMesh} />;
};