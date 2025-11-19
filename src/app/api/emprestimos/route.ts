import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "public/data/emprestimos.json");

function readEmprestimos() {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function writeEmprestimos(data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = readEmprestimos();
  return NextResponse.json(data);
}

type EmprestimoPayload = {
  id?: string;
  usuario: string;
  livro: string;
  status: "ativo" | "concluido" | string;
  dataEmprestimo?: string;
  devolucaoPrevista?: string;
  devolucaoReal?: string | null;
};

export async function POST(request: Request) {
  const novoEmprestimo: EmprestimoPayload = await request.json();
  const data: EmprestimoPayload[] = readEmprestimos();

  const emprestimo: EmprestimoPayload = {
    ...novoEmprestimo,
    id: novoEmprestimo.id || `emp-${Date.now()}`,
    status: novoEmprestimo.status || "ativo",
    dataEmprestimo: novoEmprestimo.dataEmprestimo || new Date().toISOString(),
    devolucaoPrevista:
      novoEmprestimo.devolucaoPrevista ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    devolucaoReal: novoEmprestimo.devolucaoReal || null,
  };

  data.push(emprestimo);
  writeEmprestimos(data);
  return NextResponse.json(emprestimo, { status: 201 });
}

export async function PUT(request: Request) {
  const payload: EmprestimoPayload = await request.json();

  if (!payload.id) {
    return NextResponse.json(
      { erro: "É necessário informar o id do empréstimo." },
      { status: 400 }
    );
  }

  const data: EmprestimoPayload[] = readEmprestimos();
  const index = data.findIndex((item) => item.id === payload.id);

  if (index === -1) {
    return NextResponse.json(
      { erro: "Empréstimo não encontrado." },
      { status: 404 }
    );
  }

  const atualizado = {
    ...data[index],
    ...payload,
    devolucaoReal:
      payload.devolucaoReal ?? data[index].devolucaoReal ?? null,
  };

  data[index] = atualizado;
  writeEmprestimos(data);
  return NextResponse.json(atualizado);
}
