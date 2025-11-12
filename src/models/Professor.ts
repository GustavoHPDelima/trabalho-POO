import { Usuario } from "./Usuario";

export class Professor extends Usuario {
  constructor(nome: string, id: number) {
    super(nome, id, 10, 30);
  }

  /**
   * Regra específica para professores: permitem um livro a mais além do limite.
   * Assinatura mantém compatibilidade com a classe base.
   */
  podeEmprestar(emprestimosAtuais: number): boolean {
    // Professores têm um bônus de +1 livro
    return emprestimosAtuais < this.limiteEmprestimos + 3;
  }
}
