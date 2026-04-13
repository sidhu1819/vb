import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center, CubeCamera } from '@react-three/drei';
import * as THREE from 'three';

const VBText = ({ scrollYProgress }) => {
  const groupRef = useRef();
  const textRef = useRef();
  const { mouse, viewport } = useThree();
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Page load animation (Y from -5 to 0)
    if (groupRef.current.position.y < 0) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.02);
    }

    // Floating bob
    const bob = Math.sin(time * 2) * 0.15;
    
    // Scale pulse
    const pulse = 1.0 + Math.sin(time * 1.5) * 0.02;

    const scrollVal = scrollYProgress?.get() || 0;
    const scrollScale = THREE.MathUtils.lerp(1, 0.3, scrollVal * 2);
    const scrollYOffset = scrollVal * 5;

    groupRef.current.scale.setScalar(pulse * scrollScale);
    groupRef.current.position.y = (groupRef.current.position.y < 0 ? groupRef.current.position.y : 0) + bob + scrollYOffset;
    
    // Base Rotation Y
    groupRef.current.rotation.y += 0.003;

    // Mouse tilt interaction (lerp 0.05, max +- 0.15 radians)
    if (textRef.current) {
      const targetRotationX = (mouse.y * viewport.height) / 100;
      const targetRotationY = (mouse.x * viewport.width) / 100;
      
      const clampedX = THREE.MathUtils.clamp(-targetRotationX, -0.15, 0.15);
      const clampedY = THREE.MathUtils.clamp(targetRotationY, -0.15, 0.15);
      
      textRef.current.rotation.x = THREE.MathUtils.lerp(textRef.current.rotation.x, clampedX, 0.05);
      textRef.current.rotation.y = THREE.MathUtils.lerp(textRef.current.rotation.y, clampedY, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[0, -5, 0]}>
      <CubeCamera resolution={256} frames={Infinity}>
        {(texture) => (
          <Center ref={textRef}>
            <Text3D
              font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
              size={2.5}
              height={0.6}
              curveSegments={12}
              bevelEnabled
              bevelThickness={0.04}
              bevelSize={0.03}
              bevelSegments={8}
            >
              VB
              <meshStandardMaterial
                color="#00c6ff"
                metalness={0.8}
                roughness={0.15}
                envMap={texture}
                emissive="#003344"
                emissiveIntensity={0.5}
                transparent
                opacity={Math.max(0, 1 - (scrollYProgress?.get() || 0) * 2)}
              />
            </Text3D>
          </Center>
        )}
      </CubeCamera>
    </group>
  );
};

export default VBText;
