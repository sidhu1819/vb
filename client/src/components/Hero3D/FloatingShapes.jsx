import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TorusKnot, Icosahedron, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

const ShapeWrapper = ({ children, index, type }) => {
  const ref = useRef();
  const { mouse, viewport } = useThree();
  
  const params = useMemo(() => {
    const r = 2.5 + Math.random() * 5.5; 
    const speed = (Math.random() * 0.5 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
    const offset = Math.random() * Math.PI * 2;
    const tiltFactor = Math.random() * 0.5 + 0.5;
    const rotSpeedX = Math.random() * 0.02 - 0.01;
    const rotSpeedY = Math.random() * 0.02 - 0.01;
    const rotSpeedZ = Math.random() * 0.02 - 0.01;
    return { r, speed, offset, tiltFactor, rotSpeedX, rotSpeedY, rotSpeedZ };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime();
    const { r, speed, offset, tiltFactor, rotSpeedX, rotSpeedY, rotSpeedZ } = params;
    
    let x = r * Math.cos(time * speed + offset);
    let y = r * Math.sin(time * speed * 0.7 + offset) * tiltFactor;
    let z = r * Math.sin(time * speed * 0.4 + offset) * 0.5;

    const mouseWorldX = (mouse.x * viewport.width) / 2;
    const mouseWorldY = (mouse.y * viewport.height) / 2;
    
    const dx = x - mouseWorldX;
    const dy = y - mouseWorldY;
    const distSq = dx*dx + dy*dy;
    
    if (distSq < 9) { 
      const dist = Math.sqrt(distSq);
      const force = (3 - dist) / 3;
      x += (dx / dist) * force * 1.5;
      y += (dy / dist) * force * 1.5;
    }

    ref.current.position.set(x, y, z);
    ref.current.rotation.x += rotSpeedX;
    ref.current.rotation.y += rotSpeedY;
    ref.current.rotation.z += rotSpeedZ;
  });

  return (
    <group ref={ref} name={`floating_shape_${index}`}>
      {children}
    </group>
  );
};

const ConnectionLines = ({ shapesRef }) => {
  const lineRef = useRef();
  const maxConnections = 20;

  useFrame(() => {
    if (!shapesRef.current || !lineRef.current) return;
    
    const children = shapesRef.current.children;
    const positions = [];
    let count = 0;

    for (let i = 0; i < children.length; i++) {
        for (let j = i + 1; j < children.length; j++) {
            if (count >= maxConnections) break;
            
            const objA = children[i];
            const objB = children[j];
            
            if (objA.name.startsWith('floating_shape_') && objB.name.startsWith('floating_shape_')) {
                const distSq = objA.position.distanceToSquared(objB.position);
                if (distSq < 25) { 
                    positions.push(
                        objA.position.x, objA.position.y, objA.position.z,
                        objB.position.x, objB.position.y, objB.position.z
                    );
                    count++;
                }
            }
        }
    }

    const geometry = lineRef.current.geometry;
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#00c6ff" transparent opacity={0.12} />
    </lineSegments>
  );
};

const FloatingShapes = () => {
  const shapesRef = useRef();
  const shapes = useMemo(() => {
    const items = [];
    
    // 4 TorusKnot
    for (let i = 0; i < 4; i++) {
      const size = 0.3 + Math.random() * 0.3;
      items.push(
        <ShapeWrapper key={`tk_${i}`} index={i} type="torus">
          <TorusKnot args={[size, size * 0.3, 64, 8]}>
            <meshBasicMaterial color={i % 2 === 0 ? '#00c6ff' : '#7b5ea7'} wireframe transparent opacity={0.35} />
          </TorusKnot>
        </ShapeWrapper>
      );
    }
    
    // 4 Icosahedron
    for (let i = 0; i < 4; i++) {
      const size = 0.3 + Math.random() * 0.2;
      items.push(
        <ShapeWrapper key={`ic_${i}`} index={i + 4} type="ico">
          <Icosahedron args={[size, 0]}>
            <meshBasicMaterial color="#00c6ff" wireframe transparent opacity={0.25} />
          </Icosahedron>
        </ShapeWrapper>
      );
    }
    
    // 4 Octahedron
    for (let i = 0; i < 4; i++) {
      const size = 0.25 + Math.random() * 0.2;
      items.push(
        <ShapeWrapper key={`oc_${i}`} index={i + 8} type="octa">
          <Octahedron args={[size, 0]}>
            <meshBasicMaterial color="#7b5ea7" wireframe transparent opacity={0.3} />
          </Octahedron>
        </ShapeWrapper>
      );
    }
    return items;
  }, []);

  return (
    <>
      <group ref={shapesRef}>
        {shapes}
      </group>
      <ConnectionLines shapesRef={shapesRef} />
    </>
  );
};

export default FloatingShapes;
