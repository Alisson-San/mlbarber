"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const INITIAL_DATA = {
  shop: {
    name: "ML BARBER",
    tagline: "Cortes que elevam sua presença",
    subtitle: "Estilo, atitude e identidade em Carlos Barbosa — Serra Gaúcha",
    whatsapp: "5554999999999",
    instagram: "mlbarber._",
    city: "Carlos Barbosa - RS",
    followers: "+3.980",
    clientsServed: "+5.200",
    activeBarbersCount: "2",
    experienceLabel: "Referência na Serra",
  },
  barbers: [
    {
      id: "mateus",
      name: "Mateus Lopes",
      role: "Fundador & Master Barber",
      chair: "Cadeira 01",
      specialty: "Degradê Navalhado, Barboterapia & Visagismo",
      avatarUrl: "/assets/barber-mateus.webp",
      active: true,
    },
    {
      id: "alex",
      name: "Alex Minuzzo",
      role: "Barber Stylist",
      chair: "Cadeira 02",
      specialty: "Fade Limpo, Texturizado & Acabamento Preciso",
      avatarUrl: "/assets/barber-alex.webp",
      active: true,
    },
  ],
  services: [
    { id: "corte", name: "Corte Masculino / Fade", duration: "40 min", price: 50 },
    { id: "combo", name: "Combo Corte + Barba Completa", duration: "60 min", price: 80 },
    { id: "barba", name: "Barboterapia Toalha Quente", duration: "30 min", price: 40 },
    { id: "acabamento", name: "Pezinho + Sobrancelha na Navalha", duration: "20 min", price: 25 },
  ],
  timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
};

const TOTAL_VIDEO_FRAMES = 240;

type UiStage = "hero" | "wide" | "workbench" | "booking";

export default function MLBarberVideoExperience() {
  const [data, setData] = useState<any>(INITIAL_DATA);
  const [uiStage, setUiStage] = useState<UiStage>("hero");

  // Estados do Menu Prático de Agendamento (Ato 3 - Cadeira de Frente)
  const [selectedBarberId, setSelectedBarberId] = useState<string>("mateus");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("combo");
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedTime, setSelectedTime] = useState<string>("15:00");
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [bookingConfirmed, setBookingConfirmed] = useState<any>(null);

  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroContainerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<UiStage>("hero");

  // Sincroniza dados dinâmicos do painel Admin sem bloquear a abertura imediata do site
  useEffect(() => {
    fetch("/api/shop")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.shop) {
          setData(d);
          const firstActive = d.barbers?.find((b: any) => b.active);
          if (firstActive) setSelectedBarberId(firstActive.id);
        }
      })
      .catch(() => {});
  }, []);

  // Motor Canvas 60fps/120fps com 240 Quadros Nativos (24fps), Sub-Frame Blending e ZERO Re-renders do React no Scroll
  useEffect(() => {
    const wrapper = scrollWrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const isMobile = window.innerWidth < 768;
    let lenis: Lenis | null = null;
    const onTicker = (t: number) => lenis?.raf(t * 1000);

    if (!isMobile) {
      lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(onTicker);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    const images: (HTMLImageElement | null)[] = new Array(TOTAL_VIDEO_FRAMES).fill(null);
    const loadedFlags: boolean[] = new Array(TOTAL_VIDEO_FRAMES).fill(false);
    const playhead = { progress: 0 };

    // Função de suavização Hermite (evita trancos de velocidade ao entrar e sair dos Timelapses)
    const smoothstep = (t: number) => t * t * (3 - 2 * t);

    // Curva de Scroll Não-Linear para 240 quadros nativos (0 a 239):
    // • 0.00 -> 0.22: Abertura do nome + Visão limpa da barbearia inteira (Quadros 0 a 40)
    // • 0.22 -> 0.30: TIMELAPSE 1 — Acelera suavemente até a bancada (Quadros 40 a 107)
    // • 0.30 -> 0.60: Motion suave na bancada de ferramentas (Quadros 107 a 155)
    // • 0.60 -> 0.68: TIMELAPSE 2 — Acelera da bancada para a cadeira (Quadros 155 a 184)
    // • 0.68 -> 0.88: Giro suave da cadeira de frente para a câmera (Quadros 184 a 239)
    // • 0.88 -> 1.00: Cadeira posicionada + Menu de Agendamento (Quadro 239)
    const mapProgressToExactFrame = (p: number): number => {
      const clamped = Math.max(0, Math.min(1, p));
      if (clamped <= 0.22) {
        return (clamped / 0.22) * 40;
      }
      if (clamped <= 0.3) {
        const t = smoothstep((clamped - 0.22) / 0.08);
        return 40 + t * (107 - 40);
      }
      if (clamped <= 0.6) {
        const t = (clamped - 0.3) / 0.3;
        return 107 + t * (155 - 107);
      }
      if (clamped <= 0.68) {
        const t = smoothstep((clamped - 0.6) / 0.08);
        return 155 + t * (184 - 155);
      }
      if (clamped <= 0.88) {
        const t = (clamped - 0.68) / 0.2;
        return 184 + t * (239 - 184);
      }
      return 239;
    };

    // Encontra o quadro carregado mais próximo caso o usuário role antes do fim do pré-carregamento
    const getNearestLoadedImage = (targetIdx: number): HTMLImageElement | null => {
      if (loadedFlags[targetIdx] && images[targetIdx]) return images[targetIdx];
      for (let delta = 1; delta < TOTAL_VIDEO_FRAMES; delta++) {
        const prev = targetIdx - delta;
        const next = targetIdx + delta;
        if (prev >= 0 && loadedFlags[prev] && images[prev]) return images[prev];
        if (next < TOTAL_VIDEO_FRAMES && loadedFlags[next] && images[next]) return images[next];
      }
      return null;
    };

    // Desenha o quadro com interpolação sub-frame (suaviza 24fps para 60fps+ nos movimentos lentos)
    const renderFrame = (exactFrame: number) => {
      if (!ctx) return;
      const baseIdx = Math.max(0, Math.min(TOTAL_VIDEO_FRAMES - 1, Math.floor(exactFrame)));
      const nextIdx = Math.min(TOTAL_VIDEO_FRAMES - 1, baseIdx + 1);
      const frac = exactFrame - baseIdx;

      const img = getNearestLoadedImage(baseIdx);
      if (!img) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const ch = Math.max(1, Math.floor(canvas.clientHeight * dpr));

      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;

      // Suaviza o enquadramento pelos quadros reais da bancada (72..173 em 24fps), ocultando o reflexo superior
      let toolFocusBell = 0;
      if (exactFrame >= 72 && exactFrame < 105) {
        toolFocusBell = 0.5 - 0.5 * Math.cos(((exactFrame - 72) / 33) * Math.PI);
      } else if (exactFrame >= 105 && exactFrame <= 155) {
        toolFocusBell = 1;
      } else if (exactFrame > 155 && exactFrame <= 173) {
        toolFocusBell = 0.5 + 0.5 * Math.cos(((exactFrame - 155) / 18) * Math.PI);
      }

      const extraZoom = 1 + toolFocusBell * 0.22;

      let baseW = cw;
      let baseH = ch;
      if (canvasRatio > imgRatio) {
        baseH = cw / imgRatio;
      } else {
        baseW = ch * imgRatio;
      }

      const drawW = baseW * extraZoom;
      const drawH = baseH * extraZoom;

      // Foco horizontal responsivo (no celular, foca na cadeira girando à esquerda no Ato 3)
      let focalX = 0.5;
      if (canvasRatio < 1) {
        if (exactFrame < 72) focalX = 0.48;
        else if (exactFrame <= 173) focalX = 0.5;
        else focalX = 0.37;
      }

      // Foco vertical (desce para 0.88 durante os quadros da bancada para destacar máquinas e tesouras)
      const focalY = 0.5 + toolFocusBell * 0.38;

      const offsetX = (cw - drawW) * focalX;
      const offsetY = (ch - drawH) * focalY;

      ctx.globalAlpha = 1;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      // Sub-frame blending: mistura suavemente o próximo quadro quando ambos estão carregados
      if (frac > 0.04 && frac < 0.96 && loadedFlags[baseIdx] && loadedFlags[nextIdx] && images[nextIdx]) {
        ctx.globalAlpha = frac;
        ctx.drawImage(images[nextIdx]!, offsetX, offsetY, drawW, drawH);
        ctx.globalAlpha = 1;
      }
    };

    // Atualiza elementos contínuos direto na GPU via DOM ref (sem acionar re-render do React a cada frame!)
    const syncContinuousDOM = (p: number) => {
      if (heroContainerRef.current) {
        const heroExit = Math.min(1, Math.max(0, p / 0.13));
        const opacity = Math.max(0, 1 - heroExit * 1.15);
        heroContainerRef.current.style.opacity = String(opacity);
        heroContainerRef.current.style.transform = `translate3d(0, ${-heroExit * 68}px, 0) scale(${1 + heroExit * 0.05})`;
        heroContainerRef.current.style.pointerEvents = heroExit < 0.92 ? "auto" : "none";
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${Math.max(2, p * 100)}%`;
      }

      // Só aciona o React quando muda de cena (apenas 3 vezes em todo o scroll!)
      const nextStage: UiStage =
        p < 0.11 ? "hero" : p < 0.27 ? "wide" : p < 0.65 ? "workbench" : "booking";
      if (nextStage !== stageRef.current) {
        stageRef.current = nextStage;
        setUiStage(nextStage);
      }
    };

    // Carrega quadros em ordem de prioridade com decodificação assíncrona fora da thread principal (img.decode)
    let cancelled = false;
    const priorityOrder: number[] = [0];
    // Passo 1: Keyframes espaçados a cada 6 quadros (garante cobertura imediata de todo o vídeo)
    for (let i = 5; i < TOTAL_VIDEO_FRAMES; i += 6) priorityOrder.push(i);
    // Passo 2: Quadros pares intermediários
    for (let i = 2; i < TOTAL_VIDEO_FRAMES; i += 2) {
      if (!priorityOrder.includes(i)) priorityOrder.push(i);
    }
    // Passo 3: Todos os quadros restantes para 24fps completos
    for (let i = 1; i < TOTAL_VIDEO_FRAMES; i++) {
      if (!priorityOrder.includes(i)) priorityOrder.push(i);
    }

    const loadSingleFrame = (idx: number): Promise<void> =>
      new Promise((resolve) => {
        if (cancelled) return resolve();
        const img = new Image();
        img.decoding = "async";
        img.src = `/assets/tour-frames/frame_${String(idx + 1).padStart(4, "0")}.webp?v=24fps`;
        img.onload = () => {
          if (cancelled) return resolve();
          // Decodifica o bitmap em background antes de entregar ao canvas (evita engasgos no drawImage)
          img
            .decode()
            .catch(() => {})
            .finally(() => {
              if (cancelled) return resolve();
              images[idx] = img;
              loadedFlags[idx] = true;
              const currentExact = mapProgressToExactFrame(playhead.progress);
              if (idx === 0 || Math.abs(idx - currentExact) <= 4) {
                renderFrame(currentExact);
              }
              resolve();
            });
        };
        img.onerror = () => resolve();
      });

    (async () => {
      await loadSingleFrame(0);
      const concurrency = 8;
      let cursor = 1;
      const workers = Array.from({ length: concurrency }, async () => {
        while (!cancelled && cursor < priorityOrder.length) {
          const nextIdx = priorityOrder[cursor++];
          await loadSingleFrame(nextIdx);
        }
      });
      await Promise.all(workers);
    })();

    // IMPORTANTE: onUpdate fica no Tween (e não no scrollTrigger) para rodar a 60fps/120fps durante toda a interpolação do scrub!
    const st = gsap.to(playhead, {
      progress: 1,
      ease: "none",
      onUpdate: () => {
        const p = playhead.progress;
        syncContinuousDOM(p);
        renderFrame(mapProgressToExactFrame(p));
      },
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
      },
    });

    const handleResize = () => {
      renderFrame(mapProgressToExactFrame(playhead.progress));
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      st.scrollTrigger?.kill();
      st.kill();
      gsap.ticker.remove(onTicker);
      lenis?.destroy();
    };
  }, []);

  // Função para rolar suavemente até um momento específico do vídeo quando o usuário clica no Menu Rápido
  function jumpToMoment(targetPct: number) {
    if (!scrollWrapperRef.current) return;
    const maxScroll = scrollWrapperRef.current.scrollHeight - window.innerHeight;
    window.scrollTo({ top: maxScroll * targetPct, behavior: "smooth" });
  }

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName || !clientPhone || !data) return;

    const barber = data.barbers.find((b: any) => b.id === selectedBarberId);
    const service = data.services.find((s: any) => s.id === selectedServiceId);

    const payload = {
      clientName,
      clientPhone,
      barberId: barber?.id,
      barberName: barber?.name,
      chair: barber?.chair,
      serviceName: service?.name,
      price: service?.price,
      date: selectedDate,
      time: selectedTime,
    };

    const res = await fetch("/api/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "book", booking: payload }),
    });
    const json = await res.json();
    if (json.ok) {
      setBookingConfirmed({ ...payload, id: json.booking.id });
    }
  }

  const { shop, barbers, services, timeSlots } = data;
  const activeBarbers = barbers.filter((b: any) => b.active);
  const currentBarber =
    activeBarbers.find((b: any) => b.id === selectedBarberId) || activeBarbers[0];
  const currentService =
    services.find((s: any) => s.id === selectedServiceId) || services[0];

  const currentAct = uiStage === "hero" || uiStage === "wide" ? 1 : uiStage === "workbench" ? 2 : 3;
  const showWideShopBadge = uiStage === "wide";
  const showWorkbenchCard = uiStage === "workbench";
  const showBookingCard = uiStage === "booking";

  return (
    <div ref={scrollWrapperRef} className="relative h-[320vh] w-full select-none">
      {/* PALCO FIXO 100dvh ONDE O VÍDEO E OS ELEMENTOS ACONTECEM */}
      <div
        className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-[#0F1411] bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/tour-frames/frame_0001.webp?v=24fps')" }}
      >
        {/* CAMADA 0: VÍDEO INTERATIVO NO CANVAS */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

        {/* Vinheta Superior & Inferior (Mais transparente no meio para preservar 100% da nitidez e iluminação do vídeo) */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 bg-gradient-to-b from-black/45 via-transparent to-black/55 ${
            showWideShopBadge ? "opacity-25" : "opacity-85"
          }`}
        />

        {/* BARRA DE NAVEGAÇÃO RÁPIDA NO TOPO (Pílula Prática Desktop & Mobile) */}
        <header className="absolute top-4 sm:top-6 inset-x-0 z-40 max-w-6xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2">
          <button
            onClick={() => jumpToMoment(0)}
            className="flex items-center gap-2.5 bg-[#FAF8F5]/95 backdrop-blur-md text-[#181B19] px-3.5 py-2 rounded-full shadow-lg border border-white/40"
          >
            <img
              src="/assets/logo-ml.webp"
              alt="ML Barber"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="font-serif font-black text-xs sm:text-sm tracking-wider">ML BARBER</span>
          </button>

          {/* Seletor Rápido dos 3 Momentos do Vídeo */}
          <nav className="flex items-center gap-1 bg-black/55 backdrop-blur-xl p-1 rounded-full border border-white/15">
            <button
              onClick={() => jumpToMoment(0)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                currentAct === 1 ? "bg-[#FAF8F5] text-[#181B19]" : "text-white/75 hover:text-white"
              }`}
            >
              1. Início
            </button>
            <button
              onClick={() => jumpToMoment(0.42)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                currentAct === 2 ? "bg-[#FAF8F5] text-[#181B19]" : "text-white/75 hover:text-white"
              }`}
            >
              2. A Bancada
            </button>
            <button
              onClick={() => jumpToMoment(0.92)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                currentAct === 3
                  ? "bg-[#1F3D2B] text-[#FAF8F5] shadow-md"
                  : "text-emerald-300 hover:text-white"
              }`}
            >
              💈 3. Agendar
            </button>
          </nav>

          <a
            href="/admin"
            className="hidden sm:inline-flex px-3.5 py-2 rounded-full bg-black/45 backdrop-blur-md text-[11px] font-semibold text-white/70 hover:text-white border border-white/10"
          >
            Admin
          </a>
        </header>

        {/* =====================================================================
            ATO 1 (Scroll 0% a 22%):
            1. Nos primeiros scrolls (0% -> 13%), o nome e a logo abrem/sobem suavemente via GPU ref (zero lag).
            2. Em seguida (11% -> 27%), a barbearia toda aparece limpa antes do timelapse para a bancada.
           ===================================================================== */}
        <div
          ref={heroContainerRef}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center will-change-transform"
        >
          {/* Selo Localização */}
          <span className="px-4 py-1.5 rounded-full bg-[#1F3D2B]/90 backdrop-blur-md border border-emerald-400/30 text-[#FAF8F5] text-[10px] sm:text-xs font-bold uppercase tracking-[0.28em] mb-5 shadow-xl">
            🌿 {shop.city} • {shop.experienceLabel}
          </span>

          {/* Logo Oficial no Centro */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#FAF8F5] p-1.5 shadow-[0_0_50px_rgba(0,0,0,0.6)] mb-4">
            <img
              src="/assets/logo-ml.webp"
              alt="Logo ML Barber"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          {/* Nome Grande ML BARBER com Blur Sumindo Abaixo */}
          <div className="relative">
            <h1 className="font-serif font-black text-[16vw] sm:text-[11vw] leading-[0.88] tracking-tighter text-[#FAF8F5] title-blur-fade drop-shadow-2xl">
              {shop.name}
            </h1>
            <div className="h-8 w-full -mt-6 backdrop-blur-[3px] pointer-events-none" />
          </div>

          <p className="text-sm sm:text-lg text-[#EFECE6] max-w-md font-medium mt-1 drop-shadow">
            {shop.tagline}
          </p>

          {/* CTA Rápido ou Instrução de Scroll */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => jumpToMoment(0.92)}
              className="px-7 py-3.5 rounded-full bg-[#FAF8F5] text-[#181B19] font-extrabold text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-[#1F3D2B] hover:text-white transition-colors"
            >
              💈 Ir Direto para Agendamento
            </button>
            <button
              onClick={() => jumpToMoment(0.42)}
              className="px-5 py-3 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-semibold"
            >
              Role para entrar na barbearia ↓
            </button>
          </div>
        </div>

        {/* LEGENDA DISCRETA QUANDO O TÍTULO ABRE E MOSTRA A BARBEARIA INTEIRA (Scroll 11% a 26%) */}
        <div
          className={`absolute inset-x-0 bottom-8 z-20 flex justify-center px-4 pointer-events-none transition-all duration-500 ${
            showWideShopBadge ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-[#FAF8F5] text-xs font-semibold tracking-wider shadow-2xl flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ambiente ML Barber • Continue rolando para ir até a bancada ↓</span>
          </div>
        </div>

        {/* =====================================================================
            ATO 2 (Scroll 28% a 62%):
            CÂMERA NAS FERRAMENTAS • INFORMAÇÕES, SEGUIDORES, CLIENTES E BARBEIROS
           ===================================================================== */}
        <div
          className={`absolute inset-x-0 bottom-8 sm:bottom-12 z-20 max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-500 ${
            showWorkbenchCard
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-12 pointer-events-none"
          }`}
        >
          <div className="bg-[#FAF8F5]/95 backdrop-blur-2xl text-[#181B19] rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/60">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Texto sobre a Bancada & Equipamentos */}
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F3D2B] text-[#FAF8F5] text-[10px] font-extrabold uppercase tracking-[0.22em]">
                  ✂️ BANCADA DE ALTA PRECISÃO
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-black leading-tight">
                  Excelência em Cada Detalhe, Com {shop.followers} Seguidores
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Liderada por <strong>Mateus Lopes</strong> ao lado de{" "}
                  <strong>Alex Minuzzo</strong>, com equipamentos de ponta, visagismo e ambiente
                  climatizado em Carlos Barbosa.
                </p>
              </div>

              {/* Cards de Métricas Reais */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 shrink-0">
                <div className="bg-[#EFECE6] p-3.5 sm:p-4 rounded-2xl text-center border border-black/5">
                  <p className="font-serif text-xl sm:text-3xl font-black text-[#1F3D2B]">
                    {shop.followers}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 mt-0.5">
                    Seguidores
                  </p>
                </div>
                <div className="bg-[#EFECE6] p-3.5 sm:p-4 rounded-2xl text-center border border-black/5">
                  <p className="font-serif text-xl sm:text-3xl font-black text-[#181B19]">
                    {shop.clientsServed}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 mt-0.5">
                    Clientes
                  </p>
                </div>
                <div className="bg-[#EFECE6] p-3.5 sm:p-4 rounded-2xl text-center border border-black/5">
                  <p className="font-serif text-xl sm:text-3xl font-black text-[#1F3D2B]">
                    {activeBarbers.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 mt-0.5">
                    Barbeiros
                  </p>
                </div>
              </div>
            </div>

            {/* Pílulas Rápidas da Equipe (Clicar já seleciona o barbeiro e avança para a Cadeira!) */}
            <div className="mt-5 pt-4 border-t border-black/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
                  Nossa Bancada:
                </span>
                {activeBarbers.map((b: any) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBarberId(b.id);
                      jumpToMoment(0.92);
                    }}
                    className="shrink-0 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white hover:bg-[#1F3D2B] hover:text-white text-xs font-bold border border-black/10 transition-colors flex items-center gap-2"
                  >
                    <img
                      src={b.avatarUrl || "/assets/logo-ml.webp"}
                      alt={b.name}
                      className="w-6 h-6 rounded-full object-cover border border-black/10"
                    />
                    <span>
                      {b.name} ({b.chair}) →
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-bold text-[#1F3D2B] hidden sm:inline">
                Continue rolando para sentar na cadeira ↓
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================================
            ATO 3 (Scroll 69% a 100%):
            CADEIRA VIRADA PARA A CÂMERA • MENU PRÁTICO DE RESERVA DE HORÁRIO E CORTE
           ===================================================================== */}
        <div
          className={`absolute inset-x-0 bottom-3 sm:bottom-6 z-30 max-w-6xl mx-auto px-3 sm:px-6 transition-all duration-500 ${
            showBookingCard
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-16 pointer-events-none"
          }`}
        >
          {/* No Desktop fica posicionado à direita deixando a cadeira livre à esquerda;
              No Mobile vira um Bottom Sheet compacto mostrando a cadeira virada no topo da tela! */}
          <div className="lg:ml-auto lg:w-[540px] bg-[#FAF8F5]/95 backdrop-blur-2xl text-[#181B19] rounded-3xl p-4 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.75)] border-2 border-[#1F3D2B] max-h-[82dvh] overflow-y-auto">
            {!bookingConfirmed ? (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                {/* Cabeçalho do Menu */}
                <div className="flex items-center justify-between border-b border-black/10 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#1F3D2B]">
                      💈 A CADEIRA ESTÁ PRONTA PARA VOCÊ
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-black leading-none mt-0.5">
                      Agende Seu Horário
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
                      Valor Total
                    </span>
                    <span className="font-serif text-xl sm:text-2xl font-black text-[#1F3D2B]">
                      R$ {currentService?.price}
                    </span>
                  </div>
                </div>

                {/* PASSO 1: SELECIONAR BARBEIRO COM FOTO DE PERFIL TRATADA */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    1. Escolha o Barbeiro ({activeBarbers.length} disponíveis)
                  </label>
                  <div
                    className={`grid gap-2.5 ${
                      activeBarbers.length >= 3 ? "grid-cols-3" : "grid-cols-2"
                    }`}
                  >
                    {activeBarbers.map((b: any) => {
                      const active = selectedBarberId === b.id;
                      return (
                        <button
                          type="button"
                          key={b.id}
                          onClick={() => setSelectedBarberId(b.id)}
                          className={`p-2.5 sm:p-3 rounded-2xl text-left border transition-all flex items-center gap-3 ${
                            active
                              ? "bg-[#1F3D2B] text-[#FAF8F5] border-[#1F3D2B] shadow-lg ring-2 ring-[#1F3D2B]/30"
                              : "bg-[#EFECE6]/85 text-[#181B19] border-black/10 hover:border-[#1F3D2B]"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={b.avatarUrl || "/assets/logo-ml.webp"}
                              alt={b.name}
                              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 transition-all ${
                                active ? "border-emerald-300 shadow-md" : "border-white"
                              }`}
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                                active
                                  ? "bg-emerald-400 border-[#1F3D2B]"
                                  : "bg-emerald-500 border-[#EFECE6]"
                              }`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-[10px] uppercase font-extrabold tracking-wider ${
                                active ? "text-emerald-300" : "text-[#1F3D2B]"
                              }`}
                            >
                              {b.chair}
                            </p>
                            <p className="font-bold text-xs sm:text-sm truncate leading-tight mt-0.5">
                              {b.name}
                            </p>
                            <p className="text-[10px] truncate opacity-80 mt-0.5">{b.role}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PASSO 2: SELECIONAR CORTE / SERVIÇO */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    2. Escolha o Corte ou Serviço
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {services.map((srv: any) => {
                      const active = selectedServiceId === srv.id;
                      return (
                        <button
                          type="button"
                          key={srv.id}
                          onClick={() => setSelectedServiceId(srv.id)}
                          className={`px-3 py-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            active
                              ? "bg-[#181B19] text-[#FAF8F5] border-[#181B19]"
                              : "bg-white text-[#181B19] border-black/10 hover:border-[#1F3D2B]"
                          }`}
                        >
                          <div className="pr-2">
                            <p className="font-bold text-xs leading-tight">{srv.name}</p>
                            <p className="text-[10px] opacity-70">{srv.duration}</p>
                          </div>
                          <span className="font-extrabold text-xs shrink-0">R$ {srv.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PASSO 3: DIA E HORÁRIO */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-1">
                      3. Data
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/15 text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-1">
                      Horário ({selectedTime})
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                      {timeSlots.map((slot: string) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`shrink-0 px-3 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                            selectedTime === slot
                              ? "bg-[#1F3D2B] text-white border-[#1F3D2B]"
                              : "bg-white text-[#181B19] border-black/10"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PASSO 4: NOME, WHATSAPP E BOTÃO DE RESERVAR */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    required
                    placeholder="Seu Nome"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs font-semibold"
                  />
                  <input
                    required
                    placeholder="Seu WhatsApp"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#1F3D2B] hover:bg-[#29523A] text-[#FAF8F5] font-extrabold text-xs uppercase tracking-[0.2em] shadow-xl transition-all"
                >
                  Confirmar Horário com {currentBarber?.name.split(" ")[0]} • R${" "}
                  {currentService?.price}
                </button>
              </form>
            ) : (
              /* TELA DE SUCESSO PÓS-RESERVA */
              <div className="text-center py-4 space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-[#1F3D2B] text-xs font-extrabold">
                  ✅ CADEIRA RESERVADA • #{bookingConfirmed.id}
                </span>
                <h4 className="font-serif text-2xl font-black">
                  Tudo pronto, {bookingConfirmed.clientName}!
                </h4>
                <p className="text-xs text-zinc-600">
                  <strong>{bookingConfirmed.serviceName}</strong> com{" "}
                  <strong>{bookingConfirmed.barberName}</strong> ({bookingConfirmed.chair}) no dia{" "}
                  <strong>{bookingConfirmed.date}</strong> às{" "}
                  <strong>{bookingConfirmed.time}</strong>.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <a
                    href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
                      `Olá! Fiz minha reserva pelo site da ML Barber (#${bookingConfirmed.id}):\n` +
                        `💈 Barbeiro: ${bookingConfirmed.barberName}\n` +
                        `✂️ Serviço: ${bookingConfirmed.serviceName} (R$ ${bookingConfirmed.price})\n` +
                        `📅 Data/Hora: ${bookingConfirmed.date} às ${bookingConfirmed.time}\n` +
                        `👤 Cliente: ${bookingConfirmed.clientName}`
                    )}`}
                    target="_blank"
                    rel="noopener"
                    className="flex-1 py-3.5 rounded-xl bg-[#1F3D2B] text-white text-xs font-extrabold uppercase tracking-wider"
                  >
                    Enviar Comprovante no WhatsApp ↗
                  </a>
                  <button
                    onClick={() => setBookingConfirmed(null)}
                    className="px-4 py-3.5 rounded-xl bg-[#EFECE6] text-xs font-bold"
                  >
                    Nova Reserva
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BARRA DE PROGRESSO DISCRETA NA BASE DA TELA */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/15 z-40">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-[#1F3D2B] via-emerald-400 to-[#B08A57]"
            style={{ width: "2%" }}
          />
        </div>
      </div>
    </div>
  );
}
