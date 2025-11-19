"use client";
import { useEffect, useState } from "react";

type Livro = {
  titulo: string;
  autor: string;
  isbn: string;
  quantidade: number;
  disponivel?: number;
};
type Usuario = { nome: string; tipo: string; id?: number };
type Emprestimo = {
  usuario: string;
  livro: string;
  status: string;
  dataEmprestimo?: string;
  devolucaoPrevista?: string;
};

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

  // Estatísticas principais
  const totalLivros = livros.length;
  const totalExemplares = livros.reduce((acc, l) => acc + (l.quantidade || 0), 0);
  const livrosDisponiveis = livros.filter((l) => (l.quantidade || 0) > 0).length;
  const livrosIndisponiveis = livros.filter((l) => (l.quantidade || 0) === 0).length;
  
  const emprestimosAtivos = emprestimos.filter((e) => e.status === "ativo").length;
  const emprestimosDevolvidos = emprestimos.filter((e) => e.status === "devolvido").length;
  const emprestimosAtrasados = emprestimos.filter((e) => {
    if (e.status !== "ativo" || !e.devolucaoPrevista) return false;
    return new Date(e.devolucaoPrevista) < new Date();
  }).length;

  // Estatísticas de usuários
  const usuariosPorTipo = usuarios.reduce((acc, u) => {
    acc[u.tipo] = (acc[u.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Autor mais popular (baseado em empréstimos)
  const autorMaisPopular = (() => {
    const contagem: Record<string, number> = {};
    emprestimos.forEach((emp) => {
      const livro = livros.find((l) => l.titulo === emp.livro);
      if (livro) {
        contagem[livro.autor] = (contagem[livro.autor] || 0) + 1;
      }
    });
    const entries = Object.entries(contagem);
    if (entries.length === 0) return "N/A";
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  })();

  // Livros mais emprestados
  const livrosMaisEmprestados = (() => {
    const contagem: Record<string, number> = {};
    emprestimos.forEach((emp) => {
      contagem[emp.livro] = (contagem[emp.livro] || 0) + 1;
    });
    return Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([titulo, count]) => [titulo, count.toString()]);
  })();

  // Empréstimos ativos com detalhes
  const emprestimosAtivosDetalhes = emprestimos
    .filter((e) => e.status === "ativo")
    .slice(0, 5)
    .map((e) => {
      const dataPrevista = e.devolucaoPrevista 
        ? new Date(e.devolucaoPrevista).toLocaleDateString("pt-BR")
        : "N/A";
      const atrasado = e.devolucaoPrevista && new Date(e.devolucaoPrevista) < new Date();
      return [
        e.livro,
        e.usuario,
        dataPrevista,
        atrasado ? "⚠️ Atrasado" : "✅ No prazo"
      ];
    });

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Dashboard</h2>

      {/* Cards principais - primeira linha */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card
          title="Total de Livros"
          value={totalLivros}
          subtitle={`${totalExemplares} exemplares`}
          borderColor="border-blue-500"
        />
        <Card
          title="Usuários Cadastrados"
          value={usuarios.length}
          subtitle={`${Object.keys(usuariosPorTipo).length} tipos`}
          borderColor="border-orange-400"
        />
        <Card
          title="Empréstimos Ativos"
          value={emprestimosAtivos}
          borderColor="border-green-500"
        />
      </div>

      {/* Cards secundários - segunda linha */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card
          title="Livros Disponíveis"
          value={livrosDisponiveis}
          borderColor="border-cyan-500"
        />
        <Card
          title="Livros Indisponíveis"
          value={livrosIndisponiveis}
          borderColor="border-red-500"
        />
        <Card
          title="Empréstimos Devolvidos"
          value={emprestimosDevolvidos}
          borderColor="border-purple-500"
        />
        <Card
          title="Empréstimos Atrasados"
          value={emprestimosAtrasados}
          borderColor="border-yellow-500"
        />
      </div>

      {/* Cards informativos - terceira linha */}
      <div className="grid md:grid-cols-1 gap-6">
        <InfoCard
          title="Autor Mais Popular"
          value={autorMaisPopular}
          description="Mais emprestado"
          borderColor="border-indigo-500"
        />
      </div>

      {/* Tabelas - primeira linha */}
      <div className="grid md:grid-cols-2 gap-6">
        <Table
          title="Livros Recentes"
          headers={["Título", "Autor", "Estoque"]}
          rows={livros
            .slice(0, 5)
            .map((l) => [
              l.titulo,
              l.autor,
              `${l.quantidade || 0} ${(l.quantidade || 0) <= 2 ? "⚠️" : ""}`
            ])}
        />

        <Table
          title="Últimos Usuários"
          headers={["Nome", "Tipo"]}
          rows={usuarios.slice(0, 5).map((u) => [u.nome, u.tipo])}
        />
      </div>

      {/* Tabelas - segunda linha */}
      <div className="grid md:grid-cols-2 gap-6">
        <Table
          title="Empréstimos Ativos"
          headers={["Livro", "Usuário", "Devolução", "Status"]}
          rows={emprestimosAtivosDetalhes.length > 0 
            ? emprestimosAtivosDetalhes 
            : [["Nenhum empréstimo ativo", "-", "-", "-"]]}
        />

        <Table
          title="Livros Mais Emprestados"
          headers={["Título", "Empréstimos"]}
          rows={livrosMaisEmprestados.length > 0 
            ? livrosMaisEmprestados 
            : [["Nenhum dado disponível", "-"]]}
        />
      </div>

      {/* Estatísticas de usuários */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-white">Distribuição de Usuários por Tipo</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(usuariosPorTipo).map(([tipo, count]) => (
            <div
              key={tipo}
              className="bg-slate-700/50 p-4 rounded-lg border border-slate-600"
            >
              <div className="text-slate-400 text-sm mb-1">{tipo}</div>
              <div className="text-2xl font-bold text-white">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  subtitle,
  borderColor,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
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
  } else if (borderColor.includes("cyan")) {
    gradientStyle =
      "linear-gradient(135deg, rgba(10, 150, 180, 0.3) 0%, rgba(5, 100, 120, 0.2) 100%)";
  } else if (borderColor.includes("red")) {
    gradientStyle =
      "linear-gradient(135deg, rgba(150, 10, 10, 0.3) 0%, rgba(100, 5, 5, 0.2) 100%)";
  } else if (borderColor.includes("purple")) {
    gradientStyle =
      "linear-gradient(135deg, rgba(100, 10, 150, 0.3) 0%, rgba(70, 5, 100, 0.2) 100%)";
  } else if (borderColor.includes("yellow")) {
    gradientStyle =
      "linear-gradient(135deg, rgba(150, 120, 10, 0.3) 0%, rgba(100, 80, 5, 0.2) 100%)";
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
        {subtitle && (
          <p className="text-sm text-slate-300 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  description,
  borderColor,
}: {
  title: string;
  value: string | number;
  description: string;
  borderColor: string;
}) {
  let gradientStyle = "";

  if (borderColor.includes("amber")) {
    gradientStyle =
      "linear-gradient(135deg, rgba(150, 100, 10, 0.3) 0%, rgba(120, 80, 5, 0.2) 100%)";
  } else if (borderColor.includes("indigo")) {
    gradientStyle =
      "linear-gradient(135deg, rgba(50, 10, 150, 0.3) 0%, rgba(35, 5, 100, 0.2) 100%)";
  } else if (borderColor.includes("teal")) {
    gradientStyle =
      "linear-gradient(135deg, rgba(10, 120, 120, 0.3) 0%, rgba(5, 80, 80, 0.2) 100%)";
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
        <h3 className="text-sm font-medium mb-1 text-slate-300">{title}</h3>
        <p className="text-2xl font-bold mb-1">{value}</p>
        <p className="text-xs text-slate-400">{description}</p>
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
