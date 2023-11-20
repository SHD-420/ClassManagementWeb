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

/** Insert a new channel into the database */
export const createChannel = async (
  data: Pick<Channel, "name" | "code" | "creatorId">,
) => {
  const result = await dbClient.execute({
    sql: "INSERT INTO CHANNELS (NAME, CREATOR_ID, CODE) VALUES (?,?,?)",
    args: [data.name, data.creatorId, data.code],
  });
  if (typeof result.lastInsertRowid === "undefined") {
    throw new TypeError(
      "Error while inserting new user: ResultSet.lastInsertRowid was undefined.",
    );
  }

  return Number(result.lastInsertRowid);
};

/** Get all the channels for a given creatorId */
export const getChannelsByCreator = async (userId: number) => {
  const result = await dbClient.execute({
    sql: `SELECT
        ID AS id,
        NAME AS name,
        CODE AS code,
        CREATED_AT as createdAt
        FROM CHANNELS
        WHERE CREATOR_ID = ?`,
    args: [userId],
  });

  return result.rows as unknown as Pick<
    Channel,
    "id" | "name" | "code" | "createdAt"
  >[];
};

/** Get channel with a given code */
export const getChannelByCode = async (code: string) => {
  const result = await dbClient.execute({
    sql: `SELECT
        ID AS id,
        NAME AS name,
        CODE AS code,
        CREATED_AT as createdAt
        FROM CHANNELS
        WHERE CODE = ?`,
    args: [code],
  });

  if (!result.rows.length) return;
  return result.rows[0] as unknown as Pick<
    Channel,
    "id" | "name" | "code" | "createdAt"
  >;
};

/** Get creator id for given channel */
export const getChannelCreatorId = async (id: number) => {
  const result = await dbClient.execute({
    sql: "SELECT CREATOR_ID FROM CHANNELS WHERE ID = ?",
    args: [id],
  });
  return result.rows[0]?.CREATOR_ID as number | undefined;
};

/** Check if a channel with a given code exists */
export const doesChannelExistByCode = async (code: string) => {
  const result = await dbClient.execute({
    sql: "SELECT EXISTS (SELECT 1 FROM CHANNELS WHERE CODE = ?) AS E",
    args: [code],
  });
  return (result.rows[0].E !== 0);
};

/** Update an existing channel with given data */
export const updateChannel = async (
  id: number,
  data: Pick<Channel, "name">,
) => {
  await dbClient.execute({
    sql: "UPDATE CHANNELS SET NAME = ? WHERE ID = ?",
    args: [data.name, id],
  });
};

/** Delete a channel from the database */
export const deleteChannel = async (id: number) => {
  await dbClient.execute({
    sql: "DELETE FROM CHANNELS WHERE ID = ?",
    args: [id],
  });
};
