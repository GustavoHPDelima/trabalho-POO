"use client";

import { useEffect, useState } from "react";

type Livro = {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  quantidade: number;
  disponivel: number;
};

export default function LivrosPage() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [novoLivro, setNovoLivro] = useState<Omit<Livro, "id">>({
    titulo: "",
    autor: "",
    isbn: "",
    quantidade: 0,
    disponivel: 0,
  });

  useEffect(() => {
    fetch("/api/livros")
      .then((r) => r.json())
      .then((d) => setLivros(d.livros || []))
      .catch((err) => console.error(err));
  }, []);

  function handleAddLivro() {
    if (!novoLivro.titulo || !novoLivro.autor || !novoLivro.isbn) {
      alert("Preencha todos os campos!");
      return;
    }

    const livroComId = { ...novoLivro, id: Date.now() };
    setLivros((prev) => [...prev, livroComId]);
    setShowModal(false);
    setNovoLivro({
      titulo: "",
      autor: "",
      isbn: "",
      quantidade: 0,
      disponivel: 0,
    });
  }

  return (
    <main className="p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          📚 Gerenciamento de Livros
        </h1>
        <button className="px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-blue-700 text-white">
          Adicionar
        </button>
      </header>

      {livros.length === 0 ? (
        <p className="text-gray-500">Nenhum livro cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-2 px-4 text-left">Título</th>
                <th className="py-2 px-4 text-left">Autor</th>
                <th className="py-2 px-4 text-left">ISBN</th>
                <th className="py-2 px-4 text-center">Qtd Total</th>
                <th className="py-2 px-4 text-center">Disponíveis</th>
                <th className="py-2 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {livros.map((l) => (
                <tr key={l.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-2 px-4">{l.titulo}</td>
                  <td className="py-2 px-4">{l.autor}</td>
                  <td className="py-2 px-4">{l.isbn}</td>
                  <td className="py-2 px-4 text-center">{l.quantidade}</td>
                  <td className="py-2 px-4 text-center">
                    {l.disponivel > 0 ? (
                      <span className="text-green-600 font-semibold">
                        {l.disponivel}
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        Indisponível
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center space-x-2">
                    <button className="text-blue-600 hover:underline">
                      Editar
                    </button>
                    <button className="text-red-600 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Novo Livro</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título"
                className="w-full border p-2 rounded"
                value={novoLivro.titulo}
                onChange={(e) =>
                  setNovoLivro({ ...novoLivro, titulo: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Autor"
                className="w-full border p-2 rounded"
                value={novoLivro.autor}
                onChange={(e) =>
                  setNovoLivro({ ...novoLivro, autor: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="ISBN"
                className="w-full border p-2 rounded"
                value={novoLivro.isbn}
                onChange={(e) =>
                  setNovoLivro({ ...novoLivro, isbn: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Quantidade"
                className="w-full border p-2 rounded"
                value={novoLivro.quantidade}
                onChange={(e) =>
                  setNovoLivro({
                    ...novoLivro,
                    quantidade: Number(e.target.value),
                    disponivel: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddLivro}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
