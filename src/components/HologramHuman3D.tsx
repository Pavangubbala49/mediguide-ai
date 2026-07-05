import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  RefreshCw,
  Scan,
  Play,
  Pause,
  Compass,
  AlertTriangle,
  Heart,
  Brain,
  Wind,
  Zap,
  Droplet,
  Users,
  Sparkles,
  Move,
  MousePointer,
  RotateCw
} from 'lucide-react';
import type { DiagnosisReport } from '../services/medicalData';

interface HologramHuman3DProps {
  report?: DiagnosisReport | null;
  onSelectOrgan?: (organName: string) => void;
}

// 8 Core Body Systems
export type BodySystem = 
  | 'Skeletal' 
  | 'Muscular' 
  | 'Circulatory' 
  | 'Nervous' 
  | 'Digestive' 
  | 'Respiratory' 
  | 'Urinary' 
  | 'Reproductive';

export default function HologramHuman3D({ report, onSelectOrgan }: HologramHuman3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Controls & View States
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeSystem, setActiveSystem] = useState<BodySystem>('Circulatory');
  const [activeOrgan, setActiveOrgan] = useState<string>('Heart');
  const [viewAngle, setViewAngle] = useState<'FRONT' | 'RIGHT SIDE' | 'BACK' | 'LEFT SIDE'>('FRONT');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Target Organ Disease Prediction Logic
  const getAffectedOrganFromReport = (rep: DiagnosisReport | null | undefined): string => {
    if (!rep || !rep.predictions || rep.predictions.length === 0) return 'Heart';
    const topDisease = rep.predictions[0].diseaseId.toLowerCase();
    
    if (topDisease.includes('covid') || topDisease.includes('asthma') || topDisease.includes('flu') || topDisease.includes('cold') || topDisease.includes('lung')) {
      return 'Lungs';
    }
    if (topDisease.includes('hyper') || topDisease.includes('heart') || topDisease.includes('cardio') || topDisease.includes('blood')) {
      return 'Heart';
    }
    if (topDisease.includes('migraine') || topDisease.includes('head') || topDisease.includes('brain') || topDisease.includes('neuro')) {
      return 'Brain';
    }
    if (topDisease.includes('stomach') || topDisease.includes('gastro') || topDisease.includes('digest')) {
      return 'Stomach';
    }
    if (topDisease.includes('kidney') || topDisease.includes('renal') || topDisease.includes('uti')) {
      return 'Kidneys';
    }
    if (topDisease.includes('dermatitis') || topDisease.includes('skin') || topDisease.includes('rash')) {
      return 'Muscles';
    }
    return 'Heart';
  };

  const diseaseTargetOrgan = getAffectedOrganFromReport(report);
  const topDiseaseName = report?.predictions?.[0]?.diseaseId || 'None Detected';
  const diseaseSeverity = report?.severity || 'Moderate';
  const recommendedSpecialist = report?.recommendedSpecialist || 'General Physician';

  // Dynamic Telemetry Data state matching reference image
  const [organTelemetry, setOrganTelemetry] = useState({
    name: 'Cardiovascular System (Heart)',
    system: 'Circulatory System',
    description: 'Explore the human body in 3D hologram. Select a system to highlight and learn more about it.',
    height: '175 cm',
    weight: '70 kg',
    diseaseMatch: topDiseaseName !== 'None Detected' ? topDiseaseName.toUpperCase() : 'OPTIMAL FUNCTION',
    specialist: recommendedSpecialist,
    severity: diseaseSeverity,
    tips: [
      'Maintain steady hydration (2.5L daily)',
      'Monitor resting heart rate & blood pressure',
      'Reduce sodium intake & refine cardio regimen'
    ]
  });

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const bodyGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const laserMeshRef = useRef<THREE.Mesh | null>(null);
  const targetPulseMeshRef = useRef<THREE.Mesh | null>(null);

  // Group References for Body Systems
  const skeletalGroupRef = useRef<THREE.Group | null>(null);
  const muscularGroupRef = useRef<THREE.Group | null>(null);
  const circulatoryGroupRef = useRef<THREE.Group | null>(null);
  const nervousGroupRef = useRef<THREE.Group | null>(null);
  const organsGroupRef = useRef<THREE.Group | null>(null);

  // Interaction Drag / Zoom Refs
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotationY = useRef(0);
  const targetRotationX = useRef(0);
  const currentCameraZ = useRef(9.5);

  // Update telemetry when activeOrgan changes
  useEffect(() => {
    switch (activeOrgan) {
      case 'Brain':
        setOrganTelemetry(prev => ({
          ...prev,
          name: 'Cerebral Cranium & Neural Cortex (Brain)',
          system: 'Nervous System',
          description: 'Master central processing node orchestrating synaptic signals, memory retention, and motor reflexes.',
          diseaseMatch: diseaseTargetOrgan === 'Brain' ? topDiseaseName.toUpperCase() : 'SYNAPSE NORMAL',
          specialist: 'Neurologist',
          severity: diseaseTargetOrgan === 'Brain' ? diseaseSeverity : 'Optimal',
          tips: [
            'Prioritize 7-8 hours of uninterrupted deep sleep',
            'Reduce excessive blue light exposure before bedtime',
            'Practice stress reduction & cognitive exercises'
          ]
        }));
        break;
      case 'Heart':
        setOrganTelemetry(prev => ({
          ...prev,
          name: 'Cardiovascular System (Heart)',
          system: 'Circulatory System',
          description: 'Primary muscular cardiac pump directing systemic arterial flow and cellular oxygen delivery.',
          diseaseMatch: diseaseTargetOrgan === 'Heart' ? topDiseaseName.toUpperCase() : 'SINUS RHYTHM 72 BPM',
          specialist: 'Cardiologist',
          severity: diseaseTargetOrgan === 'Heart' ? diseaseSeverity : 'Optimal',
          tips: [
            'Maintain regular cardiovascular aerobic exercise',
            'Monitor blood pressure (Target: < 120/80 mmHg)',
            'Limit saturated fats and processed sodium'
          ]
        }));
        break;
      case 'Lungs':
        setOrganTelemetry(prev => ({
          ...prev,
          name: 'Pulmonary System (Lungs)',
          system: 'Respiratory System',
          description: 'Dual lobe gas-exchange interface optimizing oxygen intake and carbon dioxide expulsion.',
          diseaseMatch: diseaseTargetOrgan === 'Lungs' ? topDiseaseName.toUpperCase() : 'CLEAR AIRWAYS 99% SpO2',
          specialist: 'Pulmonologist',
          severity: diseaseTargetOrgan === 'Lungs' ? diseaseSeverity : 'Optimal',
          tips: [
            'Perform daily deep diaphragmatic breathing exercises',
            'Avoid airborne pollutants and secondhand smoke',
            'Maintain indoor air purification & ventilation'
          ]
        }));
        break;
      case 'Stomach':
        setOrganTelemetry(prev => ({
          ...prev,
          name: 'Gastrointestinal & Digestive Tract',
          system: 'Digestive System',
          description: 'Metabolic nutrient processing complex decomposing food into essential bio-compounds.',
          diseaseMatch: diseaseTargetOrgan === 'Stomach' ? topDiseaseName.toUpperCase() : 'NORMAL PERISTALSIS',
          specialist: 'Gastroenterologist',
          severity: diseaseTargetOrgan === 'Stomach' ? diseaseSeverity : 'Optimal',
          tips: [
            'Consume high-fiber nutrient dense whole foods',
            'Stay well-hydrated throughout meal intervals',
            'Minimize refined sugars and synthetic additives'
          ]
        }));
        break;
      case 'Kidneys':
        setOrganTelemetry(prev => ({
          ...prev,
          name: 'Renal & Urinary Filtration System',
          system: 'Urinary System',
          description: 'Bilateral metabolic filtration units balancing electrolyte levels and fluid osmolality.',
          diseaseMatch: diseaseTargetOrgan === 'Kidneys' ? topDiseaseName.toUpperCase() : 'FILTRATION RATE NORMAL',
          specialist: 'Nephrologist',
          severity: diseaseTargetOrgan === 'Kidneys' ? diseaseSeverity : 'Optimal',
          tips: [
            'Drink 2.5 - 3 Liters of purified water daily',
            'Avoid excessive NSAID painkiller consumption',
            'Monitor blood glucose and electrolyte balance'
          ]
        }));
        break;
      default:
        break;
    }
  }, [activeOrgan, diseaseTargetOrgan, topDiseaseName, diseaseSeverity]);

  // Main Three.js Scene Setup (Constructing TRUE 3D VOLUMETRIC HUMAN ANATOMY GEOMETRY)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 580;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, currentCameraZ.current);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Cyberpunk Cyan & Blue Hologram Lighting System
    const ambientLight = new THREE.AmbientLight(0x00f0ff, 2.5);
    scene.add(ambientLight);

    const dirLightFront = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLightFront.position.set(5, 10, 12);
    scene.add(dirLightFront);

    const cyanPointLight = new THREE.PointLight(0x00f0ff, 5.0, 30);
    cyanPointLight.position.set(-5, 4, 6);
    scene.add(cyanPointLight);

    const redAlertLight = new THREE.PointLight(0xef4444, 3.0, 20);
    redAlertLight.position.set(5, 2, 5);
    scene.add(redAlertLight);

    // 5. ROOT MASTER 3D BODY GROUP
    const bodyGroup = new THREE.Group();
    bodyGroupRef.current = bodyGroup;
    scene.add(bodyGroup);

    // Common Holographic Materials
    const cyanWireMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });

    const boneMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });

    // =========================================================================
    // A. 3D SKELETAL GEOMETRY GROUP (Skull, Spine, Ribcage, Pelvis, Limb Bones)
    // =========================================================================
    const skeletalGroup = new THREE.Group();
    skeletalGroupRef.current = skeletalGroup;

    // --- 3D Skull Cranium & Jaw ---
    const skullGeo = new THREE.SphereGeometry(0.38, 24, 24);
    skullGeo.scale(1, 1.2, 1.05);
    const skullMesh = new THREE.Mesh(skullGeo, boneMat);
    skullMesh.position.set(0, 2.55, 0);
    skeletalGroup.add(skullMesh);

    const jawGeo = new THREE.ConeGeometry(0.26, 0.35, 16);
    jawGeo.rotateX(Math.PI);
    const jawMesh = new THREE.Mesh(jawGeo, boneMat);
    jawMesh.position.set(0, 2.25, 0.08);
    skeletalGroup.add(jawMesh);

    // --- 3D Spinal Vertebrae Column ---
    const spineGroup = new THREE.Group();
    const vertebraeCount = 20;
    for (let i = 0; i < vertebraeCount; i++) {
      const vGeo = new THREE.CylinderGeometry(0.06, 0.065, 0.08, 12);
      const vMesh = new THREE.Mesh(vGeo, boneMat);
      vMesh.position.set(0, 2.1 - i * 0.11, -0.05 + Math.sin(i * 0.2) * 0.04);
      spineGroup.add(vMesh);
    }
    skeletalGroup.add(spineGroup);

    // --- 3D Thoracic Ribcage ---
    const ribcageGroup = new THREE.Group();
    const ribCount = 10;
    for (let i = 0; i < ribCount; i++) {
      const ribRadius = 0.52 - i * 0.02;
      const ribGeo = new THREE.TorusGeometry(ribRadius, 0.025, 8, 32, Math.PI * 1.6);
      ribGeo.rotateX(Math.PI / 2);
      const ribMesh = new THREE.Mesh(ribGeo, boneMat);
      ribMesh.position.set(0, 1.85 - i * 0.11, 0.02);
      ribcageGroup.add(ribMesh);
    }
    skeletalGroup.add(ribcageGroup);

    // --- 3D Pelvic Girdle ---
    const pelvisGeo = new THREE.TorusGeometry(0.48, 0.08, 12, 32, Math.PI * 1.4);
    pelvisGeo.rotateX(Math.PI / 2);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, boneMat);
    pelvisMesh.position.set(0, -0.2, -0.02);
    skeletalGroup.add(pelvisMesh);

    // --- 3D Clavicle Shoulder Beam ---
    const clavicleGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.25, 12);
    clavicleGeo.rotateZ(Math.PI / 2);
    const clavicleMesh = new THREE.Mesh(clavicleGeo, boneMat);
    clavicleMesh.position.set(0, 2.05, 0.02);
    skeletalGroup.add(clavicleMesh);

    // --- 3D Arm Bones (Left & Right Humerus, Radius, Ulna) ---
    const createArmBones = (isLeft: boolean) => {
      const armGroup = new THREE.Group();
      const posX = isLeft ? -0.72 : 0.72;

      // Humerus Upper Arm Bone
      const humerusGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.95, 12);
      const humerusMesh = new THREE.Mesh(humerusGeo, boneMat);
      humerusMesh.position.set(posX, 1.5, 0);
      armGroup.add(humerusMesh);

      // Radius & Ulna Forearm Bones
      const forearmGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.9, 12);
      const forearmMesh = new THREE.Mesh(forearmGeo, boneMat);
      forearmMesh.position.set(posX * 1.05, 0.55, 0);
      armGroup.add(forearmMesh);

      return armGroup;
    };
    skeletalGroup.add(createArmBones(true));
    skeletalGroup.add(createArmBones(false));

    // --- 3D Leg Bones (Left & Right Femur, Tibia) ---
    const createLegBones = (isLeft: boolean) => {
      const legGroup = new THREE.Group();
      const posX = isLeft ? -0.32 : 0.32;

      // Femur Thigh Bone
      const femurGeo = new THREE.CylinderGeometry(0.065, 0.05, 1.45, 12);
      const femurMesh = new THREE.Mesh(femurGeo, boneMat);
      femurMesh.position.set(posX, -0.95, 0);
      legGroup.add(femurMesh);

      // Tibia Shin Bone
      const tibiaGeo = new THREE.CylinderGeometry(0.05, 0.04, 1.4, 12);
      const tibiaMesh = new THREE.Mesh(tibiaGeo, boneMat);
      tibiaMesh.position.set(posX, -2.4, 0);
      legGroup.add(tibiaMesh);

      return legGroup;
    };
    skeletalGroup.add(createLegBones(true));
    skeletalGroup.add(createLegBones(false));

    bodyGroup.add(skeletalGroup);


    // =========================================================================
    // B. 3D MUSCULAR & BODY OUTLINE VOLUME ENVELOPE GROUP
    // =========================================================================
    const muscularGroup = new THREE.Group();
    muscularGroupRef.current = muscularGroup;

    // Outer Translucent 3D Holographic Body Skin Wireframe Contour
    const torsoGeo = new THREE.CylinderGeometry(0.62, 0.38, 2.3, 32, 16);
    const torsoMesh = new THREE.Mesh(torsoGeo, cyanWireMat);
    torsoMesh.position.set(0, 0.9, 0);
    muscularGroup.add(torsoMesh);

    // 3D Pectoral Muscle Volumes
    const pecGeo = new THREE.SphereGeometry(0.28, 16, 16);
    pecGeo.scale(1.2, 0.8, 0.6);
    const pecLeft = new THREE.Mesh(pecGeo, cyanWireMat);
    pecLeft.position.set(-0.28, 1.6, 0.25);
    muscularGroup.add(pecLeft);

    const pecRight = new THREE.Mesh(pecGeo, cyanWireMat);
    pecRight.position.set(0.28, 1.6, 0.25);
    muscularGroup.add(pecRight);

    // 3D Abdominal Muscle Pack Volumes
    for (let row = 0; row < 3; row++) {
      const abGeo = new THREE.SphereGeometry(0.13, 12, 12);
      abGeo.scale(1.1, 0.7, 0.5);
      const abL = new THREE.Mesh(abGeo, cyanWireMat);
      abL.position.set(-0.14, 1.15 - row * 0.22, 0.28);
      muscularGroup.add(abL);

      const abR = new THREE.Mesh(abGeo, cyanWireMat);
      abR.position.set(0.14, 1.15 - row * 0.22, 0.28);
      muscularGroup.add(abR);
    }

    bodyGroup.add(muscularGroup);


    // =========================================================================
    // C. 3D CIRCULATORY VASCULAR NETWORK (ARTERIES & VEINS TUBE SYSTEM)
    // =========================================================================
    const circulatoryGroup = new THREE.Group();
    circulatoryGroupRef.current = circulatoryGroup;

    const vascMatRed = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const vascMatBlue = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      roughness: 0.2
    });

    // 3D Central Aorta Trunk Tube
    const aortaGeo = new THREE.CylinderGeometry(0.035, 0.03, 2.2, 12);
    const aortaMesh = new THREE.Mesh(aortaGeo, vascMatRed);
    aortaMesh.position.set(-0.06, 0.9, 0.05);
    circulatoryGroup.add(aortaMesh);

    const venaCavaMesh = new THREE.Mesh(aortaGeo, vascMatBlue);
    venaCavaMesh.position.set(0.06, 0.9, 0.05);
    circulatoryGroup.add(venaCavaMesh);

    // 3D Branching Arm & Leg Vascular Tubes
    [-0.32, 0.32].forEach((posX, idx) => {
      const legVascGeo = new THREE.CylinderGeometry(0.025, 0.02, 3.2, 12);
      const legVasc = new THREE.Mesh(legVascGeo, idx === 0 ? vascMatRed : vascMatBlue);
      legVasc.position.set(posX, -1.6, 0.02);
      circulatoryGroup.add(legVasc);
    });

    bodyGroup.add(circulatoryGroup);


    // =========================================================================
    // D. 3D NERVOUS SYSTEM SYNAPTIC NET (SPINAL CORD & NEURAL POINTS)
    // =========================================================================
    const nervousGroup = new THREE.Group();
    nervousGroupRef.current = nervousGroup;

    const nervousMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.9,
      wireframe: true
    });

    // 3D Spinal Cord Central Nerve Tube
    const spinalCordGeo = new THREE.CylinderGeometry(0.025, 0.02, 2.4, 12);
    const spinalCordMesh = new THREE.Mesh(spinalCordGeo, nervousMat);
    spinalCordMesh.position.set(0, 0.9, -0.06);
    nervousGroup.add(spinalCordMesh);

    // Synaptic Neural Point Cloud in Brain Cranium
    const neuralNodeCount = 120;
    const neuralGeo = new THREE.BufferGeometry();
    const neuralPositions = new Float32Array(neuralNodeCount * 3);
    for (let i = 0; i < neuralNodeCount; i++) {
      neuralPositions[i * 3] = (Math.random() - 0.5) * 0.45;
      neuralPositions[i * 3 + 1] = 2.4 + (Math.random() - 0.5) * 0.45;
      neuralPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.45;
    }
    neuralGeo.setAttribute('position', new THREE.BufferAttribute(neuralPositions, 3));
    const neuralPointsMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.04,
      transparent: true,
      opacity: 0.95
    });
    const neuralSystem = new THREE.Points(neuralGeo, neuralPointsMat);
    nervousGroup.add(neuralSystem);

    bodyGroup.add(nervousGroup);


    // =========================================================================
    // E. 3D INTERNAL ORGAN SYSTEM GEOMETRIES (HEART, LUNGS, STOMACH, KIDNEYS)
    // =========================================================================
    const organsGroup = new THREE.Group();
    organsGroupRef.current = organsGroup;

    // --- 3D Cardiac Heart Mesh ---
    const heartGeo = new THREE.SphereGeometry(0.24, 20, 20);
    heartGeo.scale(1.1, 1.3, 1.0);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: diseaseTargetOrgan === 'Heart' ? 0xef4444 : 0xd97706,
      emissiveIntensity: diseaseTargetOrgan === 'Heart' ? 1.0 : 0.6,
      roughness: 0.2
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.set(-0.16, 1.38, 0.12);
    organsGroup.add(heartMesh);

    // --- 3D Lungs Pair Meshes ---
    const lungGeo = new THREE.CapsuleGeometry(0.22, 0.55, 12, 16);
    const lungMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: diseaseTargetOrgan === 'Lungs' ? 0xef4444 : 0x0284c7,
      emissiveIntensity: diseaseTargetOrgan === 'Lungs' ? 0.95 : 0.4,
      transparent: true,
      opacity: 0.85
    });
    const leftLung = new THREE.Mesh(lungGeo, lungMat);
    leftLung.position.set(-0.36, 1.38, 0.08);
    organsGroup.add(leftLung);

    const rightLung = new THREE.Mesh(lungGeo, lungMat);
    rightLung.position.set(0.36, 1.38, 0.08);
    organsGroup.add(rightLung);

    // --- 3D Stomach & Intestines Mesh ---
    const stomachGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const stomachMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: diseaseTargetOrgan === 'Stomach' ? 0xef4444 : 0xd97706,
      emissiveIntensity: diseaseTargetOrgan === 'Stomach' ? 0.9 : 0.35
    });
    const stomachMesh = new THREE.Mesh(stomachGeo, stomachMat);
    stomachMesh.position.set(0.12, 0.45, 0.12);
    organsGroup.add(stomachMesh);

    // --- 3D Kidneys Pair Mesh ---
    const kidneyGeo = new THREE.SphereGeometry(0.15, 12, 12);
    const kidneyMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: diseaseTargetOrgan === 'Kidneys' ? 0xef4444 : 0x059669,
      emissiveIntensity: diseaseTargetOrgan === 'Kidneys' ? 0.9 : 0.3
    });
    const kidneyLeft = new THREE.Mesh(kidneyGeo, kidneyMat);
    kidneyLeft.position.set(-0.25, 0.2, -0.08);
    organsGroup.add(kidneyLeft);

    const kidneyRight = new THREE.Mesh(kidneyGeo, kidneyMat);
    kidneyRight.position.set(0.25, 0.2, -0.08);
    organsGroup.add(kidneyRight);

    bodyGroup.add(organsGroup);


    // =========================================================================
    // F. 3D ANOMALY RED PULSE RING FOR PREDICTED TARGET ORGAN
    // =========================================================================
    const pulseRingGeo = new THREE.TorusGeometry(0.46, 0.035, 16, 32);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.95
    });
    const pulseRingMesh = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    
    if (diseaseTargetOrgan === 'Brain') pulseRingMesh.position.set(0, 2.55, 0.08);
    else if (diseaseTargetOrgan === 'Lungs') pulseRingMesh.position.set(0, 1.38, 0.08);
    else if (diseaseTargetOrgan === 'Stomach') pulseRingMesh.position.set(0.12, 0.45, 0.12);
    else if (diseaseTargetOrgan === 'Kidneys') pulseRingMesh.position.set(0, 0.2, -0.08);
    else pulseRingMesh.position.set(-0.16, 1.38, 0.12); // Heart default

    targetPulseMeshRef.current = pulseRingMesh;
    bodyGroup.add(pulseRingMesh);


    // =========================================================================
    // G. 3D HOLOGRAM PEDESTAL FLOOR RINGS & VOLUMETRIC LIGHT CONE BEAM
    // =========================================================================
    const baseGroup = new THREE.Group();
    baseGroup.position.set(0, -3.2, 0);

    // Concentric Floor Projection Rings
    const ringRadii = [2.6, 2.2, 1.8, 1.3, 0.7];
    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r - 0.04, r, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65 - idx * 0.08
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      baseGroup.add(ringMesh);
    });

    // Pedestal Solid Disc Base
    const pedestalGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.12, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x081325,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.9
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.y = -0.06;
    baseGroup.add(pedestalMesh);

    // Volumetric Hologram Upward Projection Light Cone Beam
    const coneGeo = new THREE.ConeGeometry(2.8, 6.5, 64, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const lightConeMesh = new THREE.Mesh(coneGeo, coneMat);
    lightConeMesh.position.y = 3.25;
    baseGroup.add(lightConeMesh);

    bodyGroup.add(baseGroup);


    // =========================================================================
    // H. FLOATING CYAN HOLOGRAM PARTICLE FIELD & LASER SCANNER RING
    // =========================================================================
    const particleCount = 260;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.8 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 6.8;

      particlePositions[i * 3] = radius * Math.cos(theta);
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = radius * Math.sin(theta);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.05,
      transparent: true,
      opacity: 0.8
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    bodyGroup.add(particleSystem);

    // Holographic Laser Scanning Ring
    const laserGeo = new THREE.TorusGeometry(2.1, 0.02, 16, 64);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.rotation.x = Math.PI / 2;
    laserMeshRef.current = laserMesh;
    scene.add(laserMesh);

    // Position Body Group Centered
    bodyGroup.position.y = 0.1;


    // =========================================================================
    // I. ANIMATION & SYSTEM HIGHLIGHT LOGIC LOOP
    // =========================================================================
    let laserDir = 1;
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous Smooth 360° Auto Rotation around Y axis
      if (bodyGroupRef.current) {
        if (autoRotate && !isDragging.current) {
          targetRotationY.current += 0.008;
        }

        // Smooth rotation damping
        bodyGroupRef.current.rotation.y += (targetRotationY.current - bodyGroupRef.current.rotation.y) * 0.1;
        bodyGroupRef.current.rotation.x += (targetRotationX.current - bodyGroupRef.current.rotation.x) * 0.1;
      }

      // Smooth Camera Z Zoom interpolation
      if (cameraRef.current) {
        cameraRef.current.position.z += (currentCameraZ.current - cameraRef.current.position.z) * 0.1;
      }

      // Heartbeat pulse rhythm
      const heartPulse = 1.0 + Math.sin(elapsedTime * 7) * 0.14;
      heartMesh.scale.set(heartPulse, heartPulse, heartPulse);

      // Disease Anomaly Red Pulse Ring scale & rotation
      if (targetPulseMeshRef.current) {
        const ringPulse = 1.0 + Math.sin(elapsedTime * 9) * 0.2;
        targetPulseMeshRef.current.scale.set(ringPulse, ringPulse, ringPulse);
        targetPulseMeshRef.current.rotation.z += 0.02;
      }

      // Holographic pedestal rings spin
      baseGroup.rotation.y += 0.004;

      // Laser scanner sweep moving up and down
      if (laserMeshRef.current) {
        laserMeshRef.current.position.y += 0.038 * laserDir;
        if (laserMeshRef.current.position.y > 3.2) laserDir = -1;
        else if (laserMeshRef.current.position.y < -3.2) laserDir = 1;
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- MOUSE & TOUCH 360° INTERACTIVE ROTATION & ZOOM ---
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      targetRotationY.current += deltaX * 0.01;
      targetRotationX.current += deltaY * 0.005;

      // Clamp X tilt angle to avoid flipping
      targetRotationX.current = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotationX.current));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Scroll wheel zoom handler
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.005;
      currentCameraZ.current = Math.max(5.5, Math.min(13.0, currentCameraZ.current + zoomFactor));
      setZoomLevel(Number((9.5 / currentCameraZ.current).toFixed(1)));
    };

    // Double click reset view angle
    const handleDoubleClick = () => {
      targetRotationY.current = 0;
      targetRotationX.current = 0;
      currentCameraZ.current = 9.5;
      setViewAngle('FRONT');
      setZoomLevel(1.0);
    };

    // Touch handlers for mobile swipe & pinch
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

      targetRotationY.current += deltaX * 0.01;
      targetRotationX.current += deltaY * 0.005;

      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElem.addEventListener('wheel', handleWheel, { passive: false });
    domElem.addEventListener('dblclick', handleDoubleClick);

    domElem.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 600;
      const newHeight = container.clientHeight || 580;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElem.removeEventListener('wheel', handleWheel);
      domElem.removeEventListener('dblclick', handleDoubleClick);

      domElem.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [diseaseTargetOrgan]);

  // Dynamic Highlight adjustments based on activeSystem
  useEffect(() => {
    if (!skeletalGroupRef.current || !muscularGroupRef.current || !circulatoryGroupRef.current || !nervousGroupRef.current || !organsGroupRef.current) return;

    // Default opacity resets
    skeletalGroupRef.current.traverse(child => {
      if (child instanceof THREE.Mesh) (child.material as THREE.Material).opacity = activeSystem === 'Skeletal' ? 1.0 : 0.4;
    });

    muscularGroupRef.current.traverse(child => {
      if (child instanceof THREE.Mesh) (child.material as THREE.Material).opacity = activeSystem === 'Muscular' ? 0.8 : 0.2;
    });

    circulatoryGroupRef.current.traverse(child => {
      if (child instanceof THREE.Mesh) (child.material as THREE.Material).opacity = activeSystem === 'Circulatory' ? 1.0 : 0.3;
    });

    nervousGroupRef.current.traverse(child => {
      if (child instanceof THREE.Mesh) (child.material as THREE.Material).opacity = activeSystem === 'Nervous' ? 1.0 : 0.3;
    });
  }, [activeSystem]);

  // Handle Preset View Angles (FRONT, RIGHT SIDE, BACK, LEFT SIDE)
  const setCameraViewAngle = (angle: 'FRONT' | 'RIGHT SIDE' | 'BACK' | 'LEFT SIDE') => {
    setViewAngle(angle);
    targetRotationX.current = 0;
    switch (angle) {
      case 'FRONT':
        targetRotationY.current = 0;
        break;
      case 'RIGHT SIDE':
        targetRotationY.current = Math.PI / 2;
        break;
      case 'BACK':
        targetRotationY.current = Math.PI;
        break;
      case 'LEFT SIDE':
        targetRotationY.current = (3 * Math.PI) / 2;
        break;
    }
  };

  const resetView = () => {
    setCameraViewAngle('FRONT');
    currentCameraZ.current = 9.5;
    setZoomLevel(1.0);
  };

  // Systems mapping to organs
  const handleSystemClick = (sys: BodySystem) => {
    setActiveSystem(sys);
    let selectedOrganName = 'Heart';
    switch (sys) {
      case 'Circulatory':
        selectedOrganName = 'Heart';
        break;
      case 'Nervous':
        selectedOrganName = 'Brain';
        break;
      case 'Respiratory':
        selectedOrganName = 'Lungs';
        break;
      case 'Digestive':
        selectedOrganName = 'Stomach';
        break;
      case 'Urinary':
        selectedOrganName = 'Kidneys';
        break;
      case 'Muscular':
      case 'Skeletal':
      case 'Reproductive':
        selectedOrganName = 'Heart';
        break;
    }
    setActiveOrgan(selectedOrganName);
    onSelectOrgan?.(selectedOrganName);
  };

  // Systems list with icons matching the reference image
  const systemsList: { id: BodySystem; label: string; icon: any }[] = [
    { id: 'Skeletal', label: 'SKELETAL', icon: Sparkles },
    { id: 'Muscular', label: 'MUSCULAR', icon: Zap },
    { id: 'Circulatory', label: 'CIRCULATORY', icon: Heart },
    { id: 'Nervous', label: 'NERVOUS', icon: Brain },
    { id: 'Digestive', label: 'DIGESTIVE', icon: FlameIcon },
    { id: 'Respiratory', label: 'RESPIRATORY', icon: Wind },
    { id: 'Urinary', label: 'URINARY', icon: Droplet },
    { id: 'Reproductive', label: 'REPRODUCTIVE', icon: Users }
  ];

  return (
    <div style={styles.hudContainer}>
      
      {/* 1. TOP FUTURISTIC TITLE HEADER (Matching Reference Image) */}
      <div style={styles.topHeaderContainer}>
        <div style={styles.titlePillBadge}>
          <h2 style={styles.mainTitle}>3D BODY HOLOGRAM</h2>
        </div>
        <div style={styles.subtitleRow}>
          <span style={styles.cyanLineLeft} />
          <span style={styles.subtitleText}>360° VOLUMETRIC VIEW</span>
          <span style={styles.cyanLineRight} />
        </div>
      </div>


      {/* 2. MAIN HUD THREE-COLUMN GRID */}
      <div style={styles.hudMainGrid}>
        
        {/* LEFT PANEL: FLOATING GLASS "SYSTEMS" PANEL */}
        <div style={styles.leftGlassSidebar}>
          <div style={styles.sidebarHeader}>
            <span>SYSTEMS</span>
          </div>

          <div style={styles.systemsList}>
            {systemsList.map((item) => {
              const IconComp = item.icon;
              const isActive = activeSystem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSystemClick(item.id)}
                  style={{
                    ...styles.systemBtn,
                    backgroundColor: isActive ? 'rgba(0, 240, 255, 0.2)' : 'rgba(8, 19, 37, 0.65)',
                    borderColor: isActive ? '#00f0ff' : 'rgba(0, 240, 255, 0.15)',
                    color: isActive ? '#00f0ff' : '#8ba2c0',
                    boxShadow: isActive ? '0 0 15px rgba(0, 240, 255, 0.35)' : 'none'
                  }}
                >
                  <IconComp size={16} color={isActive ? '#00f0ff' : '#8ba2c0'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>


        {/* CENTER VIEWPORT: TRUE 3D HOLOGRAM CANVAS */}
        <div style={styles.centerCanvasContainer}>
          
          {/* Scanline Effect Overlay */}
          <div style={styles.scanlineOverlay} />

          {/* Interactive Three.js Mount Canvas */}
          <div ref={mountRef} style={styles.canvas3D} title="Drag mouse to rotate 360° | Scroll to zoom | Double tap to reset" />

          {/* Pedestal 360° ROTATION Badge Indicator (Matching Reference Image) */}
          <div style={styles.rotationBadgePedestal}>
            <RotateCw size={14} color="#00f0ff" className={autoRotate ? "spin-indicator" : ""} />
            <span>360° ROTATION</span>
          </div>

          {/* Canvas Top Action Controls */}
          <div style={styles.canvasTopControls}>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              style={styles.hudControlIconBtn}
              title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
            >
              {autoRotate ? <Pause size={13} color="#00f0ff" /> : <Play size={13} color="#00f0ff" />}
              <span>{autoRotate ? 'Auto Rotating' : 'Paused'}</span>
            </button>

            <button
              onClick={resetView}
              style={styles.hudControlIconBtn}
              title="Reset View Angle"
            >
              <RefreshCw size={13} color="#00f0ff" />
              <span>Reset</span>
            </button>
          </div>

          {/* Bottom Drag Guide */}
          <div style={styles.dragPromptText}>
            CLICK AND DRAG TO ROTATE 360° VOLUMETRIC MODEL
          </div>

        </div>


        {/* RIGHT PANEL: FLOATING GLASS "INFORMATION" & "CONTROLS" CARDS */}
        <div style={styles.rightGlassSidebar}>
          
          {/* CARD 1: INFORMATION CARD (Matching Reference Image) */}
          <div style={styles.glassInfoCard}>
            <div style={styles.cardHeaderTitle}>INFORMATION</div>

            <p style={styles.infoDescParagraph}>
              {organTelemetry.description}
            </p>

            <div style={styles.statGroup}>
              <span style={styles.statLabel}>HEIGHT</span>
              <span style={styles.statVal}>{organTelemetry.height}</span>
            </div>

            <div style={styles.statGroup}>
              <span style={styles.statLabel}>WEIGHT</span>
              <span style={styles.statVal}>{organTelemetry.weight}</span>
            </div>

            {/* Disease Anomaly Prediction Match */}
            {topDiseaseName !== 'None Detected' && (
              <div style={styles.diseaseAlertBox}>
                <AlertTriangle size={13} color="#ef4444" />
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#ef4444', fontWeight: 800 }}>DISEASE TARGET</div>
                  <div style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 800 }}>{topDiseaseName.toUpperCase()}</div>
                </div>
              </div>
            )}
          </div>


          {/* CARD 2: CONTROLS CARD (Matching Reference Image) */}
          <div style={styles.glassControlsCard}>
            <div style={styles.cardHeaderTitle}>CONTROLS</div>

            <div style={styles.controlRow}>
              <Move size={16} color="#00f0ff" />
              <div>
                <strong style={styles.controlName}>DRAG</strong>
                <span style={styles.controlAction}>Rotate</span>
              </div>
            </div>

            <div style={styles.controlRow}>
              <MousePointer size={16} color="#00f0ff" />
              <div>
                <strong style={styles.controlName}>SCROLL</strong>
                <span style={styles.controlAction}>Zoom ({zoomLevel}x)</span>
              </div>
            </div>

            <div style={styles.controlRow}>
              <Compass size={16} color="#00f0ff" />
              <div>
                <strong style={styles.controlName}>DOUBLE TAP</strong>
                <span style={styles.controlAction}>Reset View</span>
              </div>
            </div>
          </div>

        </div>

      </div>


      {/* 3. BOTTOM PREVIEW ANGLE CARDS (4 PREVIEWS MATCHING REFERENCE IMAGE) */}
      <div style={styles.bottomPreviewBar}>
        <div style={styles.previewCardsGrid}>
          {[
            { id: 'FRONT', label: 'FRONT', desc: 'Anterior View' },
            { id: 'RIGHT SIDE', label: 'RIGHT SIDE', desc: 'Lateral Profile' },
            { id: 'BACK', label: 'BACK', desc: 'Posterior View' },
            { id: 'LEFT SIDE', label: 'LEFT SIDE', desc: 'Lateral Profile' }
          ].map(angleCard => {
            const isSelected = viewAngle === angleCard.id;
            return (
              <div
                key={angleCard.id}
                onClick={() => setCameraViewAngle(angleCard.id as any)}
                style={{
                  ...styles.previewCard,
                  borderColor: isSelected ? '#00f0ff' : 'rgba(0, 240, 255, 0.15)',
                  backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.18)' : 'rgba(8, 19, 37, 0.75)'
                }}
              >
                <div style={styles.previewThumbnailCircle}>
                  <Scan size={18} color={isSelected ? '#00f0ff' : '#8ba2c0'} />
                </div>
                <div style={styles.previewLabelText}>
                  {angleCard.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// Flame icon component for digestive
function FlameIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" />
    </svg>
  );
}


// --- FUTURISTIC STYLES EXACTLY MATCHING REFERENCE IMAGE ---
const styles = {
  hudContainer: {
    width: '100%',
    backgroundColor: '#040b15',
    color: '#e2e8f0',
    borderRadius: '16px',
    border: '1px solid rgba(0, 240, 255, 0.3)',
    boxShadow: '0 12px 40px rgba(0, 240, 255, 0.15), 0 0 30px rgba(0, 0, 0, 0.95)',
    padding: '1.25rem',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    position: 'relative' as const,
    overflow: 'hidden' as const,
    marginBottom: '2rem'
  },
  topHeaderContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.25rem'
  },
  titlePillBadge: {
    border: '1px solid rgba(0, 240, 255, 0.4)',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    padding: '0.4rem 1.75rem',
    borderRadius: '8px',
    boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)'
  },
  mainTitle: {
    fontSize: '1.25rem',
    fontWeight: 900,
    letterSpacing: '0.12em',
    color: '#00f0ff',
    margin: 0,
    textAlign: 'center' as const,
    textShadow: '0 0 12px rgba(0, 240, 255, 0.6)'
  },
  subtitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginTop: '0.35rem'
  },
  cyanLineLeft: {
    width: '30px',
    height: '1px',
    backgroundColor: '#00f0ff',
    opacity: 0.6
  },
  cyanLineRight: {
    width: '30px',
    height: '1px',
    backgroundColor: '#00f0ff',
    opacity: 0.6
  },
  subtitleText: {
    fontSize: '0.68rem',
    fontWeight: 800,
    color: '#00f0ff',
    letterSpacing: '0.15em'
  },
  hudMainGrid: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr 220px',
    gap: '1rem',
    minHeight: '540px'
  },
  leftGlassSidebar: {
    backgroundColor: 'rgba(8, 19, 37, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 240, 255, 0.25)',
    borderRadius: '12px',
    padding: '0.85rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem'
  },
  sidebarHeader: {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: '#8ba2c0',
    letterSpacing: '0.1em',
    paddingBottom: '0.4rem',
    borderBottom: '1px solid rgba(0, 240, 255, 0.15)'
  },
  systemsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.45rem'
  },
  systemBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid transparent',
    fontSize: '0.72rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left' as const
  },
  centerCanvasContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    backgroundColor: '#030813',
    borderRadius: '12px',
    border: '1px solid rgba(0, 240, 255, 0.25)',
    overflow: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scanlineOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 240, 255, 0.02) 50%)',
    backgroundSize: '100% 4px',
    pointerEvents: 'none' as const,
    zIndex: 2
  },
  canvas3D: {
    width: '100%',
    height: '100%',
    cursor: 'grab'
  },
  rotationBadgePedestal: {
    position: 'absolute' as const,
    bottom: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'rgba(4, 11, 21, 0.85)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(0, 240, 255, 0.4)',
    color: '#00f0ff',
    padding: '0.3rem 0.85rem',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    zIndex: 5
  },
  canvasTopControls: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    display: 'flex',
    gap: '0.4rem',
    zIndex: 5
  },
  hudControlIconBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: 'rgba(8, 19, 37, 0.85)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(0, 240, 255, 0.3)',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '0.25rem 0.55rem',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  dragPromptText: {
    position: 'absolute' as const,
    bottom: '12px',
    fontSize: '0.65rem',
    fontWeight: 800,
    color: '#8ba2c0',
    letterSpacing: '0.12em',
    zIndex: 5
  },
  rightGlassSidebar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.85rem'
  },
  glassInfoCard: {
    backgroundColor: 'rgba(8, 19, 37, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 240, 255, 0.25)',
    borderRadius: '12px',
    padding: '0.85rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.65rem',
    flex: 1
  },
  cardHeaderTitle: {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: '#8ba2c0',
    letterSpacing: '0.1em',
    paddingBottom: '0.35rem',
    borderBottom: '1px solid rgba(0, 240, 255, 0.15)'
  },
  infoDescParagraph: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    lineHeight: 1.45,
    margin: 0
  },
  statGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.1rem'
  },
  statLabel: {
    fontSize: '0.65rem',
    fontWeight: 800,
    color: '#8ba2c0',
    letterSpacing: '0.08em'
  },
  statVal: {
    fontSize: '0.88rem',
    fontWeight: 800,
    color: '#ffffff'
  },
  diseaseAlertBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    padding: '0.4rem 0.6rem',
    borderRadius: '6px'
  },
  glassControlsCard: {
    backgroundColor: 'rgba(8, 19, 37, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 240, 255, 0.25)',
    borderRadius: '12px',
    padding: '0.85rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.6rem'
  },
  controlRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem'
  },
  controlName: {
    fontSize: '0.72rem',
    fontWeight: 900,
    color: '#00f0ff',
    display: 'block',
    letterSpacing: '0.05em'
  },
  controlAction: {
    fontSize: '0.68rem',
    color: '#94a3b8'
  },
  bottomPreviewBar: {
    marginTop: '1.25rem',
    paddingTop: '0.85rem',
    borderTop: '1px solid rgba(0, 240, 255, 0.2)'
  },
  previewCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.85rem'
  },
  previewCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.85rem 0.5rem',
    borderRadius: '12px',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const
  },
  previewThumbnailCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(0, 240, 255, 0.3)'
  },
  previewLabelText: {
    fontSize: '0.72rem',
    fontWeight: 900,
    color: '#ffffff',
    letterSpacing: '0.08em'
  }
};
