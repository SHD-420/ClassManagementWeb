import { Handlers } from "$fresh/server.ts";
import { AuthState } from "../../_middleware.ts";
import { parseJsonFromReq, validationError } from "../../../../utils/api.ts";
import { checkExists, insertOne, selectOne } from "../../../../db/index.ts";
import { Channel } from "../../../../db/models/channel.ts";
import { z } from "$zod";

const joinRequestSchema = z.object({
  code: z.string().length(6, "Code should be of 6 characters!"),
});

export const handler: Handlers<null, AuthState> = {
  // send join request from authenticated user to a given channel
  async POST(req, ctx) {
    const data = await parseJsonFromReq(req, joinRequestSchema);

    if (data instanceof Response) return data;

    // check if channel exists or not
    const channel = await selectOne<
      Pick<Channel, "id" | "name" | "createdAt">
    >(
      {
        sql:
          "SELECT ID AS id, NAME AS name, CREATED_AT AS createdAt FROM CHANNELS WHERE CODE = ?",
        args: [data.code],
      },
    );

    if (!channel) {
      return validationError({ code: "Channel was not found!" });
    }

    const userId = ctx.state.user.id;

    // check if user has already joined the channel
    const hasUserAlreadyJoined = await checkExists({
      sql:
        "SELECT 1 FROM CHANNEL_USER_PIVOTS WHERE CHANNEL_ID = ? AND USER_ID = ?",
      args: [channel.id, userId],
    });
    if (hasUserAlreadyJoined) {
      return validationError({ code: "You have already joined this channel!" });
    }

    // check if user has already sent join request to the channel
    const doesJoinReqExist = await checkExists({
      sql: "SELECT 1 FROM JOIN_REQUESTS WHERE USER_ID = ? AND CHANNEL_ID = ?",
      args: [userId, channel.id],
    });

    if (doesJoinReqExist) {
      return validationError({ code: "Join request already sent!" });
    }

    // insert join request into the db
    await insertOne({
      sql: `INSERT INTO JOIN_REQUESTS (USER_ID, CHANNEL_ID) VALUES (?, ?)`,
      args: [ctx.state.user.id, channel.id],
    });

    return new Response(JSON.stringify(channel));
  },
};
