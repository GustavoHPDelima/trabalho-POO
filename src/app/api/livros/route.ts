import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src", "data", "livros.json");

export async function GET() {
  try {
    const data = fs.existsSync(DATA_PATH)
      ? JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"))
      : [];
    return NextResponse.json({ sucesso: true, livros: data });
  } catch (err) {
    return NextResponse.json({ sucesso: false, livros: [] });
  }
}

export async function POST(req: Request) {
  const novo = await req.json();
  const data = fs.existsSync(DATA_PATH)
    ? JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"))
    : [];
  data.push(novo);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  return NextResponse.json({ sucesso: true, livro: novo });
}
