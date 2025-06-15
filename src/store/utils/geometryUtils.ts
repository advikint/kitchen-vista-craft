import * as THREE from 'three';

export interface CollisionItem {
  position: { x: number; y: number }; // Ground plane position (maps to XZ in 3D)
  width: number;  // X-axis dimension before rotation
  height: number; // Y-axis dimension (vertical)
  depth: number;  // Z-axis dimension before rotation
  rotation: number; // Degrees around Y-axis
}

export interface AABB {
  minX: number; maxX: number;
  minY: number; maxY: number;
  minZ: number; maxZ: number;
}

const calculateWorldAABB = (item: CollisionItem): AABB => {
  const { position, width, height, depth, rotation } = item;

  // 1. Define 8 local corners (object centered at its local origin)
  const halfW = width / 2;
  const halfH = height / 2; // This is the actual half-height for 3D AABB
  const halfD = depth / 2;

  const localCorners: THREE.Vector3[] = [
    new THREE.Vector3(-halfW, -halfH, -halfD),
    new THREE.Vector3( halfW, -halfH, -halfD),
    new THREE.Vector3( halfW,  halfH, -halfD),
    new THREE.Vector3(-halfW,  halfH, -halfD),
    new THREE.Vector3(-halfW, -halfH,  halfD),
    new THREE.Vector3( halfW, -halfH,  halfD),
    new THREE.Vector3( halfW,  halfH,  halfD),
    new THREE.Vector3(-halfW,  halfH,  halfD),
  ];

  // 2. Prepare rotation (around Y-axis)
  const rotationRadians = (rotation || 0) * Math.PI / 180;
  // Using a Quaternion for rotation is generally more robust than Euler angles
  const itemQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotationRadians, 0, 'YXZ'));
  
  // 3. Prepare world translation for the item's 3D center
  // The item's 2D position (x,y) is on the ground (XZ plane).
  // The item's 3D center will be at (position.x, height / 2, position.y)
  const worldCenter = new THREE.Vector3(position.x, height / 2, position.y);

  // 4. Transform corners to world space and find min/max
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  localCorners.forEach(corner => {
    const worldCorner = corner.clone();
    // Apply rotation (around item's own center, which is local origin before translation)
    worldCorner.applyQuaternion(itemQuaternion);
    // Apply translation to world position
    worldCorner.add(worldCenter);

    minX = Math.min(minX, worldCorner.x);
    maxX = Math.max(maxX, worldCorner.x);
    minY = Math.min(minY, worldCorner.y);
    maxY = Math.max(maxY, worldCorner.y);
    minZ = Math.min(minZ, worldCorner.z);
    maxZ = Math.max(maxZ, worldCorner.z);
  });

  return { minX, maxX, minY, maxY, minZ, maxZ };
};

export const has3DOverlap = (itemA: CollisionItem, itemB: CollisionItem): boolean => {
  const aabbA = calculateWorldAABB(itemA);
  const aabbB = calculateWorldAABB(itemB);

  const overlapX = aabbA.minX < aabbB.maxX && aabbA.maxX > aabbB.minX;
  const overlapY = aabbA.minY < aabbB.maxY && aabbA.maxY > aabbB.minY; // Vertical overlap
  const overlapZ = aabbA.minZ < aabbB.maxZ && aabbA.maxZ > aabbB.minZ; // Depth overlap

  return overlapX && overlapY && overlapZ;
};

// Example usage (can be removed or kept for testing):
/*
const item1: CollisionItem = { position: { x: 0, y: 0 }, width: 10, height: 20, depth: 10, rotation: 0 };
const item2: CollisionItem = { position: { x: 5, y: 0 }, width: 10, height: 20, depth: 10, rotation: 0 }; // Overlaps
const item3: CollisionItem = { position: { x: 20, y: 0 }, width: 10, height: 20, depth: 10, rotation: 0 }; // No overlap
const item4: CollisionItem = { position: {x:0, y:0}, width:10, height:5, depth:10, rotation:0}; // item1 but shorter
const item5: CollisionItem = { position: {x:0, y:0}, width:10, height:20, depth:10, rotation:45};


console.log("Item 1 AABB:", calculateWorldAABB(item1));
// minX: -5, maxX: 5, minY: 0, maxY: 20, minZ: -5, maxZ: 5
console.log("Item 5 AABB:", calculateWorldAABB(item5));
// Example for 45deg rotated: width=10, depth=10 -> extends to sqrt(50) approx 7.07 in X and Z
// minX: -7.07, maxX: 7.07, minY: 0, maxY: 20, minZ: -7.07, maxZ: 7.07

console.log("Overlap 1 and 2:", has3DOverlap(item1, item2)); // Expected: true
console.log("Overlap 1 and 3:", has3DOverlap(item1, item3)); // Expected: false
console.log("Overlap 1 and 4 (vertical check):", has3DOverlap(item1, item4)); // Expected: true
console.log("Overlap 1 and 5 (rotated):", has3DOverlap(item1, item5)); // Expected: true (due to rotation causing overlap)

const item6: CollisionItem = { position: {x:10, y:0}, width: 5, height: 5, depth: 5, rotation: 0};
const item7: CollisionItem = { position: {x:10, y:6}, width: 5, height: 5, depth: 5, rotation: 0}; // No Y overlap with item6
console.log("Overlap 6 and 7 (Y-axis separation):", has3DOverlap(item6, item7)); // Expected: false
*/
