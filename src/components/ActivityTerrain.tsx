// 3D Activity Terrain - Galaxy/Nebula visualization driven by activity data
// Matches spike prototype aesthetic with data-driven cluster placement

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, Text, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { TerrainGrid } from "../lib/terrain-data";

// Cluster center type
interface ClusterCenter {
  x: number;
  z: number;
  size: number;
  density: number;
}

// Hover state for tooltip
interface HoverState {
  cell: import("../lib/terrain-data").TerrainCell;
  position: THREE.Vector3;
}

// Grid dimensions (must match gridToClusters)
const GRID_WIDTH = 28;
const GRID_DEPTH = 8;

// Map 3D coordinates to grid cell
function positionToCell(
  x: number,
  z: number,
  grid: TerrainGrid,
): import("../lib/terrain-data").TerrainCell | null {
  // Convert world coords to grid indices
  // X: -14 to +14 maps to week 0-51
  // Z: -4 to +4 maps to day 0-6
  const weekIdx = Math.floor(((x + GRID_WIDTH / 2) / GRID_WIDTH) * 52);
  const dayIdx = Math.floor(((z + GRID_DEPTH / 2) / GRID_DEPTH) * 7);

  // Bounds check
  if (weekIdx < 0 || weekIdx >= 52 || dayIdx < 0 || dayIdx >= 7) {
    return null;
  }

  return grid[weekIdx]?.[dayIdx] ?? null;
}

// Convert terrain grid to cluster centers - high activity = bigger clusters
function gridToClusters(grid: TerrainGrid): ClusterCenter[] {
  const clusters: ClusterCenter[] = [];
  // Match spike dimensions - width 32, depth 12, but compress to fit view
  const gridWidth = 28;
  const gridDepth = 8;

  // Scan grid for cells with any activity
  for (let weekIdx = 0; weekIdx < grid.length; weekIdx++) {
    const week = grid[weekIdx];
    for (let dayIdx = 0; dayIdx < week.length; dayIdx++) {
      const cell = week[dayIdx];

      // Lower threshold - create clusters for most activity
      if (cell.value > 0.05) {
        const x = (weekIdx / 51) * gridWidth - gridWidth / 2;
        const z = (dayIdx / 6) * gridDepth - gridDepth / 2;

        clusters.push({
          x: x + (Math.random() - 0.5) * 0.8,
          z: z + (Math.random() - 0.5) * 0.5,
          size: 1.5 + cell.value * 5,
          density: 0.4 + cell.value * 0.6,
        });
      }
    }
  }

  // Add bridge clusters between nearby high-activity areas
  for (let i = 0; i < clusters.length - 1; i++) {
    const c1 = clusters[i];
    const c2 = clusters[i + 1];
    const dist = Math.sqrt((c2.x - c1.x) ** 2 + (c2.z - c1.z) ** 2);

    if (dist < 6 && dist > 1 && Math.random() > 0.5) {
      clusters.push({
        x: (c1.x + c2.x) / 2 + (Math.random() - 0.5) * 1,
        z: (c1.z + c2.z) / 2 + (Math.random() - 0.5) * 0.5,
        size: Math.min(c1.size, c2.size) * 0.6,
        density: Math.min(c1.density, c2.density) * 0.5,
      });
    }
  }

  return clusters;
}

// Generate star point cloud from clusters (like spike Terrain.tsx)
function generateStarCloud(clusters: ClusterCenter[]): {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
} {
  const points: {
    x: number;
    y: number;
    z: number;
    intensity: number;
    size: number;
  }[] = [];

  for (const cluster of clusters) {
    const numStars = Math.floor(cluster.density * cluster.size * 60);

    for (let i = 0; i < numStars; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.random() * cluster.size;

      const x = cluster.x + Math.cos(angle) * dist;
      const z = cluster.z + Math.sin(angle) * dist * 0.6;

      if (Math.abs(x) > 16 || Math.abs(z) > 6) continue;

      const normDist = dist / cluster.size;
      const baseIntensity = (1 - normDist) * cluster.density;
      const intensity = baseIntensity * (0.3 + Math.random() * 0.7);
      const y = 0.1 + intensity * 0.4 + Math.random() * 0.15;

      let size: number;
      const sizeRoll = Math.random();
      if (sizeRoll > 0.98) size = 0.25 + Math.random() * 0.15;
      else if (sizeRoll > 0.9) size = 0.12 + Math.random() * 0.1;
      else if (sizeRoll > 0.6) size = 0.06 + Math.random() * 0.05;
      else size = 0.02 + Math.random() * 0.03;

      if (intensity > 0.7) size *= 1.3;

      points.push({ x, y, z, intensity, size });
    }
  }

  // Field stars
  for (let i = 0; i < 200; i++) {
    points.push({
      x: (Math.random() - 0.5) * 32,
      z: (Math.random() - 0.5) * 12,
      y: 0.05 + Math.random() * 0.1,
      intensity: 0.1 + Math.random() * 0.2,
      size: 0.015 + Math.random() * 0.025,
    });
  }

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

// Star shaders - individual sizes with flickering
const starVertexShader = `
  attribute float size;
  uniform float time;
  varying vec3 vColor;
  varying float vFlicker;

  // Pseudo-random based on position
  float rand(vec3 co) {
    return fract(sin(dot(co, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }

  void main() {
    vColor = color;

    // Each star gets unique flicker timing based on position
    float seed = rand(position);
    float flickerSpeed = 2.0 + seed * 3.0; // 2-5 Hz variation
    float flickerPhase = seed * 6.28318; // Random phase offset

    // Subtle flicker - floor at 0.75 so stars stay visible
    float flickerWave = 0.5 + 0.5 * sin(time * flickerSpeed + flickerPhase);
    vFlicker = 0.75 + 0.25 * flickerWave; // Range: 0.75 to 1.0

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const starFragmentShader = `
  varying vec3 vColor;
  varying float vFlicker;
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    // Soft falloff for star glow
    float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * vFlicker;
    gl_FragColor = vec4(vColor * vFlicker, alpha);
  }
`;

// Stars component
function Stars({ clusters }: { clusters: ClusterCenter[] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors, sizes } = useMemo(
    () => generateStarCloud(clusters),
    [clusters],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, colors, sizes]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.02) * 0.01;
    }
    // Update time uniform for flickering
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// Nebula shaders
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

// Nebula component
function Nebula({ clusters }: { clusters: ClusterCenter[] }) {
  const cloudTexture = useMemo(() => createCloudTexture(), []);

  const { positions, colors, sizes } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const siz: number[] = [];

    // Nebula colors - mostly cyan, very subtle purple accent
    const cyanColor = new THREE.Color("#00D9FF");
    const purpleColor = new THREE.Color("#3a2060");
    const darkColor = new THREE.Color("#010204");

    // Ambient nebula coverage - reduced count so stars show through
    const ambientClouds = 150;
    for (let i = 0; i < ambientClouds; i++) {
      const x = (Math.random() - 0.5) * 32;
      const z = (Math.random() - 0.5) * 12;
      const y = 0.02 + Math.random() * 0.1;

      pos.push(x, y, z);

      const color = new THREE.Color();
      // 90% cyan, only 10% get subtle purple
      if (Math.random() > 0.1) {
        color.lerpColors(darkColor, cyanColor, 0.06 + Math.random() * 0.08);
      } else {
        color.lerpColors(darkColor, purpleColor, 0.04 + Math.random() * 0.06);
      }
      col.push(color.r, color.g, color.b);

      // Larger particles for ambient coverage
      const sizeRoll = Math.random();
      let size: number;
      if (sizeRoll > 0.9) size = 15 + Math.random() * 20;
      else if (sizeRoll > 0.7) size = 8 + Math.random() * 8;
      else size = 3 + Math.random() * 5;
      siz.push(size);
    }

    // Denser nebula around data clusters - reduced count to prevent stacking
    for (const cluster of clusters) {
      const numClouds = Math.floor(cluster.density * cluster.size * 12);

      for (let i = 0; i < numClouds; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.random() * cluster.size * 1.5;

        const x = cluster.x + Math.cos(angle) * dist;
        const z = cluster.z + Math.sin(angle) * dist * 0.7;
        const y = 0.02 + Math.random() * 0.15;

        pos.push(x, y, z);

        // Same intensity as ambient - subtle purple accent
        const color = new THREE.Color();
        if (Math.random() > 0.1) {
          color.lerpColors(darkColor, cyanColor, 0.06 + Math.random() * 0.1);
        } else {
          color.lerpColors(darkColor, purpleColor, 0.04 + Math.random() * 0.06);
        }
        col.push(color.r, color.g, color.b);

        const sizeRoll = Math.random();
        let size: number;
        if (sizeRoll > 0.97) size = 20 + Math.random() * 15;
        else if (sizeRoll > 0.9) size = 10 + Math.random() * 8;
        else if (sizeRoll > 0.6) size = 4 + Math.random() * 4;
        else size = 1.5 + Math.random() * 2;
        siz.push(size);
      }
    }

    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
      sizes: new Float32Array(siz),
    };
  }, [clusters]);

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

// Floating particles
const PARTICLE_COUNT = 150;

function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 26;
      pos[i3 + 1] = Math.random() * 6 + 1;
      pos[i3 + 2] = (Math.random() - 0.5) * 7;

      vel[i3] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 1] = Math.random() * 0.02 + 0.01;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    return [pos, vel];
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame(() => {
    if (!pointsRef.current) return;

    const positionAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const posArray = positionAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      posArray[i3] += velocities[i3];
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2];

      if (posArray[i3 + 1] > 8) {
        posArray[i3] = (Math.random() - 0.5) * 26;
        posArray[i3 + 1] = 0.5;
        posArray[i3 + 2] = (Math.random() - 0.5) * 7;
      }
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.08}
        color="#00D9FF"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Axis labels - months along X, days along Z
const INTER_FONT =
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff";

function AxisLabels() {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Grid spans -14 to +14 on X (28 units), -4 to +4 on Z (8 units)
  const gridWidth = 28;
  const gridDepth = 8;

  return (
    <group>
      {/* Month labels along X-axis at front edge */}
      {months.map((month, i) => (
        <Text
          key={month}
          position={[
            (i / 11) * gridWidth - gridWidth / 2,
            -0.5,
            gridDepth / 2 + 1.2,
          ]}
          font={INTER_FONT}
          fontSize={0.5}
          color="#3a5060"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {month}
        </Text>
      ))}

      {/* Day labels along Z-axis at left edge */}
      {days.map((day, i) => (
        <Text
          key={day}
          position={[
            -gridWidth / 2 - 1.5,
            -0.5,
            (i / 6) * gridDepth - gridDepth / 2,
          ]}
          font={INTER_FONT}
          fontSize={0.4}
          color="#3a5060"
          anchorX="right"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {day}
        </Text>
      ))}
    </group>
  );
}

// Grid floor
function GridFloor() {
  return (
    <Grid
      position={[0, -0.5, 0]}
      args={[40, 40]}
      cellSize={1}
      cellThickness={0.6}
      cellColor="#1e2a38"
      sectionSize={5}
      sectionThickness={0.8}
      sectionColor="#151c24"
      fadeDistance={40}
      fadeStrength={1}
      infiniteGrid
    />
  );
}

// Horizontal-only camera panning
function HorizontalPan() {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const initialized = useRef(false);

  // Scroll to current month on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      // December = week ~50, maps to X ≈ 12
      const currentWeek = Math.ceil(
        (new Date().getTime() -
          new Date(new Date().getFullYear(), 0, 1).getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      );
      // Show current month on right side with some space, center ~6 weeks back
      const targetX = ((currentWeek - 26 - 8) / 52) * 28;
      camera.position.x = Math.max(-14, Math.min(14, targetX));
    }
  }, [camera]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastX.current = e.clientX;
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - lastX.current;
      lastX.current = e.clientX;
      // Move camera horizontally (negative because drag left = see right)
      camera.position.x -= deltaX * 0.02;
      // Clamp to grid bounds (-14 to +14)
      camera.position.x = Math.max(-14, Math.min(14, camera.position.x));
    };

    const onPointerUp = () => {
      isDragging.current = false;
      canvas.style.cursor = "grab";
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Scroll horizontally
      camera.position.x += e.deltaX * 0.01 + e.deltaY * 0.01;
      camera.position.x = Math.max(-14, Math.min(14, camera.position.x));
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [camera, gl]);

  return null;
}

// Day names for tooltip
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Invisible interaction zone for hover detection
function HoverZone({
  grid,
  onHover,
}: {
  grid: TerrainGrid;
  onHover: (state: HoverState | null) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    const { x, z } = e.point as THREE.Vector3;
    const cell = positionToCell(x, z, grid);

    if (cell) {
      onHover({
        cell,
        position: new THREE.Vector3(x, 0.5, z),
      });
    } else {
      onHover(null);
    }
  };

  const handlePointerLeave = () => {
    onHover(null);
  };

  return (
    <mesh
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <planeGeometry args={[GRID_WIDTH, GRID_DEPTH]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// Format date for tooltip display
function formatDate(isoDate: string): string {
  const date = new Date(isoDate + "T12:00:00"); // Add time to avoid timezone issues
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Build breakdown string with only non-zero counts
function formatBreakdown(
  cell: import("../lib/terrain-data").TerrainCell,
): string {
  const parts: string[] = [];
  if (cell.commits > 0)
    parts.push(`${cell.commits} commit${cell.commits > 1 ? "s" : ""}`);
  if (cell.tasks > 0)
    parts.push(`${cell.tasks} task${cell.tasks > 1 ? "s" : ""}`);
  if (cell.personal > 0) parts.push(`${cell.personal} personal`);
  return parts.join(" · ");
}

// Tooltip component using drei Html
function Tooltip({ hover }: { hover: HoverState }) {
  const { cell, position } = hover;
  const breakdown = formatBreakdown(cell);

  return (
    <Html
      position={[position.x, position.y + 0.5, position.z]}
      center
      style={{
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          background: "rgba(2, 3, 4, 0.9)",
          border: "1px solid #1e2a38",
          borderRadius: "4px",
          padding: "8px 12px",
          color: "#e0e0e0",
          fontSize: "13px",
          fontFamily: "Inter, system-ui, sans-serif",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ color: "#00D9FF", fontWeight: 500, marginBottom: "2px" }}>
          {formatDate(cell.date)}
        </div>
        {breakdown ? (
          <div style={{ fontSize: "12px" }}>{breakdown}</div>
        ) : (
          <div style={{ color: "#666", fontSize: "12px" }}>—</div>
        )}
      </div>
    </Html>
  );
}

// Scene component - manages hover state inside Canvas
function Scene({
  grid,
  clusters,
}: {
  grid: TerrainGrid;
  clusters: ClusterCenter[];
}) {
  const [hover, setHover] = useState<HoverState | null>(null);

  return (
    <>
      <color attach="background" args={["#020304"]} />
      <fog attach="fog" args={["#020304", 20, 50]} />

      <ambientLight intensity={0.05} />

      <GridFloor />
      <AxisLabels />
      <Nebula clusters={clusters} />
      <Stars clusters={clusters} />
      <HoverZone grid={grid} onHover={setHover} />
      {hover && <Tooltip hover={hover} />}

      <HorizontalPan />

      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// Main component
interface ActivityTerrainProps {
  grid: TerrainGrid;
  className?: string;
}

export function ActivityTerrain({ grid, className }: ActivityTerrainProps) {
  const clusters = useMemo(() => gridToClusters(grid), [grid]);

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{
          position: [0, 8, 10],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true }}
      >
        <Scene grid={grid} clusters={clusters} />
      </Canvas>
    </div>
  );
}

export default ActivityTerrain;
