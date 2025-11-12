export type EmprestimoStatus = "ativo" | "devolvido" | "atrasado";

export class Emprestimo {
  constructor(
    public id: string,
    public livroIsbn: string,
    public usuarioId: number,
    public dataEmprestimo: string, // ISO
    public dataPrevistaDevolucao: string, // ISO
    public status: EmprestimoStatus = "ativo"
  ) {}

  verificarAtraso(now = new Date()): boolean {
    return (
      new Date(this.dataPrevistaDevolucao) < now && this.status === "ativo"
    );
  }

  calcularMulta(valorPorDia = 2): number {
    const hoje = new Date();
    if (!this.verificarAtraso(hoje)) return 0;
    const diffMs =
      hoje.getTime() - new Date(this.dataPrevistaDevolucao).getTime();
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return dias * valorPorDia;
  }
}
