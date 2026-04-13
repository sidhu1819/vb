import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Ring = ({ count, radius, color, size, speed, tiltX, scrollYProgress }) => {
  const meshRef = useRef();
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 0.6;
      temp.push({ t, z, speed, radius });
    }
    return temp;
  }, [count, radius, speed]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const scrollVal = scrollYProgress?.get() || 0;
    
    const currentTiltX = THREE.MathUtils.degToRad(tiltX) + scrollVal * 2;
    if (meshRef.current) meshRef.current.rotation.x = currentTiltX;
    
    particles.forEach((p, i) => {
      const currentT = p.t + time * p.speed * 60;
      const x = Math.cos(currentT) * p.radius;
      const y = Math.sin(currentT) * p.radius;
      
      dummy.position.set(x, y, p.z);
      dummy.updateMatrix();
      if (meshRef.current) meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    if (meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={color === '#ffffff' ? 0.4 : 1.0}
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </instancedMesh>
  );
};

const OrbitalRings = ({ scrollYProgress }) => {
  return (
    <group>
      <Ring count={300} radius={3.5} color="#00c6ff" size={0.04} speed={0.008} tiltX={15} scrollYProgress={scrollYProgress} />
      <Ring count={200} radius={5.5} color="#7b5ea7" size={0.03} speed={-0.005} tiltX={45} scrollYProgress={scrollYProgress} />
      <Ring count={150} radius={7.5} color="#ffffff" size={0.02} speed={0.003} tiltX={75} scrollYProgress={scrollYProgress} />
    </group>
  );
};

export default OrbitalRings;
