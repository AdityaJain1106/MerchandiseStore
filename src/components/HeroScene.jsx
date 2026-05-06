import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

const ParticleRing = () => {
  const points = useRef();

  // Generate particles on a ring
  const particles = useMemo(() => {
    const p = new Float32Array(3000);
    for (let i = 0; i < 1000; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      const r = 5 + Math.random() * 2;
      
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;
    }
    return p;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      points.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#38bdf8" sizeAttenuation transparent opacity={0.6} />
    </points>
  );
};

const HeroScene = () => {
  return (
    <div className="absolute inset-0 z-0 h-full w-full bg-brand-dark">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#040f2a']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#38bdf8" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#f97316" />

        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <ParticleRing />
        </Float>
      </Canvas>
    </div>
  );
};

export default HeroScene;
