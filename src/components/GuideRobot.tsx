'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { RobotMood } from '@/types/robot';

const MOOD_COLORS: Record<RobotMood, { eye: number; glow: number; antenna: number }> = {
  welcome: { eye: 0x39ff14, glow: 0x39ff14, antenna: 0x39ff14 },
  curious: { eye: 0x5aff3a, glow: 0x2d8a2d, antenna: 0x39ff14 },
  focused: { eye: 0x39ff14, glow: 0x1a6b1a, antenna: 0x39ff14 },
  excited: { eye: 0xffb000, glow: 0xffb000, antenna: 0xffb000 },
  proud: { eye: 0x39ff14, glow: 0x39ff14, antenna: 0x5aff3a },
  celebrate: { eye: 0xffb000, glow: 0x39ff14, antenna: 0xffb000 },
};

interface GuideRobotProps {
  mood: RobotMood;
  isSpeaking?: boolean;
}

function GuideRobot({ mood, isSpeaking = false }: GuideRobotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef(mood);
  const speakingRef = useRef(isSpeaking);

  moodRef.current = mood;
  speakingRef.current = isSpeaking;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.2);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xc8e6c8, 0.35));

    const keyLight = new THREE.DirectionalLight(0x39ff14, 1.2);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffb000, 0.4);
    rimLight.position.set(-3, 1, -2);
    scene.add(rimLight);

    const robot = new THREE.Group();
    scene.add(robot);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0d140d,
      metalness: 0.6,
      roughness: 0.35,
      emissive: 0x0a100a,
      emissiveIntensity: 0.15,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a1e,
      metalness: 0.7,
      roughness: 0.3,
    });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.7), bodyMat);
    body.position.y = -0.15;
    robot.add(body);

    const chestPanel = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.08), accentMat);
    chestPanel.position.set(0, -0.05, 0.36);
    robot.add(chestPanel);

    const chestGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.12, 16),
      new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.8 }),
    );
    chestGlow.position.set(0, -0.05, 0.41);
    robot.add(chestGlow);

    const head = new THREE.Group();
    head.position.y = 0.85;
    robot.add(head);

    head.add(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.75, 0.75), bodyMat));

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.28, 0.1),
      new THREE.MeshStandardMaterial({
        color: 0x050805,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x1a6b1a,
        emissiveIntensity: 0.3,
      }),
    );
    visor.position.set(0, 0.05, 0.38);
    head.add(visor);

    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const leftEyeMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
    const rightEyeMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
    const leftEye = new THREE.Mesh(eyeGeo, leftEyeMat);
    const rightEye = new THREE.Mesh(eyeGeo, rightEyeMat);
    leftEye.position.set(-0.18, 0.05, 0.42);
    rightEye.position.set(0.18, 0.05, 0.42);
    head.add(leftEye, rightEye);

    const antenna = new THREE.Group();
    antenna.position.y = 0.45;
    head.add(antenna);

    const antennaStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.04, 0.35, 8),
      accentMat,
    );
    antennaStem.position.y = 0.18;
    antenna.add(antennaStem);

    const antennaBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.9 }),
    );
    antennaBulb.position.y = 0.4;
    antenna.add(antennaBulb);

    const armGeo = new THREE.BoxGeometry(0.22, 0.7, 0.22);
    const leftArm = new THREE.Group();
    const rightArm = new THREE.Group();
    leftArm.position.set(-0.72, 0.15, 0);
    rightArm.position.set(0.72, 0.15, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, bodyMat);
    const rightArmMesh = new THREE.Mesh(armGeo, bodyMat);
    leftArmMesh.position.y = -0.25;
    rightArmMesh.position.y = -0.25;
    leftArm.add(leftArmMesh);
    rightArm.add(rightArmMesh);
    robot.add(leftArm, rightArm);

    const legGeo = new THREE.BoxGeometry(0.28, 0.55, 0.3);
    const leftLeg = new THREE.Mesh(legGeo, accentMat);
    const rightLeg = new THREE.Mesh(legGeo, accentMat);
    leftLeg.position.set(-0.3, -1.0, 0);
    rightLeg.position.set(0.3, -1.0, 0);
    robot.add(leftLeg, rightLeg);

    const floorRing = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.15, 48),
      new THREE.MeshBasicMaterial({
        color: 0x39ff14,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      }),
    );
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = -1.35;
    robot.add(floorRing);

    const particles: THREE.Mesh[] = [];
    const particleGroup = new THREE.Group();
    robot.add(particleGroup);

    for (let i = 0; i < 12; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0 }),
      );
      p.position.set(
        (Math.random() - 0.5) * 2.5,
        Math.random() * 2,
        (Math.random() - 0.5) * 1.5,
      );
      particleGroup.add(p);
      particles.push(p);
    }

    let currentMood = moodRef.current;
    let blinkTimer = 0;
    let isBlinking = false;
    let raf = 0;
    const clock = new THREE.Clock();

    const applyMood = (m: RobotMood) => {
      const colors = MOOD_COLORS[m];
      leftEyeMat.color.setHex(colors.eye);
      rightEyeMat.color.setHex(colors.eye);
      (antennaBulb.material as THREE.MeshBasicMaterial).color.setHex(colors.antenna);
      (chestGlow.material as THREE.MeshBasicMaterial).color.setHex(colors.glow);
      bodyMat.emissive.setHex(colors.glow);
      bodyMat.emissiveIntensity = m === 'celebrate' ? 0.35 : 0.15;
    };

    applyMood(currentMood);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    const moodTilt: Record<RobotMood, number> = {
      welcome: 0.05,
      curious: -0.12,
      focused: 0,
      excited: 0.15,
      proud: -0.05,
      celebrate: 0.2,
    };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const delta = clock.getDelta();

      if (moodRef.current !== currentMood) {
        currentMood = moodRef.current;
        applyMood(currentMood);
      }

      const speaking = speakingRef.current;

      robot.position.y = Math.sin(t * 1.4) * 0.06;
      robot.rotation.y = Math.sin(t * 0.5) * 0.08;

      head.rotation.x = moodTilt[currentMood] + Math.sin(t * 2) * 0.02;
      head.rotation.z = Math.sin(t * 0.8) * 0.04;

      leftArm.rotation.z = 0.25 + Math.sin(t * 1.2) * 0.08;
      rightArm.rotation.z = -0.25 - Math.sin(t * 1.2 + 1) * 0.08;

      if (speaking) {
        rightArm.rotation.z = -0.6 + Math.sin(t * 8) * 0.25;
      }

      if (currentMood === 'celebrate') {
        leftArm.rotation.z = 0.8 + Math.sin(t * 3) * 0.3;
        rightArm.rotation.z = -0.8 - Math.sin(t * 3) * 0.3;
        robot.rotation.y = Math.sin(t * 2) * 0.25;
        particleGroup.visible = true;
        particles.forEach((p, i) => {
          const mat = p.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.3 + Math.sin(t * 3 + i) * 0.3;
          p.position.y += Math.sin(t * 2 + i) * 0.002;
        });
      } else {
        particleGroup.visible = currentMood === 'excited';
        particles.forEach((p, i) => {
          const mat = p.material as THREE.MeshBasicMaterial;
          mat.opacity = currentMood === 'excited' ? 0.15 + Math.sin(t * 4 + i) * 0.15 : 0;
        });
      }

      blinkTimer += delta;
      if (blinkTimer > 2.8 + Math.random() * 2) {
        isBlinking = true;
        blinkTimer = 0;
      }
      if (isBlinking) {
        const scale = Math.max(0.1, Math.sin(blinkTimer * 20));
        leftEye.scale.y = scale;
        rightEye.scale.y = scale;
        if (blinkTimer > 0.15) isBlinking = false;
      } else {
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;
      }

      const pulse = 0.7 + Math.sin(t * 3) * 0.3;
      (antennaBulb.material as THREE.MeshBasicMaterial).opacity = pulse;
      (chestGlow.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 2) * 0.3;
      floorRing.rotation.z = t * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="guide-robot-canvas" aria-hidden="true" />;
}

export default GuideRobot;
