import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { Center, useTexture } from "@react-three/drei";
import {
  Box2,
  DoubleSide,
  LineSegments,
  Mesh,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
  type Group,
} from "three";
import { geoMercator } from "d3-geo";
import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import ShiftMaterial from "./shaderMaterial";
import GeoTrail from "./geoTrail";
import type { CityGeoJSON } from "@/types/map";
import ShapeBox from "./shape";
import FlyLine from "./flyLine";
import Boundary from "./boundary";
import Label from "./label";
import { activeCitySelector, useConfigStore } from "../stores";

import fjMap from "@/assets/fj_map.png";
import fjNormalMap from "@/assets/fj_normal_map.png";
import fjDisplacementMap from "@/assets/fj_displacement_map.png";
import Cones from "./cone";

export interface BaseProps {
  depth?: number;
  data: CityGeoJSON;
  outlineData?: CityGeoJSON;
  controls?: RefObject<{ target: Vector3; update: () => void } | null>;
}

export default function Base(props: BaseProps) {
  const { data, outlineData, depth = 1, controls } = props;
  const groupRef = useRef<Group>(null!);
  const camera = useThree((state) => state.camera);

  const projection = useMemo(() => {
    return geoMercator()
      .center(data.features[0].properties.centroid)
      .translate([0, 0]);
  }, [data]);

  const { regions, bbox, boundary } = useMemo(() => {
    const regions: {
      name: string;
      center: Vector3;
      points: Vector2[][];
    }[] = [];
    const bbox = new Box2();

    const toV2 = (coord: number[]) => {
      const [x, y] = projection(coord as [number, number])!;
      const projected = new Vector2(x, -y);
      bbox.expandByPoint(projected);
      return projected;
    };

    data.features.forEach((feature) => {
      const [x, y] = projection(
        feature.properties.centroid ?? feature.properties.center
      )!;

      const points = feature.geometry.coordinates.reduce<Vector2[][]>(
        (pre, cur) => [
          ...pre,
          ...cur.map<Vector2[]>((coordinates) => coordinates.map(toV2)),
        ],
        []
      );

      regions.push({
        name: feature.properties.name,
        center: new Vector3(x, -y),
        points,
      });
    });

    let boundary: Shape[] = [];

    outlineData?.features.forEach((feature) => {
      const points = feature.geometry.coordinates.map<Shape>((cur) => {
        return new Shape(
          cur.reduce<Vector2[]>(
            (pre, coordinates) => [...pre, ...coordinates.map(toV2)],
            []
          )
        );
      });

      boundary = boundary.concat(points);
    });

    return {
      regions,
      bbox,
      boundary,
    };
  }, [projection]);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    const tl = gsap.timeline();

    tl.to(camera.position, {
      x: 5.8,
      y: 4.8,
      z: 3.8,
      duration: 2.5,
      // delay: 2,
      ease: "circ.out",
      onComplete: () => {
        useConfigStore.setState({ mapPlayComplete: true });
      },
    });
    tl.to(groupRef.current.position, { x: 0, y: 0, z: 0, duration: 1 }, 2.5);

    tl.to(
      groupRef.current.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 1,
        ease: "circ.out",
      },
      2.5
    );
    groupRef.current.traverse((obj) => {
      if (obj instanceof Mesh || obj instanceof LineSegments) {
        tl.to(obj.material, { opacity: 1, duration: 1, ease: "circ.out" }, 2.5);
      }
    });

    return () => {
      tl.kill();
    };
  }, [camera]);

  // 点击城市后，相机平滑聚焦到该市；取消选择则回到全省概览视角。
  useEffect(() => {
    return useConfigStore.subscribe(
      (s) => s.selectedCity,
      (selectedCity) => {
        const ctrl = controls?.current;
        if (!ctrl || !groupRef.current) return;

        let target: Vector3;
        let camPos: { x: number; y: number; z: number };

        if (selectedCity) {
          const region = regions.find((r) => r.name === selectedCity);
          if (!region) return;
          groupRef.current.updateWorldMatrix(true, false);
          target = new Vector3(region.center.x, region.center.y, depth);
          groupRef.current.localToWorld(target);
          camPos = { x: target.x + 2.2, y: target.y + 2.8, z: target.z + 3.4 };
        } else {
          target = new Vector3(0, 0, 0);
          camPos = { x: 5.8, y: 4.8, z: 3.8 };
        }

        gsap.to(ctrl.target, {
          x: target.x,
          y: target.y,
          z: target.z,
          duration: 1,
          ease: "power2.inOut",
          onUpdate: () => ctrl.update(),
        });
        gsap.to(camera.position, {
          ...camPos,
          duration: 1,
          ease: "power2.inOut",
          onUpdate: () => ctrl.update(),
        });
      }
    );
  }, [regions, depth, camera, controls]);

  return (
    <Center top>
      <group
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[0.68, 0.68, 0.68]}
        position={[0, 0.2, 0]}>
        <group ref={groupRef} scale={[1, 1, 0]} position={[0, 0, -0.01]}>
          {regions.map((region, idx) => (
            <City
              key={region.name + idx}
              depth={depth}
              bbox={bbox}
              data={region}
            />
          ))}
          {outlineData && (
            <GeoTrail
              projection={projection}
              feature={outlineData.features[0]}
            />
          )}
          <Cones data={regions} />
          <FlyLine data={regions} />
          <Boundary data={boundary} />
        </group>
      </group>
    </Center>
  );
}

function City(props: {
  depth: number;
  bbox: Box2;
  data: {
    name: string;
    center: Vector3;
    points: Vector2[][];
  };
}) {
  const { bbox, data, depth } = props;
  const materialRef = useRef<ShaderMaterial>(null!);
  const groupRef = useRef<Group>(null!);
  const vector3 = useRef(new Vector3(1, 1, 1));

  const [texture, normalMap, displacementMap] = useTexture([
    fjMap,
    fjNormalMap,
    fjDisplacementMap,
  ]);

  const [shape, shapeGeometry] = useMemo(() => {
    const shapes = data.points.map((e) => new Shape(e));
    const shapeGeometry = new ShapeGeometry(shapes);
    return [shapes, shapeGeometry];
  }, [data.points]);

  useFrame((_, delta) => {
    groupRef.current.scale.lerp(vector3.current, 0.1);
    materialRef.current.uniforms.time.value += delta / 3;
  });

  // 跟随全局高亮城市：当前城市被高亮则抬升（z 放大），否则复位。
  useEffect(() => {
    const apply = (active: string | null) =>
      vector3.current.setZ(active === data.name ? 1.6 : 1);
    apply(activeCitySelector(useConfigStore.getState()));
    return useConfigStore.subscribe(activeCitySelector, apply);
  }, [data.name]);

  return (
    <object3D
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        useConfigStore.getState().setHoveredCity(data.name);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        useConfigStore.getState().setHoveredCity(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        useConfigStore.getState().setSelectedCity(data.name);
      }}
    >
      <ShapeBox bbox={bbox} args={[shape, { depth, bevelEnabled: false }]}>
        <meshStandardMaterial
          transparent
          attach="material-0"
          color="#dce8e1"
          map={texture}
          normalMap={normalMap}
          normalScale={new Vector2(0.35, 0.35)}
          displacementMap={displacementMap}
          displacementScale={0.02}
          metalness={0.2}
          roughness={0.7}
          side={DoubleSide}
          opacity={0}
        />
        <ShiftMaterial
          transparent
          attach="material-1"
          ref={materialRef}
          opacity={0}
          depth={depth}
          side={DoubleSide}
        />
      </ShapeBox>
      <lineSegments position={[0, 0, depth + 0.05]} raycast={() => null}>
        <edgesGeometry args={[shapeGeometry]} />
        <lineBasicMaterial transparent color="#ffffff" opacity={0} />
      </lineSegments>
      <Label
        center
        position={[data.center.x, data.center.y, depth + 0.2]}
        distanceFactor={10}
        zIndexRange={[100 - 1000]}>
        {data.name}
      </Label>
    </object3D>
  );
}
