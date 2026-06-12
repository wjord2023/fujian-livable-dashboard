import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import styled from "styled-components";
import { Center, useTexture } from "@react-three/drei";
import {
  Box2,
  DoubleSide,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
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
import { useConfigStore } from "../stores";
import { cityAtYear, indexColorAt, yearIndexDomain } from "../data";

const SELECTED_RISE_MIN = 1.8;
const SELECTED_RISE_MAX = 3.2;
const HOVER_RISE_MIN = 1.22;
const HOVER_RISE_MAX = 1.55;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const scoreRatioAt = (city: string, year: number) => {
  const score = cityAtYear(city, year)?.index;
  if (typeof score !== "number") return 0;

  const { min, max } = yearIndexDomain(year);
  return max > min ? clamp01((score - min) / (max - min)) : 0.5;
};

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

// 地图城市标签：城市名 + 当前年份的绿色宜居指数（数值颜色随分数深浅变化）。
const CityTag = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 1px 8px;
  border-radius: 9px;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  background: rgba(6, 20, 16, 0.55);
  border: 1px solid rgba(95, 227, 184, 0.32);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);

  b {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
`;

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
  const capRef = useRef<MeshStandardMaterial>(null!);
  const groupRef = useRef<Group>(null!);
  const vector3 = useRef(new Vector3(1, 1, 1));
  const [score, setScore] = useState(
    () => cityAtYear(data.name, useConfigStore.getState().year)?.index ?? 0
  );
  const [tagColor, setTagColor] = useState(() =>
    indexColorAt(score, useConfigStore.getState().year)
  );

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

  // 抬升高度：点击选中→按当前年份指数高低拉伸；悬停→同样按分数轻微抬起；其余复位。
  // 选中态使用更大的高度区间，让城市分数和视觉高度形成正相关。
  useEffect(() => {
    const targetZ = (s: {
      selectedCity: string | null;
      hoveredCity: string | null;
      year: number;
    }) => {
      const scoreRatio = scoreRatioAt(data.name, s.year);
      if (s.selectedCity === data.name) {
        return lerp(SELECTED_RISE_MIN, SELECTED_RISE_MAX, scoreRatio);
      }
      if (s.hoveredCity === data.name) {
        return lerp(HOVER_RISE_MIN, HOVER_RISE_MAX, scoreRatio);
      }
      return 1;
    };
    const apply = (z: number) => vector3.current.setZ(z);
    apply(targetZ(useConfigStore.getState()));
    return useConfigStore.subscribe(targetZ, apply);
  }, [data.name]);

  // 按当前年份的绿色宜居指数给城市着色（同年内分数越高越亮绿、越低越暗），并刷新标签分数。
  useEffect(() => {
    const apply = (year: number) => {
      const d = cityAtYear(data.name, year);
      if (!d) return;
      setScore(d.index);
      const color = indexColorAt(d.index, year);
      setTagColor(color);
      capRef.current?.color.set(color);
      if (materialRef.current) {
        materialRef.current.uniforms.baseTopColor.value.set(color);
        materialRef.current.uniforms.scanColor.value.set(
          indexColorAt(d.index + 10, year)
        );
      }
    };
    apply(useConfigStore.getState().year);
    return useConfigStore.subscribe((s) => s.year, apply);
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
          ref={capRef}
          transparent
          attach="material-0"
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
        <CityTag>
          <span>{data.name}</span>
          <b style={{ color: tagColor }}>{score}</b>
        </CityTag>
      </Label>
    </object3D>
  );
}
