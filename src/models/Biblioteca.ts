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
    this.emprestimos.push(novoEmprestimo);
  }

  devolverLivro(_emprestimoId: string, _dataDevolucao: string) {
    if (!_emprestimoId || _emprestimoId.trim().length === 0) {
      throw new Error("O ID do empréstimo é inválido.");
    }

    if (!_dataDevolucao || isNaN(new Date(_dataDevolucao).getTime())) {
      throw new Error("A data de devolução é inválida.");
    }

    const emprestimo = this.emprestimos.find((e) => e.id === _emprestimoId);
    if (!emprestimo) {
      throw new Error("Empréstimo não encontrado.");
    }

    if (emprestimo.status !== "ativo") {
      throw new Error("Empréstimo já finalizado.");
    }

    // calcula multa com base na data de devolução informada
    const dataDevolucao = new Date(_dataDevolucao);
    const prevista = new Date(emprestimo.dataPrevistaDevolucao);
    const msPorDia = 1000 * 60 * 60 * 24;
    let multa = 0;
    if (dataDevolucao.getTime() > prevista.getTime()) {
      const diffMs = dataDevolucao.getTime() - prevista.getTime();
      const dias = Math.ceil(diffMs / msPorDia);
      const valorPorDia = 2; // mesmo padrão do Emprestimo.calcularMulta
      multa = dias * valorPorDia;
    }

    // atualiza status e persiste
    emprestimo.status = "devolvido";
    this.salvarDados();

    return multa;
  }

  consultarEstoque(_livroIsbn: string): number {
    if (!_livroIsbn || _livroIsbn.trim().length === 0 || _livroIsbn.trim().length < 10) {
      throw new Error("O ISBN do livro não pode estar vazio.");
    }

    const livro = this.livros.find((l) => (l as any).isbn === _livroIsbn);
    if (!livro) {
      return 0;
    }

    const livroAny = livro as any;
    if (typeof livroAny.qtd === "number") return livroAny.qtd;
    if (typeof livroAny.quantidade === "number") return livroAny.quantidade;
    if (typeof livroAny.quantidadeDisponivel === "number") return livroAny.quantidadeDisponivel;
    if (typeof livroAny.estoque === "number") return livroAny.estoque;

    return 0;
  }
}
