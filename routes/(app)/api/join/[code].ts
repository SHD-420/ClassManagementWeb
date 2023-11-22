import { Handlers } from "$fresh/server.ts";
import { checkExists, insertOne, selectOne } from "../../../../db/index.ts";
import { Channel } from "../../../../db/models/channel.ts";
import { AuthState } from "../../_middleware.ts";
import { validationError } from "../../../../utils/api.ts";

export const handler: Handlers<null, AuthState> = {
  // send join request from authenticated user to a given channel
  async POST(_, ctx) {
    const { code } = ctx.params;

    if (code.length !== 6) {
      return validationError("Invalid code!");
    }

    // check if channel exists or not
    const channel = await selectOne<
      Pick<Channel, "id" | "name" | "createdAt" | "creatorId">
    >(
      {
        sql:
          "SELECT ID AS id, NAME AS name, CREATOR_ID AS creatorId, CREATED_AT AS createdAt FROM CHANNELS WHERE CODE = ?",
        args: [code],
      },
    );

    if (!channel) {
      return validationError("Channel was not found!");
    }

    const userId = ctx.state.user.id;

    // check if user is the creator of the channel
    if (channel.creatorId === userId) {
      return validationError("You own this channel!");
    }

    // check if user has already sent join request to the channel
    const doesJoinReqExist = await checkExists({
      sql: "SELECT 1 FROM JOIN_REQUESTS WHERE USER_ID = ? AND CHANNEL_ID = ?",
      args: [userId, channel.id],
    });

    if (doesJoinReqExist) {
      return validationError("Join request already sent!");
    }

    console.log(channel);

    // insert join request into the db
    // await insertOne({
    //   sql: `INSERT INTO JOIN_REQUESTS (USER_ID, CHANNEL_ID) VALUES (?, ?)`,
    //   args: [ctx.state.user.id, channel.id],
    // });

    return new Response(JSON.stringify(channel));
  },
};
