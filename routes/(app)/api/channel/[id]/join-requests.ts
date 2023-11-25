import { HandlerContext, Handlers } from "$fresh/server.ts";
import { checkExists, selectMany } from "../../../../../db/index.ts";
import { JoinRequest } from "../../../../../db/models/joinRequest.ts";
import { validationError } from "../../../../../utils/api.ts";
import { AuthState } from "../../../_middleware.ts";

// parse channel id from url params
// and make sure that creator of that channel is the authenticated user
const authorizeAndGetChannelId = async (
  ctx: HandlerContext<null, AuthState>,
) => {
  const channelId = parseInt(ctx.params.id);

  if (Number.isNaN(channelId)) {
    return validationError("Channel id should be integer!");
  }

  // make sure channel exists and user has access rights to it
  const doesChannelExist = await checkExists({
    sql: "SELECT 1 FROM CHANNELS WHERE ID = ? AND CREATOR_ID = ?",
    args: [channelId, ctx.state.user.id],
  });

  if (!doesChannelExist) {
    return new Response("", { status: 404 });
  }
  return channelId;
};

export const handler: Handlers<null, AuthState> = {
  // get join requests for a channel
  async GET(_, ctx) {
    const channelId = await authorizeAndGetChannelId(ctx);

    if (channelId instanceof Response) return channelId;

    const joinRequests = await selectMany<
      Pick<JoinRequest, "id" | "createdAt"> & { userName: string }
    >({
      sql: `SELECT
    JOIN_REQUESTS.ID AS id,
    JOIN_REQUESTS.CREATED_AT AS createdAt,
    USERS.NAME AS userName
    FROM JOIN_REQUESTS
    INNER JOIN USERS ON USERS.ID = JOIN_REQUESTS.USER_ID
    WHERE JOIN_REQUESTS.CHANNEL_ID = ?
    `,
      args: [channelId],
    });

    return new Response(JSON.stringify(joinRequests));
  },
};
