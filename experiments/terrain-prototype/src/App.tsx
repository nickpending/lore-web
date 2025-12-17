import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Terrain, generateClusterCenters } from "./components/Terrain";
import { Particles } from "./components/Particles";
import { GridFloor } from "./components/GridFloor";
import { Nebula } from "./components/Nebula";

export default function App() {
  // Generate cluster centers ONCE and share between Terrain and Nebula
  const clusterCenters = useMemo(() => generateClusterCenters(), []);

  return (
    <Canvas
      camera={{
        position: [0, 20, 35],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#0a0e14"]} />
      <fog attach="fog" args={["#0a0e14", 40, 80]} />

      {/* Minimal lighting - let bloom do the work */}
      <ambientLight intensity={0.05} />

      <GridFloor />
      <Nebula clusterCenters={clusterCenters} />
      <Terrain clusterCenters={clusterCenters} />
      <Particles />

      {/* Bloom effect for galaxy glow */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>

      <OrbitControls
        enablePan={false}
        minDistance={15}
        maxDistance={60}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
