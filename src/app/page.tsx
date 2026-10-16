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
    { id: "combo", name: "Combo Corte + Barba", duration: "60 min", price: 80 },
    { id: "barba", name: "Barboterapia Toalha Quente", duration: "30 min", price: 40 },
    { id: "acabamento", name: "Pezinho + Sobrancelha", duration: "20 min", price: 25 },
  ],
  timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
};

const TOTAL_VIDEO_FRAMES = 240;

type UiStage = "hero" | "wide" | "workbench" | "chair" | "booking";

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

  // Motor Canvas 60fps/120fps com 240 Quadros Nativos (24fps), Sub-Frame Blending e Enquadramento Inteligente Mobile/Desktop
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
    const smoothstep = (t: number) => {
      const c = Math.max(0, Math.min(1, t));
      return c * c * (3 - 2 * c);
    };

    // Curva de Scroll Não-Linear calibrada pelos quadros nítidos e centralizados:
    // • 0.00 -> 0.22: Abertura do nome + Visão limpa da barbearia inteira (Quadros 0 a 40)
    // • 0.22 -> 0.32: TIMELAPSE 1 — Acelera todo o deslocamento até cravar nas ferramentas centralizadas (Quadros 40 a 128)
    // • 0.32 -> 0.58: BANCADA ESTÁVEL E NÍTIDA — Apenas os quadros perfeitamente centralizados e sem motion blur nas ferramentas (Quadros 128 a 150)
    // • 0.58 -> 0.68: TIMELAPSE 2 — Acelera a saída da bancada até chegar na cadeira (Quadros 150 a 184)
    // • 0.68 -> 0.84: Giro suave da cadeira de frente para a câmera (Quadros 184 a 239)
    // • 0.84 -> 1.00: Cadeira posicionada + Menu de Agendamento (Quadro 239)
    const mapProgressToExactFrame = (p: number): number => {
      const clamped = Math.max(0, Math.min(1, p));
      if (clamped <= 0.22) {
        return (clamped / 0.22) * 40;
      }
      if (clamped <= 0.32) {
        const t = smoothstep((clamped - 0.22) / 0.1);
        return 40 + t * (128 - 40);
      }
      if (clamped <= 0.58) {
        const t = (clamped - 0.32) / 0.26;
        return 128 + t * (150 - 128);
      }
      if (clamped <= 0.68) {
        const t = smoothstep((clamped - 0.58) / 0.1);
        return 150 + t * (184 - 150);
      }
      if (clamped <= 0.84) {
        const t = (clamped - 0.68) / 0.16;
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

    // Desenha o quadro com interpolação sub-frame e câmera responsiva para Mobile (retrato) e Desktop (paisagem)
    const renderFrame = (exactFrame: number, scrollProgress = playhead.progress) => {
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

      // Limpa o fundo do palco com o verde-escuro oficial da barbearia
      ctx.fillStyle = "#0F1411";
      ctx.fillRect(0, 0, cw, ch);

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;

      // Curva de foco na bancada: atinge 100% (1.0) antes do quadro 128 e permanece 100% travada até o quadro 150
      // (evita qualquer deslocamento ou descentralização enquanto o card da bancada está aberto!)
      let toolFocusBell = 0;
      if (exactFrame >= 85 && exactFrame < 126) {
        toolFocusBell = smoothstep((exactFrame - 85) / (126 - 85));
      } else if (exactFrame >= 126 && exactFrame <= 151) {
        toolFocusBell = 1;
      } else if (exactFrame > 151 && exactFrame <= 178) {
        toolFocusBell = 1 - smoothstep((exactFrame - 151) / (178 - 151));
      }

      // Curva de foco na cadeira principal (Quadros 165..239)
      const chairFocusBell = smoothstep((exactFrame - 165) / 28);

      // Curva de elevação no mobile quando o card de Agendamento sobe na metade inferior (scroll 0.78..0.85)
      const bookingLift = smoothstep((scrollProgress - 0.78) / 0.07);

      let drawW = cw;
      let drawH = ch;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio < 1) {
        // =====================================================================
        // MODO MOBILE RETRATO:
        // Reposiciona o vídeo verticalmente e horizontalmente em cada Ato para que
        // o assunto principal (Salão -> Ferramentas -> Cadeira) fique sempre visível
        // e centralizado na janela livre acima dos cards inferiores!
        // =====================================================================
        const mobileHeightFactor = 0.82 - toolFocusBell * 0.06 - chairFocusBell * 0.04;
        drawH = Math.max(ch * mobileHeightFactor, cw / imgRatio);
        drawW = drawH * imgRatio;

        // Alvo horizontal na imagem:
        // • Salão (Ato 1): 0.47
        // • Ferramentas (Ato 2, quadros 128..150): 0.485 (centraliza as máquinas, shaver e tesouras na tela)
        // • Cadeira (Ato 3): 0.365 (centraliza a Cadeira 01 na tela)
        const targetImgX =
          0.47 * (1 - toolFocusBell - chairFocusBell) +
          0.485 * toolFocusBell +
          0.365 * chairFocusBell;
        offsetX = Math.max(cw - drawW, Math.min(0, 0.5 * cw - targetImgX * drawW));

        // Alvo vertical na imagem:
        // • Salão (Ato 1): centro do salão (imgY 0.52) -> meio da tela (screenY 0.46)
        // • Bancada (Ato 2): máquinas/tesouras (imgY 0.72) -> janela livre superior (screenY 0.34), ocultando o espelho superior
        // • Giro da Cadeira (Ato 3a): cadeira girando (imgY 0.65) -> centro da tela limpa (screenY 0.48)
        // • Reserva na Cadeira (Ato 3b): cadeira de frente (imgY 0.70) -> janela superior (screenY 0.25) acima do card!
        const baseImgY = 0.52 * (1 - toolFocusBell) + 0.72 * toolFocusBell;
        const chairImgY = 0.65 * (1 - bookingLift) + 0.70 * bookingLift;
        const targetImgY = baseImgY * (1 - chairFocusBell) + chairImgY * chairFocusBell;

        const baseScreenY = 0.46 * (1 - toolFocusBell) + 0.34 * toolFocusBell;
        const chairScreenY = 0.48 * (1 - bookingLift) + 0.25 * bookingLift;
        const targetScreenY = baseScreenY * (1 - chairFocusBell) + chairScreenY * chairFocusBell;

        offsetY = targetScreenY * ch - targetImgY * drawH;
      } else {
        // =====================================================================
        // MODO DESKTOP / PAISAGEM:
        // =====================================================================
        const extraZoom = 1 + toolFocusBell * 0.22;
        let baseW = cw;
        let baseH = ch;
        if (canvasRatio > imgRatio) {
          baseH = cw / imgRatio;
        } else {
          baseW = ch * imgRatio;
        }
        drawW = baseW * extraZoom;
        drawH = baseH * extraZoom;

        const focalX = 0.5;
        const focalY = 0.5 + toolFocusBell * 0.4;
        offsetX = (cw - drawW) * focalX;
        offsetY = (ch - drawH) * focalY;
      }

      ctx.globalAlpha = 1;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      // Sub-frame blending: mistura suavemente o próximo quadro quando ambos estão carregados
      if (frac > 0.04 && frac < 0.96 && loadedFlags[baseIdx] && loadedFlags[nextIdx] && images[nextIdx]) {
        ctx.globalAlpha = frac;
        ctx.drawImage(images[nextIdx]!, offsetX, offsetY, drawW, drawH);
        ctx.globalAlpha = 1;
      }

      // No mobile, suaviza as bordas superior e inferior do quadro do vídeo para fundir com #0F1411 atrás dos cards
      if (canvasRatio < 1) {
        if (offsetY > 0) {
          const topGrad = ctx.createLinearGradient(0, offsetY, 0, offsetY + ch * 0.12);
          topGrad.addColorStop(0, "#0F1411");
          topGrad.addColorStop(1, "rgba(15, 20, 17, 0)");
          ctx.fillStyle = topGrad;
          ctx.fillRect(0, 0, cw, offsetY + ch * 0.12);
        }
        const imgBottom = offsetY + drawH;
        if (imgBottom < ch) {
          const fadeStart = Math.max(0, imgBottom - ch * 0.14);
          const botGrad = ctx.createLinearGradient(0, fadeStart, 0, imgBottom);
          botGrad.addColorStop(0, "rgba(15, 20, 17, 0)");
          botGrad.addColorStop(1, "#0F1411");
          ctx.fillStyle = botGrad;
          ctx.fillRect(0, fadeStart, cw, ch - fadeStart);
        }
      }
    };

    // Atualiza elementos contínuos direto na GPU via DOM ref (sem acionar re-render do React a cada frame!)
    const syncContinuousDOM = (p: number) => {
      if (heroContainerRef.current) {
        const heroExit = Math.min(1, Math.max(0, p / 0.12));
        const opacity = Math.max(0, 1 - heroExit * 1.15);
        heroContainerRef.current.style.opacity = String(opacity);
        heroContainerRef.current.style.transform = `translate3d(0, ${-heroExit * 60}px, 0) scale(${1 + heroExit * 0.04})`;
        heroContainerRef.current.style.pointerEvents = heroExit < 0.9 ? "auto" : "none";
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${Math.max(2, p * 100)}%`;
      }

      // O card da Bancada ("workbench") só entra em p >= 0.32 (quando o vídeo já está cravado no quadro 128,
      // 100% centralizado e sem motion blur nas ferramentas) e sai em p = 0.58 antes do movimento de saída!
      const nextStage: UiStage =
        p < 0.11
          ? "hero"
          : p < 0.32
          ? "wide"
          : p <= 0.58
          ? "workbench"
          : p < 0.82
          ? "chair"
          : "booking";

      if (nextStage !== stageRef.current) {
        stageRef.current = nextStage;
        setUiStage(nextStage);
      }
    };

    // Carrega quadros em ordem de prioridade com decodificação assíncrona fora da thread principal (img.decode)
    let cancelled = false;
    const priorityOrder: number[] = [0];
    for (let i = 5; i < TOTAL_VIDEO_FRAMES; i += 6) priorityOrder.push(i);
    for (let i = 2; i < TOTAL_VIDEO_FRAMES; i += 2) {
      if (!priorityOrder.includes(i)) priorityOrder.push(i);
    }
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
          img
            .decode()
            .catch(() => {})
            .finally(() => {
              if (cancelled) return resolve();
              images[idx] = img;
              loadedFlags[idx] = true;
              const currentExact = mapProgressToExactFrame(playhead.progress);
              if (idx === 0 || Math.abs(idx - currentExact) <= 4) {
                renderFrame(currentExact, playhead.progress);
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

    const st = gsap.to(playhead, {
      progress: 1,
      ease: "none",
      onUpdate: () => {
        const p = playhead.progress;
        syncContinuousDOM(p);
        renderFrame(mapProgressToExactFrame(p), p);
      },
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
      },
    });

    const handleResize = () => {
      renderFrame(mapProgressToExactFrame(playhead.progress), playhead.progress);
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

  const currentAct =
    uiStage === "hero" || uiStage === "wide" ? 1 : uiStage === "workbench" ? 2 : 3;
  const showWideShopBadge = uiStage === "wide";
  const showWorkbenchCard = uiStage === "workbench";
  const showChairSpinBadge = uiStage === "chair";
  const showBookingCard = uiStage === "booking";

  return (
    <div ref={scrollWrapperRef} className="relative h-[340vh] w-full select-none">
      {/* PALCO FIXO 100dvh ONDE O VÍDEO E OS ELEMENTOS ACONTECEM */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-[#0F1411]">
        {/* CAMADA 0: VÍDEO INTERATIVO NO CANVAS */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

        {/* Vinheta Superior & Inferior calibrada para não escurecer o centro do vídeo */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 bg-gradient-to-b from-black/50 via-transparent to-black/60 ${
            showWideShopBadge || showChairSpinBadge ? "opacity-25" : "opacity-80"
          }`}
        />

        {/* BARRA DE NAVEGAÇÃO RÁPIDA NO TOPO (Responsiva para telas estreitas de celular e Desktop) */}
        <header className="absolute top-3 sm:top-6 inset-x-0 z-40 max-w-6xl mx-auto px-2.5 sm:px-6 flex items-center justify-between gap-1.5">
          <button
            onClick={() => jumpToMoment(0)}
            className="flex items-center gap-1.5 sm:gap-2.5 bg-[#FAF8F5]/95 backdrop-blur-md text-[#181B19] pl-1.5 pr-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full shadow-lg border border-white/40 shrink-0"
          >
            <img
              src="/assets/logo-ml.webp"
              alt="ML Barber"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover"
            />
            <span className="font-serif font-black text-[11px] sm:text-sm tracking-wider">
              <span className="sm:hidden">ML</span>
              <span className="hidden sm:inline">ML BARBER</span>
            </span>
          </button>

          {/* Seletor Rápido dos 3 Momentos do Vídeo */}
          <nav className="flex items-center gap-0.5 sm:gap-1 bg-black/60 backdrop-blur-xl p-1 rounded-full border border-white/15">
            <button
              onClick={() => jumpToMoment(0)}
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all ${
                currentAct === 1 ? "bg-[#FAF8F5] text-[#181B19]" : "text-white/75 hover:text-white"
              }`}
            >
              1. Salão
            </button>
            <button
              onClick={() => jumpToMoment(0.45)}
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all ${
                currentAct === 2 ? "bg-[#FAF8F5] text-[#181B19]" : "text-white/75 hover:text-white"
              }`}
            >
              2. Bancada
            </button>
            <button
              onClick={() => jumpToMoment(0.92)}
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all ${
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
            1. Nos primeiros scrolls (0% -> 12%), o nome e a logo sobem suavemente.
            2. Em seguida (11% -> 32%), a barbearia toda aparece limpa antes de chegar na bancada.
           ===================================================================== */}
        <div
          ref={heroContainerRef}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 pt-8 sm:pt-0 text-center will-change-transform"
        >
          {/* Selo Localização */}
          <span className="px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#1F3D2B]/90 backdrop-blur-md border border-emerald-400/30 text-[#FAF8F5] text-[9px] sm:text-xs font-bold uppercase tracking-[0.22em] sm:tracking-[0.28em] mb-3 sm:mb-5 shadow-xl">
            🌿 {shop.city} • {shop.experienceLabel}
          </span>

          {/* Logo Oficial no Centro */}
          <div className="relative w-20 h-20 sm:w-36 sm:h-36 rounded-full bg-[#FAF8F5] p-1 sm:p-1.5 shadow-[0_0_50px_rgba(0,0,0,0.6)] mb-3 sm:mb-4">
            <img
              src="/assets/logo-ml.webp"
              alt="Logo ML Barber"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          {/* Nome Grande ML BARBER com Dissolve Óptico nas Letras (Sem caixa retangular de backdrop-blur!) */}
          <div className="relative inline-block">
            <h1 className="font-serif font-black text-[13.5vw] sm:text-[11vw] leading-[0.88] tracking-tighter text-[#FAF8F5] title-blur-fade drop-shadow-2xl">
              {shop.name}
            </h1>
            <span
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0 font-serif font-black text-[13.5vw] sm:text-[11vw] leading-[0.88] tracking-tighter text-[#FAF8F5]/55 blur-[3px] sm:blur-[5px] title-bottom-glow"
            >
              {shop.name}
            </span>
          </div>

          <p className="text-xs sm:text-lg text-[#EFECE6] max-w-xs sm:max-w-md font-medium mt-2 sm:mt-3 drop-shadow">
            {shop.tagline}
          </p>

          {/* CTA Rápido ou Instrução de Scroll */}
          <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full max-w-[260px] sm:max-w-none">
            <button
              onClick={() => jumpToMoment(0.92)}
              className="w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#FAF8F5] text-[#181B19] font-extrabold text-[11px] sm:text-xs uppercase tracking-[0.18em] shadow-2xl hover:bg-[#1F3D2B] hover:text-white transition-colors"
            >
              💈 Agendar Horário
            </button>
            <button
              onClick={() => jumpToMoment(0.45)}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold"
            >
              Role para entrar na barbearia ↓
            </button>
          </div>
        </div>

        {/* LEGENDA DISCRETA QUANDO O TÍTULO ABRE E MOSTRA A BARBEARIA INTEIRA (Scroll 11% a 32%) */}
        <div
          className={`absolute inset-x-0 bottom-5 sm:bottom-8 z-20 flex justify-center px-3 pointer-events-none transition-all duration-500 ${
            showWideShopBadge ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-black/65 backdrop-blur-xl border border-white/20 text-[#FAF8F5] text-[11px] sm:text-xs font-semibold tracking-wide shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>Salão ML Barber • Continue rolando até a bancada ↓</span>
          </div>
        </div>

        {/* =====================================================================
            ATO 2 (Scroll 32% a 58%):
            CÂMERA CRAVADA E NÍTIDA NAS FERRAMENTAS (Quadros 128 a 150)
            • Só aparece quando as máquinas e tesouras já estão 100% centralizadas e sem motion blur!
           ===================================================================== */}
        <div
          className={`absolute inset-x-0 bottom-3 sm:bottom-10 z-20 max-w-6xl mx-auto px-3 sm:px-6 transition-all duration-500 ${
            showWorkbenchCard
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-12 pointer-events-none"
          }`}
        >
          <div className="bg-[#FAF8F5]/95 backdrop-blur-2xl text-[#181B19] rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-2xl border border-white/60">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-6">
              {/* Texto sobre a Bancada & Equipamentos */}
              <div className="space-y-1 sm:space-y-2 max-w-xl">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#1F3D2B] text-[#FAF8F5] text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.18em] sm:tracking-[0.22em]">
                    ✂️ BANCADA DE ALTA PRECISÃO
                  </span>
                  <span className="text-[10px] font-bold text-[#1F3D2B] sm:hidden">
                    Role p/ a cadeira ↓
                  </span>
                </div>
                <h2 className="font-serif text-lg sm:text-4xl font-black leading-tight">
                  Excelência em Cada Detalhe, Com {shop.followers} Seguidores
                </h2>
                <p className="text-[11px] sm:text-sm text-zinc-600 leading-snug sm:leading-relaxed">
                  Liderada por <strong>Mateus Lopes</strong> ao lado de{" "}
                  <strong>Alex Minuzzo</strong>, com equipamentos de ponta e visagismo em Carlos
                  Barbosa.
                </p>
              </div>

              {/* Cards de Métricas Reais */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 shrink-0">
                <div className="bg-[#EFECE6] py-2 px-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-center border border-black/5">
                  <p className="font-serif text-base sm:text-3xl font-black text-[#1F3D2B] leading-none">
                    {shop.followers}
                  </p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-zinc-500 mt-1">
                    Seguidores
                  </p>
                </div>
                <div className="bg-[#EFECE6] py-2 px-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-center border border-black/5">
                  <p className="font-serif text-base sm:text-3xl font-black text-[#181B19] leading-none">
                    {shop.clientsServed}
                  </p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-zinc-500 mt-1">
                    Clientes
                  </p>
                </div>
                <div className="bg-[#EFECE6] py-2 px-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-center border border-black/5">
                  <p className="font-serif text-base sm:text-3xl font-black text-[#1F3D2B] leading-none">
                    {activeBarbers.length}
                  </p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-zinc-500 mt-1">
                    Barbeiros
                  </p>
                </div>
              </div>
            </div>

            {/* Pílulas Rápidas da Equipe */}
            <div className="mt-3 sm:mt-5 pt-2.5 sm:pt-4 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
                  Nossa Bancada:
                </span>
                {activeBarbers.map((b: any) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBarberId(b.id);
                      jumpToMoment(0.92);
                    }}
                    className="p-1.5 sm:pl-1.5 sm:pr-3.5 sm:py-1.5 rounded-full bg-white hover:bg-[#1F3D2B] hover:text-white text-[11px] sm:text-xs font-bold border border-black/10 transition-colors flex items-center gap-2 min-w-0 overflow-hidden"
                  >
                    <img
                      src={b.avatarUrl || "/assets/logo-ml.webp"}
                      alt={b.name}
                      className="w-6 h-6 rounded-full object-cover border border-black/10 shrink-0"
                    />
                    <span className="truncate">
                      {b.name.split(" ")[0]} ({b.chair}) →
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
            ATO 3A (Scroll 58% a 82%):
            GIRO DA CADEIRA COM TELA LIMPA (Permite ver a poltrona girando de frente no celular e desktop!)
           ===================================================================== */}
        <div
          className={`absolute inset-x-0 bottom-5 sm:bottom-8 z-20 flex justify-center px-3 pointer-events-none transition-all duration-500 ${
            showChairSpinBadge ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-black/65 backdrop-blur-xl border border-emerald-400/30 text-[#FAF8F5] text-[11px] sm:text-xs font-semibold tracking-wide shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>Preparando sua cadeira • Continue rolando para agendar ↓</span>
          </div>
        </div>

        {/* =====================================================================
            ATO 3B (Scroll 82% a 100%):
            CADEIRA VIRADA PARA A CÂMERA + MENU DE RESERVA SEM SOBREPOSIÇÃO DE BOTÕES NO MOBILE
           ===================================================================== */}
        <div
          className={`absolute inset-x-0 bottom-2 sm:bottom-6 z-30 max-w-6xl mx-auto px-2.5 sm:px-6 transition-all duration-500 ${
            showBookingCard
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-16 pointer-events-none"
          }`}
        >
          <div className="lg:ml-auto lg:w-[540px] bg-[#FAF8F5]/95 backdrop-blur-2xl text-[#181B19] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.8)] border-2 border-[#1F3D2B] max-h-[60dvh] sm:max-h-[84dvh] overflow-y-auto overscroll-contain no-scrollbar">
            {!bookingConfirmed ? (
              <form onSubmit={handleConfirmBooking} className="space-y-3 sm:space-y-4">
                {/* Cabeçalho do Menu */}
                <div className="flex items-center justify-between border-b border-black/10 pb-2 sm:pb-3">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#1F3D2B] block">
                      💈 A CADEIRA ESTÁ PRONTA PARA VOCÊ
                    </span>
                    <h3 className="font-serif text-lg sm:text-2xl font-black leading-none mt-0.5">
                      Agende Seu Horário
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 block">
                      Valor Total
                    </span>
                    <span className="font-serif text-lg sm:text-2xl font-black text-[#1F3D2B]">
                      R$ {currentService?.price}
                    </span>
                  </div>
                </div>

                {/* PASSO 1: SELECIONAR BARBEIRO COM FOTO DE PERFIL TRATADA */}
                <div>
                  <label className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    1. Escolha o Barbeiro
                  </label>
                  <div
                    className={`grid gap-2.5 ${
                      activeBarbers.length >= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"
                    }`}
                  >
                    {activeBarbers.map((b: any) => {
                      const active = selectedBarberId === b.id;
                      return (
                        <button
                          type="button"
                          key={b.id}
                          onClick={() => setSelectedBarberId(b.id)}
                          className={`min-w-0 overflow-hidden p-2 sm:p-3 rounded-xl sm:rounded-2xl text-left border-2 transition-all flex items-center gap-2 sm:gap-3 ${
                            active
                              ? "bg-[#1F3D2B] text-[#FAF8F5] border-[#1F3D2B] shadow-md"
                              : "bg-[#EFECE6]/90 text-[#181B19] border-black/10 hover:border-[#1F3D2B]"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={b.avatarUrl || "/assets/logo-ml.webp"}
                              alt={b.name}
                              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border-2 transition-all ${
                                active ? "border-emerald-300" : "border-white"
                              }`}
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border-2 ${
                                active
                                  ? "bg-emerald-400 border-[#1F3D2B]"
                                  : "bg-emerald-500 border-[#EFECE6]"
                              }`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider leading-none truncate ${
                                active ? "text-emerald-300" : "text-[#1F3D2B]"
                              }`}
                            >
                              {b.chair}
                            </p>
                            <p className="font-bold text-xs sm:text-sm truncate leading-tight mt-0.5">
                              {b.name}
                            </p>
                            <p className="text-[9px] sm:text-[10px] truncate opacity-80 hidden sm:block mt-0.5">
                              {b.role}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PASSO 2: SELECIONAR CORTE / SERVIÇO (1 coluna ampla no mobile para zero sobreposição; 2 colunas no desktop) */}
                <div>
                  <label className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    2. Escolha o Serviço
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    {services.map((srv: any) => {
                      const active = selectedServiceId === srv.id;
                      return (
                        <button
                          type="button"
                          key={srv.id}
                          onClick={() => setSelectedServiceId(srv.id)}
                          className={`min-w-0 overflow-hidden px-3 py-2 sm:py-2.5 rounded-xl border-2 text-left flex items-center justify-between gap-2 transition-all ${
                            active
                              ? "bg-[#181B19] text-[#FAF8F5] border-[#181B19]"
                              : "bg-white text-[#181B19] border-black/10 hover:border-[#1F3D2B]"
                          }`}
                        >
                          <div className="min-w-0 flex-1 flex items-center justify-between sm:block gap-2">
                            <p className="font-bold text-xs truncate leading-tight">{srv.name}</p>
                            <p className="text-[10px] opacity-70 shrink-0">{srv.duration}</p>
                          </div>
                          <span
                            className={`font-extrabold text-xs shrink-0 px-2 py-0.5 rounded-md ${
                              active ? "bg-white/15 text-emerald-300" : "bg-[#EFECE6] text-[#1F3D2B]"
                            }`}
                          >
                            R$ {srv.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PASSO 3: DIA E HORÁRIO (Empilhados no mobile para o input date nativo nunca invadir os horários!) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  <div className="min-w-0 sm:col-span-5">
                    <label className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-1">
                      3. Data do Agendamento
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="block w-full max-w-full px-3 py-2 rounded-xl bg-white border border-black/15 text-xs font-bold"
                    />
                  </div>
                  <div className="min-w-0 sm:col-span-7">
                    <label className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-1">
                      4. Horário ({selectedTime})
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                      {timeSlots.map((slot: string) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`shrink-0 px-3 py-2 rounded-xl text-xs font-extrabold border-2 transition-all ${
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

                {/* PASSO 5: NOME, WHATSAPP E BOTÃO DE RESERVAR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    required
                    placeholder="Seu Nome"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs font-semibold"
                  />
                  <input
                    required
                    placeholder="Seu WhatsApp"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl sm:rounded-2xl bg-[#1F3D2B] hover:bg-[#29523A] text-[#FAF8F5] font-extrabold text-xs uppercase tracking-[0.18em] shadow-xl transition-all"
                >
                  Confirmar com {currentBarber?.name.split(" ")[0]} • R$ {currentService?.price}
                </button>
              </form>
            ) : (
              /* TELA DE SUCESSO PÓS-RESERVA */
              <div className="text-center py-3 sm:py-4 space-y-3 sm:space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-[#1F3D2B] text-[11px] sm:text-xs font-extrabold">
                  ✅ CADEIRA RESERVADA • #{bookingConfirmed.id}
                </span>
                <h4 className="font-serif text-xl sm:text-2xl font-black">
                  Tudo pronto, {bookingConfirmed.clientName}!
                </h4>
                <p className="text-xs text-zinc-600">
                  <strong>{bookingConfirmed.serviceName}</strong> com{" "}
                  <strong>{bookingConfirmed.barberName}</strong> ({bookingConfirmed.chair}) no dia{" "}
                  <strong>{bookingConfirmed.date}</strong> às{" "}
                  <strong>{bookingConfirmed.time}</strong>.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
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
                    className="flex-1 py-3 sm:py-3.5 rounded-xl bg-[#1F3D2B] text-white text-xs font-extrabold uppercase tracking-wider"
                  >
                    Enviar Comprovante no WhatsApp ↗
                  </a>
                  <button
                    onClick={() => setBookingConfirmed(null)}
                    className="px-4 py-3 sm:py-3.5 rounded-xl bg-[#EFECE6] text-xs font-bold"
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
