import { defineRoute } from "$fresh/src/server/defines.ts";
import { AuthState } from "./_middleware.ts";
import { selectMany } from "../../db/index.ts";
import ChannelList from "../../islands/app/dashboard/ChannelList.tsx";
import JoinChannelForm from "../../islands/app/dashboard/JoinChannelForm.tsx";
import { Channel } from "../../db/models/channel.ts";

export default defineRoute<AuthState>(async function (
  _req,
  ctx,
) {
  const ownedChannels = await selectMany<
    Pick<
      Channel,
      "id" | "name" | "code" | "createdAt"
    >
  >({
    sql: `SELECT
    ID AS id,
    NAME AS name,
    CODE AS code,
    CREATED_AT as createdAt
    FROM CHANNELS
    WHERE CREATOR_ID = ?`,
    args: [ctx.state.user.id],
  });

  const joinedChannels = await selectMany({
    sql: `SELECT
    CHANNELS.ID AS id,
    CHANNELS.NAME AS name,
    CHANNELS.CODE AS code,
    CHANNELS.CREATED_AT AS created_at,
    USERS.NAME AS 'creator'
    FROM 
    (
      (JOIN_REQUESTS INNER JOIN CHANNELS ON CHANNELS.ID = JOIN_REQUESTS.CHANNEL_ID)
      INNER JOIN USERS ON USERS.ID = CHANNELS.CREATOR_ID
    )
    WHERE JOIN_REQUESTS.USER_ID = ?
    `,
    args: [ctx.state.user.id],
  });

  console.log(joinedChannels);

  return (
    <main>
      <ChannelList initialList={[...ownedChannels]} />
      <div className="py-4"></div>
      <JoinChannelForm />
    </main>
  );
});
