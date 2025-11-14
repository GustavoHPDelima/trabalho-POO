import { NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json();

  const filePath = path.join(process.cwd(), "public/data/usuarios.json");
  const file = await readFile(filePath, "utf-8");
  const usuarios = JSON.parse(file);

  usuarios.push(body);

  await writeFile(filePath, JSON.stringify(usuarios, null, 2));

  return NextResponse.json({ ok: true });
}
