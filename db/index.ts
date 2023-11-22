import { createClient, InStatement } from "$libsql/web";

// create and export the libsql client

const TURSO_URL = Deno.env.get("TURSO_URL");
const TURSO_AUTHTOKEN = Deno.env.get("TURSO_AUTHTOKEN");

if (!TURSO_AUTHTOKEN || !TURSO_URL) {
  throw new Error(
    "Environment variables: TURSO_URL and TURSO_AUTHTOKEN were not provided!",
  );
}

export const dbClient = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTHTOKEN,
});

export const migrate = async () => {
  await (await import("./models/user.ts")).migrate();
  await (await import("./models/channel.ts")).migrate();
  await (await import("./models/joinRequest.ts")).migrate();
};

//
// UTILS
//

/**
 * Execute a sql query to retrieve all rows
 */
export const selectMany = async <T>(statement: InStatement) => {
  const result = await dbClient.execute(statement);
  return result.rows as T[];
};

/**
 * Execute a sql query to retrieve 1 row (first one in result set)
 */
export const selectOne = async <T>(statement: InStatement) => {
  const result = await dbClient.execute(statement);
  if (!result.rows.length) return null;
  return result.rows[0] as T;
};

/**
 * Check if given query returns any rows, similar to sqlite EXISTS operator
 */
export const checkExists = async (statement: InStatement) => {
  const result = await dbClient.execute(statement);
  return result.rows.length > 0;
};

/**
 * Execute sql to insert one record into the db and get the inserted id
 */
export const insertOne = async (statement: InStatement) => {
  const result = await dbClient.execute(statement);
  if (!result.lastInsertRowid) return null;
  return Number(result.lastInsertRowid);
};
