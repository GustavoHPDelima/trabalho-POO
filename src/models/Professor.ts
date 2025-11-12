import { Usuario } from "./Usuario";

export class Professor extends Usuario {
  constructor(nome: string, id: number) {
    super(nome, id, 10, 30);
  }
}
