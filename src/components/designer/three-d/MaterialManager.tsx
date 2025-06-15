
import { useMemo } from "react";
import * as THREE from "three";

export const useMaterialManager = () => {
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  
  const createWoodMaterial = (type: 'oak' | 'maple' | 'cherry' | 'walnut' = 'oak') => {
    const colorMap: Record<string, string> = {
      oak: '#DEB887',
      maple: '#F5DEB3',
      cherry: '#8B4513',
      walnut: '#654321'
    };
    
    return new THREE.MeshStandardMaterial({
      color: colorMap[type],
      roughness: 0.7,
      metalness: 0.1,
      normalScale: new THREE.Vector2(0.5, 0.5)
    });
  };

  const createLaminateMaterial = (color: string) => {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.1
    });
  };

  const createGlassMaterial = (transparency = 0.3) => {
    return new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: transparency,
      transmission: 0.9,
      roughness: 0.05,
      metalness: 0,
      ior: 1.5,
      thickness: 1,
      envMapIntensity: 1
    });
  };

  const createMetalMaterial = (type: 'steel' | 'brass' | 'chrome' = 'steel') => {
    const colorMap: Record<string, string> = {
      steel: '#C0C0C0',
      brass: '#B5651D',
      chrome: '#E5E5E5'
    };
    
    return new THREE.MeshStandardMaterial({
      color: colorMap[type],
      roughness: type === 'chrome' ? 0.1 : 0.3,
      metalness: 0.9
    });
  };

  const createCountertopMaterial = (type: 'granite' | 'quartz' | 'marble' = 'granite') => {
    const colorMap: Record<string, string> = {
      granite: '#2F2F2F',
      quartz: '#F5F5F5',
      marble: '#F8F8FF'
    };
    
    return new THREE.MeshStandardMaterial({
      color: colorMap[type],
      roughness: type === 'marble' ? 0.1 : 0.2,
      metalness: 0.1
    });
  };

  return {
    createWoodMaterial,
    createLaminateMaterial,
    createGlassMaterial,
    createMetalMaterial,
    createCountertopMaterial
  };
};

export default useMaterialManager;
