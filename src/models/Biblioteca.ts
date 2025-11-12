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
  adicionarLivros(_titulo: string, _autor: string, _isbn: string, qtd: number) {
    if (!_titulo || _titulo.trim().length === 0) {
      throw new Error("O título do livro não pode estar vazio.");
    }

    if (!_autor || _autor.trim().length === 0) {
      throw new Error("O autor do livro não pode estar vazio.");
    }

    if (!_isbn || _isbn.trim().length === 0 && _isbn.trim().length < 10) {
      throw new Error("O ISBN do livro não pode estar vazio.");
    }

    if (qtd <= 0) {
      throw new Error("A quantidade de livros deve ser maior que zero.");
    }

    const novoLivro = new Livro(_titulo, _autor, _isbn, qtd);
    
    this.livros.push(novoLivro);
  }

  registrarEmprestimo(_usuarioId: number, _livroIsbn: string, _dataEmprestimo: string, _dataPrevistaDevolucao: string) {
    if(!_usuarioId || _usuarioId <= 0) {
      throw new Error("O ID do usuário é inválido.");
    }

    if(!_livroIsbn || _livroIsbn.trim().length === 0 && _livroIsbn.trim().length < 10) {
      throw new Error("O ISBN do livro não pode estar vazio.");
    }
    
    if(!_dataEmprestimo || isNaN(new Date(_dataEmprestimo).getTime())) {
      throw new Error("A data de empréstimo é inválida.");
    } 

    if(!_dataPrevistaDevolucao || isNaN(new Date(_dataPrevistaDevolucao).getTime())) {
      throw new Error("A data prevista de devolução é inválida.");  
    }

    const novoEmprestimo = new Emprestimo(
      (this.emprestimos.length + 1).toString(),
      _livroIsbn,
      _usuarioId,
      _dataEmprestimo,
      _dataPrevistaDevolucao
    );
  }
}
