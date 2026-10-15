"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import BarberAssistantWidget from "@/components/BarberAssistantWidget";

export default function MLBarberHome() {
  const [data, setData] = useState<any>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string>("all");

  const heroRef = useRef<HTMLElement | null>(null);
  const bigTitleRef = useRef<HTMLDivElement | null>(null);
  const mateusLayerRef = useRef<HTMLDivElement | null>(null);
  const emergingLogoRef = useRef<HTMLDivElement | null>(null);
  const floatingToolsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/barber")
      .then((r) => r.json())
      .then((res) => {
        setData(res);
      });
  }, []);

  useEffect(() => {
    if (!data) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const isMobile = window.innerWidth < 768;
    let lenis: Lenis | null = null;
    if (!isMobile) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
    }

    const tick = (time: number) => {
      if (lenis) lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);

    const ctx = gsap.context(() => {
      // Entrada Inicial Suave
      gsap.fromTo(
        ".hero-enter",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "power3.out" }
      );

      // Coreografia no Scroll pedida pelo usuário:
      // O nome grande ML BARBER com blur vai subindo/desfocando, o Mateus tem paralaxe e a Logo Circular surge com destaque
      if (heroRef.current && bigTitleRef.current && mateusLayerRef.current && emergingLogoRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });

        tl.to(
          bigTitleRef.current,
          { yPercent: -35, scale: 1.08, opacity: 0.15, ease: "none" },
          0
        )
          .to(
            mateusLayerRef.current,
            { yPercent: 12, scale: 0.94, opacity: 0.25, ease: "none" },
            0
          )
          .fromTo(
            emergingLogoRef.current,
            { scale: 0.72, y: 60, opacity: 0.85 },
            { scale: 1.15, y: -30, opacity: 1, ease: "none" },
            0
          );
      }

      // Ícones Vetoriais de Tesoura, Navalha, Máquina e Bigode flutuando em paralaxe
      if (floatingToolsRef.current) {
        gsap.to(".barber-tool-icon", {
          y: -45,
          rotate: 12,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    });

    return () => {
      gsap.ticker.remove(tick);
      ctx.revert();
      lenis?.destroy();
    };
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full border-4 border-fern border-t-transparent animate-spin mx-auto" />
          <p className="font-display font-bold text-fern uppercase tracking-widest text-sm">
            ML Barber • Carregando Experiência...
          </p>
        </div>
      </div>
    );
  }

  const { barbershop, barbers, services, posts } = data;
  const activeBarbers = barbers.filter((b: any) => b.active);
  const filteredPosts = posts.filter((p: any) =>
    selectedBarberId === "all" ? true : p.barberId === selectedBarberId
  );
  const selectedBarberObj = activeBarbers.find((b: any) => b.id === selectedBarberId);

  return (
    <main className="relative min-h-screen hex-light-bg text-charcoal">
      {/* HEADER CLARO & BOTÂNICO */}
      <header className="fixed top-0 inset-x-0 z-40 bg-alabaster/85 backdrop-blur-xl border-b border-sand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <img
              src={barbershop.logoUrl}
              alt="ML Barber Logo"
              className="w-12 h-12 rounded-full object-contain border border-fern/20 shadow-sm"
            />
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight text-charcoal block leading-none">
                ML BARBER
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-fern font-semibold">
                Carlos Barbosa • RS
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.18em] font-bold text-charcoal/80">
            <a href="#mateus" className="hover:text-fern transition-colors">A Barbearia</a>
            <a href="#equipe" className="hover:text-fern transition-colors">Bancada & Barbeiros</a>
            <a href="#servicos" className="hover:text-fern transition-colors">Valores</a>
            <a href="/agenda" className="text-fern underline decoration-2 underline-offset-4">
              Agenda Online
            </a>
            <a href="/admin" className="text-zinc-400 hover:text-charcoal">Admin</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/agenda"
              className="px-5 py-2.5 rounded-full bg-fern hover:bg-fern-light text-white text-xs sm:text-sm font-bold shadow-lg shadow-fern/20 transition-all hover:scale-105"
            >
              ✂️ Reservar Horário
            </a>
          </div>
        </div>
      </header>

      {/* ATO 1: HERO SECTION (FUNDO DE SAMAMBAIA + NOME GIGANTE COM BLUR SUMINDO ABAIXO + MATEUS + LOGO SURGINDO) */}
      <section
        ref={heroRef}
        className="relative min-h-[105svh] pt-28 pb-16 flex flex-col justify-between overflow-hidden"
      >
        {/* Faixa Superior de Folhas de Samambaia (Assinatura Visual da ML Barber) */}
        <div className="absolute top-20 inset-x-4 sm:inset-x-8 h-[62%] rounded-[2.5rem] fern-botanical-bg overflow-hidden shadow-2xl">
          {/* Foto real da parede de samambaia e LEDs hexagonais em blend mode */}
          <img
            src={barbershop.spaceImages?.[0] || "/assets/espaco-principal.webp"}
            alt="Parede de Samambaia ML Barber"
            className="w-full h-full object-cover opacity-25 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-fern-dark/40 via-fern/60 to-alabaster" />
        </div>

        {/* ÍCONES VETORIAIS FLUTUANTES (TESOURA, BIGODE, MÁQUINA, NAVALHA) */}
        <div ref={floatingToolsRef} className="pointer-events-none absolute inset-0 z-10 max-w-7xl mx-auto">
          {/* Tesoura SVG */}
          <svg className="barber-tool-icon absolute top-36 left-[8%] w-12 h-12 text-sand/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
          {/* Bigode Clássico SVG */}
          <svg className="barber-tool-icon absolute top-44 right-[10%] w-16 h-16 text-sand/30" viewBox="0 0 64 32" fill="currentColor">
            <path d="M32 18c-5-8-14-12-22-8-5 2-8 7-8 11 0 3 3 5 6 4 6-2 12-7 24-7s18 5 24 7c3 1 6-1 6-4 0-4-3-9-8-11-8-4-17 0-22 8z" />
          </svg>
          {/* Máquina de Corte / Pente SVG */}
          <svg className="barber-tool-icon absolute bottom-44 left-[12%] w-12 h-12 text-fern/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="7" y="4" width="10" height="16" rx="3" />
            <path d="M7 4V2M10 4V2M14 4V2M17 4V2M12 14h.01" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-20 flex flex-col items-center pt-6">
          {/* Badge de Localização */}
          <div className="hero-enter inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-alabaster/95 border border-sand-dark text-fern text-xs font-bold uppercase tracking-widest shadow-md mb-4">
            <span className="w-2 h-2 rounded-full bg-fern animate-ping" />
            <span>🌿 {barbershop.statusBanner}</span>
          </div>

          {/* NOME GIGANTE "ML BARBER" COM BLUR SUMINDO ABAIXO */}
          <div ref={bigTitleRef} className="hero-enter w-full text-center select-none pointer-events-none gpu-layer">
            <h1 className="font-display font-extrabold text-[15vw] sm:text-[13.5vw] leading-[0.86] tracking-tighter text-alabaster drop-shadow-sm title-blur-fade-bottom">
              ML BARBER
            </h1>
          </div>

          {/* COMPOSIÇÃO CENTRAL: MATEUS LOPES + LOGO EMERGINDO NA BASE COM BLUR */}
          <div className="relative -mt-14 sm:-mt-28 flex flex-col items-center w-full max-w-4xl">
            <div ref={mateusLayerRef} className="hero-enter relative z-10 w-72 sm:w-96 gpu-layer">
              <img
                src={barbershop.founderImageUrl}
                alt={barbershop.founder}
                className="w-full h-auto object-contain drop-shadow-[0_24px_40px_rgba(20,22,21,0.35)]"
              />
            </div>

            {/* Névoa de Blur na Base + Logo Oficial que Surge no Scroll */}
            <div className="relative z-20 -mt-20 w-full flex flex-col items-center pt-10 pb-4 bg-gradient-to-t from-alabaster via-alabaster/90 to-transparent backdrop-blur-[3px]">
              <div
                ref={emergingLogoRef}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white p-2 shadow-2xl border-2 border-fern/30 gpu-layer"
              >
                <img
                  src={barbershop.logoUrl}
                  alt="Selo Oficial ML Barber"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>

              <p className="font-display text-2xl sm:text-4xl font-extrabold text-charcoal mt-5 text-center">
                {barbershop.tagline.toUpperCase()}
              </p>
              <p className="text-sm sm:text-base text-charcoal/70 max-w-xl text-center mt-2">
                Comandada por <strong className="text-fern">{barbershop.founder}</strong> e equipe. {barbershop.subtagline}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                <a
                  href="/agenda"
                  className="px-8 py-4 rounded-2xl bg-fern hover:bg-fern-light text-white font-bold text-sm uppercase tracking-wider shadow-xl shadow-fern/25 transition-all hover:scale-105"
                >
                  💈 Agendar Horário Online
                </a>
                <a
                  href="#equipe"
                  className="px-8 py-4 rounded-2xl bg-sand hover:bg-sand-dark text-charcoal font-bold text-sm uppercase tracking-wider border border-sand-dark transition-all"
                >
                  Conhecer os Barbeiros
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ATO 2: O FUNDADOR (MATEUS LOPES) & O ESPAÇO COM PAREDE DE SAMAMBAIA */}
      <section id="mateus" className="py-24 bg-sand/70 border-y border-sand-dark relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fern/10 text-fern text-xs font-bold uppercase tracking-widest">
              🌿 Identidade & Estrutura • Carlos Barbosa
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold leading-tight">
              MATEUS LOPES & A EXPERIÊNCIA <span className="text-fern">ML BARBER</span>
            </h2>
            <p className="text-charcoal/80 leading-relaxed text-base">
              {barbershop.aboutText}
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-alabaster border border-sand-dark">
                <p className="font-display text-2xl font-extrabold text-fern">{barbershop.followersCount}</p>
                <p className="text-xs text-charcoal/60 uppercase font-semibold">Seguidores</p>
              </div>
              <div className="p-4 rounded-2xl bg-alabaster border border-sand-dark">
                <p className="font-display text-2xl font-extrabold text-charcoal">{activeBarbers.length}</p>
                <p className="text-xs text-charcoal/60 uppercase font-semibold">Barbeiros Ativos</p>
              </div>
              <div className="p-4 rounded-2xl bg-alabaster border border-sand-dark">
                <p className="font-display text-2xl font-extrabold text-wood">100%</p>
                <p className="text-xs text-charcoal/60 uppercase font-semibold">Acabamento Preciso</p>
              </div>
            </div>
          </div>

          {/* Galeria da Arquitetura (Parede de Samambaia + Bancada Verde + Cadeiras) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="/assets/espaco-principal.webp"
                alt="Interior ML Barber"
                className="w-full h-64 object-cover rounded-3xl shadow-lg border border-sand-dark"
              />
              <div className="p-5 rounded-3xl fern-botanical-bg text-white">
                <p className="font-display font-bold text-lg">A Clássica Parede Verde</p>
                <p className="text-xs text-emerald-100/80 mt-1">
                  Nossa parede de folhas de samambaia é o cenário oficial de cada transformação na ML Barber.
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-6">
              <img
                src="/assets/espaco-cadeira.webp"
                alt="Poltrona ML Barber"
                className="w-full h-52 object-cover rounded-3xl shadow-lg border border-sand-dark"
              />
              <img
                src="/assets/espaco-bancada.webp"
                alt="Bancada ML Barber"
                className="w-full h-52 object-cover rounded-3xl shadow-lg border border-sand-dark"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ATO 3: SEÇÃO POR BARBEIRO (VITRINE INDIVIDUAL DE PROFISSIONAIS & FOTOS DE CORTES) */}
      <section id="equipe" className="py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-fern text-xs font-bold uppercase tracking-[0.25em]">
                ✂️ Nossa Bancada de Profissionais
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold mt-1">
                ESCOLHA SEU BARBEIRO & VEJA O PORTFÓLIO
              </h2>
            </div>
            <a
              href="/agenda"
              className="self-start md:self-auto px-6 py-3 rounded-xl bg-fern text-white text-xs font-bold uppercase tracking-wider"
            >
              Ver Agenda Completa →
            </a>
          </div>

          {/* SELETOR DE BARBEIROS (CARDS DOS PROFISSIONAIS ATIVOS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <button
              onClick={() => setSelectedBarberId("all")}
              className={`text-left p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                selectedBarberId === "all"
                  ? "fern-botanical-bg text-white border-fern shadow-xl"
                  : "bg-sand/60 border-sand-dark text-charcoal hover:border-fern"
              }`}
            >
              <span className="text-xs uppercase tracking-widest opacity-75 font-bold">Visão Geral</span>
              <div className="my-4">
                <p className="font-display text-2xl font-extrabold">Toda a Equipe</p>
                <p className="text-xs opacity-80 mt-1">
                  Veja todos os cortes e trabalhos postados pela bancada da ML Barber.
                </p>
              </div>
              <span className="text-xs font-bold underline">Mostrar todos ({posts.length} fotos)</span>
            </button>

            {activeBarbers.map((barber: any) => (
              <div
                key={barber.id}
                onClick={() => setSelectedBarberId(barber.id)}
                className={`cursor-pointer p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                  selectedBarberId === barber.id
                    ? "fern-botanical-bg text-white border-fern shadow-xl scale-[1.02]"
                    : "bg-white border-sand-dark text-charcoal hover:border-fern"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={barber.avatarUrl}
                    alt={barber.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-wood"
                  />
                  <div>
                    {barber.isFounder && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-wood text-white font-bold uppercase">
                        Fundador
                      </span>
                    )}
                    <h3 className="font-display font-bold text-lg leading-tight mt-0.5">{barber.name}</h3>
                    <p className="text-xs opacity-75">@{barber.instagram}</p>
                  </div>
                </div>

                <p className="text-xs opacity-85 my-4 line-clamp-2">{barber.bio}</p>

                <div className="flex items-center justify-between pt-3 border-t border-current/10">
                  <span className="text-[11px] font-bold">Ver Cortes de {barber.name.split(" ")[0]}</span>
                  <a
                    href={`/agenda?barber=${barber.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 rounded-xl bg-wood text-white text-[11px] font-bold hover:brightness-110"
                  >
                    Agendar
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* APRESENTAÇÃO DO BARBEIRO SELECIONADO */}
          {selectedBarberObj && (
            <div className="p-6 sm:p-8 rounded-3xl bg-sand border border-sand-dark flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-fern">
                  💈 Portfólio Individual • {selectedBarberObj.role}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold">
                  Trabalhos de {selectedBarberObj.name}
                </h3>
                <p className="text-sm text-charcoal/75 max-w-2xl">{selectedBarberObj.bio}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedBarberObj.specialties?.map((sp: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-alabaster border border-sand-dark text-xs font-semibold text-fern"
                    >
                      ✓ {sp}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href={`/agenda?barber=${selectedBarberObj.id}`}
                className="shrink-0 px-7 py-4 rounded-2xl bg-fern text-white font-bold text-xs uppercase tracking-wider shadow-lg"
              >
                Reservar Horário com {selectedBarberObj.name.split(" ")[0]} →
              </a>
            </div>
          )}

          {/* GRADE DE FOTOS DE CORTES FILTRADA PELO BARBEIRO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredPosts.map((post: any) => {
              const postBarber = barbers.find((b: any) => b.id === post.barberId);
              return (
                <article
                  key={post.id}
                  className="group rounded-3xl overflow-hidden bg-white border border-sand-dark hover:border-fern shadow-md transition-all"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-sand relative">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-alabaster/90 backdrop-blur-md text-fern text-[11px] font-bold">
                      {post.styleTag}
                    </span>
                  </div>
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-charcoal text-sm sm:text-base">{post.title}</h4>
                      <p className="text-xs text-fern font-semibold mt-0.5">
                        Profissional: {postBarber?.name || "Equipe ML Barber"}
                      </p>
                    </div>
                    <a
                      href={`/agenda?barber=${post.barberId}`}
                      className="shrink-0 px-3.5 py-2 rounded-xl bg-sand hover:bg-fern hover:text-white text-charcoal text-xs font-bold transition-colors"
                    >
                      Agendar
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ATO 4: TABELA DE SERVIÇOS & VALORES */}
      <section id="servicos" className="py-24 fern-botanical-bg text-white relative z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-300 font-bold">
              💈 Transparência & Qualidade
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold">
              SERVIÇOS & VALORES
            </h2>
          </div>

          <div className="grid gap-4">
            {services.map((srv: any) => (
              <div
                key={srv.id}
                className="p-5 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-300/50 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-bold text-lg text-white">{srv.name}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/15 text-emerald-200">
                      ⏱️ {srv.durationMin} min
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200">{srv.description}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <span className="font-display text-2xl font-extrabold text-amber-300">
                    R$ {srv.price}
                  </span>
                  <a
                    href={`/agenda?service=${srv.id}`}
                    className="px-4 py-2.5 rounded-xl bg-alabaster text-fern font-bold text-xs uppercase hover:scale-105 transition-transform"
                  >
                    Reservar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-alabaster border-t border-sand-dark text-center text-xs text-charcoal/60 space-y-2">
        <p className="font-display font-bold text-charcoal text-sm">
          {barbershop.fullName} • {barbershop.city}
        </p>
        <p>Instagram Oficial: @{barbershop.instagram}</p>
      </footer>

      <BarberAssistantWidget data={data} />
    </main>
  );
}
