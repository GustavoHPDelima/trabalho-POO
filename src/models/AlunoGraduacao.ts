import { Usuario } from "./Usuario";

export class AlunoGraduacao extends Usuario {
  constructor(nome: string, id: number) {
    super(nome, id, 3, 15);
  }
}
