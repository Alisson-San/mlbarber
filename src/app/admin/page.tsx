"use client";

import React, { useEffect, useState } from "react";

export default function MLAdminPage() {
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [shop, setShop] = useState<any>(null);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  // Novo Barbeiro
  const [newBarberName, setNewBarberName] = useState("");
  const [newBarberRole, setNewBarberRole] = useState("Barber Stylist");
  const [newBarberChair, setNewBarberChair] = useState("Cadeira 04");
  const [newBarberSpecialty, setNewBarberSpecialty] = useState("Degradê, Corte & Barba");

  useEffect(() => {
    fetch("/api/shop")
      .then((r) => r.json())
      .then((d) => {
        setShop(d.shop);
        setBarbers(d.barbers || []);
        setServices(d.services || []);
        setBookings(d.bookings || []);
      });
  }, []);

  async function saveAll(
    nextShop = shop,
    nextBarbers = barbers,
    nextServices = services,
    nextBookings = bookings
  ) {
    const res = await fetch("/api/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        shop: nextShop,
        barbers: nextBarbers,
        services: nextServices,
        bookings: nextBookings,
      }),
    });
    if (res.ok) {
      setMsg("✅ Dados da ML Barber atualizados com sucesso!");
      setLogged(true);
    } else {
      setMsg("❌ Senha incorreta (Padrão: mlbarber2026)");
    }
  }

  function addBarber() {
    if (!newBarberName.trim()) return;
    const nb = {
      id: `brb-${Date.now().toString().slice(-4)}`,
      name: newBarberName.trim(),
      role: newBarberRole.trim() || "Barber Stylist",
      chair: newBarberChair.trim() || `Cadeira 0${barbers.length + 1}`,
      specialty: newBarberSpecialty.trim() || "Cortes & Barba",
      active: true,
    };
    const next = [...barbers, nb];
    setBarbers(next);
    setNewBarberName("");
    saveAll(shop, next, services, bookings);
  }

  function toggleBarberActive(id: string) {
    const next = barbers.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    setBarbers(next);
    saveAll(shop, next, services, bookings);
  }

  function removeBarber(id: string) {
    const next = barbers.filter((b) => b.id !== id);
    setBarbers(next);
    saveAll(shop, next, services, bookings);
  }

  function updateServicePrice(id: string, price: number) {
    const next = services.map((s) => (s.id === id ? { ...s, price } : s));
    setServices(next);
  }

  function removeBooking(id: string) {
    const next = bookings.filter((b) => b.id !== id);
    setBookings(next);
    saveAll(shop, barbers, services, next);
  }

  if (!shop) return <div className="p-10 text-[#FAF8F5]">Carregando painel...</div>;

  if (!logged) {
    return (
      <div className="min-h-screen bg-[#0F1411] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FAF8F5] text-[#181B19] rounded-3xl p-8 space-y-5 shadow-2xl text-center">
          <img
            src="/assets/logo-ml.webp"
            alt="ML Barber"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            className="w-24 h-24 mx-auto rounded-full object-cover shadow-md"
          />
          <h1 className="font-serif text-2xl font-black">Painel Admin • ML Barber</h1>
          <p className="text-xs text-zinc-600">
            Senha padrão: <strong className="text-[#1F3D2B]">mlbarber2026</strong>
          </p>
          <input
            type="password"
            placeholder="Digite a senha do painel"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveAll()}
            className="w-full px-4 py-3 rounded-xl bg-white border border-black/15 text-sm font-semibold"
          />
          <button
            onClick={() => saveAll()}
            className="w-full py-3.5 rounded-xl bg-[#1F3D2B] text-white font-extrabold text-xs uppercase tracking-wider"
          >
            Entrar no Painel
          </button>
          {msg && <p className="text-xs text-red-600 font-bold">{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181B19] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#1F3D2B]">
              Painel ML Barber • {shop.city}
            </h1>
            {msg && <p className="text-xs text-emerald-700 font-bold mt-1">{msg}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => saveAll()}
              className="px-4 py-2.5 rounded-xl bg-[#1F3D2B] text-white text-xs font-extrabold uppercase tracking-wider"
            >
              Salvar Alterações
            </button>
            <a
              href="/"
              className="px-4 py-2.5 rounded-xl bg-[#181B19] text-white text-xs font-bold"
            >
              ← Ver Experiência em Vídeo
            </a>
          </div>
        </div>

        {/* BLOCO 1: RESERVAS DA CADEIRA (ATO 3) */}
        <section className="p-6 rounded-3xl bg-white border border-black/10 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl font-black text-[#1F3D2B]">
            📅 Agendamentos Recebidos ({bookings.length})
          </h2>
          {bookings.length === 0 ? (
            <p className="text-xs text-zinc-500">Nenhuma reserva registrada ainda.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/10 text-xs space-y-1.5 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#1F3D2B]">#{b.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#1F3D2B] font-bold text-[10px]">
                        {b.date} às {b.time}
                      </span>
                    </div>
                    <p className="font-bold text-sm">{b.clientName}</p>
                    <p className="text-zinc-600">📱 {b.clientPhone}</p>
                    <p>
                      💈 <strong>{b.barberName}</strong> ({b.chair})
                    </p>
                    <p>
                      ✂️ {b.serviceName} — <strong>R$ {b.price}</strong>
                    </p>
                  </div>
                  <div className="pt-3 flex gap-2">
                    <a
                      href={`https://wa.me/55${String(b.clientPhone).replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Olá ${b.clientName}! Confirmamos seu horário na ML Barber (${b.date} às ${b.time}) com ${b.barberName}.`
                      )}`}
                      target="_blank"
                      rel="noopener"
                      className="flex-1 py-2 rounded-lg bg-[#1F3D2B] text-white text-center font-bold"
                    >
                      Chamar WhatsApp
                    </a>
                    <button
                      onClick={() => removeBooking(b.id)}
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-700 font-bold"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BLOCO 2: EQUIPE DE BARBEIROS NA BANCADA */}
        <section className="p-6 rounded-3xl bg-white border border-black/10 space-y-5 shadow-sm">
          <h2 className="font-serif text-xl font-black text-[#1F3D2B]">
            💈 Bancada de Barbeiros (Ato 2 & Ato 3)
          </h2>
          <div className="grid sm:grid-cols-4 gap-3">
            <input
              placeholder="Nome (ex: Lucas Silva)"
              value={newBarberName}
              onChange={(e) => setNewBarberName(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/15 text-xs font-semibold"
            />
            <input
              placeholder="Cadeira (ex: Cadeira 04)"
              value={newBarberChair}
              onChange={(e) => setNewBarberChair(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/15 text-xs font-semibold"
            />
            <input
              placeholder="Especialidade"
              value={newBarberSpecialty}
              onChange={(e) => setNewBarberSpecialty(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/15 text-xs font-semibold"
            />
            <button
              onClick={addBarber}
              className="px-4 py-2.5 rounded-xl bg-[#1F3D2B] text-white font-extrabold text-xs uppercase"
            >
              + Adicionar Barbeiro
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {barbers.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                  b.active ? "bg-[#FAF8F5] border-[#1F3D2B]/40" : "bg-zinc-100 border-black/10 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={b.avatarUrl || "/assets/logo-ml.webp"}
                    alt={b.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-black/10 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1F3D2B]">
                      {b.chair}
                    </span>
                    <p className="font-bold text-base leading-tight">{b.name}</p>
                    <p className="text-xs text-zinc-500">{b.role}</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">{b.specialty}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleBarberActive(b.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                      b.active ? "bg-[#1F3D2B] text-white" : "bg-zinc-300 text-zinc-800"
                    }`}
                  >
                    {b.active ? "✓ Ativo na Cadeira" : "Inativo"}
                  </button>
                  {b.id !== "mateus" && (
                    <button
                      onClick={() => removeBarber(b.id)}
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-bold"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BLOCO 3: SERVIÇOS E VALORES + MÉTRICAS DO ATO 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <section className="p-6 rounded-3xl bg-white border border-black/10 space-y-4 shadow-sm">
            <h2 className="font-serif text-xl font-black text-[#1F3D2B]">✂️ Tabela de Serviços</h2>
            <div className="space-y-2.5">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-black/10"
                >
                  <div>
                    <p className="font-bold text-xs sm:text-sm">{srv.name}</p>
                    <p className="text-[11px] text-zinc-500">{srv.duration}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold">R$</span>
                    <input
                      type="number"
                      value={srv.price}
                      onChange={(e) => updateServicePrice(srv.id, Number(e.target.value))}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-white border border-black/15 text-xs font-extrabold text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => saveAll()}
              className="w-full py-3 rounded-xl bg-[#1F3D2B] text-white text-xs font-extrabold uppercase tracking-wider"
            >
              Salvar Preços
            </button>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-black/10 space-y-4 shadow-sm">
            <h2 className="font-serif text-xl font-black text-[#1F3D2B]">📊 Números & WhatsApp da Loja</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-zinc-500 block mb-1">WhatsApp (com DDD)</label>
                <input
                  value={shop.whatsapp}
                  onChange={(e) => setShop({ ...shop, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/15 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-500 block mb-1">Seguidores no Instagram</label>
                <input
                  value={shop.followers}
                  onChange={(e) => setShop({ ...shop, followers: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/15 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-500 block mb-1">Clientes Atendidos</label>
                <input
                  value={shop.clientsServed}
                  onChange={(e) => setShop({ ...shop, clientsServed: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/15 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-500 block mb-1">Selo de Destaque</label>
                <input
                  value={shop.experienceLabel}
                  onChange={(e) => setShop({ ...shop, experienceLabel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/15 font-semibold"
                />
              </div>
            </div>
            <button
              onClick={() => saveAll()}
              className="w-full py-3 rounded-xl bg-[#1F3D2B] text-white text-xs font-extrabold uppercase tracking-wider"
            >
              Salvar Informações da Barbearia
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
