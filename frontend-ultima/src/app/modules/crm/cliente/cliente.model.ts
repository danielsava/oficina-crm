export interface Cliente {
  id?: string;
  nome: string;
  email: string;
  documento: string;
  telefone?: string;
  dataCadastro?: Date | string;
}
