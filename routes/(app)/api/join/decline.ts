import { HandlerContext, Handlers } from "$fresh/server.ts";
import { z } from "$zod";
import { checkExists, dbClient } from "../../../../db/index.ts";
import { parseJsonFromReq, validationError } from "../../../../utils/api.ts";
import { AuthState } from "../../_middleware.ts";

// make sure that join request exists
// and creator of that channel to be joined is the authenticated user
const authorize = async (
  id: number,
  ctx: HandlerContext<null, AuthState>,
) => {
  const doesExist = await checkExists({
    sql: `SELECT
    1 FROM JOIN_REQUESTS INNER JOIN CHANNELS ON
    CHANNELS.ID = JOIN_REQUESTS.CHANNEL_ID
    WHERE JOIN_REQUESTS.ID = ? AND CHANNELS.CREATOR_ID = ?`,
    args: [id, ctx.state.user.id],
  });

  if (!doesExist) return validationError("Channel was not found!");

  return true;
};

const joinDeclineSchema = z.object({
  id: z.number(),
});

export const handler: Handlers<null, AuthState> = {
  // decline a given join request
  async POST(req, ctx) {
    const data = await parseJsonFromReq(req, joinDeclineSchema);
    if (data instanceof Response) return data;

    const authorizeResponse = await authorize(data.id, ctx);
    if (authorizeResponse instanceof Response) return authorizeResponse;

    // delete the join request
    await dbClient.execute({
      sql: "DELETE FROM JOIN_REQUESTS WHERE ID = ?",
      args: [data.id],
    });

    return new Response("ok");
  },
};
