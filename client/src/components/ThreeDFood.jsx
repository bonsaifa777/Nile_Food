import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';

function FloatingBurger({ position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef} castShadow receiveShadow>
          <torusGeometry args={[1.2, 0.5, 32, 32]} />
          <MeshDistortMaterial
            color="#f59e0b"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>
    </group>
  );
}

function FloatingSphere({ position, color, scale = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.005;
    }
  });

  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
        <mesh ref={meshRef} scale={scale} castShadow>
          <sphereGeometry args={[0.6, 64, 64]} />
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.4}
            speed={3}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </Float>
    </group>
  );
}

function FloatingTorus({ position, color, scale = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1}>
        <mesh ref={meshRef} scale={scale} castShadow>
          <torusGeometry args={[0.5, 0.2, 16, 100]} />
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.5}
            speed={2}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>
      </Float>
    </group>
  );
}

function FloatingCylinder({ position, color, scale = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group position={position}>
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh ref={meshRef} scale={scale} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.2, 32]} />
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.35}
            speed={2.5}
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>
      </Float>
    </group>
  );
}

function Scene({ complexity = 'high' }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#6366f1" />
      <pointLight position={[5, -3, 5]} intensity={0.6} color="#a855f7" />
      
      <FloatingBurger position={[0, 0.5, 0]} />
      
      {complexity !== 'low' && (
        <>
          <FloatingSphere position={[-2, 1.5, -1]} color="#6366f1" scale={0.8} />
          <FloatingSphere position={[2.5, -1, -0.5]} color="#4f46e5" scale={0.6} />
          <FloatingTorus position={[-1.5, -1.5, 0.5]} color="#818cf8" scale={0.7} />
          <FloatingTorus position={[1.8, 1.8, -1]} color="#a5b4fc" scale={0.5} />
        </>
      )}
      
      {complexity === 'high' && (
        <>
          <FloatingCylinder position={[-2.5, 0, 1]} color="#3730a3" scale={0.6} />
          <FloatingSphere position={[3, 0.5, 1]} color="#c7d2fe" scale={0.4} />
          <FloatingTorus position={[0, -2, 1.5]} color="#6366f1" scale={0.4} />
        </>
      )}
      
      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={5}
      />
      
      <Environment preset="city" />
    </>
  );
}

export default function ThreeDFood({ className = '', complexity = 'high' }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-950 dark:to-slate-900 rounded-3xl">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ touchAction: 'none' }}
        onCreated={() => setIsLoading(false)}
        shadows
      >
        <Scene complexity={complexity} />
      </Canvas>
    </motion.div>
  );
}
