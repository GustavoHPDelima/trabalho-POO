import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "public/data/livros.json");

function readLivros() {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function writeLivros(data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = readLivros();
  return NextResponse.json(data);
}

type LivroPayload = {
  id?: number;
  titulo: string;
  autor: string;
  isbn: string;
  quantidade: number;
  disponivel: number;
};

export async function POST(request: Request) {
  const livroRecebido: LivroPayload = await request.json();
  const livros = readLivros();

  const sanitized: LivroPayload = {
    ...livroRecebido,
    id:
      typeof livroRecebido.id === "number"
        ? livroRecebido.id
        : Date.now() + Math.floor(Math.random() * 1000),
    quantidade: Number(livroRecebido.quantidade ?? 0),
    disponivel:
      livroRecebido.disponivel ?? Number(livroRecebido.quantidade ?? 0),
  };

  const existingIndex = livros.findIndex((l: LivroPayload) => l.id === sanitized.id);

  if (existingIndex >= 0) {
    livros[existingIndex] = { ...livros[existingIndex], ...sanitized };
    writeLivros(livros);
    return NextResponse.json(livros[existingIndex]);
  }

  livros.push(sanitized);
  writeLivros(livros);
  return NextResponse.json(sanitized, { status: 201 });
}
