"use client";
import { useEffect, useState } from "react";

type Usuario = {
  nome: string;
  tipo: string;
};

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Aluno");

  useEffect(() => {
    async function carregarUsuarios() {
      const res = await fetch("/data/usuarios.json");
      setUsuarios(await res.json());
    }
    carregarUsuarios();
  }, []);

  async function salvarUsuario(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    const novo = { nome, tipo };

    const novosUsuarios = [...usuarios, novo];
    setUsuarios(novosUsuarios);

    await fetch("/api/usuario", {
      method: "POST",
      body: JSON.stringify(novo),
    });

    setNome("");
  }

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-bold text-white">Gerenciar Usuários</h2>

      <form
        onSubmit={salvarUsuario}
        className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md grid md:grid-cols-3 gap-4"
      >
        <div className="flex flex-col">
          <label className="text-slate-300 mb-1">Nome do Usuário</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="p-2 rounded bg-slate-900 border border-slate-700 text-white"
            placeholder="Ex: João da Silva"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-slate-300 mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="p-2 rounded bg-slate-900 border border-slate-700 text-white"
          >
            <option>Aluno</option>
            <option>Professor</option>
            <option>Bibliotecário</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl mt-6 p-3 font-semibold"
        >
          Cadastrar Usuário
        </button>
      </form>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Usuários Cadastrados
        </h3>

        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="pb-2 text-left">Nome</th>
              <th className="pb-2 text-left">Tipo</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((u, i) => (
              <tr key={i} className="border-b border-slate-700/50">
                <td className="py-2">{u.nome}</td>
                <td className="py-2">{u.tipo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
