import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export interface ClusterCenter {
  x: number;
  z: number;
  size: number;
  density: number;
}

// Generate cluster centers - exported so Nebula can use the same ones
export function generateClusterCenters(): ClusterCenter[] {
  const width = 32;
  const depth = 12;
  const clusterCenters: ClusterCenter[] = [];
  const numClusters = 8 + Math.floor(Math.random() * 6);

  for (let i = 0; i < numClusters; i++) {
    clusterCenters.push({
      x: (Math.random() - 0.5) * width * 0.9,
      z: (Math.random() - 0.5) * depth * 0.7,
      size: 2 + Math.random() * 4,
      density: 0.4 + Math.random() * 0.6,
    });
  }

  // Add connecting bridges between nearby clusters
  for (let i = 0; i < clusterCenters.length - 1; i++) {
    const c1 = clusterCenters[i];
    const c2 = clusterCenters[i + 1];
    const dist = Math.sqrt((c2.x - c1.x) ** 2 + (c2.z - c1.z) ** 2);

    if (dist < 10 && Math.random() > 0.4) {
      clusterCenters.push({
        x: (c1.x + c2.x) / 2 + (Math.random() - 0.5) * 2,
        z: (c1.z + c2.z) / 2 + (Math.random() - 0.5) * 1,
        size: 1 + Math.random() * 2,
        density: 0.2 + Math.random() * 0.3,
      });
    }
  }

  return clusterCenters;
}

// Generate star points from cluster centers
function generatePointCloud(clusterCenters: ClusterCenter[]): {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
} {
  const width = 32;
  const depth = 12;

  const points: {
    x: number;
    y: number;
    z: number;
    intensity: number;
    size: number;
  }[] = [];

  // Generate stars for each cluster
  for (const cluster of clusterCenters) {
    const numStars = Math.floor(cluster.density * cluster.size * 80);

    for (let i = 0; i < numStars; i++) {
      // Gaussian-ish distribution from cluster center
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.random() * cluster.size; // Squared for center concentration

      const x = cluster.x + Math.cos(angle) * dist;
      const z = cluster.z + Math.sin(angle) * dist * 0.6; // Flatten in z

      // Skip if out of bounds
      if (Math.abs(x) > width / 2 || Math.abs(z) > depth / 2) continue;

      // Distance from cluster center affects intensity
      const normDist = dist / cluster.size;
      const baseIntensity = (1 - normDist) * cluster.density;

      // Random variation in intensity
      const intensity = baseIntensity * (0.3 + Math.random() * 0.7);

      // Height - very subtle, follows intensity
      const y = 0.1 + intensity * 0.4 + Math.random() * 0.15;

      // Size variation - MUCH more dramatic
      // Most stars tiny, few large
      let size: number;
      const sizeRoll = Math.random();
      if (sizeRoll > 0.98) {
        // 2% - Large bright stars
        size = 0.25 + Math.random() * 0.15;
      } else if (sizeRoll > 0.9) {
        // 8% - Medium stars
        size = 0.12 + Math.random() * 0.1;
      } else if (sizeRoll > 0.6) {
        // 30% - Small stars
        size = 0.06 + Math.random() * 0.05;
      } else {
        // 60% - Tiny dim stars
        size = 0.02 + Math.random() * 0.03;
      }

      // Bright stars get bigger
      if (intensity > 0.7) {
        size *= 1.3;
      }

      points.push({ x, y, z, intensity, size });
    }
  }

  // Add scattered field stars (not in clusters)
  const fieldStars = 200;
  for (let i = 0; i < fieldStars; i++) {
    const x = (Math.random() - 0.5) * width;
    const z = (Math.random() - 0.5) * depth;
    const y = 0.05 + Math.random() * 0.1;
    const intensity = 0.1 + Math.random() * 0.2;
    const size = 0.015 + Math.random() * 0.025;
    points.push({ x, y, z, intensity, size });
  }

  // Convert to typed arrays
  const positions = new Float32Array(points.length * 3);
  const colors = new Float32Array(points.length * 3);
  const sizes = new Float32Array(points.length);

  const cyanColor = new THREE.Color("#00D9FF");
  const whiteColor = new THREE.Color("#FFFFFF");
  const dimCyan = new THREE.Color("#003344");

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const i3 = i * 3;

    positions[i3] = p.x;
    positions[i3 + 1] = p.y;
    positions[i3 + 2] = p.z;

    const color = new THREE.Color();
    if (p.intensity < 0.3) {
      color.lerpColors(dimCyan, cyanColor, p.intensity / 0.3);
    } else if (p.intensity < 0.7) {
      color.lerpColors(
        cyanColor,
        whiteColor,
        ((p.intensity - 0.3) / 0.4) * 0.5,
      );
    } else {
      color.lerpColors(
        cyanColor,
        whiteColor,
        0.5 + ((p.intensity - 0.7) / 0.3) * 0.5,
      );
    }
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = p.size;
  }

  return { positions, colors, sizes };
}

interface TerrainProps {
  clusterCenters: ClusterCenter[];
}

export function Terrain({ clusterCenters }: TerrainProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors, sizes } = useMemo(
    () => generatePointCloud(clusterCenters),
    [clusterCenters],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, colors, sizes]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.02) * 0.01;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.1}
        sizeAttenuation
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
