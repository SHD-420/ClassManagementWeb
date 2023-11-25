import { defineRoute } from "$fresh/src/server/defines.ts";
import { selectMany } from "../../db/index.ts";
import ChannelList, {
  ChannelCompact,
} from "../../islands/app/dashboard/ChannelList.tsx";
import JoinChannelForm from "../../islands/app/dashboard/JoinChannelForm.tsx";
import { AuthState } from "./_middleware.ts";

export default defineRoute<AuthState>(async function (
  _req,
  ctx,
) {
  // find all channels joined by the user
  let channelList = await selectMany<ChannelCompact>({
    sql: `SELECT
    ID AS id,
    NAME AS name,
    CODE AS code,
    CREATED_AT AS createdAt
    FROM CHANNELS WHERE ID IN
    (SELECT CHANNEL_ID FROM CHANNEL_USER_PIVOTS WHERE USER_ID = ?)
    `,
    args: [ctx.state.user.id],
  });

  // if user is a staff, attach joinRequestCount to all channels created by him/her
  if (ctx.state.user.type === "STAFF") {
    const createdChannels = await selectMany<
      { joinRequestCount: number; id: number }
    >({
      sql: `SELECT
      CHANNELS.ID AS id,
      COUNT(JOIN_REQUESTS.ID) AS joinRequestCount
      FROM CHANNELS
      LEFT JOIN JOIN_REQUESTS ON
      JOIN_REQUESTS.CHANNEL_ID = CHANNELS.ID
      WHERE CHANNELS.CREATOR_ID = ?
      GROUP BY CHANNELS.ID
      `,
      args: [ctx.state.user.id],
    });

    createdChannels.forEach(({ id, joinRequestCount }) => {
      channelList = channelList.map((channel) => {
        if (channel.id !== id) return channel;
        return { ...channel, joinRequestCount };
      });
    });
  }

  // TODO: hide new channel button for students
  return (
    <main>
      <ChannelList initialList={channelList} />
      <div className="py-4"></div>
      <JoinChannelForm />
    </main>
  );
});
