import { NextResponse } from "next/server";
import fs from "fs/promises";
import os from "os";
import path from "path";

export const dynamic = "force-dynamic";

const SEED_DB_PATH = path.join(process.cwd(), "data", "db.json");
const TMP_DB_PATH = path.join(os.tmpdir(), "mlbarber-db.json");

let memoryDbCache: Record<string, any> | null = null;

async function readDb() {
  try {
    const tmpRaw = await fs.readFile(TMP_DB_PATH, "utf-8");
    const parsed = JSON.parse(tmpRaw);
    memoryDbCache = parsed;
    return parsed;
  } catch {
    if (memoryDbCache) return memoryDbCache;
    const raw = await fs.readFile(SEED_DB_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    memoryDbCache = parsed;
    return parsed;
  }
}

async function writeDb(db: Record<string, any>) {
  memoryDbCache = db;
  const serialized = JSON.stringify(db, null, 2);
  try {
    await fs.writeFile(SEED_DB_PATH, serialized, "utf-8");
  } catch {
    // Em ambiente serverless read-only (Vercel), persiste em /tmp
    await fs.writeFile(TMP_DB_PATH, serialized, "utf-8");
  }
}

export async function GET() {
  const data = await readDb();
  const { adminPassword, ...publicData } = data;
  return NextResponse.json(publicData);
}

export async function POST(req: Request) {
  const body = await req.json();
  const db = await readDb();

  // Novo agendamento vindo do Menu da Cadeira (Ato 3 do Vídeo)
  if (body.action === "book") {
    const newBooking = {
      id: `ML-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      status: "confirmar",
      ...body.booking,
    };
    db.bookings = [newBooking, ...(db.bookings || [])];
    await writeDb(db);
    return NextResponse.json({ ok: true, booking: newBooking });
  }

  // Atualização via Painel Admin
  const expectedPassword = process.env.ADMIN_PASSWORD || db.adminPassword;
  if (body.password !== expectedPassword) {
    return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
  }

  if (body.shop) db.shop = body.shop;
  if (body.barbers) db.barbers = body.barbers;
  if (body.services) db.services = body.services;
  if (body.bookings) db.bookings = body.bookings;

  await writeDb(db);
  return NextResponse.json({ ok: true });
}
