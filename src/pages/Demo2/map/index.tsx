import { Suspense, useRef, type ComponentRef } from "react";
import styled from "styled-components";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Lights from "./lights";
import Mirror from "./mirror";
import Base from "./base";
import Bottom from "./bottom";
import BeamLight from "./beamLight";
import type { CityGeoJSON } from "@/types/map";

import fjMapData from "@/assets/fj.json";
import fjOutlineData from "@/assets/fj_outline.json";

const mapData = fjMapData as CityGeoJSON,
  outlineData = fjOutlineData as CityGeoJSON;

const CanvasWrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

export default function Map() {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls> | null>(null);

  return (
    <CanvasWrapper>
      <Canvas
        camera={{
          fov: 70,
          position: [8.5, 10, 6.5],
        }}
        dpr={[1, 2]}>
        <fog attach="fog" args={["#000000", 10, 30]} />
        <color attach="background" args={["#000000"]} />
        <Lights />
        <Suspense fallback={null}>
          <Base data={mapData} outlineData={outlineData} controls={controlsRef} />
        </Suspense>
        <Bottom />
        <Mirror />
        <BeamLight />
        <OrbitControls
          ref={controlsRef}
          enableDamping
          zoomSpeed={0.3}
          minDistance={2.4}
          maxDistance={24}
          maxPolarAngle={1.5}
        />
      </Canvas>
    </CanvasWrapper>
  );
}
