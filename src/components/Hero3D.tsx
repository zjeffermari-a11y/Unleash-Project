import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Stars, Sparkles } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mouse, viewport } = useThree();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      
      // Subtle mouse interaction
      const targetX = (mouse.x * viewport.width) / 10;
      const targetY = (mouse.y * viewport.height) / 10;
      
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} scale={1.8}>
        <MeshDistortMaterial 
          color="#050505"
          emissive="#f59e0b"
          emissiveIntensity={0.15}
          distort={0.4} 
          speed={2} 
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>
    </Float>
  );
}

function SecondarySphere({ position, scale, color, speed, distort, offset = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mouse, viewport } = useThree();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      
      // Parallax effect based on mouse
      const targetX = position[0] + (mouse.x * viewport.width) / (10 * offset);
      const targetY = position[1] + (mouse.y * viewport.height) / (10 * offset);
      
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={2} floatIntensity={3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial 
          color="#050505"
          emissive={color}
          emissiveIntensity={0.3}
          distort={distort} 
          speed={speed} 
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-auto">
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={2} color="#f59e0b" />
          <directionalLight position={[-10, -10, -5]} intensity={1} color="#ef4444" />
          <spotLight position={[0, 5, 0]} intensity={2} color="#ffffff" penumbra={1} />
          
          {/* Main Centerpiece */}
          <AnimatedSphere />
          
          {/* Orbiting/Floating Elements */}
          <SecondarySphere position={[-3, 2, -2]} scale={0.6} color="#ef4444" speed={3} distort={0.5} offset={1.5} />
          <SecondarySphere position={[3, -2, -1]} scale={0.8} color="#f59e0b" speed={2.5} distort={0.6} offset={1.2} />
          <SecondarySphere position={[-2, -3, -3]} scale={0.5} color="#ffffff" speed={4} distort={0.3} offset={2} />
          <SecondarySphere position={[4, 2, -4]} scale={0.7} color="#ea580c" speed={2} distort={0.4} offset={1.8} />

          {/* Particles and Stars */}
          <Sparkles count={150} scale={15} size={3} speed={0.5} opacity={0.4} color="#f59e0b" />
          <Sparkles count={50} scale={10} size={2} speed={0.2} opacity={0.2} color="#ef4444" />
          <Stars radius={50} depth={50} count={4000} factor={4} saturation={0} fade speed={1.5} />
        </Canvas>
      </Suspense>
    </div>
  );
}
