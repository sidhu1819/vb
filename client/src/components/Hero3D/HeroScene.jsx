import { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import VBText from './VBText';
import OrbitalRings from './OrbitalRings';
import FloatingShapes from './FloatingShapes';
import NebulaBackground from './NebulaBackground';

const Lights = () => {
  const light1Ref = useRef();
  const light2Ref = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (light1Ref.current) {
      light1Ref.current.position.x = Math.cos(time * 0.5) * 5;
      light1Ref.current.position.z = Math.sin(time * 0.5) * 5;
    }
    if (light2Ref.current) {
      light2Ref.current.position.x = Math.cos(time * 0.5 + Math.PI) * 5;
      light2Ref.current.position.z = Math.sin(time * 0.5 + Math.PI) * 5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#0a1a2e" />
      <pointLight ref={light1Ref} color="#00c6ff" intensity={2.5} distance={20} position={[5, 5, 5]} />
      <pointLight ref={light2Ref} color="#7b5ea7" intensity={2.0} distance={18} position={[-5, -3, 3]} />
      <rectAreaLight color="#ffffff" intensity={0.8} position={[0, 0, 8]} width={10} height={10} />
    </>
  );
};

const CameraRig = () => {
  const { camera, mouse } = useThree();
  useFrame(() => {
    const targetX = mouse.x * 1.5;
    const targetY = mouse.y * 1.0;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.03);
    camera.lookAt(0, 0, 0);
  });
  return null;
};

const ExplosionBurst = () => {
  const ref = useRef();
  const startTime = useRef(0);
  const count = 80;
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 6;
      temp.push({
        dir: new THREE.Vector3(
          Math.sin(angle1) * Math.cos(angle2),
          Math.sin(angle1) * Math.sin(angle2),
          Math.cos(angle1)
        ),
        speed,
      });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (startTime.current === 0) startTime.current = state.clock.getElapsedTime();
    const elapsed = state.clock.getElapsedTime() - startTime.current;
    
    if (elapsed > 1.5) {
      ref.current.visible = false;
      return;
    }

    ref.current.material.opacity = 1 - (elapsed / 1.5);

    particles.forEach((p, i) => {
      const dist = p.speed * elapsed * (1 - elapsed/3); 
      dummy.position.copy(p.dir).multiplyScalar(dist);
      const s = Math.max(0, 1 - (elapsed/1.5));
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color="#00c6ff" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
};

const HeroScene = ({ scrollYProgress }) => {
  const [clickCount, setClickCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-[#04060f]" onClick={() => setClickCount(c => c + 1)}>
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#04060f']} />
        <CameraRig />
        <Lights />
        
        <NebulaBackground scrollYProgress={scrollYProgress} />
        <OrbitalRings scrollYProgress={scrollYProgress} />
        <FloatingShapes />
        <VBText scrollYProgress={scrollYProgress} />
        
        {clickCount > 0 && <ExplosionBurst key={clickCount} />}

        {!isMobile && (
          <EffectComposer>
            <Bloom intensity={1.2} luminanceThreshold={0.15} luminanceSmoothing={0.9} radius={0.6} mipmapBlur />
            <Noise opacity={0.15} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default HeroScene;
