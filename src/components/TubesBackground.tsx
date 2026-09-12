import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { cn, randomHexColor } from '../lib/utils';

export interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  enableClickInteraction?: boolean;
  tubeColors?: string[];
  lightsColors?: string[];
  intensity?: number;
  onRandomize?: (palette: { tubes: string[]; lights: string[] }) => void;
}

export interface TubesBackgroundRef {
  randomize: () => void;
  setColors: (tubeColors: string[], lightsColors?: string[]) => void;
  setIntensity: (val: number) => void;
}

export const TubesBackground = forwardRef<TubesBackgroundRef, TubesBackgroundProps>(
  (
    {
      children,
      className,
      enableClickInteraction = true,
      tubeColors = ['#f967fb', '#53bc28', '#6958d5'],
      lightsColors = ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'],
      intensity = 200,
      onRandomize,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const tubesAppRef = useRef<any>(null);
    const isCustomFallbackRef = useRef<boolean>(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Imperative API
    const randomize = () => {
      const newTubes = [randomHexColor(), randomHexColor(), randomHexColor()];
      const newLights = [randomHexColor(), randomHexColor(), randomHexColor(), randomHexColor()];

      if (tubesAppRef.current?.tubes?.setColors) {
        tubesAppRef.current.tubes.setColors(newTubes);
      }
      if (tubesAppRef.current?.tubes?.setLightsColors) {
        tubesAppRef.current.tubes.setLightsColors(newLights);
      }
      if (onRandomize) {
        onRandomize({ tubes: newTubes, lights: newLights });
      }
    };

    const setColors = (newTubes: string[], newLights?: string[]) => {
      if (tubesAppRef.current?.tubes?.setColors) {
        tubesAppRef.current.tubes.setColors(newTubes);
      }
      if (newLights && tubesAppRef.current?.tubes?.setLightsColors) {
        tubesAppRef.current.tubes.setLightsColors(newLights);
      }
    };

    const setIntensity = (val: number) => {
      if (tubesAppRef.current?.tubes?.lights) {
        tubesAppRef.current.tubes.lights.intensity = val;
      }
    };

    useImperativeHandle(ref, () => ({
      randomize,
      setColors,
      setIntensity,
    }));

    // Initialize Tubes
    useEffect(() => {
      let mounted = true;
      let cleanup: (() => void) | undefined;

      const initTubes = async () => {
        if (!canvasRef.current) return;

        try {
          // Dynamic import from CDN
          // @ts-ignore
          const module = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
          const TubesCursor = module.default;

          if (!mounted || !canvasRef.current) return;

          const app = TubesCursor(canvasRef.current, {
            tubes: {
              colors: tubeColors,
              lights: {
                intensity: intensity,
                colors: lightsColors,
              },
            },
          });

          tubesAppRef.current = app;
          setIsLoaded(true);

          const handleResize = () => {
            if (tubesAppRef.current?.resize) {
              tubesAppRef.current.resize();
            }
          };

          window.addEventListener('resize', handleResize);

          cleanup = () => {
            window.removeEventListener('resize', handleResize);
            if (tubesAppRef.current?.destroy) {
              try {
                tubesAppRef.current.destroy();
              } catch (e) {
                // Ignore cleanup errors
              }
            }
            tubesAppRef.current = null;
          };
        } catch (error) {
          console.warn('CDN TubesCursor load notice, initializing Three.js WebGL fallback:', error);
          if (!mounted || !canvasRef.current) return;

          // Three.js fallback implementation
          isCustomFallbackRef.current = true;
          const canvas = canvasRef.current;
          const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(
            45,
            (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight),
            0.1,
            1000
          );
          camera.position.z = 50;

          // Create multiple smooth interactive curves
          const tubeMeshes: THREE.Mesh[] = [];
          const numTubes = 3;
          const pointsCount = 30;

          const mouseTrail: THREE.Vector3[] = [];
          for (let i = 0; i < pointsCount; i++) {
            mouseTrail.push(new THREE.Vector3(0, 0, 0));
          }

          let targetX = 0;
          let targetY = 0;

          tubeColors.forEach((color, idx) => {
            const curve = new THREE.CatmullRomCurve3(mouseTrail.map((p) => p.clone()));
            const geometry = new THREE.TubeGeometry(curve, 64, 0.8 + idx * 0.2, 12, false);
            const material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(color),
              emissive: new THREE.Color(color),
              emissiveIntensity: 0.8,
              roughness: 0.2,
              metalness: 0.8,
            });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            tubeMeshes.push(mesh);
          });

          // Lights
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
          scene.add(ambientLight);

          const pointLights: THREE.PointLight[] = lightsColors.map((color, i) => {
            const light = new THREE.PointLight(color, intensity / 50, 100);
            light.position.set((i - 1.5) * 20, (i % 2 === 0 ? 1 : -1) * 15, 20);
            scene.add(light);
            return light;
          });

          const onPointerMove = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            targetX = ((clientX - rect.left) / rect.width) * 60 - 30;
            targetY = -(((clientY - rect.top) / rect.height) * 40 - 20);
          };

          window.addEventListener('mousemove', onPointerMove);
          window.addEventListener('touchmove', onPointerMove);

          let animationFrameId: number;
          let clock = new THREE.Clock();

          const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            // Interpolate head
            const head = mouseTrail[0];
            head.x += (targetX - head.x) * 0.15;
            head.y += (targetY - head.y) * 0.15;

            // Follow trail
            for (let i = 1; i < pointsCount; i++) {
              const prev = mouseTrail[i - 1];
              const curr = mouseTrail[i];
              curr.x += (prev.x - curr.x) * 0.45;
              curr.y += (prev.y - curr.y) * 0.45;
              curr.z = Math.sin(time * 3 + i * 0.2) * 5;
            }

            // Update tube geometries
            tubeMeshes.forEach((mesh, idx) => {
              const offsetTrail = mouseTrail.map((p, i) => {
                const angle = time * 2 + idx * (Math.PI * 2 / numTubes) + i * 0.1;
                const radius = (1 - i / pointsCount) * (1.5 + idx);
                return new THREE.Vector3(
                  p.x + Math.cos(angle) * radius,
                  p.y + Math.sin(angle) * radius,
                  p.z + (idx - 1) * 2
                );
              });

              const curve = new THREE.CatmullRomCurve3(offsetTrail);
              mesh.geometry.dispose();
              mesh.geometry = new THREE.TubeGeometry(curve, 60, 0.7 + idx * 0.2, 10, false);
            });

            // Pulse lights
            pointLights.forEach((light, i) => {
              light.position.x = Math.sin(time * 1.5 + i) * 25;
              light.position.y = Math.cos(time * 1.2 + i) * 20;
            });

            renderer.render(scene, camera);
          };

          animate();
          setIsLoaded(true);

          const handleResize = () => {
            const width = canvas.clientWidth || window.innerWidth;
            const height = canvas.clientHeight || window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          };

          window.addEventListener('resize', handleResize);

          cleanup = () => {
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
          };
        }
      };

      initTubes();

      return () => {
        mounted = false;
        if (cleanup) cleanup();
      };
    }, []);

    // Sync external props changes
    useEffect(() => {
      if (tubesAppRef.current?.tubes?.setColors) {
        tubesAppRef.current.tubes.setColors(tubeColors);
      }
      if (tubesAppRef.current?.tubes?.setLightsColors) {
        tubesAppRef.current.tubes.setLightsColors(lightsColors);
      }
    }, [tubeColors, lightsColors]);

    const handleClick = (e: React.MouseEvent) => {
      if (!enableClickInteraction) return;
      // Don't trigger if clicked on an interactive UI control inside children
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea, [data-interactive="true"]')) {
        return;
      }
      randomize();
    };

    return (
      <div
        ref={containerRef}
        className={cn('relative w-full h-full min-h-[400px] overflow-hidden bg-black select-none', className)}
        onClick={handleClick}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block cursor-crosshair"
          style={{ touchAction: 'none' }}
        />

        {/* Ambient Subtle Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full pointer-events-none">
          {children}
        </div>
      </div>
    );
  }
);

TubesBackground.displayName = 'TubesBackground';
export default TubesBackground;
