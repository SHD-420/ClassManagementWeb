import { dbClient } from "../index.ts";
import * as bcrypt from "$bcrypt";

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

/**
 * Insert a new user into the database
 */
export const createUser = async (
  data: Pick<User, "email" | "name" | "type"> & { password: string },
): Promise<User> => {
  const hashedPassword = await bcrypt.hash(data.password);
  const result = await dbClient.execute({
    sql: "INSERT INTO USERS (NAME, EMAIL, PASSWORD, TYPE) VALUES (?,?,?,?)",
    args: [data.name, data.email, hashedPassword, data.type],
  });
  if (typeof result.lastInsertRowid === "undefined") {
    throw new TypeError(
      "Error while inserting new user: ResultSet.lastInsertRowid was undefined.",
    );
  }

  const { password: _, ...dataWithoutPassword } = data;

  return {
    id: Number(result.lastInsertRowid),
    ...dataWithoutPassword,
  };
};

/**
 * Check if user with provided email exists or not
 */
export const doesUserExistByEmail = async (email: string) => {
  const result = await dbClient.execute({
    sql: "SELECT EXISTS (SELECT 1 FROM USERS WHERE EMAIL = ?) AS E",
    args: [email],
  });
  return (result.rows[0].E !== 0);
};

/**
 * Find a user with provided email (for login purpose), null if no user found
 */
export const getUserByEmail = async (email: string) => {
  const { rows } = await dbClient.execute({
    sql: `SELECT 
      ID as id,
      NAME as name,
      PASSWORD as password
    FROM USERS WHERE EMAIL = ?`,
    args: [email],
  });
  if (!rows.length) return null;
  return rows[0] as unknown as (Pick<User, "name" | "id"> & {
    password: string;
  });
};
