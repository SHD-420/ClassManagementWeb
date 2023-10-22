import { createClient } from "https://esm.sh/@libsql/client@0.3.3/web";
import { load } from "$std/dotenv/mod.ts";

const env = await load();

const client = createClient({
  url: env["TURSO_URL"],
  authToken: env["TURSO_AUTHTOKEN"],
});

// await client.execute(`
// CREATE TABLE IF NOT EXISTS PERSON (
//     NAME INT,
//     CASTE VARCHAR(255)
// )
// `);

// const data = await client.execute(`INSERT INTO PERSON VALUES (31, "OBC")`);

const rs = await client.execute(`SELECT * FROM PERSON`);
console.log(rs.rows);
