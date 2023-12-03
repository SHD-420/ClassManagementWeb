import { Handlers } from "$fresh/server.ts";
import { AuthState } from "../../../_middleware.ts";
import { parseJsonFromReq } from "../../../../../utils/api.ts";
import { checkExists } from "../../../../../db/index.ts";
import { insertOne } from "../../../../../db/index.ts";
import { z } from "$zod";

const createTextMessageSchema = z.object({
  message: z.string(),
});

export const handler: Handlers<null, AuthState> = {
  // create a text message
  async POST(req, ctx) {
    const channelId = ctx.params.id;
    const userId = ctx.state.user.id;

    // verify that channel exists and user has joined the channel
    if (
      !await checkExists({
        sql:
          "SELECT 1 FROM CHANNEL_USER_PIVOTS WHERE USER_ID = ? AND CHANNEL_ID = ?",
        args: [userId, channelId],
      })
    ) {
      return new Response("", { status: 404 });
    }

    // authenticated user must be staff
    if (
      !await checkExists({
        sql: "SELECT 1 FROM USERS WHERE TYPE = 'STAFF' AND ID = ?",
        args: [userId],
      })
    ) {
      return new Response("", { status: 401 });
    }

    const data = await parseJsonFromReq(req, createTextMessageSchema);
    if (data instanceof Response) return data;

    // create the text message
    await insertOne({
      sql:
        "INSERT INTO TEXT_MESSAGES (CONTENT, USER_ID, CHANNEL_ID) VALUES (?,?,?)",
      args: [data.message, userId, channelId],
    });

    return new Response("ok");
  },
};
