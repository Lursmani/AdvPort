import { useThree } from "@react-three/fiber";

export function BackdropPlane({ color }: { color: string }) {
  const { viewport } = useThree();

  return (
    <mesh position={[0, 0, -2.8]} renderOrder={-2}>
      <planeGeometry args={[viewport.width * 2.4, viewport.height * 2.4]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}
