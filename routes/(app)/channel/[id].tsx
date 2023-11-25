import { defineRoute } from "$fresh/src/server/defines.ts";
import { checkExists, selectOne } from "../../../db/index.ts";
import { Channel } from "../../../db/models/channel.ts";
import { AuthState } from "../_middleware.ts";
import JoinRequestsDropdown from "../../../islands/app/channel/[id]/JoinRequestsDropdown.tsx";

export default defineRoute<AuthState>(async function (
  _,
  ctx,
) {
  const channelId = ctx.params.id;

  const channel = await selectOne<
    Pick<Channel, "id" | "name" | "code" | "creatorId"> & {
      userCount: number;
      joinRequestCount: number;
    }
  >({
    sql: `SELECT
        ID AS id,
        NAME AS name,
        CODE AS code,
        CREATOR_ID AS creatorId,
        (SELECT COUNT(*) FROM CHANNEL_USER_PIVOTS WHERE CHANNEL_ID = ?) AS userCount
        FROM CHANNELS
        WHERE ID = ?
      `,
    args: [channelId, channelId],
  });
  if (!channel) return ctx.renderNotFound();

  // make sure user has joined the channel
  const isUserJoined = await checkExists({
    sql:
      "SELECT 1 FROM CHANNEL_USER_PIVOTS WHERE CHANNEL_ID = ? AND USER_ID = ?",
    args: [channelId, ctx.state.user.id],
  });

  if (!isUserJoined) return ctx.renderNotFound();

  // count & show join requests from db only if user is the creator of channel
  const joinRequestCount = channel.creatorId === ctx.state.user.id
    ? (await selectOne<{ joinRequestCount: number }>({
      sql:
        "SELECT COUNT(*) AS joinRequestCount FROM JOIN_REQUESTS WHERE CHANNEL_ID = ?",
      args: [channelId],
    }))?.joinRequestCount
    : null;

  return (
    <main>
      <div className="flex justify-between">
        <div>
          <h2 class="text-4xl font-bold">{channel.name}</h2>
          <p>{channel.userCount} members</p>
        </div>

        {joinRequestCount
          ? (
            <JoinRequestsDropdown
              channelId={channel.id}
              joinRequestCount={joinRequestCount}
            />
          )
          : null}
      </div>
    </main>
  );
});
