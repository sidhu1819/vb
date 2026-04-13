import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CustomBlobMaterial = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color() }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      float glow = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
      float alpha = (0.08 + sin(time * 0.5) * 0.04) * glow;
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUv, center);
      float alphaMask = smoothstep(0.5, 0.0, dist);
      gl_FragColor = vec4(color, alpha * alphaMask);
    }
  `,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
};

const Blob = ({ color, position, scale, speed, scrollYProgress }) => {
  const mesh = useRef();
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color(color) }
  }), [color]);

  useFrame((state) => {
    uniforms.time.value = state.clock.getElapsedTime() * speed;
    if (mesh.current) {
        mesh.current.rotation.y += speed * 0.01;
        mesh.current.rotation.z += speed * 0.005;
        const scrollVal = scrollYProgress?.get() || 0;
        mesh.current.rotation.x = scrollVal * 3;
    }
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial attach="material" args={[CustomBlobMaterial]} uniforms={uniforms} />
    </mesh>
  );
};

const BackgroundParticles = () => {
  const pointsRef = useRef();
  
  const particleData = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    
    const colorCyan = new THREE.Color('#00c6ff');
    const colorPurple = new THREE.Color('#7b5ea7');

    for (let i = 0; i < count; i++) {
        const r = 5 + Math.random() * 15;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i*3+2] = r * Math.cos(phi) - 5;
        
        const c = Math.random() > 0.4 ? colorCyan : colorPurple;
        colors[i*3] = c.r;
        colors[i*3+1] = c.g;
        colors[i*3+2] = c.b;
        
        phases[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions, colors, phases };
  }, []);

  useFrame((state) => {
     if (!pointsRef.current) return;
     const time = state.clock.getElapsedTime();
     if (Math.floor(state.clock.elapsedTime * 60) % 2 !== 0) return;
     
     const positions = pointsRef.current.geometry.attributes.position.array;
     for (let i = 0; i < 2000; i++) {
         const phase = particleData.phases[i];
         positions[i*3+1] += Math.sin(time * 0.5 + phase) * 0.005;
     }
     pointsRef.current.geometry.attributes.position.needsUpdate = true;
     pointsRef.current.rotation.y = time * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={2000} array={particleData.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={2000} array={particleData.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} vertexColors transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

const NebulaBackground = ({ scrollYProgress }) => {
  return (
    <group>
      <BackgroundParticles />
      <Blob color="#00c6ff" position={[-8, 4, -10]} scale={8} speed={0.4} scrollYProgress={scrollYProgress} />
      <Blob color="#7b5ea7" position={[6, -6, -8]} scale={10} speed={0.5} scrollYProgress={scrollYProgress} />
      <Blob color="#005577" position={[0, 0, -15]} scale={12} speed={0.3} scrollYProgress={scrollYProgress} />
    </group>
  );
};

export default NebulaBackground;
