import { execFileSync } from "child_process";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const RAW_DIR = path.join(process.cwd(), "raw");
const TEMP_DIR = path.join(process.cwd(), "raw", ".temp_frames");
const OUT_DIR = path.join(process.cwd(), "public", "assets");
const FRAMES_DIR = path.join(OUT_DIR, "tour-frames");

async function findFile(keywords) {
  for (const dir of [RAW_DIR, process.cwd()]) {
    try {
      const files = await fs.readdir(dir);
      const match = files.find((f) => keywords.some((k) => f.toLowerCase().includes(k.toLowerCase())));
      if (match) return path.join(dir, match);
    } catch {}
  }
  return null;
}

async function processLogo() {
  const logoInput = await findFile(["image_16", "logo"]);
  if (!logoInput) return;
  console.log("💈 Processando Logo Oficial ML Barber...");
  const size = 700;
  const circleMask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 4}" fill="white"/></svg>`
  );
  await sharp(logoInput)
    .resize(size, size, { fit: "cover" })
    .composite([{ input: circleMask, blend: "dest-in" }])
    .webp({ quality: 92 })
    .toFile(path.join(OUT_DIR, "logo-ml.webp"));
}

async function processBarbers() {
  const size = 600;
  const vignette = Buffer.from(
    `<svg width="${size}" height="${size}">
      <defs>
        <radialGradient id="v" cx="50%" cy="48%" r="72%">
          <stop offset="0%" stop-color="black" stop-opacity="0"/>
          <stop offset="72%" stop-color="black" stop-opacity="0"/>
          <stop offset="100%" stop-color="#0F1411" stop-opacity="0.22"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#v)"/>
    </svg>`
  );

  const mateusInput = await findFile(["mateus"]);
  if (mateusInput) {
    console.log("🧔 Processando foto de perfil: Mateus Lopes...");
    await sharp(mateusInput)
      .extract({ left: 125, top: 14, width: 900, height: 900 })
      .resize(size, size, { kernel: "lanczos3" })
      .modulate({ brightness: 1.03, saturation: 1.04 })
      .linear(1.06, -5)
      .sharpen({ sigma: 0.85 })
      .composite([{ input: vignette, blend: "over" }])
      .webp({ quality: 92 })
      .toFile(path.join(OUT_DIR, "barber-mateus.webp"));
  }

  const alexInput = await findFile(["alex"]);
  if (alexInput) {
    console.log("🧔 Processando foto de perfil: Alex Minuzzo...");
    await sharp(alexInput)
      .extract({ left: 95, top: 6, width: 1130, height: 1130 })
      .resize(size, size, { kernel: "lanczos3" })
      .modulate({ brightness: 0.99, saturation: 0.98 })
      .linear(1.05, -5)
      .sharpen({ sigma: 0.85 })
      .composite([{ input: vignette, blend: "over" }])
      .webp({ quality: 92 })
      .toFile(path.join(OUT_DIR, "barber-alex.webp"));
  }
}

async function processVideo() {
  const forceRebuild = process.argv.includes("--force");
  if (!forceRebuild) {
    try {
      const existingMeta = JSON.parse(await fs.readFile(path.join(FRAMES_DIR, "meta.json"), "utf-8"));
      if (existingMeta?.totalFrames >= 230 && existingMeta?.fps === 24 && existingMeta?.quality === 90) {
        console.log(`✅ ${existingMeta.totalFrames} quadros nativos 24fps já estão prontos em public/assets/tour-frames/`);
        return;
      }
    } catch {}
  }

  const videoInput = await findFile(["tour.mp4", "gemini_generated_video", ".mp4"]);
  if (!videoInput) {
    console.error("❌ ERRO: Coloque o vídeo na pasta raw/tour.mp4 e rode novamente!");
    process.exit(1);
  }

  const ffmpegMod = await import("ffmpeg-static").catch(() =>
    import("./raw/node_modules/ffmpeg-static/index.js")
  );
  const ffmpegPath = ffmpegMod.default;

  console.log("🎬 Vídeo localizado:", videoInput);
  await fs.rm(TEMP_DIR, { recursive: true, force: true });
  await fs.rm(FRAMES_DIR, { recursive: true, force: true });
  await fs.mkdir(TEMP_DIR, { recursive: true });
  await fs.mkdir(FRAMES_DIR, { recursive: true });

  console.log("⚡ Extraindo todos os quadros nativos 24fps em Lossless PNG (1:1 com o vídeo original)...");
  execFileSync(ffmpegPath, [
    "-i", videoInput,
    "-vf", "fps=24",
    path.join(TEMP_DIR, "raw_%04d.png"),
  ]);

  const rawFiles = (await fs.readdir(TEMP_DIR)).filter((f) => f.endsWith(".png")).sort();
  console.log(`🖼️ Masterizando ${rawFiles.length} quadros 24fps na resolução nativa 1280x720 HD (WebP 90 + nitidez óptica)...`);

  const concurrency = 8;
  let cursor = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < rawFiles.length) {
      const idx = cursor++;
      const outName = `frame_${String(idx + 1).padStart(4, "0")}.webp`;
      await sharp(path.join(TEMP_DIR, rawFiles[idx]))
        .sharpen({ sigma: 0.7, m1: 0.6, m2: 1.3 })
        .webp({ quality: 90, smartSubsample: true, effort: 4 })
        .toFile(path.join(FRAMES_DIR, outName));
    }
  });
  await Promise.all(workers);

  await fs.rm(TEMP_DIR, { recursive: true, force: true });
  await fs.writeFile(
    path.join(FRAMES_DIR, "meta.json"),
    JSON.stringify({ totalFrames: rawFiles.length, fps: 24, width: 1280, height: 720, quality: 90 }, null, 2)
  );
  console.log(`✅ Pronto! ${rawFiles.length} quadros nativos 24fps gerados em public/assets/tour-frames/`);
}

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(FRAMES_DIR, { recursive: true });
  await processLogo();
  await processBarbers();
  await processVideo();
}

run();
