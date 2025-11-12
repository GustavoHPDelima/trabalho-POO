export abstract class Usuario {
  constructor(
    public nome: string,
    public id: number,
    public limiteEmprestimos: number,
    public prazoEmprestimoDias: number
  ) {}

  podeEmprestar(emprestimosAtuais: number): boolean {
    return emprestimosAtuais < this.limiteEmprestimos;
  }
}
