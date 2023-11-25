import { HandlerContext, Handlers } from "$fresh/server.ts";
import { z } from "$zod";
import { dbClient, insertOne, selectOne } from "../../../../db/index.ts";
import { JoinRequest } from "../../../../db/models/joinRequest.ts";
import { parseJsonFromReq, validationError } from "../../../../utils/api.ts";
import { AuthState } from "../../_middleware.ts";

// get join request data and
// make sure that creator of that channel to be joined is the authenticated user
const authorizeAndGetJoinRequest = async (
  id: number,
  ctx: HandlerContext<null, AuthState>,
) => {
  const joinRequest = await selectOne<
    Pick<JoinRequest, "channelId" | "userId"> & { channelCreatorId: number }
  >({
    sql: `SELECT
    CHANNELS.CREATOR_ID AS channelCreatorId,
    JOIN_REQUESTS.CHANNEL_ID AS channelId,
    JOIN_REQUESTs.USER_ID AS userId
    FROM JOIN_REQUESTS INNER JOIN CHANNELS ON
    CHANNELS.ID = JOIN_REQUESTS.CHANNEL_ID
    WHERE JOIN_REQUESTS.ID = ?
    `,
    args: [id],
  });

  if (!joinRequest) return validationError("Channel was not found!");

  if (joinRequest.channelCreatorId !== ctx.state.user.id) {
    return new Response("", { status: 401 });
  }

  return joinRequest;
};

const joinConfirmSchema = z.object({
  id: z.number(),
});

export const handler: Handlers<null, AuthState> = {
  // confirm a given join request
  async POST(req, ctx) {
    const data = await parseJsonFromReq(req, joinConfirmSchema);
    if (data instanceof Response) return data;

    const joinRequest = await authorizeAndGetJoinRequest(data.id, ctx);
    if (joinRequest instanceof Response) return joinRequest;

    // insert user into the channel
    await insertOne({
      sql: "INSERT INTO CHANNEL_USER_PIVOTS (CHANNEL_ID, USER_ID) VALUES (?,?)",
      args: [joinRequest.channelId, joinRequest.userId],
    });

    // delete the join request
    await dbClient.execute({
      sql: "DELETE FROM JOIN_REQUESTS WHERE ID = ?",
      args: [data.id],
    });

    return new Response("ok");
  },
};
