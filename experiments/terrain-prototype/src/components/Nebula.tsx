/// <reference types="@react-three/fiber" />
import { useMemo } from "react";
import * as THREE from "three";

// Simple soft gradient - organic shapes come from particle overlap
function createCloudTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.3)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.1)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface NebulaProps {
  clusterCenters: { x: number; z: number; size: number; density: number }[];
}

// Custom shader for variable-size nebula particles
const nebulaVertexShader = `
  attribute float size;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const nebulaFragmentShader = `
  uniform sampler2D map;
  uniform float opacity;
  varying vec3 vColor;
  void main() {
    vec4 texColor = texture2D(map, gl_PointCoord);
    gl_FragColor = vec4(vColor, texColor.a * opacity);
  }
`;

// Nebula follows the SAME cluster centers as the terrain
export function Nebula({ clusterCenters }: NebulaProps) {
  const cloudTexture = useMemo(() => createCloudTexture(), []);

  const { positions, colors, sizes } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const siz: number[] = [];

    const cyanColor = new THREE.Color("#00D9FF");
    const purpleColor = new THREE.Color("#5030A0");
    const darkColor = new THREE.Color("#001018");

    // Generate MORE nebula particles for organic overlap
    for (const cluster of clusterCenters) {
      const numClouds = Math.floor(cluster.density * cluster.size * 25);

      for (let i = 0; i < numClouds; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.random() * cluster.size * 1.5;

        const x = cluster.x + Math.cos(angle) * dist;
        const z = cluster.z + Math.sin(angle) * dist * 0.7;

        const y = 0.02 + Math.random() * 0.15;

        pos.push(x, y, z);

        // Color - mostly cyan, some purple
        const color = new THREE.Color();
        if (Math.random() > 0.35) {
          color.lerpColors(darkColor, cyanColor, 0.15 + Math.random() * 0.2);
        } else {
          color.lerpColors(darkColor, purpleColor, 0.15 + Math.random() * 0.25);
        }
        col.push(color.r, color.g, color.b);

        // Dramatic size variation - tiny wisps to BIG diffuse clouds
        const sizeRoll = Math.random();
        let size: number;
        if (sizeRoll > 0.97) {
          size = 25 + Math.random() * 20; // 3% HUGE clouds
        } else if (sizeRoll > 0.9) {
          size = 12 + Math.random() * 10; // 7% large
        } else if (sizeRoll > 0.6) {
          size = 5 + Math.random() * 5; // 30% medium
        } else {
          size = 1.5 + Math.random() * 3; // 60% small wisps
        }
        siz.push(size);
      }
    }

    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
      sizes: new Float32Array(siz),
    };
  }, [clusterCenters]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: cloudTexture },
        opacity: { value: 0.06 },
      },
      vertexShader: nebulaVertexShader,
      fragmentShader: nebulaFragmentShader,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [cloudTexture]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, colors, sizes]);

  return <points geometry={geometry} material={material} />;
}
