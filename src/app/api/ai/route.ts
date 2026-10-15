import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export async function POST(req: Request) {
  try {
    const { messages = [], imageBase64 } = await req.json();
    const db = JSON.parse(await fs.readFile(DB_PATH, "utf-8"));

    const activeBarbers = (db.barbers || []).filter((b: any) => b.active);
    const servicesList = (db.services || [])
      .map((s: any) => `- ${s.name}: R$ ${s.price} (${s.durationMin} min) [id: ${s.id}]`)
      .join("\n");
    const barbersList = activeBarbers
      .map((b: any) => `- ${b.name} (${b.role}) | Especialidades: ${b.specialties.join(", ")} | Horários: ${b.availableTimes.join(", ")} [id: ${b.id}]`)
      .join("\n");

    const systemPrompt = `
Você é o Concierge & Assistente de Visagismo da "${db.barbershop.fullName}", fundada por ${db.barbershop.founder} em Carlos Barbosa/RS.
Serviços e Valores Oficiais:
${servicesList}

Barbeiros Ativos na Bancada Hoje:
${barbersList}

Regras:
1. Ajude o cliente a escolher o melhor corte/serviço (se ele enviar foto, comente sobre o estilo: Fade, Taper, Social/Tesoura, Barba, etc.).
2. Informe sempre o valor exato e duração conforme a tabela acima.
3. Sugira o barbeiro ideal da equipe e mostre horários livres.
4. Quando o cliente mencionar qual serviço deseja (ou pedir para agendar), inclua no final da resposta um JSON:
\`\`\`json
{"readyToBook": true, "serviceId": "srv-combo", "barberId": "mateus", "suggestedTime": "15:30"}
\`\`\`
Responda de forma curta, elegante e acolhedora.
`;

    let reply = "";
    let suggestion: any = null;

    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      const historyText = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
      const parts: any[] = [{ text: `${systemPrompt}\n\nConversa:\n${historyText}` }];
      if (imageBase64 && imageBase64.includes("base64,")) {
        const [meta, b64] = imageBase64.split("base64,");
        const mimeType = meta.match(/data:(.*?);/)?.[1] || "image/jpeg";
        parts.push({ inline_data: { mime_type: mimeType, data: b64 } });
      }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] }),
        }
      );
      const json = await res.json();
      reply = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else if (openAiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.4,
        }),
      });
      const json = await res.json();
      reply = json.choices?.[0]?.message?.content || "";
    }

    const jsonMatch =
      reply.match(/```json\s*([\s\S]*?)```/) || reply.match(/(\{"readyToBook":[\s\S]*?\})/);
    if (jsonMatch?.[1]) {
      try {
        suggestion = JSON.parse(jsonMatch[1]);
        reply = reply.replace(jsonMatch[0], "").trim();
      } catch {}
    }

    // Fallback determinístico local caso não haja API Key configurada
    if (!reply) {
      const lastUser = (messages[messages.length - 1]?.content || "").toLowerCase();
      const wantsCombo = /(combo|corte e barba|completo)/i.test(lastUser);
      const wantsBeard = /\b(barba)\b/i.test(lastUser) && !wantsCombo;
      const wantsSnow = /(nevou|platinado|luzes)/i.test(lastUser);
      const wantsAlex = /(alex|taper|cacheado)/i.test(lastUser);
      const wantsAfonso = /(afonso)/i.test(lastUser);

      const chosenService = wantsSnow
        ? db.services.find((s: any) => s.id === "srv-nevou")
        : wantsCombo
        ? db.services.find((s: any) => s.id === "srv-combo")
        : wantsBeard
        ? db.services.find((s: any) => s.id === "srv-barba")
        : db.services[0];

      const chosenBarber = wantsAlex
        ? activeBarbers.find((b: any) => b.id === "alex") || activeBarbers[0]
        : wantsAfonso
        ? activeBarbers.find((b: any) => b.id === "afonso") || activeBarbers[0]
        : activeBarbers[0];

      suggestion = {
        readyToBook: true,
        serviceId: chosenService?.id || "srv-corte",
        barberId: chosenBarber?.id || "mateus",
        suggestedTime: chosenBarber?.availableTimes?.[1] || "14:00",
      };

      reply =
        `Excelente escolha! Para **${chosenService?.name}** (R$ ${chosenService?.price} • ${chosenService?.durationMin} min), recomendo agendar com **${chosenBarber?.name}**.\n\n` +
        `Selecionei abaixo os horários livres de hoje/amanhã para você reservar em 1 clique:`;
    }

    return NextResponse.json({ reply, suggestion });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
