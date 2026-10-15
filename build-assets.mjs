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
        const base = n.replace(/\.[^.]+$/, "").toLowerCase();
        const found = files.find(
          (f) =>
            f.toLowerCase() === n.toLowerCase() ||
            f.replace(/\.[^.]+$/, "").toLowerCase() === base
        );
        if (found) return path.join(dir, found);
      }
    } catch {}
  }
  return null;
}

// 1. Recorta a Logo Circular (image_16) eliminando o fundo cinza/preto externo
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

// 2. Processa a foto do Mateus Lopes (image_15) removendo a barra de comentário inferior e aplicando fade suave na base
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

// 4. Extrai um corte extra da grade do perfil (image_18)
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

  const logo = await findFile(["image_16.png", "image_16.jpg", "logo.png"]);
  if (logo) await processLogo(logo);
  else await createFallback("logo-ml.webp", "ML BARBER");

  const mateus = await findFile(["image_15.png", "image_15.jpg", "mateus.png"]);
  if (mateus) await processMateusHero(mateus);
  else await createFallback("mateus-hero.webp", "Mateus Lopes");

  const shots = [
    { files: ["image_17.png", "image_17.jpg"], out: "corte-fade-1.webp", top: 0.18, bot: 0.79, label: "Fade Clássico" },
    { files: ["image_19.png", "image_19.jpg"], out: "corte-taper-2.webp", top: 0.13, bot: 0.90, label: "Taper Fade Cacheado" },
    { files: ["image_20.png", "image_20.jpg"], out: "espaco-principal.webp", top: 0.18, bot: 0.79, label: "Espaço ML Barber" },
    { files: ["image_21.png", "image_21.jpg"], out: "espaco-bancada.webp", top: 0.23, bot: 0.70, label: "Bancada & Samambaia" },
    { files: ["image_22.png", "image_22.jpg"], out: "espaco-cadeira.webp", top: 0.18, bot: 0.79, label: "Poltrona ML Barber" },
  ];

  for (const s of shots) {
    const f = await findFile(s.files);
    if (f) await processInstagramScreenshot(f, s.out, s.top, s.bot);
    else await createFallback(s.out, s.label);
  }

  const profile = await findFile(["image_18.png", "image_18.jpg"]);
  if (profile) await extractGridCutFromProfile(profile);
  else await createFallback("corte-medio-3.webp", "Corte Texturizado");

  console.log("\n🎉 Todos os assets da ML Barber foram recortados e otimizados!");
}

run();
