"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight three.js hero object: a noise-displaced icosahedron with a
 * wireframe shell and an orbiting particle ring.
 *
 * Performance guards:
 *  - three.js is imported dynamically after the browser is idle, so it never
 *    competes with the LCP text.
 *  - Only mounted on wide, non-reduced-motion screens (see Hero).
 *  - Renders only while visible and the tab is active; DPR capped at 1.75.
 */

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying float vNoise;
  varying vec3 vNormal;

  // Cheap 3D value noise
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    float n = noise(normal * 2.2 + uTime * 0.35);
    vNoise = n;
    vNormal = normalize(normalMatrix * normal);
    vec3 displaced = position + normal * (n * 0.28);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying float vNoise;
  varying vec3 vNormal;

  void main() {
    vec3 violet = vec3(0.576, 0.510, 1.0);
    vec3 teal = vec3(0.306, 0.804, 0.769);
    vec3 color = mix(violet, teal, smoothstep(0.25, 0.85, vNoise));
    float fresnel = pow(1.0 - abs(vNormal.z), 2.0);
    gl_FragColor = vec4(color * (0.35 + fresnel * 0.9), 0.55 + fresnel * 0.45);
  }
`;

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const start = async () => {
      const THREE = await import("three");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 6);

      const group = new THREE.Group();
      scene.add(group);

      const uniforms = { uTime: { value: 0 } };
      const coreGeometry = new THREE.IcosahedronGeometry(1.35, 24);
      const coreMaterial = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      group.add(core);

      const shellGeometry = new THREE.IcosahedronGeometry(1.85, 1);
      const shellMaterial = new THREE.MeshBasicMaterial({
        color: 0x9382ff,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      });
      const shell = new THREE.Mesh(shellGeometry, shellMaterial);
      group.add(shell);

      const RING_COUNT = 420;
      const ringPositions = new Float32Array(RING_COUNT * 3);
      for (let i = 0; i < RING_COUNT; i++) {
        const angle = (i / RING_COUNT) * Math.PI * 2;
        const radius = 2.5 + (Math.random() - 0.5) * 0.35;
        ringPositions[i * 3] = Math.cos(angle) * radius;
        ringPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
        ringPositions[i * 3 + 2] = Math.sin(angle) * radius;
      }
      const ringGeometry = new THREE.BufferGeometry();
      ringGeometry.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
      const ringMaterial = new THREE.PointsMaterial({
        color: 0x4ecdc4,
        size: 0.03,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Points(ringGeometry, ringMaterial);
      ring.rotation.x = 1.15;
      ring.rotation.z = 0.3;
      group.add(ring);

      const resize = () => {
        const { clientWidth, clientHeight } = container;
        if (!clientWidth || !clientHeight) return;
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      const pointer = { x: 0, y: 0 };
      const onPointerMove = (event: PointerEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clock = new THREE.Clock();
      let frameId = 0;
      let visible = true;

      const renderFrame = () => {
        const elapsed = clock.getElapsedTime();
        uniforms.uTime.value = elapsed;
        core.rotation.y = elapsed * 0.15;
        shell.rotation.y = -elapsed * 0.08;
        shell.rotation.x = elapsed * 0.05;
        ring.rotation.y = elapsed * 0.12;
        group.rotation.x += (pointer.y * 0.25 - group.rotation.x) * 0.05;
        group.rotation.y += (pointer.x * 0.35 - group.rotation.y) * 0.05;
        renderer.render(scene, camera);
      };

      const loop = () => {
        renderFrame();
        frameId = requestAnimationFrame(loop);
      };

      const play = () => {
        if (reducedMotion || frameId || !visible || document.hidden) return;
        clock.start();
        frameId = requestAnimationFrame(loop);
      };
      const pause = () => {
        cancelAnimationFrame(frameId);
        frameId = 0;
      };

      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) play();
        else pause();
      });
      visibilityObserver.observe(container);

      const onVisibilityChange = () => (document.hidden ? pause() : play());
      document.addEventListener("visibilitychange", onVisibilityChange);

      renderFrame();
      play();
      setReady(true);

      cleanup = () => {
        pause();
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        coreGeometry.dispose();
        coreMaterial.dispose();
        shellGeometry.dispose();
        shellMaterial.dispose();
        ringGeometry.dispose();
        ringMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    const hasIdleCallback = typeof window.requestIdleCallback === "function";
    const begin = () => {
      start().catch((error) => console.error("Hero 3D scene failed to start:", error));
    };
    const idleId = hasIdleCallback
      ? window.requestIdleCallback(begin, { timeout: 1500 })
      : setTimeout(begin, 300);

    return () => {
      disposed = true;
      if (hasIdleCallback) window.cancelIdleCallback(idleId as number);
      else clearTimeout(idleId);
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`hero-scene ${ready ? "hero-scene--ready" : ""}`}
      aria-hidden="true"
    />
  );
}
