"use client";
import { useState, useEffect } from "react";

type Livro = {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  quantidade: number;
  disponivel: number;
};

type Usuario = {
  id: number;
  nome: string;
  tipo: string;
};

export default function LivrosDisponiveis() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [showEmprestimoModal, setShowEmprestimoModal] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);
  const [novoLivro, setNovoLivro] = useState<{
    titulo: string;
    autor: string;
    isbn: string;
    quantidade?: number;
  }>({
    titulo: "",
    autor: "",
    isbn: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [livrosRes, usuariosRes] = await Promise.all([
          fetch("/api/livros"),
          fetch("/data/usuarios.json"),
        ]);

        if (!livrosRes.ok) throw new Error("Falha ao buscar livros");
        if (!usuariosRes.ok) throw new Error("Falha ao buscar usuários");

        const livrosData = await livrosRes.json();
        const usuariosData = await usuariosRes.json();

        setLivros(Array.isArray(livrosData) ? livrosData : []);
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
        setError(null);
      } catch (err: any) {
        console.error("Erro carregarDados:", err);
        setError(err?.message || "Erro desconhecido ao carregar dados");
        setLivros([]);
      }
    }

    carregarDados();
  }, []);

  function gerarISBN() {
    const randomPart = () =>
      Math.floor(10000 + Math.random() * 90000).toString();
    return `978-1-${randomPart()}-${randomPart()}`;
  }

  function abrirModalCadastro() {
    setNovoLivro({
      titulo: "",
      autor: "",
      isbn: gerarISBN(),
      quantidade: undefined,
    });
    setShowCadastroModal(true);
  }

  async function handleAddLivro() {
    if (
      !novoLivro.titulo?.trim() ||
      !novoLivro.autor?.trim() ||
      !novoLivro.quantidade ||
      novoLivro.quantidade <= 0
    ) {
      alert("Preencha todos os campos corretamente!");
      return;
    }

    const livroComId: Livro = {
      id: Date.now(),
      titulo: novoLivro.titulo,
      autor: novoLivro.autor,
      isbn: novoLivro.isbn,
      quantidade: novoLivro.quantidade,
      disponivel: novoLivro.quantidade,
    };

    try {
      const res = await fetch("/api/livros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(livroComId),
      });
      if (!res.ok) throw new Error("Falha ao salvar livro");
      setLivros((prev) => [...prev, livroComId]);
      setShowCadastroModal(false);
    } catch (err) {
      console.error("Erro salvando livro:", err);
      alert("Erro ao salvar livro. Verifique o console.");
    }
  }

  function abrirModalEmprestimo(e: React.MouseEvent, livro: Livro) {
    e.stopPropagation();
    setLivroSelecionado(livro);
    setShowEmprestimoModal(true);
  }

  async function confirmarEmprestimo() {
    if (!livroSelecionado) return;

    if (livroSelecionado.disponivel <= 0) {
      alert("Esse livro não está disponível no momento!");
      return;
    }

    const usuarioAtual = usuarios[0] ?? {
      id: 0,
      nome: "Usuário Exemplo",
      tipo: "Aluno",
    };

    const livrosAtualizados = livros.map((l) =>
      l.id === livroSelecionado.id ? { ...l, disponivel: l.disponivel - 1 } : l
    );
    setLivros(livrosAtualizados);

    try {
      await fetch("/api/livros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          livrosAtualizados.find((l) => l.id === livroSelecionado.id)
        ),
      });

      const novoEmprestimo = {
        usuario: usuarioAtual.nome,
        livro: livroSelecionado.titulo,
        status: "ativo",
      };

      await fetch("/api/emprestimos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoEmprestimo),
      });

      alert("Empréstimo registrado com sucesso!");
      setShowEmprestimoModal(false);
    } catch (err) {
      console.error("Erro confirmarEmprestimo:", err);
      alert("Erro ao registrar empréstimo. Verifique o console.");
    }
  }

  const hoje = new Date();
  const devolucaoPrevista = new Date();
  devolucaoPrevista.setDate(hoje.getDate() + 7);
  const multaDiaria = 1.5;

  return (
    <div className="space-y-8 p-8 text-white">
      <header
        className="flex justify-between items-center"
        style={{ zIndex: 50 }}
      >
        <h1 className="text-3xl font-bold">Livros Disponíveis</h1>
        <button
          type="button"
          onClick={abrirModalCadastro}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white shadow"
          style={{ zIndex: 60 }}
        >
          + Adicionar Livro
        </button>
      </header>

      {error && <div className="text-yellow-300">Aviso: {error}</div>}

      <div className="grid md:grid-cols-3 gap-6">
        {livros.map((livro) => (
          <div
            key={livro.id}
            onClick={(e) => abrirModalEmprestimo(e, livro)}
            className="cursor-pointer bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg hover:scale-[1.03] hover:border-blue-500 transition"
          >
            <h3 className="text-xl font-semibold mb-2">{livro.titulo}</h3>
            <p className="text-slate-300">{livro.autor}</p>
            <p className="text-slate-400">Código: {livro.isbn}</p>
            <div className="mt-4 flex justify-between text-sm">
              <span>Total: {livro.quantidade}</span>
              <span
                className={`font-semibold ${livro.disponivel > 0 ? "text-green-400" : "text-red-400"}`}
              >
                {livro.disponivel > 0
                  ? `${livro.disponivel} disponíveis`
                  : "Indisponível"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showCadastroModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Novo Livro
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Digite o título do livro"
                className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white placeholder-slate-400"
                value={novoLivro.titulo}
                onChange={(e) =>
                  setNovoLivro({ ...novoLivro, titulo: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Informe o autor do livro"
                className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white placeholder-slate-400"
                value={novoLivro.autor}
                onChange={(e) =>
                  setNovoLivro({ ...novoLivro, autor: e.target.value })
                }
              />
              <input
                type="text"
                readOnly
                className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white cursor-not-allowed"
                value={novoLivro.isbn}
              />
              <input
                type="number"
                placeholder="Quantidade de exemplares disponíveis"
                className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white placeholder-slate-400"
                value={novoLivro.quantidade ?? ""}
                onChange={(e) =>
                  setNovoLivro({
                    ...novoLivro,
                    quantidade: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCadastroModal(false)}
                className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddLivro}
                className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmprestimoModal && livroSelecionado && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-[400px] shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Empréstimo de Livro
            </h2>
            <div className="space-y-2 text-slate-300">
              <p>
                <strong>Título:</strong> {livroSelecionado.titulo}
              </p>
              <p>
                <strong>Autor:</strong> {livroSelecionado.autor}
              </p>
              <p>
                <strong>Disponíveis:</strong> {livroSelecionado.disponivel}
              </p>
              <hr className="border-slate-700 my-2" />
              <p>
                <strong>Data do Empréstimo:</strong>{" "}
                {hoje.toLocaleDateString("pt-BR")}
              </p>
              <p>
                <strong>Devolução Prevista:</strong>{" "}
                {devolucaoPrevista.toLocaleDateString("pt-BR")}
              </p>
              <p>
                <strong>Multa diária:</strong> R$ {multaDiaria.toFixed(2)}
              </p>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEmprestimoModal(false)}
                className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEmprestimo}
                className="px-3 py-2 bg-green-600 rounded hover:bg-green-700"
              >
                Confirmar Empréstimo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
