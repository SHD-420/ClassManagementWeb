import { dbClient } from "../index.ts";
import { User } from "./user.ts";

export type Channel = {
  id: number;
  name: string;
  code: string;
  createdAt: string;

  // relationships
  creatorId: number;
  creator: User;
};

export const migrate = () =>
  dbClient.executeMultiple(`
    CREATE TABLE IF NOT EXISTS CHANNELS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        NAME VARCHAR(255) NOT NULL,
        CREATOR_ID INT REFERENCES USERS(ID) ON DELETE CASCADE NOT NULL,
        CODE CHAR(6) NOT NULL UNIQUE,
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);