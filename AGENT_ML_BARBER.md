# 💈 AGENT EXECUTION SPEC — ML BARBER (MATEUS LOPES)

**Diretório Alvo no WSL:** `~/Projetos/MLBarber`  
**Localização do Negócio:** Carlos Barbosa — Serra Gaúcha / RS (`@mlbarber._`)  
**Objetivo:** Construir de ponta a ponta (Zero-Touch) a plataforma web de presença digital, vitrine dinâmica multi-barbeiros, sistema de agendamento interativo (`/agenda`), Assistente de IA de Visagismo & Reserva e Painel Administrativo (`/admin`) da **ML Barber**.

---

## 1. MAPA DE ARQUIVOS BRUTOS (RAW ASSETS) E TRATAMENTO AUTOMÁTICO (`sharp`)

O usuário colocará as imagens brutas em `~/Projetos/MLBarber/raw/` (ou na raiz `~/Projetos/MLBarber/`). Como várias imagens são capturas de tela verticais do celular/Instagram, o script `build-assets.mjs` realizará um **Smart Crop Automático** para remover a barra superior de bateria/relógio do iOS e a barra inferior de comentários do Instagram, mantendo apenas a fotografia limpa!

| Arquivo Original | Conteúdo | Processamento Automático (`build-assets.mjs`) |
|---|---|---|
| `image_16.png` | Logo Oficial Circular ML Barber (Silhueta Degradê/Barba) | `/public/assets/logo-ml.webp` — Recorte circular perfeito com canal Alpha transparente ao redor do selo e realce de nitidez. |
| `image_15.png` | Foto do fundador Mateus Lopes em frente à ML Barber | `/public/assets/mateus-hero.webp` — Remove barra inferior de comentário, aplica máscara editorial suave na base para fundir com o texto gigante `ML BARBER`. |
| `image_20.png` / `image_22.png` | Fotos do Espaço Interno (Parede de Samambaia + LEDs Hexagonais + Cadeiras) | `/public/assets/espaco-principal.webp` e `/public/assets/espaco-cadeira.webp` — Crop automático das barras do Instagram + ajuste de iluminação clara/natural. |
| `image_21.png` | Foto de ângulo aberto (Bancada Verde-Oliva + Samambaia ao fundo) | `/public/assets/espaco-bancada.webp` — Crop limpo do ambiente para o fundo da seção Sobre & Equipe. |
| `image_17.png` | Corte masculino perfil (com a parede de samambaia ao fundo) | `/public/assets/corte-fade-1.webp` — Crop 4:5 focado apenas na foto do corte. |
| `image_19.png` | Corte Taper Fade / Cacheado (com a parede de samambaia ao fundo) | `/public/assets/corte-taper-2.webp` — Crop 4:5 focado apenas na foto do corte. |
| `image_18.png` | Print do Perfil + Grade do Feed | Dados extraídos para `db.json` + recorte de cortes extras da grade (`/public/assets/corte-medio-3.webp`). |

---

## 2. DIREÇÃO DE ARTE, IDENTIDADE VISUAL & COREOGRAFIA DE MOTION

### Paleta de Cores ("Botanical Clean & Olive Grooming")
Extraída fielmente da arquitetura física da barbearia em Carlos Barbosa:
* **Alabaster / Off-White (`#FAF8F5`):** Fundo principal claro, limpo e sofisticado.
* **Warm Sand / Bege (`#EFECE4`):** Superfície de cards, seções alternadas e névoa de transição.
* **Fern Green / Verde Samambaia (`#1B3B2B` & `#2A543E`):** Cor de destaque botânica inspirada na parede de folhas de samambaia que aparece no fundo de todas as fotos.
* **Olive Counter / Verde Bancada (`#4A5848`):** Extraído da bancada real da barbearia (`image_21.png`).
* **Charcoal Ink (`#141615`):** Preto suave da logo e das cadeiras para tipografia de alto contraste.
* **Warm Wood / Bronze (`#A67C52`):** Detalhe amadeirado dos braços das poltronas para badges e filetes.

### Comportamento de Motion (GSAP + ScrollTrigger + Lenis)
1. **Abertura na Home (O Efeito "ML BARBER Blur Reveal"):**
   - **Fundo da Hero:** Textura botânica da parede de folhas de samambaia + padrão geométrico sutil inspirado nos LEDs hexagonais do teto da barbearia.
   - **Tipografia Monumental com Blur Gradual:** O título gigante **`ML BARBER`** atravessa a tela com uma máscara CSS (`mask-image` + `backdrop-filter`) onde a metade inferior das letras vai desfocando e desaparecendo suavemente no fundo bege.
   - **Transição no Scroll (`ScrollTrigger scrub`):** No centro está a apresentação do fundador **Mateus Lopes**. Conforme o usuário rola a página, o texto gigante se expande e desfoca, e a **Logo Circular Oficial da ML Barber** emerge em destaque absoluto com ícones vetoriais de barbearia (tesoura, navalha, máquina, pente e bigode) flutuando em paralaxe ao redor.
2. **Seção Dinâmica "Por Barbeiro" (Bancada Rotativa):**
   - Filtro interativo onde o cliente clica na foto de cada barbeiro ativo (**Mateus Lopes**, **Alex Minuzzo**, **Afonso**, etc.). Ao selecionar um profissional, a tela anima os trabalhos postados especificamente por ele, suas especialidades e libera o botão **"Reservar Horário com [Nome]"**.

---

## 3. PASSO A PASSO DE EXECUÇÃO PARA O AGENTE

Execute todos os passos abaixo na ordem exata dentro do terminal WSL.

### PASSO 3.1: Criar Estrutura de Diretórios e `package.json`

```bash
mkdir -p ~/Projetos/MLBarber
cd ~/Projetos/MLBarber
mkdir -p src/app/admin src/app/agenda src/app/api/barber src/app/api/ai src/app/api/upload src/components public/assets public/uploads data raw
```

Crie o arquivo `~/Projetos/MLBarber/package.json`:

```json
{
  "name": "ml-barber-studio",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "assets": "node build-assets.mjs",
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "gsap": "^3.12.5",
    "lenis": "^1.1.13",
    "lucide-react": "^0.454.0",
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "sharp": "^0.33.5"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5"
  }
}
```

---

### PASSO 3.2: Criar Configurações (`next.config.mjs`, `postcss.config.mjs`, `tsconfig.json`, `tailwind.config.ts`)

Crie `~/Projetos/MLBarber/next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
};
export default nextConfig;
```

Crie `~/Projetos/MLBarber/postcss.config.mjs`:

```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;
```

Crie `~/Projetos/MLBarber/tsconfig.json`:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Crie `~/Projetos/MLBarber/tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        alabaster: "#FAF8F5",
        sand: {
          DEFAULT: "#EFECE4",
          dark: "#E2DDD2",
        },
        fern: {
          DEFAULT: "#1B3B2B",
          light: "#2A543E",
          dark: "#11261B",
        },
        olive: "#4A5848",
        charcoal: "#141615",
        wood: "#A67C52",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

---

### PASSO 3.3: Criar o Processador de Assets (`~/Projetos/MLBarber/build-assets.mjs`)

Este script remove automaticamente as bordas escuras ao redor da logo circular (`image_16.png`), corta as barras de interface do Instagram das capturas de tela (`image_15` a `image_22`), aplica máscara de transição suave na foto do Mateus Lopes e gera a textura botânica de samambaia.

Crie `~/Projetos/MLBarber/build-assets.mjs`:

```javascript
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "raw");
const OUT_DIR = path.join(ROOT, "public", "assets");

async function findFile(names) {
  for (const dir of [RAW_DIR, ROOT]) {
    try {
      const files = await fs.readdir(dir);
      for (const n of names) {
        const found = files.find((f) => f.toLowerCase() === n.toLowerCase());
        if (found) return path.join(dir, found);
      }
    } catch {}
  }
  return null;
}

// 1. Recorta a Logo Circular (image_16.png) eliminando o fundo cinza/preto externo
async function processLogo(inputPath) {
  console.log("💈 Processando Logo Circular Oficial ML Barber...");
  const size = 800;
  const circleMask = Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 6}" fill="white" />
    </svg>
  `);

  await sharp(inputPath)
    .resize(size, size, { fit: "cover", position: "centre" })
    .sharpen()
    .composite([{ input: circleMask, blend: "dest-in" }])
    .webp({ quality: 92, alphaQuality: 95 })
    .toFile(path.join(OUT_DIR, "logo-ml.webp"));

  console.log("✅ Logo salva em /assets/logo-ml.webp");
}

// 2. Processa a foto do Mateus Lopes (image_15.png) removendo a barra de comentário inferior e aplicando fade suave na base
async function processMateusHero(inputPath) {
  console.log("✂️ Processando Foto Hero do Mateus Lopes...");
  const meta = await sharp(inputPath).metadata();
  const w = meta.width || 800;
  const h = meta.height || 1600;

  // Remove os 10% inferiores (barra "Faça um comentário...")
  const cropHeight = Math.round(h * 0.88);

  const outW = 900;
  const outH = 1150;
  const fadeMask = Buffer.from(`
    <svg width="${outW}" height="${outH}" viewBox="0 0 ${outW} ${outH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="white" stop-opacity="1"/>
          <stop offset="78%" stop-color="white" stop-opacity="1"/>
          <stop offset="96%" stop-color="white" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${outW}" height="${outH}" rx="36" fill="url(#fadeBottom)"/>
    </svg>
  `);

  await sharp(inputPath)
    .extract({ left: 0, top: 0, width: w, height: cropHeight })
    .resize(outW, outH, { fit: "cover", position: "bottom" })
    .modulate({ brightness: 1.03, saturation: 1.05 })
    .sharpen()
    .composite([{ input: fadeMask, blend: "dest-in" }])
    .webp({ quality: 88, alphaQuality: 90 })
    .toFile(path.join(OUT_DIR, "mateus-hero.webp"));

  console.log("✅ Foto do Mateus salva em /assets/mateus-hero.webp");
}

// 3. Corta automaticamente o cabeçalho e rodapé dos prints do Instagram (Cortes e Espaço)
async function processInstagramScreenshot(inputPath, outputName, topPct = 0.18, bottomPct = 0.78) {
  console.log(`🌿 Limpando print do Instagram e extraindo fotografia: ${outputName}...`);
  const meta = await sharp(inputPath).metadata();
  const w = meta.width || 800;
  const h = meta.height || 1600;

  const top = Math.round(h * topPct);
  const extractHeight = Math.round(h * (bottomPct - topPct));

  await sharp(inputPath)
    .extract({ left: 0, top, width: w, height: extractHeight })
    .resize(900, 1050, { fit: "cover", position: "centre" })
    .modulate({ brightness: 1.02, saturation: 1.06 })
    .sharpen({ sigma: 0.85 })
    .webp({ quality: 86 })
    .toFile(path.join(OUT_DIR, outputName));

  console.log(`✅ Fotografia limpa salva em /assets/${outputName}`);
}

// 4. Extrai um corte extra da grade do perfil (image_18.png)
async function extractGridCutFromProfile(inputPath) {
  try {
    const meta = await sharp(inputPath).metadata();
    const w = meta.width || 800;
    const h = meta.height || 1600;
    const top = Math.round(h * 0.60);
    const cellW = Math.floor(w / 3);
    const cellH = Math.round(h * 0.20);

    await sharp(inputPath)
      .extract({ left: cellW, top, width: cellW, height: cellH })
      .resize(700, 850, { fit: "cover" })
      .sharpen()
      .webp({ quality: 84 })
      .toFile(path.join(OUT_DIR, "corte-medio-3.webp"));
    console.log("✅ Corte extra extraído da grade: /assets/corte-medio-3.webp");
  } catch {}
}

async function createFallback(outputName, title) {
  const svg = Buffer.from(`
    <svg width="800" height="950" viewBox="0 0 800 950" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="950" fill="#EFECE4"/>
      <circle cx="400" cy="420" r="180" fill="#1B3B2B" opacity="0.12"/>
      <text x="400" y="480" text-anchor="middle" fill="#1B3B2B" font-family="sans-serif" font-size="28" font-weight="bold">${title}</text>
    </svg>
  `);
  await sharp(svg).webp().toFile(path.join(OUT_DIR, outputName));
}

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const logo = await findFile(["image_16.png", "logo.png"]);
  if (logo) await processLogo(logo);
  else await createFallback("logo-ml.webp", "ML BARBER");

  const mateus = await findFile(["image_15.png", "mateus.png"]);
  if (mateus) await processMateusHero(mateus);
  else await createFallback("mateus-hero.webp", "Mateus Lopes");

  const shots = [
    { files: ["image_17.png"], out: "corte-fade-1.webp", top: 0.18, bot: 0.79, label: "Fade Clássico" },
    { files: ["image_19.png"], out: "corte-taper-2.webp", top: 0.13, bot: 0.90, label: "Taper Fade Cacheado" },
    { files: ["image_20.png"], out: "espaco-principal.webp", top: 0.18, bot: 0.79, label: "Espaço ML Barber" },
    { files: ["image_21.png"], out: "espaco-bancada.webp", top: 0.23, bot: 0.70, label: "Bancada & Samambaia" },
    { files: ["image_22.png"], out: "espaco-cadeira.webp", top: 0.18, bot: 0.79, label: "Poltrona ML Barber" },
  ];

  for (const s of shots) {
    const f = await findFile(s.files);
    if (f) await processInstagramScreenshot(f, s.out, s.top, s.bot);
    else await createFallback(s.out, s.label);
  }

  const profile = await findFile(["image_18.png"]);
  if (profile) await extractGridCutFromProfile(profile);
  else await createFallback("corte-medio-3.webp", "Corte Texturizado");

  console.log("\n🎉 Todos os assets da ML Barber foram recortados e otimizados!");
}

run();
```

---

### PASSO 3.4: Criar o Banco de Dados Inicial (`~/Projetos/MLBarber/data/db.json`)

Inclui os dados extraídos do perfil `@mlbarber._` (Carlos Barbosa/RS), o fundador **Mateus Lopes**, os barbeiros da equipe (**Alex Minuzzo** e **Afonso**), os serviços com preços/tempos e os cortes vinculados a cada profissional.

Crie `~/Projetos/MLBarber/data/db.json`:

```json
{
  "adminPassword": "mlbarber2026",
  "barbershop": {
    "name": "ML Barber",
    "fullName": "ML Barber — Barbearia em Carlos Barbosa",
    "founder": "Mateus Lopes",
    "city": "Carlos Barbosa — Serra Gaúcha, RS",
    "tagline": "Cortes que elevam sua presença",
    "subtagline": "Estilo, atitude e identidade. Mais que um corte, uma experiência.",
    "instagram": "mlbarber._",
    "whatsapp": "5554999999999",
    "externalBookingUrl": "https://sites.appbarber.com.br/mlbarber-2lrz",
    "useExternalRedirect": false,
    "followersCount": "3.980+",
    "postsCount": "127+",
    "statusBanner": "Agenda Aberta • Carlos Barbosa/RS",
    "aboutText": "Comandada por Mateus Lopes no coração de Carlos Barbosa (Serra Gaúcha), a ML Barber une um ambiente moderno e acolhedor — marcado pela nossa clássica parede de samambaias e iluminação hexagonal — a uma equipe de barbeiros especialistas em visagismo, fade limpo e acabamento preciso.",
    "logoUrl": "/assets/logo-ml.webp",
    "founderImageUrl": "/assets/mateus-hero.webp",
    "spaceImages": [
      "/assets/espaco-principal.webp",
      "/assets/espaco-bancada.webp",
      "/assets/espaco-cadeira.webp"
    ]
  },
  "barbers": [
    {
      "id": "mateus",
      "name": "Mateus Lopes",
      "role": "Fundador & Master Barber",
      "instagram": "mlbarber._",
      "bio": "Fundador da ML Barber. Especialista em visagismo masculino, cortes clássicos e modernos, barba estruturada e experiência completa na cadeira.",
      "specialties": ["Visagismo", "Degradê Preciso", "Barboterapia", "Tesoura"],
      "avatarUrl": "/assets/mateus-hero.webp",
      "active": true,
      "isFounder": true,
      "availableTimes": ["09:00", "10:00", "11:00", "14:00", "15:30", "17:00", "18:30"]
    },
    {
      "id": "alex",
      "name": "Alex Minuzzo",
      "role": "Barbeiro Especialista",
      "instagram": "alexminuzzo_barbeiro",
      "bio": "Focado em fade limpo, acabamento milimétrico, cortes texturizados e taper fade para todos os tipos de cabelo.",
      "specialties": ["Fade Limpo", "Taper Fade", "Texturizado", "Acabamento Navalhado"],
      "avatarUrl": "/assets/corte-fade-1.webp",
      "active": true,
      "isFounder": false,
      "availableTimes": ["09:30", "10:30", "13:30", "15:00", "16:30", "18:00", "19:00"]
    },
    {
      "id": "afonso",
      "name": "Afonso",
      "role": "Barbeiro Profissional",
      "instagram": "afonsobarber_01",
      "bio": "Atendimento focado em cortes modernos, degradê, alinhamento de barba e sobrancelha na navalha.",
      "specialties": ["Degradê", "Barba Alinhada", "Freestyle & Nevou"],
      "avatarUrl": "/assets/corte-medio-3.webp",
      "active": true,
      "isFounder": false,
      "availableTimes": ["10:00", "11:30", "14:00", "16:00", "17:30", "19:00"]
    }
  ],
  "services": [
    {
      "id": "srv-corte",
      "name": "Corte Masculino (Social / Degradê / Tesoura)",
      "durationMin": 45,
      "price": 50,
      "category": "cabelo",
      "description": "Corte personalizado com lavagem, acabamento na navalha e finalização com pomada."
    },
    {
      "id": "srv-combo",
      "name": "Combo Completo (Corte + Barba + Sobrancelha)",
      "durationMin": 75,
      "price": 85,
      "category": "combo",
      "description": "A experiência completa da ML Barber: corte preciso, alinhamento de barba com toalha quente e sobrancelha."
    },
    {
      "id": "srv-barba",
      "name": "Barba Completa & Alinhamento",
      "durationMin": 30,
      "price": 40,
      "category": "barba",
      "description": "Modelagem de barba, hidratação dos fios e contorno limpo na navalha."
    },
    {
      "id": "srv-sobrancelha",
      "name": "Acabamento & Sobrancelha",
      "durationMin": 15,
      "price": 20,
      "category": "acabamento",
      "description": "Limpeza e alinhamento natural na navalha ou pinça."
    },
    {
      "id": "srv-nevou",
      "name": "Platinado / Nevou / Química",
      "durationMin": 120,
      "price": 150,
      "category": "quimica",
      "description": "Descoloração global segura com matização e reconstrução capilar."
    }
  ],
  "posts": [
    {
      "id": "post-1",
      "barberId": "mateus",
      "title": "Corte Médio Texturizado & Barba Alinhada",
      "styleTag": "Visagismo & Tesoura",
      "featured": true,
      "imageUrl": "/assets/corte-medio-3.webp"
    },
    {
      "id": "post-2",
      "barberId": "alex",
      "title": "Fade Limpo & Acabamento Preciso na Tesoura",
      "styleTag": "Low Fade Texturizado",
      "featured": true,
      "imageUrl": "/assets/corte-fade-1.webp"
    },
    {
      "id": "post-3",
      "barberId": "alex",
      "title": "Taper Fade em Cabelo Cacheado / Crespo",
      "styleTag": "Taper Fade",
      "featured": true,
      "imageUrl": "/assets/corte-taper-2.webp"
    },
    {
      "id": "post-4",
      "barberId": "mateus",
      "title": "Ambiente ML Barber • Parede de Samambaia",
      "styleTag": "A Experiência",
      "featured": false,
      "imageUrl": "/assets/espaco-principal.webp"
    },
    {
      "id": "post-5",
      "barberId": "afonso",
      "title": "Estrutura & Poltronas Clássicas ML Barber",
      "styleTag": "O Espaço",
      "featured": false,
      "imageUrl": "/assets/espaco-cadeira.webp"
    }
  ],
  "appointments": []
}
```

---

### PASSO 3.5: Criar Rotas de API (`src/app/api/barber/route.ts`, `src/app/api/upload/route.ts` e `src/app/api/ai/route.ts`)

Crie `~/Projetos/MLBarber/src/app/api/barber/route.ts`:

```typescript
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export async function GET() {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  const data = JSON.parse(raw);
  const { adminPassword, ...publicData } = data;
  return NextResponse.json(publicData);
}

export async function POST(req: Request) {
  const body = await req.json();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  const db = JSON.parse(raw);

  // Criação pública de agendamento pelo cliente (página /agenda ou Assistente IA)
  if (body.action === "book_appointment" && body.appointment) {
    const newApt = {
      id: `ML-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      status: "confirmado",
      ...body.appointment,
    };
    db.appointments = [newApt, ...(db.appointments || [])];
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    return NextResponse.json({ ok: true, appointment: newApt });
  }

  // Atualizações protegidas por senha do Admin
  if (body.password !== db.adminPassword) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  if (body.barbershop) db.barbershop = body.barbershop;
  if (body.barbers) db.barbers = body.barbers;
  if (body.services) db.services = body.services;
  if (body.posts) db.posts = body.posts;
  if (body.appointments) db.appointments = body.appointments;

  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  return NextResponse.json({ ok: true, db });
}
```

Crie `~/Projetos/MLBarber/src/app/api/upload/route.ts`:

```typescript
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Sem arquivo" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `ml-${Date.now()}.webp`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  await sharp(buffer)
    .rotate()
    .resize(900, 1050, { fit: "cover", position: "centre" })
    .sharpen()
    .webp({ quality: 86 })
    .toFile(path.join(uploadDir, fileName));

  return NextResponse.json({ url: `/uploads/${fileName}` });
}
```

Crie `~/Projetos/MLBarber/src/app/api/ai/route.ts` (Motor de Recepcionista & Visagismo IA com suporte a `GEMINI_API_KEY`, `OPENAI_API_KEY` e Fallback Local gratuito):

```typescript
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
```

---

### PASSO 3.6: Criar Estilos Globais e Layout (`src/app/globals.css` e `src/app/layout.tsx`)

Inclui a textura botânica da parede de samambaia, o padrão geométrico hexagonal do teto da ML Barber e o efeito **Blur Fade** da tipografia monumental **`ML BARBER`** que desaparece gradualmente na parte inferior.

Crie `~/Projetos/MLBarber/src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #FAF8F5;
  color: #141615;
  overflow-x: hidden;
}

/* Textura Botânica da Parede de Folhas de Samambaia + Luz Hexagonal do Teto */
.fern-botanical-bg {
  background-color: #1B3B2B;
  background-image:
    radial-gradient(circle at 50% 20%, rgba(74, 88, 72, 0.55) 0%, rgba(17, 38, 27, 0.94) 80%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L52 17.5 L52 42.5 L30 55 L8 42.5 L8 17.5 Z' fill='none' stroke='%23ffffff' stroke-width='0.6' stroke-opacity='0.08'/%3E%3C/svg%3E");
}

/* Padrão Claro Bege/Branco com Hexágonos sutis (Inspirado nas luminárias LED da ML Barber) */
.hex-light-bg {
  background-color: #FAF8F5;
  background-image:
    radial-gradient(circle at 50% 0%, rgba(239, 236, 228, 0.9) 0%, rgba(250, 248, 245, 1) 75%),
    url("data:image/svg+xml,%3Csvg width='56' height='56' viewBox='0 0 56 56' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 4 L50 16 L50 40 L28 52 L6 40 L6 16 Z' fill='none' stroke='%231B3B2B' stroke-width='0.6' stroke-opacity='0.06'/%3E%3C/svg%3E");
}

/* Efeito Pedido pelo Usuário: Texto Grande ML BARBER sumindo com Blur para baixo */
.title-blur-fade-bottom {
  position: relative;
  -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 48%, rgba(0,0,0,0.18) 82%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 48%, rgba(0,0,0,0.18) 82%, rgba(0,0,0,0) 100%);
}

.gpu-layer {
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
}
```

Crie `~/Projetos/MLBarber/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-display" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ML Barber | Mateus Lopes — Barbearia em Carlos Barbosa, RS",
  description: "Cortes que elevam sua presença. Estilo, atitude e identidade em Carlos Barbosa - Serra Gaúcha. Agende seu horário online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${jakarta.variable} scroll-smooth`}>
      <body className="font-sans antialiased selection:bg-fern selection:text-white">{children}</body>
    </html>
  );
}
```

---

### PASSO 3.7: Criar os Assets Vetoriais de Barbearia & Assistente IA (`src/components/BarberAssistantWidget.tsx`)

Crie `~/Projetos/MLBarber/src/components/BarberAssistantWidget.tsx`:

```tsx
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
```

---

### PASSO 3.8: Criar a Home Page com Motion "ML BARBER Blur Reveal", Fundo de Samambaia & Seção por Barbeiro (`src/app/page.tsx`)

Crie `~/Projetos/MLBarber/src/app/page.tsx`:

```tsx
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
```

---

### PASSO 3.9: Criar a Página Dedicada de Agenda Integrada (`~/Projetos/MLBarber/src/app/agenda/page.tsx`)

Permite ao cliente escolher **1. Profissional (Mateus ou Equipe)**, **2. Serviço (com valor e duração)**, **3. Data e Horário Livre**, e salva direto no sistema (com conector pronto para o AppBarber caso o Mateus ative no futuro).

Crie `~/Projetos/MLBarber/src/app/agenda/page.tsx`:

```tsx
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
```

---

### PASSO 3.10: Criar o Painel Administrativo Multi-Barbeiros (`~/Projetos/MLBarber/src/app/admin/page.tsx`)

Permite ao Mateus Lopes:
1. **Adicionar ou Desativar Barbeiros** em 1 clique quando alguém entra ou sai da equipe.
2. **Postar fotos de cortes** escolhendo de qual barbeiro é aquele trabalho.
3. **Gerenciar os Agendamentos** e valores dos serviços.

Crie `~/Projetos/MLBarber/src/app/admin/page.tsx`:

```tsx
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
```

---

### PASSO 3.11: Instalação e Inicialização pelo Agente

Por fim, o agente deve rodar no terminal em `~/Projetos/MLBarber`:

```bash
npm install
npm run assets
npm run dev
```