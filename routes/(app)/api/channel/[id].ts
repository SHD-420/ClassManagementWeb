import { HandlerContext, Handlers } from "$fresh/server.ts";
import { z } from "$zod";
import { dbClient, selectOne } from "../../../../db/index.ts";
import { parseJsonFromReq, validationError } from "../../../../utils/api.ts";
import { AuthState } from "../../_middleware.ts";

// parse channel id from url params 
// and make sure that creator of that channel is the authenticated user
const authorizeAndGetChannelId = async (
  ctx: HandlerContext<null, AuthState>,
) => {
  const channelId = parseInt(ctx.params.id);

  if (Number.isNaN(channelId)) {
    return validationError("Channel id should be integer!");
  }

  const channel = await selectOne<{ creatorId: number }>({
    sql: "SELECT CREATOR_ID AS creatorId FROM CHANNELS WHERE ID = ?",
    args: [channelId],
  });

  if (!channel) return new Response("", { status: 404 });

  if (channel.creatorId !== ctx.state.user.id) {
    return new Response("", { status: 401 });
  }

  return channelId;
};

export const editChannelSchema = z.object({
  name: z.string(),
});

export const handler: Handlers<null, AuthState> = {
  // update an existing channel
  async PATCH(req, ctx) {
    const channelId = await authorizeAndGetChannelId(ctx);

    if (channelId instanceof Response) return channelId;

    const data = await parseJsonFromReq(req, editChannelSchema);
    if (data instanceof Response) {
      return data;
    }

    await dbClient.execute({
      sql: "UPDATE CHANNELS SET NAME = ? WHERE ID = ?",
      args: [data.name, channelId],
    });
    return new Response("ok");
  },

  // delete an existing channel
  async DELETE(_, ctx) {
    const channelId = await authorizeAndGetChannelId(ctx);

    if (channelId instanceof Response) return channelId;

    await dbClient.execute({
      sql: "DELETE FROM CHANNELS WHERE ID = ?",
      args: [channelId],
    });

    return new Response("ok");
  },
};
