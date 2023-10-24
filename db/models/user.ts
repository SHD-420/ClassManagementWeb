import { dbClient } from "../index.ts";
import { hash } from "$bcrypt";

export type User = {
  id: number;
  name: string;
  email: string;
  type: "STAFF" | "STUDENT";
};

export const migrate = () =>
  dbClient.executeMultiple(`
        CREATE TABLE IF NOT EXISTS USERS (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            NAME VARCHAR(80),
            EMAIL VARCHAR(80),
            PASSWORD VARCHAR(120),
            TYPE VARCHAR(20)
                DEFAULT "STAFF"
                CHECK (TYPE IN ("STAFF","STUDENT"))
        );
    `);

export const createUser = async (
  data: Pick<User, "email" | "name" | "type"> & { password: string },
) => {
  const hashedPassword = await hash(data.password);
  return dbClient.execute({
    sql: "INSERT INTO USERS (NAME, EMAIL, PASSWORD, TYPE) VALUES (?,?,?,?)",
    args: [data.name, data.email, hashedPassword, data.type],
  });
};

export const doesUserExistByEmail = async (email: string) => {
  const result = await dbClient.execute({
    sql: "SELECT EXISTS (SELECT 1 FROM USERS WHERE EMAIL = ?) AS E",
    args: [email],
  });
  return (result.rows[0].E !== 0);
};
