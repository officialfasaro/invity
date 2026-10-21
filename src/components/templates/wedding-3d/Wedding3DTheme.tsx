"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import QRCode from "qrcode";
import {
  Calendar,
  CheckCircle2,
  Copy,
  Mail,
  MapPin,
  Play,
  QrCode,
  VolumeX,
  X,
} from "lucide-react";
import InstagramIcon from "../shared/InstagramIcon";
import GoogleMapEmbed from "../shared/GoogleMapEmbed";
import { isFeatureAvailable } from "@/utils/featureFlags";
import { WeddingInvitationData, EventScheduleItem, BankAccountItem } from "@/types/wedding";

interface LocalWish {
  id: string;
  senderName: string;
  attendance: string;
  message: string;
  timeAgo: string;
}

const DEFAULT_WISHES: LocalWish[] = [
  {
    id: "w-1",
    senderName: "Bagas & Keluarga",
    attendance: "Hadir",
    message: "Selamat menempuh hidup baru untuk Raka & Ayu! Semoga sakinah mawaddah warahmah selamanya.",
    timeAgo: "2 jam lalu",
  },
  {
    id: "w-2",
    senderName: "Dinda Maharani",
    attendance: "Hadir",
    message: "Barakallahu lakum wa baraka alaikum. Bahagia selalu kedua mempelai!",
    timeAgo: "4 jam lalu",
  },
  {
    id: "w-3",
    senderName: "Rizky Firmansyah",
    attendance: "Hadir",
    message: "Selamat sahabatku Raka! Semoga menjadi keluarga yang penuh keberkahan dan cinta kasih.",
    timeAgo: "Kemarin",
  },
];

const DEFAULT_3D_STORIES = [
  {
    date: "Tahun 2021",
    title: "Awal Pertemuan",
    story:
      "Pertama kali dipertemukan dalam sebuah kegiatan desain kreatif di Jakarta. Percakapan singkat tentang semesta dan seni membuka pintu menuju petualangan cinta yang abadi.",
  },
  {
    date: "Tahun 2023",
    title: "Mengikat Janji Komitmen",
    story:
      "Melewati berbagai dinamika kehidupan dan saling menguatkan dalam doa. Kami menyadari bahwa cinta adalah tentang komitmen untuk terus tumbuh dan melangkah bersama.",
  },
  {
    date: "Tahun 2026",
    title: "Lamaran & Menuju Pelaminan",
    story:
      "Di hadapan keluarga besar tercinta, cincin tersemat sebagai ikrar suci untuk melangkah bersama mengarungi mahligai rumah tangga yang sakinah, mawaddah, warahmah.",
  },
];

interface Wedding3DThemeProps {
  data: WeddingInvitationData;
  guestName?: string;
  showCover?: boolean;
  isEmbedded?: boolean;
}

export const Wedding3DTheme: React.FC<Wedding3DThemeProps> = ({
  data,
  guestName = "Tamu Undangan",
  showCover = true,
  isEmbedded = false,
}) => {
  // Opening state & Music state
  const [isOpen, setIsOpen] = useState(!showCover);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // RSVP Form state
  const [rsvpName, setRsvpName] = useState(guestName !== "Tamu Undangan" ? guestName : "");
  const [rsvpAttendance, setRsvpAttendance] = useState("Hadir");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [wishes, setWishes] = useState<LocalWish[]>(DEFAULT_WISHES);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // QR Ticket Modal state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [guestQrDataUrl, setGuestQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (guestName && typeof window !== "undefined") {
      const codeParam = new URLSearchParams(window.location.search).get("code") || guestName;
      const payload = JSON.stringify({
        guestName,
        slugCode: codeParam,
        invitationSlug: data.slug,
      });
      QRCode.toDataURL(payload, { width: 220, margin: 1 })
        .then(setGuestQrDataUrl)
        .catch(() => {});
    }
  }, [guestName, data.slug]);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const introProgressRef = useRef(0);
  const isOpenedRef = useRef(!showCover);

  useEffect(() => {
    isOpenedRef.current = isOpen;
  }, [isOpen]);

  // Couple Info Fallbacks
  const groomNick = data.coupleInfo.groomNickname || "Raka";
  const brideNick = data.coupleInfo.brideNickname || "Ayu";
  const groomFullName = data.coupleInfo.groomName || "Raka Pratama, S.T.";
  const brideFullName = data.coupleInfo.brideName || "Ayu Lestari, S.Pd.";

  const groomParents = useMemo(() => {
    if (data.coupleInfo.groomFather && data.coupleInfo.groomMother) {
      return `Putra dari Bpk. ${data.coupleInfo.groomFather} & Ibu ${data.coupleInfo.groomMother}`;
    }
    return "Putra tercinta dari Bpk. Bambang Wijaya & Ibu Sri Rahayu";
  }, [data.coupleInfo.groomFather, data.coupleInfo.groomMother]);

  const brideParents = useMemo(() => {
    if (data.coupleInfo.brideFather && data.coupleInfo.brideMother) {
      return `Putri dari Bpk. ${data.coupleInfo.brideFather} & Ibu ${data.coupleInfo.brideMother}`;
    }
    return "Putri tercinta dari Bpk. Hendra Gunawan & Ibu Siti Aminah";
  }, [data.coupleInfo.brideFather, data.coupleInfo.brideMother]);

  const groomPhoto = data.coupleInfo.groomPhoto || "/templates/wedding-3d/groom.jpg";
  const bridePhoto = data.coupleInfo.bridePhoto || "/templates/wedding-3d/bride.jpg";

  // Target event date for countdown
  const targetDate = useMemo(() => {
    if (data.eventSchedules && data.eventSchedules.length > 0) {
      const firstDate = data.eventSchedules[0].date;
      if (firstDate) return new Date(firstDate);
    }
    return new Date("2026-12-12T08:00:00+07:00");
  }, [data.eventSchedules]);

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Physical Gift Shipping Addresses
  const physicalGiftList = useMemo(() => {
    if (Array.isArray(data.coupleInfo.giftAddresses) && data.coupleInfo.giftAddresses.length > 0) {
      const valid = data.coupleInfo.giftAddresses.filter(
        (g) => g.address && g.address.trim() !== ""
      );
      if (valid.length > 0) return valid;
    }
    const fallbackAddr =
      data.coupleInfo.giftAddress ||
      (data.eventSchedules && data.eventSchedules[0]?.address) ||
      "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan 12140";
    return [
      {
        id: "primary",
        title: "Alamat Pengiriman",
        receiver: data.coupleInfo.giftReceiver || `${groomNick} & ${brideNick}`,
        phone: data.coupleInfo.giftPhone || "0812-3456-7890",
        address: fallbackAddr,
      },
    ];
  }, [
    data.coupleInfo.giftAddresses,
    data.coupleInfo.giftAddress,
    data.coupleInfo.giftReceiver,
    data.coupleInfo.giftPhone,
    data.eventSchedules,
    groomNick,
    brideNick,
  ]);

  // ---------------------------------------------------------------------------
  // Three.js 3D WebGL Scene Engine
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    // Selalu aktifkan animasi 3D kontinu di mobile dan desktop
    const still = false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1624);
    scene.fog = new THREE.FogExp2(0x0c1624, 0.022);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xfff0d0, 1.2);
    directionalLight.position.set(4, 6, 8);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xd4b06a, 2.2, 30);
    scene.add(pointLight);

    // Materials
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4b06a,
      metalness: 0.75,
      roughness: 0.28,
      emissive: 0x3a2a0a,
    });

    // Twin Interlocking Rings
    const rings = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(1.15, 0.09, 28, 140);
    const ring1 = new THREE.Mesh(ringGeo, goldMaterial);
    const ring2 = new THREE.Mesh(ringGeo, goldMaterial);

    ring1.position.x = -0.62;
    ring2.position.x = 0.62;
    ring1.rotation.y = Math.PI / 2.4;
    ring2.rotation.y = -Math.PI / 2.4;

    rings.add(ring1);
    rings.add(ring2);
    rings.position.set(0, 0, -1);
    scene.add(rings);

    // Wireframe Celestial Orbs along the track
    const orbs = [-18, -32, -50].map((z, idx) => {
      const orbGroup = new THREE.Group();
      const icosaGeo = new THREE.IcosahedronGeometry(2.4, 1);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xd4b06a,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      });
      const outerMesh = new THREE.Mesh(icosaGeo, wireMat);

      const sphereGeo = new THREE.SphereGeometry(0.7, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xf0cfc7,
        emissive: 0x5a3a3a,
        roughness: 0.5,
      });
      const innerMesh = new THREE.Mesh(sphereGeo, sphereMat);

      orbGroup.add(outerMesh);
      orbGroup.add(innerMesh);
      orbGroup.position.set(idx % 2 ? 3.2 : -3.2, 0, z);
      scene.add(orbGroup);
      return orbGroup;
    });

    // 3D Rose Petals
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(0.5, 0.3, 0.5, 1, 0, 1.4);
    petalShape.bezierCurveTo(-0.5, 1, -0.5, 0.3, 0, 0);

    const petalCount = 170;
    const petalGeo = new THREE.ShapeGeometry(petalShape);
    petalGeo.scale(0.26, 0.26, 0.26);

    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xf0cfc7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });

    const petals = new THREE.InstancedMesh(petalGeo, petalMat, petalCount);
    scene.add(petals);

    const petalData = Array.from({ length: petalCount }, () => ({
      x: (Math.random() - 0.5) * 26,
      y: (Math.random() - 0.5) * 18,
      z: -62 + Math.random() * 76,
      scale: 0.4 + Math.random() * 0.8,
      rx: Math.random() * 6,
      ry: Math.random() * 6,
      velocity: 0.4 + Math.random(),
      phase: Math.random() * 6,
    }));

    const dummyObj = new THREE.Object3D();

    // 3D Starfield particles
    const starCount = 900;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 60;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      starPositions[i * 3 + 2] = -70 + Math.random() * 90;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xfff0d0,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 640 ? 65 : 55;
      camera.updateProjectionMatrix();
      rings.scale.setScalar(width < 640 ? 0.72 : 1);

      const isMobile = width < 640;
      orbs.forEach((orb, idx) => {
        orb.position.x = idx % 2 ? (isMobile ? 1.6 : 3.2) : (isMobile ? -1.6 : -3.2);
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Mouse, Touch & Orientation pointer tracking
    let currentScroll = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      targetX = e.clientX / window.innerWidth - 0.5;
      targetY = e.clientY / window.innerHeight - 0.5;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        targetX = Math.max(-0.5, Math.min(0.5, e.touches[0].clientX / window.innerWidth - 0.5));
        targetY = Math.max(-0.5, Math.min(0.5, e.touches[0].clientY / window.innerHeight - 0.5));
      }
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        targetX = Math.max(-0.5, Math.min(0.5, e.gamma / 50));
        targetY = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 60));
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("deviceorientation", handleOrientation);

    // Animation loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const renderFrame = () => {
      animationFrameId = requestAnimationFrame(renderFrame);

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsedTime = clock.elapsedTime;

      // Scroll progress tracking (Supports both desktop container scroll and mobile window scroll)
      let containerFraction = 0;
      const container = scrollContainerRef.current;
      if (container) {
        const maxScroll = container.scrollHeight - container.clientHeight;
        if (maxScroll > 0) {
          containerFraction = container.scrollTop / maxScroll;
        }
      }

      const docMax = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        document.body.scrollHeight - window.innerHeight
      );
      const windowY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const windowFraction = docMax > 0 ? windowY / docMax : 0;

      const scrollFraction = Math.max(0, Math.min(1, Math.max(containerFraction, windowFraction)));

      const targetProgress = isOpenedRef.current ? scrollFraction : 0;
      currentScroll += (targetProgress - currentScroll) * (still ? 1 : 0.055);

      // Camera dolly-in upon opening
      const targetIntro = isOpenedRef.current ? 1 : 0;
      introProgressRef.current += (targetIntro - introProgressRef.current) * 0.03;

      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      const camZ = 8 + (1 - introProgressRef.current) * 7 - currentScroll * 48;
      camera.position.set(
        Math.sin(currentScroll * 7) * 1.4 + mouseX * 1.2,
        Math.cos(currentScroll * 5) * 0.6 - mouseY * 0.8,
        camZ
      );
      camera.lookAt(
        Math.sin(currentScroll * 7) * 0.5 + mouseX * 0.6,
        -mouseY * 0.3,
        camZ - 10
      );
      camera.rotation.z += Math.sin(currentScroll * 9) * 0.04;

      pointLight.position.set(
        camera.position.x + 2,
        camera.position.y + 2,
        camera.position.z - 4
      );

      // Ambient movement for starfield
      starField.rotation.y = elapsedTime * 0.02;
      starField.rotation.x = Math.sin(elapsedTime * 0.015) * 0.03;

      if (!still) {
        rings.rotation.y += delta * 0.5;
        rings.rotation.x = Math.sin(elapsedTime * 0.6) * 0.25;
        ring1.rotation.x += delta * 0.6;
        ring2.rotation.x -= delta * 0.6;

        orbs.forEach((orb, i) => {
          orb.rotation.y += delta * (0.3 + i * 0.1);
          orb.rotation.x += delta * 0.2;
          const inner = orb.children[1] as THREE.Mesh;
          if (inner) {
            inner.scale.setScalar(1 + Math.sin(elapsedTime * 1.5 + i) * 0.12);
          }
        });
      }

      // Update falling 3D petals
      petalData.forEach((p, i) => {
        const timeVal = still ? 0 : elapsedTime;
        dummyObj.position.set(
          p.x + Math.sin(timeVal * 0.5 + p.phase) * 0.8,
          ((p.y - timeVal * p.velocity * 0.5) % 18 + 27) % 18 - 9,
          p.z
        );
        dummyObj.rotation.set(p.rx + timeVal * p.velocity, p.ry + timeVal * 0.6 * p.velocity, 0);
        dummyObj.scale.setScalar(p.scale);
        dummyObj.updateMatrix();
        petals.setMatrixAt(i, dummyObj.matrix);
      });
      petals.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("deviceorientation", handleOrientation);

      ringGeo.dispose();
      goldMaterial.dispose();
      petalGeo.dispose();
      petalMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Audio Controls
  // ---------------------------------------------------------------------------
  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    isOpenedRef.current = true;
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay policy prevented playback
        });
    }
  };

  // ---------------------------------------------------------------------------
  // Copy Bank Account Number
  // ---------------------------------------------------------------------------
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(id);
        setTimeout(() => setIsCopied(null), 2500);
      })
      .catch(() => {
        setIsCopied(id);
        setTimeout(() => setIsCopied(null), 2500);
      });
  };

  // ---------------------------------------------------------------------------
  // RSVP Submit Handler
  // ---------------------------------------------------------------------------
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim() || !rsvpMessage.trim()) return;

    const newWish: LocalWish = {
      id: `w-${Date.now()}`,
      senderName: rsvpName.trim(),
      attendance: rsvpAttendance,
      message: rsvpMessage.trim(),
      timeAgo: "Baru saja",
    };

    setWishes([newWish, ...wishes]);
    setFormSubmitted(true);
    setRsvpMessage("");
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  // Google Calendar URL generator
  const calendarUrl = useMemo(() => {
    const title = encodeURIComponent(`The Wedding of ${groomNick} & ${brideNick}`);
    const details = encodeURIComponent(
      `Pernikahan sakral ${groomFullName} & ${brideFullName}. Merupakan suatu kehormatan atas kehadiran dan doa restu Anda.`
    );
    const location = encodeURIComponent(
      data.eventSchedules && data.eventSchedules.length > 0
        ? data.eventSchedules[0].venueName + ", " + data.eventSchedules[0].address
        : "Masjid Al-Ikhlas & Gedung Serbaguna Mawar, Jakarta"
    );

    const startTimeIso = targetDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endTime = new Date(targetDate.getTime() + 6 * 60 * 60 * 1000);
    const endTimeIso = endTime.toISOString().replace(/-|:|\.\d\d\d/g, "");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startTimeIso}/${endTimeIso}`;
  }, [groomNick, brideNick, groomFullName, brideFullName, data.eventSchedules, targetDate]);

  // Gallery items with fallback
  const galleryItems = useMemo(() => {
    if (data.galleries && data.galleries.length > 0) {
      return data.galleries;
    }
    return [
      { id: "g-1", imageUrl: "/templates/wedding-3d/cover.jpg", caption: "Cinta Dalam Keheningan Bintang" },
      { id: "g-2", imageUrl: "/templates/wedding-3d/bride.jpg", caption: "Pesona Anggun Sang Pengantin Wanita" },
      { id: "g-3", imageUrl: "/templates/wedding-3d/groom.jpg", caption: "Wibawa & Ketulusan Hati Sang Pria" },
      { id: "g-4", imageUrl: "/templates/wedding-3d/desktop-cover.jpg", caption: "Ikrar Janji Suci Selamanya" },
    ];
  }, [data.galleries]);

  // Bank accounts with fallback
  const bankAccounts: BankAccountItem[] = useMemo(() => {
    if (data.bankAccounts && data.bankAccounts.length > 0) {
      return data.bankAccounts;
    }
    return [
      { id: "bca-1", bankName: "Bank BCA", accountNumber: "1234567890", accountHolder: groomFullName },
      { id: "mandiri-1", bankName: "Bank Mandiri", accountNumber: "0987654321", accountHolder: brideFullName },
    ];
  }, [data.bankAccounts, groomFullName, brideFullName]);

  // 3D Card Tilt Effect handler
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 26}deg) rotateX(${-y * 26}deg) translateZ(14px)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "";
  };

  return (
    <div
      className={`relative w-full ${
        isOpen ? "min-h-screen" : "h-screen overflow-hidden"
      } bg-[#0c1624] text-[#f7f1e8] font-jost overflow-x-hidden selection:bg-[#d4b06a] selection:text-[#0c1624]`}
    >
      {/* Background Audio */}
      <audio
        ref={audioRef}
        src={data.musicUrl || "/music/wedding-romance.mp3"}
        loop
        preload="auto"
      />

      {/* WebGL 3D Canvas Fixed in Background */}
      <canvas
        ref={canvasRef}
        id="gl"
        className="fixed inset-0 w-full h-full z-0 block pointer-events-none"
      />

      {/* =================================================================== */}
      {/* FIXED BOTTOM-RIGHT MUSIC CONTROLLER                                 */}
      {/* =================================================================== */}
      {isFeatureAvailable("music", { data, forcedThemeId: "wedding-3d" }) && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto flex items-center gap-2">
          <button
            onClick={toggleMusic}
            aria-label={isPlaying ? "Jeda Musik" : "Putar Musik"}
            className={`w-12 h-12 rounded-full border border-[#d4b06a] bg-[#0c1624]/90 backdrop-blur-md flex items-center justify-center text-[#d4b06a] shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isPlaying ? "animate-vinyl-spin shadow-[#d4b06a]/20" : ""
            }`}
          >
            {isPlaying ? (
              <Play className="w-5 h-5 fill-current text-[#d4b06a]" />
            ) : (
              <VolumeX className="w-5 h-5 text-[#d4b06a]/70" />
            )}
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* MAIN VIEWPORT LAYOUT (60% Sticky Left / 40% Scrollable Right)       */}
      {/* =================================================================== */}
      <div className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row">
        {/* DESKTOP LEFT PANEL (Sticky 60vw) */}
        {!isEmbedded && (
          <aside className="hidden lg:flex lg:w-[58%] xl:w-[60%] 2xl:w-[62%] h-screen sticky top-0 flex-col justify-between p-12 xl:p-16 border-r border-[#d4b06a]/20 bg-gradient-to-b from-[#0c1624]/75 via-[#0c1624]/45 to-[#0c1624]/80 backdrop-blur-[1px]">
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.35em] text-[#d4b06a]/90 font-medium">
                —— Official Wedding Invitation
              </span>
              <span className="text-xs uppercase tracking-widest text-[#f0cfc7]/80 px-3 py-1 border border-[#d4b06a]/30">
                3D Tema 01
              </span>
            </div>

            {/* Center Couple Typography */}
            <div className="my-auto space-y-6 max-w-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-[#d4b06a]">
                The Sacred Matrimony of
              </p>
              <h2 className="font-pinyon text-7xl xl:text-8xl text-[#d4b06a] drop-shadow-md leading-none">
                {groomNick} &amp; {brideNick}
              </h2>
              <p className="font-cormorant text-xl xl:text-2xl text-[#f7f1e8]/90 italic leading-relaxed border-l-2 border-[#d4b06a] pl-5">
                &ldquo;Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, agar kamu merasa tenteram kepadanya.&rdquo;
                <span className="block not-italic text-xs font-jost uppercase tracking-widest text-[#d4b06a] mt-3">
                  QS. Ar-Rum: 21
                </span>
              </p>

              <div className="pt-4 flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest text-[#f7f1e8]/80 bg-[#1a2440]/60 px-4 py-2 border border-[#d4b06a]/40 backdrop-blur-sm">
                  12 Desember 2026
                </span>
                <span className="text-xs uppercase tracking-widest text-[#d4b06a] bg-[#0c1624]/60 px-4 py-2 border border-[#d4b06a]/40 backdrop-blur-sm">
                  Jakarta, Indonesia
                </span>
              </div>
            </div>

            {/* Bottom Indicators */}
            <div className="flex items-center justify-between text-xs text-[#f7f1e8]/50">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#d4b06a] animate-pulse" />
                <span className="tracking-widest uppercase text-[10px]">
                  Interactive 3D Universe
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tracking-widest uppercase text-[10px]">Scroll Untuk Masuk</span>
                <div className="w-4 h-7 rounded-full border border-[#d4b06a]/50 flex items-start justify-center p-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4b06a] animate-scroll-dot" />
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* RIGHT PANEL: Scrollable Mobile Frame (40vw / max 480px) */}
        <div
          ref={scrollContainerRef}
          className={`w-full ${
            !isEmbedded ? "lg:w-[42%] xl:w-[40%] 2xl:w-[38%]" : "max-w-[480px] mx-auto"
          } ${
            isOpen ? "min-h-screen lg:h-screen lg:overflow-y-auto" : "h-screen overflow-hidden"
          } no-scrollbar relative z-10 flex flex-col items-center`}
        >
          <div
            className={`w-full max-w-[480px] ${
              isOpen ? "min-h-screen pb-28" : "h-full"
            } flex flex-col shadow-2xl relative ${
              isOpen ? "bg-[#0c1624]/25 sm:bg-[#0c1624]/35 backdrop-blur-[1px]" : "bg-[#0c1624]"
            } border-x border-[#d4b06a]/20`}
          >
            {/* =============================================================== */}
            {/* COVER / INVITATION OVERLAY (Aligned 100% on top of card)       */}
            {/* =============================================================== */}
            {showCover && (
              <div
                id="cover"
                className={`absolute inset-0 z-50 flex items-center justify-center transition-all duration-1000 ease-in-out bg-[#0c1624] ${
                  isOpen
                    ? "-translate-y-full opacity-0 pointer-events-none invisible"
                    : "translate-y-0 opacity-100 visible"
                }`}
              >
                <div className="w-full h-full max-w-[480px] mx-auto flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-[#0c1624] border-x border-[#d4b06a]/30 shadow-2xl relative overflow-hidden select-none">
                  {/* Subtle Ambient Night Sky Vignette */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(26,36,64,0.5)_0%,_rgba(12,22,36,0.98)_85%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(212,176,106,0.12)_0%,_transparent_65%)] pointer-events-none" />

                  {/* Subtle Ambient Rings Aura */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-[#d4b06a]/40 animate-pulse flex items-center justify-center mb-4 sm:mb-6 relative z-10 shadow-[0_0_20px_rgba(212,176,106,0.15)]">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#f0cfc7]/40 flex items-center justify-center">
                      <span className="font-cormorant text-lg sm:text-xl text-[#d4b06a] tracking-wider">R&amp;A</span>
                    </div>
                  </div>

                  <p className="text-xs uppercase tracking-[0.35em] text-[#d4b06a]/90 font-medium mb-2.5 sm:mb-3 relative z-10">
                    The Wedding of
                  </p>

                  <h1 className="font-pinyon text-5xl sm:text-7xl lg:text-8xl text-[#d4b06a] drop-shadow-[0_2px_15px_rgba(212,176,106,0.3)] mb-4 sm:mb-6 leading-tight relative z-10">
                    {groomNick} &amp; {brideNick}
                  </h1>

                  <p className="text-xs text-[#f7f1e8]/70 tracking-wider uppercase mb-1.5 relative z-10">
                    Kepada Yth. Bapak/Ibu/Saudara/i
                  </p>

                  <p className="font-cormorant text-2xl sm:text-3xl text-white font-normal mb-6 sm:mb-8 px-6 py-1.5 border-y border-[#d4b06a]/40 inline-block relative z-10 shadow-sm">
                    {guestName}
                  </p>

                  <button
                    type="button"
                    onClick={handleOpenInvitation}
                    className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-[#f7f1e8] bg-[#0c1624] hover:bg-[#d4b06a] hover:text-[#0c1624] border border-[#d4b06a] transition-all duration-300 shadow-xl shadow-black/60 cursor-pointer relative z-10 active:scale-95"
                  >
                    <Mail className="w-4 h-4 text-[#d4b06a] group-hover:text-[#0c1624] transition-colors" />
                    <span>Buka Undangan</span>
                  </button>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* SECTION 1: HERO NAMES & DATE                                     */}
            {/* =============================================================== */}
            <section
              className={`min-h-screen flex flex-col items-center justify-center text-center p-8 relative ${
                !isOpen ? "opacity-0 pointer-events-none" : "opacity-100 transition-opacity duration-700"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.35em] text-[#d4b06a]/90 font-medium mb-4">
                Kami Menikah
              </p>

              {/* Staggered Rising Script Names */}
              <div className="font-pinyon text-6xl sm:text-7xl text-[#f7f1e8] drop-shadow-[0_0_35px_rgba(212,176,106,0.35)] leading-tight mb-4">
                <span className="inline-block">{groomNick}</span>
                <span className="font-cormorant text-3xl text-[#d4b06a] mx-3">&amp;</span>
                <span className="inline-block">{brideNick}</span>
              </div>

              <div className="w-16 h-[1px] bg-[#d4b06a] my-4" />

              <p className="font-cormorant text-xl tracking-widest text-[#f7f1e8]/90">
                Sabtu, 12 Desember 2026
              </p>

              <div className="absolute bottom-8 flex flex-col items-center gap-2 opacity-60 animate-float-bob">
                <span className="text-[10px] uppercase tracking-[0.25em]">Scroll ke Bawah</span>
                <div className="w-4 h-7 rounded-full border border-[#d4b06a] flex items-start justify-center p-1">
                  <div className="w-1 h-1 rounded-full bg-[#d4b06a] animate-scroll-dot" />
                </div>
              </div>
            </section>

            {/* =============================================================== */}
            {/* SECTION 2: BISMILLAH & SACRED VERSE                              */}
            {/* =============================================================== */}
            <section className="py-20 px-8 text-center border-t border-[#d4b06a]/20 bg-[#1a2440]/15">
              <p className="font-pinyon text-5xl text-[#d4b06a] mb-2">Bismillah</p>
              <div className="w-16 h-[1px] bg-[#d4b06a] mx-auto my-5" />
              <p className="font-cormorant italic text-lg sm:text-xl text-[#f7f1e8]/90 leading-relaxed max-w-sm mx-auto">
                &ldquo;Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, agar kamu merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.&rdquo;
              </p>
              <small className="block font-jost text-xs uppercase tracking-widest text-[#d4b06a] mt-4">
                QS. Ar-Rum: 21
              </small>
            </section>

            {/* =============================================================== */}
            {/* SECTION 3: MEMPELAI (GROOM & BRIDE)                              */}
            {/* =============================================================== */}
            <section className="py-20 px-8 text-center border-t border-[#d4b06a]/20">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4b06a] mb-2">
                Pasangan Mempelai
              </p>
              <h2 className="font-cormorant text-3xl sm:text-4xl text-[#d4b06a] mb-12">
                Mempelai
              </h2>

              <div className="space-y-14">
                {/* Groom Card */}
                <div className="flex flex-col items-center">
                  <div
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    className="w-44 h-56 rounded-t-full rounded-b-sm overflow-hidden mb-5 p-1 border border-[#d4b06a] bg-gradient-to-b from-[#1a2440]/80 to-[#0c1624]/80 shadow-xl shadow-black/40 transition-transform duration-200 perspective-900 preserve-3d cursor-pointer"
                  >
                    <img
                      src={groomPhoto}
                      alt={groomFullName}
                      className="w-full h-full object-cover rounded-t-full rounded-b-sm"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/templates/wedding-3d/groom.jpg";
                      }}
                    />
                  </div>
                  <h3 className="font-cormorant text-2xl text-[#d4b06a] font-medium">
                    {groomFullName}
                  </h3>
                  <p className="text-xs text-[#f7f1e8]/80 mt-1 max-w-xs">{groomParents}</p>
                  {data.coupleInfo.groomInstagram && (
                    <a
                      href={`https://instagram.com/${data.coupleInfo.groomInstagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#d4b06a] mt-3 hover:underline"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>{data.coupleInfo.groomInstagram}</span>
                    </a>
                  )}
                </div>

                {/* Romantic Ampersand */}
                <div className="font-pinyon text-5xl text-[#d4b06a]">&amp;</div>

                {/* Bride Card */}
                <div className="flex flex-col items-center">
                  <div
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    className="w-44 h-56 rounded-t-full rounded-b-sm overflow-hidden mb-5 p-1 border border-[#d4b06a] bg-gradient-to-b from-[#1a2440]/80 to-[#0c1624]/80 shadow-xl shadow-black/40 transition-transform duration-200 perspective-900 preserve-3d cursor-pointer"
                  >
                    <img
                      src={bridePhoto}
                      alt={brideFullName}
                      className="w-full h-full object-cover rounded-t-full rounded-b-sm"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/templates/wedding-3d/bride.jpg";
                      }}
                    />
                  </div>
                  <h3 className="font-cormorant text-2xl text-[#d4b06a] font-medium">
                    {brideFullName}
                  </h3>
                  <p className="text-xs text-[#f7f1e8]/80 mt-1 max-w-xs">{brideParents}</p>
                  {data.coupleInfo.brideInstagram && (
                    <a
                      href={`https://instagram.com/${data.coupleInfo.brideInstagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#d4b06a] mt-3 hover:underline"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>{data.coupleInfo.brideInstagram}</span>
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* =============================================================== */}
            {/* FEATURE: QR TICKET ENTRY BADGE                                  */}
            {/* =============================================================== */}
            {isFeatureAvailable("qr_ticket", { data, forcedThemeId: "wedding-3d" }) && (
              <div className="py-6 px-6 text-center border-t border-[#d4b06a]/20 bg-[#1a2440]/15">
                <div className="p-4 border border-[#d4b06a]/40 bg-[#0c1624]/40 backdrop-blur-[2px] flex items-center justify-between gap-3 text-left">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#d4b06a]">Tiket Tamu Undangan</p>
                    <p className="font-cormorant text-lg text-white font-medium">{guestName}</p>
                    <p className="text-[11px] text-[#f7f1e8]/60">Scan QR Code di meja resepsi acara</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(true)}
                    className="px-3.5 py-2 text-xs uppercase tracking-wider text-[#0c1624] bg-[#d4b06a] hover:bg-[#e2c488] font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Buka QR</span>
                  </button>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* SECTION 4: LIVE COUNTDOWN TIMER & CALENDAR                      */}
            {/* =============================================================== */}
            {isFeatureAvailable("countdown", { data, forcedThemeId: "wedding-3d" }) && (
              <section className="py-16 px-6 text-center border-t border-[#d4b06a]/20 bg-[#1a2440]/15">
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4b06a] mb-2">
                  Menghitung Hari
                </p>
                <h2 className="font-cormorant text-3xl text-[#d4b06a] mb-8">
                  Menuju Hari Bahagia
                </h2>

                <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
                  <div className="p-3 border border-[#d4b06a]/50 bg-[#0c1624]/35 backdrop-blur-[2px]">
                    <b className="block font-cormorant text-3xl sm:text-4xl text-white">
                      {String(timeLeft.days).padStart(2, "0")}
                    </b>
                    <span className="text-[10px] uppercase tracking-widest text-[#d4b06a]/80">
                      Hari
                    </span>
                  </div>
                  <div className="p-3 border border-[#d4b06a]/50 bg-[#0c1624]/35 backdrop-blur-[2px]">
                    <b className="block font-cormorant text-3xl sm:text-4xl text-white">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </b>
                    <span className="text-[10px] uppercase tracking-widest text-[#d4b06a]/80">
                      Jam
                    </span>
                  </div>
                  <div className="p-3 border border-[#d4b06a]/50 bg-[#0c1624]/35 backdrop-blur-[2px]">
                    <b className="block font-cormorant text-3xl sm:text-4xl text-white">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </b>
                    <span className="text-[10px] uppercase tracking-widest text-[#d4b06a]/80">
                      Menit
                    </span>
                  </div>
                  <div className="p-3 border border-[#d4b06a]/50 bg-[#0c1624]/35 backdrop-blur-[2px]">
                    <b className="block font-cormorant text-3xl sm:text-4xl text-white">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </b>
                    <span className="text-[10px] uppercase tracking-widest text-[#d4b06a]/80">
                      Detik
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-widest text-[#f7f1e8] bg-[#0c1624]/40 hover:bg-[#d4b06a] hover:text-[#0c1624] border border-[#d4b06a] transition-colors backdrop-blur-[2px]"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#d4b06a]" />
                    <span>Simpan ke Kalender</span>
                  </a>
                </div>
              </section>
            )}

            {/* =============================================================== */}
            {/* SECTION 5: RANGKAIAN ACARA & GOOGLE MAPS                        */}
            {/* =============================================================== */}
            <section className="py-20 px-6 text-center border-t border-[#d4b06a]/20">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4b06a] mb-2">
                Agenda Sakral
              </p>
              <h2 className="font-cormorant text-3xl sm:text-4xl text-[#d4b06a] mb-10">
                Rangkaian Acara
              </h2>

              <div className="space-y-6">
                {(data.eventSchedules && data.eventSchedules.length > 0
                  ? data.eventSchedules
                  : [
                      {
                        id: "ev-1",
                        eventName: "Akad Nikah",
                        date: "2026-12-12T08:00:00+07:00",
                        startTime: "08:00 WIB",
                        endTime: "10:00 WIB",
                        venueName: "Masjid Al-Ikhlas",
                        address: "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan",
                        mapsUrl: "https://maps.google.com/?q=Jakarta",
                      },
                      {
                        id: "ev-2",
                        eventName: "Resepsi Pernikahan",
                        date: "2026-12-12T11:00:00+07:00",
                        startTime: "11:00 WIB",
                        endTime: "14:00 WIB",
                        venueName: "Gedung Serbaguna Mawar",
                        address: "Jl. Mawar No. 5, Kebayoran Baru, Jakarta Selatan",
                        mapsUrl: "https://maps.google.com/?q=Jakarta",
                      },
                    ]
                ).map((ev: EventScheduleItem) => (
                  <div
                    key={ev.id}
                    className="p-8 border border-[#d4b06a]/70 bg-[#0c1624]/35 backdrop-blur-[2px] text-center space-y-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4b06a] to-transparent" />
                    <h3 className="font-cormorant text-2xl text-[#d4b06a] font-normal">
                      {ev.eventName}
                    </h3>
                    <div className="w-12 h-[1px] bg-[#d4b06a]/40 mx-auto" />
                    <p className="text-sm font-medium text-white">
                      {ev.startTime} {ev.endTime ? `– ${ev.endTime}` : ""}
                    </p>
                    <p className="text-sm font-semibold text-[#f0cfc7]">{ev.venueName}</p>
                    <p className="text-xs text-[#f7f1e8]/75 leading-relaxed max-w-xs mx-auto">
                      {ev.address}
                    </p>
                    {ev.mapsUrl && (
                      <div className="pt-3">
                        <a
                          href={ev.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] uppercase tracking-widest text-[#f7f1e8] bg-[#1a2440]/40 hover:bg-[#d4b06a] hover:text-[#0c1624] border border-[#d4b06a]/60 transition-colors"
                        >
                          <MapPin className="w-3 h-3 text-[#d4b06a]" />
                          <span>Buka Petunjuk Rute</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Embedded Google Maps */}
              {isFeatureAvailable("google_maps", { data, forcedThemeId: "wedding-3d" }) && (
                <div className="mt-8 overflow-hidden border border-[#d4b06a]/40 bg-[#0c1624]/40 backdrop-blur-[2px]">
                  <GoogleMapEmbed
                    venueName={data.eventSchedules?.[0]?.venueName || "Lokasi Acara"}
                    address={
                      (data.eventSchedules && data.eventSchedules[0]?.address) ||
                      "Masjid Al-Ikhlas Kebayoran Baru Jakarta"
                    }
                    mapsUrl={data.eventSchedules?.[0]?.mapsUrl}
                    latitude={data.eventSchedules?.[0]?.latitude}
                    longitude={data.eventSchedules?.[0]?.longitude}
                    heightClass="h-56 sm:h-64"
                  />
                </div>
              )}
            </section>

            {/* =============================================================== */}
            {/* SECTION: PERJALANAN KASIH (LOVE STORY)                           */}
            {/* =============================================================== */}
            {isFeatureAvailable("love_story", { data, forcedThemeId: "wedding-3d" }) && (
              <section className="py-20 px-6 text-center border-t border-[#d4b06a]/20 bg-[#1a2440]/15">
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4b06a] mb-2">
                  Perjalanan Cinta
                </p>
                <h2 className="font-cormorant text-3xl sm:text-4xl text-[#d4b06a] mb-10">
                  Kisah Kasih Kami
                </h2>
                <div className="relative max-w-sm mx-auto text-left pl-6 border-l border-[#d4b06a]/60 space-y-8 py-2">
                  {(data.coupleInfo.stories && data.coupleInfo.stories.length > 0
                    ? data.coupleInfo.stories
                    : DEFAULT_3D_STORIES
                  ).map((st, i) => (
                    <div key={i} className="relative pl-4">
                      <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#0c1624] border-2 border-[#d4b06a] shadow-[0_0_10px_rgba(212,176,106,0.5)]" />
                      <span className="text-[11px] uppercase tracking-widest text-[#d4b06a] font-semibold block">
                        {st.date}
                      </span>
                      <h3 className="font-cormorant text-xl text-white my-1 font-medium">
                        {st.title}
                      </h3>
                      <p className="text-xs text-[#f7f1e8]/80 leading-relaxed font-light">{st.story}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* =============================================================== */}
            {/* SECTION 6: GALERI 3D TILT CARDS                                 */}
            {/* =============================================================== */}
            {isFeatureAvailable("gallery", { data, forcedThemeId: "wedding-3d" }) && (
              <section className="py-20 px-6 text-center border-t border-[#d4b06a]/20 bg-[#1a2440]/15">
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4b06a] mb-2">
                  Momen Indah
                </p>
                <h2 className="font-cormorant text-3xl sm:text-4xl text-[#d4b06a] mb-10">
                  Galeri Foto
                </h2>

                <div className="grid grid-cols-2 gap-4 perspective-900">
                  {galleryItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                      onClick={() => setLightboxImg(item.imageUrl)}
                      className="aspect-[3/4] border border-[#d4b06a] bg-cover bg-center overflow-hidden preserve-3d transition-transform duration-200 cursor-pointer shadow-lg shadow-black/40 group relative"
                      style={{ backgroundImage: `url('${item.imageUrl}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-[10px] text-[#f7f1e8] tracking-wider leading-tight text-left">
                          {item.caption || "Preview Foto"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* =============================================================== */}
            {/* SECTION 7: KONFIRMASI KEHADIRAN (RSVP) & WISHES                  */}
            {/* =============================================================== */}
            <section className="py-20 px-6 text-center border-t border-[#d4b06a]/20">
              {isFeatureAvailable("rsvp", { data, forcedThemeId: "wedding-3d" }) && (
                <>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#d4b06a] mb-2">
                    RSVP &amp; Doa Restu
                  </p>
                  <h2 className="font-cormorant text-3xl sm:text-4xl text-[#d4b06a] mb-10">
                    Konfirmasi Kehadiran
                  </h2>

                  <form onSubmit={handleRsvpSubmit} className="space-y-4 text-left max-w-sm mx-auto">
                    <div>
                      <label htmlFor="rsvp-name" className="block text-xs uppercase tracking-wider text-[#d4b06a] mb-1.5">
                        Nama Anda
                      </label>
                      <input
                        id="rsvp-name"
                        type="text"
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        required
                        placeholder="Nama lengkap atau panggilan"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#0c1624]/45 backdrop-blur-[2px] border border-[#d4b06a]/60 text-[#f7f1e8] focus:border-[#d4b06a] focus:outline-none placeholder:text-[#f7f1e8]/30"
                      />
                    </div>

                    <div>
                      <label htmlFor="rsvp-att" className="block text-xs uppercase tracking-wider text-[#d4b06a] mb-1.5">
                        Konfirmasi Kehadiran
                      </label>
                      <select
                        id="rsvp-att"
                        value={rsvpAttendance}
                        onChange={(e) => setRsvpAttendance(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#0c1624]/50 backdrop-blur-[2px] border border-[#d4b06a]/60 text-[#f7f1e8] focus:border-[#d4b06a] focus:outline-none"
                      >
                        <option value="Hadir" className="bg-[#0c1624] text-white">Hadir</option>
                        <option value="Tidak Hadir" className="bg-[#0c1624] text-white">Tidak Hadir</option>
                        <option value="Masih Ragu" className="bg-[#0c1624] text-white">Masih Ragu</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="rsvp-msg" className="block text-xs uppercase tracking-wider text-[#d4b06a] mb-1.5">
                        Ucapan &amp; Doa
                      </label>
                      <textarea
                        id="rsvp-msg"
                        rows={3}
                        value={rsvpMessage}
                        onChange={(e) => setRsvpMessage(e.target.value)}
                        required
                        placeholder="Tuliskan doa restu untuk kedua mempelai..."
                        className="w-full px-3.5 py-2.5 text-sm bg-[#0c1624]/45 backdrop-blur-[2px] border border-[#d4b06a]/60 text-[#f7f1e8] focus:border-[#d4b06a] focus:outline-none placeholder:text-[#f7f1e8]/30"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 text-xs uppercase tracking-[0.25em] text-[#f7f1e8] bg-[#0c1624]/50 hover:bg-[#d4b06a] hover:text-[#0c1624] border border-[#d4b06a] transition-colors cursor-pointer mt-4 backdrop-blur-[2px]"
                    >
                      Kirim Konfirmasi
                    </button>

                    {formSubmitted && (
                      <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs text-center flex items-center justify-center gap-1.5 mt-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Terima kasih atas ucapan dan konfirmasi kehadiran Anda!</span>
                      </div>
                    )}
                  </form>
                </>
              )}

              {/* Wishes Feed */}
              {isFeatureAvailable("wishes", { data, forcedThemeId: "wedding-3d" }) && (
                <div className="mt-12 space-y-3 max-h-72 overflow-y-auto no-scrollbar text-left max-w-sm mx-auto">
                  <p className="text-xs uppercase tracking-widest text-[#d4b06a] font-medium mb-3">
                    Buku Doa &amp; Ucapan ({wishes.length})
                  </p>
                  {wishes.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 border border-[#d4b06a]/30 bg-[#0c1624]/30 backdrop-blur-[2px] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#d4b06a]">{w.senderName}</span>
                        <span className="text-[10px] text-[#f0cfc7]/80 bg-[#1a2440]/80 px-2 py-0.5 border border-[#d4b06a]/20">
                          {w.attendance}
                        </span>
                      </div>
                      <p className="text-xs text-[#f7f1e8]/90 leading-relaxed">{w.message}</p>
                      <span className="text-[10px] text-[#f7f1e8]/40 block">{w.timeAgo}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* =============================================================== */}
            {/* SECTION 8: AMPLOP DIGITAL (DIGITAL GIFTS)                        */}
            {/* =============================================================== */}
            {isFeatureAvailable("digital_gift", { data, forcedThemeId: "wedding-3d" }) && (
              <section className="py-20 px-6 text-center border-t border-[#d4b06a]/20 bg-[#1a2440]/15">
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4b06a] mb-2">
                  Tanda Kasih
                </p>
                <h2 className="font-cormorant text-3xl sm:text-4xl text-[#d4b06a] mb-4">
                  Amplop Digital
                </h2>
                <p className="text-xs text-[#f7f1e8]/70 max-w-xs mx-auto mb-8 leading-relaxed">
                  Kehadiran dan doa restu Anda adalah anugerah terindah bagi kami. Namun jika berkenan memberikan tanda kasih, dapat disalurkan melalui rekening berikut:
                </p>

                <div className="space-y-4 max-w-sm mx-auto">
                  {bankAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-6 border border-[#d4b06a]/70 bg-[#0c1624]/35 backdrop-blur-[2px] text-center space-y-2 relative"
                    >
                      <p className="text-xs uppercase tracking-widest text-[#d4b06a] font-medium">
                        {acc.bankName}
                      </p>
                      <b className="block font-cormorant text-2xl text-white tracking-wider">
                        {acc.accountNumber}
                      </b>
                      <p className="text-xs text-[#f7f1e8]/80">a.n. {acc.accountHolder}</p>
                      <button
                        onClick={() => handleCopy(acc.accountNumber, acc.id || acc.accountNumber)}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] uppercase tracking-widest text-[#f7f1e8] bg-[#1a2440]/40 hover:bg-[#d4b06a] hover:text-[#0c1624] border border-[#d4b06a]/60 transition-colors cursor-pointer"
                      >
                        {isCopied === (acc.id || acc.accountNumber) ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#d4b06a]" />
                            <span>Salin Nomor</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* =============================================================== */}
            {/* SECTION: KIRIM KADO FISIK (PHYSICAL GIFT)                        */}
            {/* =============================================================== */}
            {isFeatureAvailable("physical_gift", { data, forcedThemeId: "wedding-3d" }) && physicalGiftList.length > 0 && (
              <section className="py-16 px-6 text-center border-t border-[#d4b06a]/20 bg-[#0c1624]/20">
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4b06a] mb-2">
                  Kirim Hadiah
                </p>
                <h2 className="font-cormorant text-3xl sm:text-4xl text-[#d4b06a] mb-4">
                  Kirim Kado Fisik
                </h2>
                <p className="text-xs text-[#f7f1e8]/70 max-w-xs mx-auto mb-6 leading-relaxed">
                  Bagi keluarga dan sahabat yang ingin mengirimkan kado atau bingkisan fisik ke kediaman mempelai:
                </p>
                <div className="space-y-4 max-w-sm mx-auto">
                  {physicalGiftList.map((item, idx) => {
                    const copyKey = `physical-gift-${item.id || idx}`;
                    const fullText = `${item.receiver || `${groomNick} & ${brideNick}`}\n${item.address}\nTelp: ${item.phone || "-"}`;
                    return (
                      <div
                        key={item.id || idx}
                        className="p-6 border border-[#d4b06a]/70 bg-[#1a2440]/30 backdrop-blur-[2px] text-left space-y-2.5"
                      >
                        <div className="flex items-center gap-2 text-[#d4b06a] text-xs font-semibold uppercase tracking-wider">
                          <MapPin className="w-4 h-4" />
                          <span>{item.title || `Alamat ${idx + 1}`}</span>
                        </div>
                        <p className="text-sm font-medium text-white">{item.receiver || `${groomNick} & ${brideNick}`}</p>
                        <p className="text-xs text-[#f7f1e8]/85 leading-relaxed">{item.address}</p>
                        {item.phone && <p className="text-xs text-[#d4b06a]/90 font-mono">No. Telp: {item.phone}</p>}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(fullText, copyKey)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] uppercase tracking-widest text-[#f7f1e8] bg-[#0c1624]/50 hover:bg-[#d4b06a] hover:text-[#0c1624] border border-[#d4b06a]/60 transition-colors cursor-pointer"
                          >
                            {isCopied === copyKey ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Alamat Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#d4b06a]" />
                                <span>Salin Alamat Lengkap</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* =============================================================== */}
            {/* SECTION 9: FOOTER & CLOSING                                      */}
            {/* =============================================================== */}
            <footer className="py-20 px-6 text-center border-t border-[#d4b06a]/20 space-y-4">
              <p className="text-xs tracking-wider text-[#f7f1e8]/75">
                Terima kasih atas doa dan kehadirannya
              </p>
              <p className="font-pinyon text-5xl sm:text-6xl text-[#d4b06a]">
                {groomNick} &amp; {brideNick}
              </p>
              <div className="w-12 h-[1px] bg-[#d4b06a]/40 mx-auto my-4" />
              <small className="text-[10px] text-[#f7f1e8]/40 tracking-widest uppercase block">
                Invity • 3D Tema 01 • by Fasaro
              </small>
            </footer>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden">
            <img
              src={lightboxImg}
              alt="Preview Galeri"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#d4b06a] hover:text-[#0c1624] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Guest QR Code Ticket Modal */}
      {showTicketModal && isFeatureAvailable("qr_ticket", { data, forcedThemeId: "wedding-3d" }) && (
        <div
          onClick={() => setShowTicketModal(false)}
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0c1624] border border-[#d4b06a] max-w-xs w-full p-6 text-center space-y-4 shadow-2xl relative"
          >
            <button
              onClick={() => setShowTicketModal(false)}
              className="absolute top-3 right-3 text-[#f7f1e8]/60 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-2 text-[#d4b06a]">
              <QrCode className="w-5 h-5" />
              <span className="font-cormorant text-xl tracking-wider">Tiket Masuk Resepsi</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#d4b06a]/80">Tamu Terhormat</p>
              <h4 className="font-cormorant text-2xl text-white">{guestName}</h4>
            </div>
            <div className="bg-white p-3 inline-block mx-auto border border-[#d4b06a]">
              {guestQrDataUrl ? (
                <img src={guestQrDataUrl} alt="QR Tamu" className="w-44 h-44 mx-auto" />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-black">
                  Membuat QR...
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#f7f1e8]/75 leading-relaxed">
              Tunjukkan kode QR ini kepada penerima tamu di meja resepsi untuk verifikasi kehadiran.
            </p>
            <button
              type="button"
              onClick={() => setShowTicketModal(false)}
              className="w-full py-2.5 text-xs uppercase tracking-widest text-[#0c1624] bg-[#d4b06a] font-semibold hover:bg-[#e2c488] transition-colors cursor-pointer"
            >
              Tutup Tiket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wedding3DTheme;
