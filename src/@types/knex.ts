import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    // definir aqui o tipo de tabela como um objeto
    users: {
      id: string;
      name: string;
      gender: "Male" | "Female";
      age: number;
      created_at: string;
    };
    meals: {
      id: string;
      user_id?: string;
      name: string;
      description: string;
      consumed_at: string;
      within_diet: boolean | number;
    };
  }
}
