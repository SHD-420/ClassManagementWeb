import { dbClient } from "../index.ts";

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
            EMAIL VARCHAR(80) NOT NULL UNIQUE,
            PASSWORD VARCHAR(120),
            TYPE VARCHAR(20)
                DEFAULT "STAFF"
                CHECK (TYPE IN ("STAFF","STUDENT"))
        );
    `);
