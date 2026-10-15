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
