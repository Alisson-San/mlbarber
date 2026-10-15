# 💈 ML Barber — Barbearia em Carlos Barbosa, RS

Plataforma web oficial de presença digital, vitrine dinâmica multi-barbeiros, sistema de agendamento interativo (`/agenda`), Assistente de IA de Visagismo & Reserva e Painel Administrativo (`/admin`) da **ML Barber** (fundada por **Mateus Lopes** em Carlos Barbosa — Serra Gaúcha / RS).

## ✨ Funcionalidades

- **Home Experiencial (GSAP + ScrollTrigger + Lenis):** Efeito *ML BARBER Blur Reveal*, estética *Botanical Clean & Olive Grooming* inspirada na parede de samambaias e iluminação hexagonal da barbearia.
- **Bancada & Portfólio por Barbeiro:** Filtro interativo por profissional ativo (Mateus Lopes, Alex Minuzzo, Afonso, etc.) com exibição de cortes, especialidades e link direto de agendamento.
- **Agenda Online (`/agenda`):** Reserva de horário em 3 passos (Profissional, Serviço, Data/Hora) com confirmação via WhatsApp e integração pronta para AppBarber.
- **Assistente IA de Recepção & Visagismo:** Widget interativo com suporte a Gemini (`GEMINI_API_KEY`), OpenAI (`OPENAI_API_KEY`) e fallback determinístico local gratuito.
- **Painel Administrativo (`/admin`):** Gestão de barbeiros (ativar/desativar/adicionar), publicação de fotos de cortes otimizadas via `sharp` e controle de agendamentos.

## 🚀 Como Executar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Gere e otimize os assets a partir de `raw/` (opcional, já incluídos em `public/assets`):**
   ```bash
   npm run assets
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   - **Site Principal:** `http://localhost:3000`
   - **Agenda Online:** `http://localhost:3000/agenda`
   - **Painel Admin:** `http://localhost:3000/admin` (Senha padrão: `mlbarber2026`)
# mlbarber
