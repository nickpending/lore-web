import { Grid } from "@react-three/drei";

export function GridFloor() {
  return (
    <Grid
      position={[0, -0.5, 0]}
      args={[40, 40]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#1a2030"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#2a3545"
      fadeDistance={40}
      fadeStrength={1}
      infiniteGrid
    />
  );
}
