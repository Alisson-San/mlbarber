"use client";

import React, { useEffect, useState } from "react";

export default function MLAdminPage() {
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [barbershop, setBarbershop] = useState<any>(null);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  // Novo Barbeiro
  const [newBarberName, setNewBarberName] = useState("");
  const [newBarberInsta, setNewBarberInsta] = useState("");
  const [newBarberRole, setNewBarberRole] = useState("Barbeiro Profissional");

  // Novo Post de Corte
  const [postTitle, setPostTitle] = useState("");
  const [postTag, setPostTag] = useState("Fade & Acabamento");
  const [postBarberId, setPostBarberId] = useState("mateus");

  useEffect(() => {
    fetch("/api/barber")
      .then((r) => r.json())
      .then((d) => {
        setBarbershop(d.barbershop);
        setBarbers(d.barbers || []);
        setServices(d.services || []);
        setPosts(d.posts || []);
        setAppointments(d.appointments || []);
      });
  }, []);

  async function saveAll(
    nextShop = barbershop,
    nextBarbers = barbers,
    nextServices = services,
    nextPosts = posts,
    nextApts = appointments
  ) {
    const res = await fetch("/api/barber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        barbershop: nextShop,
        barbers: nextBarbers,
        services: nextServices,
        posts: nextPosts,
        appointments: nextApts,
      }),
    });
    if (res.ok) {
      setMsg("✅ Dados da ML Barber salvos com sucesso!");
      setLogged(true);
    } else {
      setMsg("❌ Senha incorreta (Padrão: mlbarber2026)");
    }
  }

  function addBarber() {
    if (!newBarberName.trim()) return;
    const nb = {
      id: `brb-${Date.now()}`,
      name: newBarberName.trim(),
      role: newBarberRole,
      instagram: newBarberInsta.replace("@", "") || "mlbarber._",
      bio: "Profissional integrante da bancada ML Barber em Carlos Barbosa.",
      specialties: ["Degradê", "Corte & Barba"],
      avatarUrl: "/assets/logo-ml.webp",
      active: true,
      isFounder: false,
      availableTimes: ["09:00", "10:30", "14:00", "16:00", "18:00"],
    };
    const next = [...barbers, nb];
    setBarbers(next);
    setNewBarberName("");
    setNewBarberInsta("");
    saveAll(barbershop, next, services, posts, appointments);
  }

  function toggleBarberActive(id: string) {
    const next = barbers.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    setBarbers(next);
    saveAll(barbershop, next, services, posts, appointments);
  }

  function removeBarber(id: string) {
    const next = barbers.filter((b) => b.id !== id);
    setBarbers(next);
    saveAll(barbershop, next, services, posts, appointments);
  }

  async function handlePostUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !postTitle.trim()) {
      alert("Preencha o título do corte antes de escolher a foto!");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const { url } = await res.json();

    const newPost = {
      id: `post-${Date.now()}`,
      barberId: postBarberId,
      title: postTitle,
      styleTag: postTag,
      featured: true,
      imageUrl: url,
    };
    const next = [newPost, ...posts];
    setPosts(next);
    setPostTitle("");
    saveAll(barbershop, barbers, services, next, appointments);
  }

  if (!barbershop) return <div className="p-10">Carregando...</div>;

  if (!logged) {
    return (
      <div className="min-h-screen fern-botanical-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-alabaster rounded-3xl p-8 space-y-5 shadow-2xl text-center">
          <img src={barbershop.logoUrl} alt="ML Barber" className="w-24 h-24 mx-auto rounded-full" />
          <h1 className="font-display text-2xl font-extrabold text-charcoal">Painel ML Barber</h1>
          <p className="text-xs text-charcoal/70">
            Senha padrão: <strong className="text-fern">mlbarber2026</strong>
          </p>
          <input
            type="password"
            placeholder="Digite a senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveAll()}
            className="w-full px-4 py-3 rounded-xl bg-white border border-sand-dark text-sm"
          />
          <button
            onClick={() => saveAll()}
            className="w-full py-3.5 rounded-xl bg-fern text-white font-bold text-xs uppercase"
          >
            Acessar Administração
          </button>
          {msg && <p className="text-xs text-fern font-bold">{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alabaster text-charcoal p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center justify-between border-b border-sand-dark pb-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-fern">
              Administração • ML Barber (Mateus Lopes)
            </h1>
            <p className="text-xs text-emerald-700 font-semibold">{msg}</p>
          </div>
          <a href="/" className="px-4 py-2 rounded-xl bg-fern text-white text-xs font-bold">
            ← Ver Site
          </a>
        </div>

        {/* BLOCO 1: GESTÃO DE BARBEIROS (ENTRA E SAI DE EQUIPE) */}
        <section className="p-6 rounded-3xl bg-white border border-sand-dark space-y-5">
          <h2 className="font-display text-lg font-extrabold text-fern">
            💈 Equipe de Barbeiros (Ativar, Desativar ou Adicionar Novo)
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              placeholder="Nome do Barbeiro"
              value={newBarberName}
              onChange={(e) => setNewBarberName(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-alabaster border border-sand-dark text-sm"
            />
            <input
              placeholder="Instagram (ex: alexminuzzo_barbeiro)"
              value={newBarberInsta}
              onChange={(e) => setNewBarberInsta(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-alabaster border border-sand-dark text-sm"
            />
            <button
              onClick={addBarber}
              className="px-4 py-2.5 rounded-xl bg-fern text-white font-bold text-xs uppercase"
            >
              + Adicionar Barbeiro na Bancada
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {barbers.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                  b.active ? "bg-alabaster border-fern/40" : "bg-sand/40 border-sand-dark opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={b.avatarUrl} alt={b.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-sm">{b.name}</p>
                    <p className="text-xs text-charcoal/60">@{b.instagram}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleBarberActive(b.id)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                      b.active ? "bg-fern text-white" : "bg-sand-dark text-charcoal"
                    }`}
                  >
                    {b.active ? "✓ Ativo no Site" : "Inativo"}
                  </button>
                  {!b.isFounder && (
                    <button
                      onClick={() => removeBarber(b.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BLOCO 2: POSTAR FOTO DE CORTE POR BARBEIRO */}
        <section className="p-6 rounded-3xl bg-white border border-sand-dark space-y-4">
          <h2 className="font-display text-lg font-extrabold text-fern">
            📸 Publicar Novo Corte (Vinculado ao Barbeiro)
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              placeholder="Título do Corte (ex: Low Fade Navalhado)"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-alabaster border border-sand-dark text-sm"
            />
            <select
              value={postBarberId}
              onChange={(e) => setPostBarberId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-alabaster border border-sand-dark text-sm"
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  Barbeiro: {b.name}
                </option>
              ))}
            </select>
            <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-fern text-white font-bold text-xs uppercase flex items-center justify-center">
              Selecionar Foto & Publicar
              <input type="file" accept="image/*" onChange={handlePostUpload} className="hidden" />
            </label>
          </div>
        </section>

        {/* BLOCO 3: RESERVAS RECEBIDAS */}
        <section className="p-6 rounded-3xl bg-white border border-sand-dark space-y-4">
          <h2 className="font-display text-lg font-extrabold text-fern">
            📅 Horários Reservados pelo Site / IA ({appointments.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 rounded-2xl bg-alabaster border border-sand-dark text-xs space-y-1">
                <p className="font-bold text-sm text-fern">
                  #{apt.id} • {apt.clientName} ({apt.clientPhone})
                </p>
                <p>
                  <strong>Barbeiro:</strong> {apt.barberName}
                </p>
                <p>
                  <strong>Serviço:</strong> {apt.serviceName} (R$ {apt.price})
                </p>
                <p>
                  <strong>Data/Hora:</strong> {apt.date} às {apt.time}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
