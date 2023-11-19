import { createClient } from "$libsql/web";

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
};
