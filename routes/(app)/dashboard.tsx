import { defineRoute } from "$fresh/src/server/defines.ts";
import { AuthState } from "./_middleware.ts";
import { getChannelsByCreator } from "../../db/models/channel.ts";
import ChannelList from "../../islands/app/dashboard/ChannelList.tsx";
import JoinChannelForm from "../../islands/app/dashboard/JoinChannelForm.tsx";

export default defineRoute<AuthState>(async function (
  _req,
  ctx,
) {
  const channels = await getChannelsByCreator(ctx.state.user.id);

  return (
    <main>
      <ChannelList initialList={channels} />
      <div className="py-4"></div>
      <JoinChannelForm />
    </main>
  );
});
