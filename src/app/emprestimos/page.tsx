"use client";

import { useEffect, useMemo, useState } from "react";

type Livro = {
  id: number;
  titulo: string;
  autor: string;
  quantidade: number;
  disponivel: number;
};

type Emprestimo = {
  id: string;
  usuario: string;
  usuarioId?: number;
  livro: string;
  livroId?: number;
  status: "ativo" | "concluido" | string;
  dataEmprestimo?: string;
  devolucaoPrevista?: string;
  devolucaoReal?: string | null;
};

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "concluido">(
    "todos"
  );
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        const [emprestimosRes, livrosRes] = await Promise.all([
          fetch("/api/emprestimos"),
          fetch("/api/livros"),
        ]);

        if (!emprestimosRes.ok) throw new Error("Erro ao carregar empréstimos.");
        if (!livrosRes.ok) throw new Error("Erro ao carregar livros.");

        const emprestimosData = await emprestimosRes.json();
        const livrosData = await livrosRes.json();

        setEmprestimos(Array.isArray(emprestimosData) ? emprestimosData : []);
        setLivros(Array.isArray(livrosData) ? livrosData : []);
        setErro(null);
      } catch (error: any) {
        console.error(error);
        setErro(error?.message || "Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  const hoje = new Date();
  const ativos = emprestimos.filter((e) => e.status === "ativo").length;
  const concluidos = emprestimos.filter((e) => e.status === "concluido").length;
  const atrasados = emprestimos.filter((e) => {
    if (e.status !== "ativo" || !e.devolucaoPrevista) return false;
    return new Date(e.devolucaoPrevista) < hoje;
  }).length;

  const emprestimosFiltrados = useMemo(() => {
    return emprestimos
      .filter((emprestimo) => {
        if (filtroStatus === "todos") return true;
        return emprestimo.status === filtroStatus;
      })
      .filter((emprestimo) => {
        if (!busca.trim()) return true;
        const termo = busca.toLowerCase();
        return (
          emprestimo.usuario.toLowerCase().includes(termo) ||
          emprestimo.livro.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => {
        const dataA = a.dataEmprestimo ? new Date(a.dataEmprestimo).getTime() : 0;
        const dataB = b.dataEmprestimo ? new Date(b.dataEmprestimo).getTime() : 0;
        return dataB - dataA;
      });
  }, [emprestimos, filtroStatus, busca]);

  async function marcarComoDevolvido(emprestimo: Emprestimo) {
    if (emprestimo.status === "concluido") return;

    const devolucaoReal = new Date().toISOString();
    const atualizado: Emprestimo = {
      ...emprestimo,
      status: "concluido",
      devolucaoReal,
    };

    setEmprestimos((prev) =>
      prev.map((item) => (item.id === emprestimo.id ? atualizado : item))
    );

    try {
      await fetch("/api/emprestimos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(atualizado),
      });

      if (emprestimo.livroId) {
        const livroAtual = livros.find((l) => l.id === emprestimo.livroId);
        if (livroAtual) {
          const livroAtualizado = {
            ...livroAtual,
            disponivel: Math.min(
              livroAtual.quantidade,
              livroAtual.disponivel + 1
            ),
          };
          setLivros((prev) =>
            prev.map((livro) => (livro.id === livroAtualizado.id ? livroAtualizado : livro))
          );

          await fetch("/api/livros", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(livroAtualizado),
          });
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar empréstimo:", error);
      setErro("Não foi possível atualizar o empréstimo. Tente novamente.");
    }
  }

  function formatarData(dataIso?: string) {
    if (!dataIso) return "-";
    return new Date(dataIso).toLocaleDateString("pt-BR");
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Controle de Empréstimos</h2>
          <p className="text-slate-300">
            Acompanhe os empréstimos ativos, devoluções e atrasos em tempo real.
          </p>
        </div>
      </header>

      {erro && (
        <div className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-xl">
          {erro}
        </div>
      )}

      <section className="grid md:grid-cols-3 gap-4">
        <ResumoCard titulo="Ativos" valor={ativos} destaque="text-blue-400" />
        <ResumoCard titulo="Concluídos" valor={concluidos} destaque="text-emerald-400" />
        <ResumoCard titulo="Atrasados" valor={atrasados} destaque="text-rose-400" />
      </section>

      <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">
              Busque por usuário ou livro
            </label>
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Ex: Felipe ou Estruturas de Dados"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            {["todos", "ativo", "concluido"].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status as typeof filtroStatus)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                  filtroStatus === status
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-900 border-slate-700 text-slate-300"
                }`}
              >
                {status === "todos"
                  ? "Todos"
                  : status === "ativo"
                  ? "Ativos"
                  : "Concluídos"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-700">
          <table className="w-full text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Usuário</th>
                <th className="px-4 py-3 text-left">Livro</th>
                <th className="px-4 py-3 text-left">Retirada</th>
                <th className="px-4 py-3 text-left">Devolução Prevista</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Carregando dados...
                  </td>
                </tr>
              ) : emprestimosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Nenhum empréstimo encontrado para o filtro aplicado.
                  </td>
                </tr>
              ) : (
                emprestimosFiltrados.map((emprestimo) => {
                  const estaAtrasado =
                    emprestimo.status === "ativo" &&
                    emprestimo.devolucaoPrevista &&
                    new Date(emprestimo.devolucaoPrevista) < hoje;

                  return (
                    <tr
                      key={emprestimo.id}
                      className="border-t border-slate-700/70 hover:bg-slate-900/50 transition"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {emprestimo.usuario}
                      </td>
                      <td className="px-4 py-3">{emprestimo.livro}</td>
                      <td className="px-4 py-3">{formatarData(emprestimo.dataEmprestimo)}</td>
                      <td className="px-4 py-3">
                        <span className={estaAtrasado ? "text-rose-400 font-semibold" : ""}>
                          {formatarData(emprestimo.devolucaoPrevista)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            emprestimo.status === "ativo"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-600/50"
                              : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {estaAtrasado ? "Atrasado" : emprestimo.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => marcarComoDevolvido(emprestimo)}
                          disabled={emprestimo.status === "concluido"}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                            emprestimo.status === "concluido"
                              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          Registrar Devolução
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ResumoCard({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: number;
  destaque: string;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <p className="text-slate-400 text-sm">{titulo}</p>
      <p className={`text-3xl font-bold mt-2 ${destaque}`}>{valor}</p>
    </div>
  );
}

