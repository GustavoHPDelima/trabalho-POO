"use client";
import { useEffect, useState } from "react";

type Livro = {
  titulo: string;
  autor: string;
  isbn: string;
  quantidade: number;
};
type Usuario = { nome: string; tipo: string };
type Emprestimo = { usuario: string; livro: string; status: string };

export default function Dashboard() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

  useEffect(() => {
    async function carregarDados() {
      const [livrosRes, usuariosRes, emprestimosRes] = await Promise.all([
        fetch("/data/livros.json"),
        fetch("/data/usuarios.json"),
        fetch("/data/emprestimos.json"),
      ]);

      setLivros(await livrosRes.json());
      setUsuarios(await usuariosRes.json());
      setEmprestimos(await emprestimosRes.json());
    }

    carregarDados();
  }, []);

  const livrosDisponiveis = livros.filter((l) => l.quantidade).length;
  const emprestimosAtivos = emprestimos.filter(
    (e) => e.status === "ativo"
  ).length;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Dashboard da Biblioteca</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <Card
          title="Total de Livros"
          value={livros.length}
          borderColor="border-blue-500"
        />
        <Card
          title="Usuários Cadastrados"
          value={usuarios.length}
          borderColor="border-orange-400"
        />
        <Card
          title="Empréstimos Ativos"
          value={emprestimosAtivos}
          borderColor="border-green-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Table
          title="📚 Livros Recentes"
          headers={["Título", "Autor", "Disponível"]}
          rows={livros
            .slice(0, 5)
            .map((l) => [l.titulo, l.autor, l.quantidade ? "✅" : "❌"])}
        />

        <Table
          title="👥 Últimos Usuários"
          headers={["Nome", "Tipo"]}
          rows={usuarios.slice(0, 5).map((u) => [u.nome, u.tipo])}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  borderColor,
}: {
  title: string;
  value: number;
  borderColor: string;
}) {
  let gradientStyle = "";

  if (borderColor.includes("blue")) {
    gradientStyle =
      "linear-gradient(135deg, rgba(10, 50, 150, 0.3) 0%, rgba(15, 30, 80, 0.2) 100%)";
  } else if (borderColor.includes("orange") || borderColor.includes("amber")) {
    gradientStyle =
      "linear-gradient(135deg, rgba(150, 70, 10, 0.3) 0%, rgba(120, 40, 10, 0.2) 100%)";
  } else if (borderColor.includes("green")) {
    gradientStyle =
      "linear-gradient(135deg, rgba(10, 100, 50, 0.3) 0%, rgba(15, 60, 30, 0.2) 100%)";
  } else {
    gradientStyle =
      "linear-gradient(135deg, rgba(20, 20, 30, 0.3) 0%, rgba(10, 10, 20, 0.2) 100%)";
  }

  return (
    <div
      className={`p-6 rounded-2xl border-2 ${borderColor} text-white shadow-lg flex flex-col items-center justify-center backdrop-blur-sm relative overflow-hidden`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: gradientStyle,
        }}
      ></div>

      <div className="relative z-10 text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function Table({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
      <table className="w-full text-sm text-slate-300">
        <thead>
          <tr className="border-b border-slate-700">
            {headers.map((h) => (
              <th key={h} className="text-left pb-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-700/50 ">
              {r.map((c, j) => (
                <td key={j} className="py-2">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
