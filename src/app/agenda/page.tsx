"use client";

import React, { useEffect, useState } from "react";

export default function AgendaPage() {
  const [data, setData] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState<string>("14:00");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [confirmed, setConfirmed] = useState<any>(null);

  useEffect(() => {
    fetch("/api/barber")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        const active = (d.barbers || []).filter((b: any) => b.active);
        const params = new URLSearchParams(window.location.search);
        const barberParam = params.get("barber");
        const serviceParam = params.get("service");

        setSelectedBarber(active.find((b: any) => b.id === barberParam) || active[0]);
        setSelectedService(d.services.find((s: any) => s.id === serviceParam) || d.services[0]);
      });
  }, []);

  if (!data) return <div className="p-10 text-center">Carregando Agenda ML Barber...</div>;

  const activeBarbers = data.barbers.filter((b: any) => b.active);

  async function submitBooking() {
    if (!clientName.trim() || !clientPhone.trim()) {
      alert("Preencha seu Nome e WhatsApp para finalizar a reserva!");
      return;
    }
    const res = await fetch("/api/barber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "book_appointment",
        appointment: {
          clientName,
          clientPhone,
          barberId: selectedBarber.id,
          barberName: selectedBarber.name,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          price: selectedService.price,
          durationMin: selectedService.durationMin,
          date: selectedDate,
          time: selectedTime,
        },
      }),
    });
    const json = await res.json();
    if (json.ok) setConfirmed(json.appointment);
  }

  return (
    <main className="min-h-screen hex-light-bg py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-sand-dark pb-5">
          <div className="flex items-center gap-3">
            <img src={data.barbershop.logoUrl} alt="Logo" className="w-12 h-12 rounded-full" />
            <div>
              <h1 className="font-display text-2xl font-extrabold text-charcoal">
                Agenda Online • ML Barber
              </h1>
              <p className="text-xs text-fern font-semibold">Carlos Barbosa — Serra Gaúcha</p>
            </div>
          </div>
          <a href="/" className="px-4 py-2 rounded-xl bg-sand text-xs font-bold">
            ← Voltar à Home
          </a>
        </div>

        {confirmed ? (
          <div className="p-8 rounded-3xl fern-botanical-bg text-white text-center space-y-5 shadow-2xl">
            <span className="px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase">
              Protocolo #{confirmed.id}
            </span>
            <h2 className="font-display text-3xl font-extrabold">
              HORÁRIO RESERVADO COM SUCESSO!
            </h2>
            <p className="text-sm text-emerald-100 max-w-md mx-auto">
              <strong>{confirmed.serviceName}</strong> (R$ {confirmed.price}) com{" "}
              <strong>{confirmed.barberName}</strong> no dia <strong>{confirmed.date}</strong> às{" "}
              <strong>{confirmed.time}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <a
                href={`https://wa.me/${data.barbershop.whatsapp}?text=${encodeURIComponent(
                  `Olá! Fiz minha reserva #${confirmed.id} no site da ML Barber:\n• Barbeiro: ${confirmed.barberName}\n• Serviço: ${confirmed.serviceName} (R$ ${confirmed.price})\n• Data: ${confirmed.date} às ${confirmed.time}`
                )}`}
                target="_blank"
                rel="noopener"
                className="px-6 py-3.5 rounded-xl bg-alabaster text-fern font-bold text-xs uppercase"
              >
                Confirmar via WhatsApp
              </a>
              {data.barbershop.externalBookingUrl && (
                <a
                  href={data.barbershop.externalBookingUrl}
                  target="_blank"
                  rel="noopener"
                  className="px-6 py-3.5 rounded-xl bg-white/15 text-white font-bold text-xs uppercase"
                >
                  Sincronizar no AppBarber ↗
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-7 space-y-6">
              {/* 1. Escolher Barbeiro */}
              <div className="p-6 rounded-3xl bg-white border border-sand-dark space-y-4">
                <h2 className="font-display font-bold text-base uppercase text-fern">
                  1. Escolha o Profissional
                </h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {activeBarbers.map((b: any) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBarber(b)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedBarber?.id === b.id
                          ? "bg-fern text-white border-fern"
                          : "bg-alabaster border-sand-dark text-charcoal"
                      }`}
                    >
                      <img src={b.avatarUrl} alt={b.name} className="w-10 h-10 rounded-full object-cover mb-2" />
                      <p className="font-bold text-xs">{b.name}</p>
                      <p className="text-[10px] opacity-75">{b.role}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Escolher Serviço */}
              <div className="p-6 rounded-3xl bg-white border border-sand-dark space-y-4">
                <h2 className="font-display font-bold text-base uppercase text-fern">
                  2. Escolha o Serviço
                </h2>
                <div className="space-y-2.5">
                  {data.services.map((s: any) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between ${
                        selectedService?.id === s.id
                          ? "bg-fern text-white border-fern"
                          : "bg-alabaster border-sand-dark text-charcoal"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs sm:text-sm">{s.name}</p>
                        <p className="text-[11px] opacity-75">{s.durationMin} minutos</p>
                      </div>
                      <span className="font-display font-extrabold text-sm">R$ {s.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Data e Horário */}
              <div className="p-6 rounded-3xl bg-white border border-sand-dark space-y-4">
                <h2 className="font-display font-bold text-base uppercase text-fern">
                  3. Data e Horário Disponível
                </h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-alabaster border border-sand-dark text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {(selectedBarber?.availableTimes || ["09:00", "10:30", "14:00", "16:00", "18:00"]).map(
                    (t: string) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                          selectedTime === t
                            ? "bg-fern text-white border-fern"
                            : "bg-alabaster border-sand-dark text-charcoal"
                        }`}
                      >
                        {t}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Resumo Lateral */}
            <div className="md:col-span-5">
              <div className="sticky top-8 p-6 rounded-3xl fern-botanical-bg text-white space-y-5 shadow-xl">
                <h3 className="font-display text-xl font-bold">Resumo do Agendamento</h3>
                <div className="space-y-2 text-xs border-y border-white/15 py-4">
                  <p className="flex justify-between">
                    <span className="opacity-75">Profissional:</span>
                    <strong>{selectedBarber?.name}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="opacity-75">Serviço:</span>
                    <strong>{selectedService?.name}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="opacity-75">Data & Hora:</span>
                    <strong>
                      {selectedDate} às {selectedTime}
                    </strong>
                  </p>
                  <p className="flex justify-between text-base pt-2">
                    <span>Valor Total:</span>
                    <strong className="text-amber-300">R$ {selectedService?.price}</strong>
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    placeholder="Seu Nome Completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white text-charcoal text-xs"
                  />
                  <input
                    placeholder="Seu WhatsApp (com DDD)"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white text-charcoal text-xs"
                  />
                  <button
                    onClick={submitBooking}
                    className="w-full py-4 rounded-xl bg-wood hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg"
                  >
                    Confirmar Reserva de Horário
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
