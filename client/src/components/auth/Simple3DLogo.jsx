import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center, Float, Stars } from '@react-three/drei';
import { useRef } from 'react';

const Logo = () => {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Center ref={ref}>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={2} height={0.2} curveSegments={12} bevelEnabled bevelThickness={0.02} bevelSize={0.02}
        >
          VB
          <meshStandardMaterial color="#00c6ff" metalness={0.8} roughness={0.2} emissive="#003344" />
        </Text3D>
      </Center>
    </Float>
  );
};

export const Simple3DLogo = () => {
  return (
    <div className="w-full h-full absolute inset-0 bg-[#04060f]">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#00c6ff" intensity={2} />
        <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        <Logo />
      </Canvas>
    </div>
  );
};
