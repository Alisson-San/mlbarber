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
