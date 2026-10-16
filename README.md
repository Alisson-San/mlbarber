# 💈 ML Barber — Experiência Cinematográfica Interativa

Plataforma web oficial de presença digital, **Video Scrollytelling 24fps HD** e sistema de agendamento interativo da **ML Barber** (fundada por **Mateus Lopes** em Carlos Barbosa — Serra Gaúcha / RS).

---

## ✨ Arquitetura & Funcionalidades

- **Tour Cinematográfico em 3 Atos (Canvas 24fps HD + Curva Não-Linear):**
  - **Ato 1 (0% – 14%):** Abertura com selo oficial e revelação do salão principal da ML Barber.
  - **Ato 2 (26% – 66%):** Parada na bancada iluminada com apresentação de **Mateus Lopes** e **Alex Minuzzo**, portfólio de cortes e valores.
  - **Ato 3 (76% – 100%):** Chegada à poltrona principal com **Agendamento Interativo na Cadeira** (escolha de barbeiro com fotos reais tratadas, serviço, data/hora e confirmação direta via WhatsApp + registro no painel).
- **Motor Gráfico Otimizado (`<canvas>` + Sub-Frame Blending):**
  - 240 quadros nativos a 24fps em WebP HD (`1280x720`, qualidade 90) pré-gerados em `public/assets/tour-frames/`.
  - Decodificação assíncrona fora da thread principal (`img.decode()`) e *zero re-renders* do React durante o scroll.
- **Painel Administrativo (`/admin`):**
  - Controle de agenda/reservas, adição/edição de serviços, profissionais e WhatsApp oficial da barbearia.

---

## 🚀 Como Executar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   - **Site Principal:** `http://localhost:3000`
   - **Painel Admin:** `http://localhost:3000/admin` (Senha padrão: `mlbarber2026`)

3. **(Opcional) Regerar quadros e fotos a partir de `raw/`:**
   Os 240 quadros WebP e fotos tratadas já estão prontos em `public/assets/`. Caso altere o vídeo ou fotos brutas em `raw/`:
   ```bash
   npm run assets -- --force
   ```

---

## ☁️ Deploy na Vercel

O projeto já está 100% configurado para deploy direto na **Vercel**:

1. Suba o repositório para o **GitHub / GitLab / Bitbucket**:
   ```bash
   git add -A
   git commit -m "feat: experiencia cinematografica 24fps HD e agendamento interativo"
   git push origin main
   ```
2. Na [Vercel](https://vercel.com/new), importe o repositório:
   - **Framework Preset:** `Next.js`
   - **Build Command:** `npm run build` (padrão)
   - **Output Directory:** `.next` (padrão)
   - **Environment Variables (Opcional):** `ADMIN_PASSWORD` (padrão: `mlbarber2026`)
3. Clique em **Deploy**. Todos os quadros em `/assets/tour-frames/` são servidos automaticamente pela CDN Global da Vercel com cache imutável (`Cache-Control: public, max-age=31536000, immutable`).
