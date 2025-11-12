export class Livro {
  constructor(
    public titulo: string,
    public autor: string,
    public isbn: string,
    public quantidade: number
  ) {}

  get disponivel(): boolean {
    return this.quantidade > 0;
  }

  emprestar() {
    if (!this.disponivel) throw new Error("Livro indisponível");
    this.quantidade--;
  }

  devolver() {
    this.quantidade++;
  }
}
