import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "public/data/emprestimos.json");

export async function GET() {
  const data = fs.readFileSync(filePath, "utf-8");
  return NextResponse.json(JSON.parse(data));
}

export async function POST(request: Request) {
  const novoEmprestimo = await request.json();
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  data.push(novoEmprestimo);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return NextResponse.json({ sucesso: true });
}
