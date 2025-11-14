import { describe, it, expect, beforeEach } from "vitest";
import { Biblioteca } from "./src/models/Biblioteca";
import { AlunoGraduacao } from "./src/models/AlunoGraduacao";
import { Professor } from "./src/models/Professor";
import { Livro } from "./src/models/Livro";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src", "data");

function rmDataFiles() {
  if (fs.existsSync(DATA_PATH)) {
    const files = fs.readdirSync(DATA_PATH);
    for (const f of files) fs.unlinkSync(path.join(DATA_PATH, f));
  }
}

describe("Biblioteca - fluxo básico", () => {
  let b: Biblioteca;

  beforeEach(() => {
    rmDataFiles();
    b = new Biblioteca();
    // cria dados em memória
    b.usuarios = [
      new AlunoGraduacao("Aluno 1", 1),
      new Professor("Prof 1", 2),
    ] as any;
    b.livros = [new Livro("TS para mortais", "Autor X", "1234567890", 2)] as any;
    b.emprestimos = [];
    b.salvarDados();
  });

  it("adiciona livro existente incrementando quantidade", () => {
    b.adicionarLivros("TS para mortais", "Autor X", "1234567890", 3);
    const estoque = b.consultarEstoque("1234567890");
    expect(estoque).toBe(5);
  });

  it("registra empréstimo e decrementa estoque", () => {
    const emp = b.registrarEmprestimo(1, "1234567890", new Date().toISOString());
    expect(emp).toBeDefined();
    const estoque = b.consultarEstoque("1234567890");
    expect(estoque).toBe(1);
  });

  it("impede usuário acima do limite", () => {
    // cria 3 empréstimos para aluno (limite 3)
    b.registrarEmprestimo(1, "1234567890", new Date().toISOString());
    b.livros.push(new Livro("L2", "A", "9999999999", 1) as any);
    b.registrarEmprestimo(1, "9999999999", new Date().toISOString());
    b.livros.push(new Livro("L3", "A", "8888888888", 1) as any);
    b.registrarEmprestimo(1, "8888888888", new Date().toISOString());

    // agora deve falhar para quarto empréstimo
    expect(() =>
      b.registrarEmprestimo(1, "1234567890", new Date().toISOString())
    ).toThrow();
  });

  it("calcula multa ao devolver atrasado", () => {
    const dEmp = new Date();
    const dPrev = new Date(dEmp.getTime() - 5 * 24 * 3600 * 1000); // previsto 5 dias atrás
    const emp = b.registrarEmprestimo(2, "1234567890", dEmp.toISOString(), dPrev.toISOString());
    const multa = b.devolverLivro(emp.id, new Date().toISOString());
    expect(multa).toBeGreaterThanOrEqual(1);
  });
});
