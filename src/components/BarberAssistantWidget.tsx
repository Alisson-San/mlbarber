"use client";

import React, { useState } from "react";

export default function BarberAssistantWidget({ data }: { data: any }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content:
        "Olá! Bem-vindo à **ML Barber** 💈🌿. Quer ajuda para escolher seu corte/barba, consultar valores ou reservar um horário direto com o **Mateus Lopes** ou nossa equipe?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [bookedApt, setBookedApt] = useState<any>(null);

  const sendMsg = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;
    const nextMsgs = [...messages, { role: "user", content: textToSend }];
    setMessages(nextMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMsgs }),
      });
      const json = await res.json();
      if (json.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: json.reply }]);
      }
      if (json.suggestion?.readyToBook) {
        setSuggestion(json.suggestion);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmQuickBooking = async () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      alert("Informe seu nome e WhatsApp para confirmar!");
      return;
    }
    const srv = data.services.find((s: any) => s.id === suggestion?.serviceId) || data.services[0];
    const brb = data.barbers.find((b: any) => b.id === suggestion?.barberId) || data.barbers[0];

    const res = await fetch("/api/barber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "book_appointment",
        appointment: {
          clientName,
          clientPhone,
          barberId: brb.id,
          barberName: brb.name,
          serviceId: srv.id,
          serviceName: srv.name,
          price: srv.price,
          date: new Date().toISOString().slice(0, 10),
          time: suggestion?.suggestedTime || "15:00",
        },
      }),
    });
    const json = await res.json();
    if (json.ok) setBookedApt(json.appointment);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full bg-fern hover:bg-fern-light text-white font-bold text-xs sm:text-sm shadow-2xl border border-sand/30 hover:scale-105 transition-transform"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <span>{open ? "✕ Fechar Recepção IA" : "💈 Agendar c/ Assistente IA"}</span>
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] max-h-[78vh] bg-alabaster border-2 border-fern rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 fern-botanical-bg text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={data.barbershop.logoUrl} alt="ML" className="w-10 h-10 rounded-full bg-white p-0.5" />
              <div>
                <p className="font-display font-bold text-sm">Recepção Inteligente • ML Barber</p>
                <p className="text-[11px] text-emerald-200">Valores, Visagismo & Horários Livres</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-xs px-2 py-1 rounded bg-white/10">
              ✕
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs sm:text-sm max-h-[50vh]">
            {/* Atalhos Rápidos */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              <button
                onClick={() => sendMsg("Quero saber valores de Corte e Combo Completo")}
                className="px-2.5 py-1 rounded-full bg-sand text-fern font-semibold text-[11px] hover:bg-fern hover:text-white transition-colors"
              >
                ✂️ Tabela de Preços
              </button>
              <button
                onClick={() => sendMsg("Quero agendar Combo Corte + Barba com o Mateus Lopes")}
                className="px-2.5 py-1 rounded-full bg-sand text-fern font-semibold text-[11px] hover:bg-fern hover:text-white transition-colors"
              >
                🧔 Agendar c/ Mateus
              </button>
              <button
                onClick={() => sendMsg("Quero fazer um Fade / Taper com o Alex")}
                className="px-2.5 py-1 rounded-full bg-sand text-fern font-semibold text-[11px] hover:bg-fern hover:text-white transition-colors"
              >
                💈 Fade c/ Equipe
              </button>
            </div>

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                    m.role === "user"
                      ? "bg-fern text-white rounded-br-none"
                      : "bg-sand text-charcoal border border-sand-dark rounded-bl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {suggestion && !bookedApt && (
              <div className="p-4 rounded-2xl bg-white border-2 border-fern/30 space-y-2.5 shadow-md">
                <p className="text-[11px] font-bold uppercase text-fern">⚡ Reserva Rápida Sugerida</p>
                <input
                  placeholder="Seu Nome"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-alabaster border border-sand-dark text-xs"
                />
                <input
                  placeholder="Seu WhatsApp (com DDD)"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-alabaster border border-sand-dark text-xs"
                />
                <button
                  onClick={confirmQuickBooking}
                  className="w-full py-2.5 rounded-xl bg-fern text-white font-bold text-xs uppercase"
                >
                  Confirmar Horário ({suggestion.suggestedTime})
                </button>
              </div>
            )}

            {bookedApt && (
              <div className="p-4 rounded-2xl bg-emerald-900 text-white space-y-2 text-center">
                <p className="font-bold text-xs uppercase">✅ Reserva #{bookedApt.id} Confirmada!</p>
                <p className="text-[11px] text-emerald-100">
                  {bookedApt.serviceName} com {bookedApt.barberName} às {bookedApt.time}
                </p>
              </div>
            )}

            {loading && <p className="text-[11px] text-fern animate-pulse">Consultando bancada...</p>}
          </div>

          <div className="p-3 bg-sand border-t border-sand-dark flex gap-2">
            <input
              type="text"
              placeholder="Pergunte sobre cortes, valores ou horários..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMsg()}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-sand-dark text-xs focus:outline-none focus:border-fern"
            />
            <button
              onClick={() => sendMsg()}
              className="px-4 py-2 rounded-xl bg-fern text-white font-bold text-xs"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
