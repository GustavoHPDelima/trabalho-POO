import fs from "fs";
import path from "path";
import { Livro } from "./Livro";
import { Usuario } from "./Usuario";
import { Emprestimo } from "./Emprestimo";

const DATA_PATH = path.join(process.cwd(), "src", "data");

function readJson<T>(filename: string): T | [] {
  try {
    const text = fs.readFileSync(path.join(DATA_PATH, filename), "utf-8");
    return JSON.parse(text) as T;
  } catch {
    return [] as unknown as T;
  }
}

function writeJson(filename: string, data: any) {
  fs.writeFileSync(
    path.join(DATA_PATH, filename),
    JSON.stringify(data, null, 2)
  );
}

export class Biblioteca {
  livros: Livro[] = [];
  usuarios: Usuario[] = [];
  emprestimos: Emprestimo[] = [];

  carregarDados() {
    this.livros = readJson<Livro[]>("livros.json") as any;
    this.usuarios = readJson<Usuario[]>("usuarios.json") as any;
    this.emprestimos = readJson<Emprestimo[]>("emprestimos.json") as any;
  }

  salvarDados() {
    writeJson("livros.json", this.livros);
    writeJson("usuarios.json", this.usuarios);
    writeJson("emprestimos.json", this.emprestimos);
  }

  // métodos de domínio: adicionarLivro, registrarEmprestimo, devolver, etc.
}
