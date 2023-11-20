import { Handlers } from "$fresh/server.ts";
import { getChannelByCode } from "../../../../db/models/channel.ts";
import { createJoinRequest } from "../../../../db/models/joinRequest.ts";
import { AuthState } from "../../_middleware.ts";

export const handler: Handlers<null, AuthState> = {
  // send join request from authenticated user to a given channel
  async POST(_, ctx) {
    const { code } = ctx.params;

    if (code.length !== 6) {
      return new Response("Invalid code!", { status: 400 });
    }

    const channel = await getChannelByCode(code);

    if (!channel) {
      return new Response("Channel was not found!", { status: 400 });
    }

    await createJoinRequest({
      userId: ctx.state.user.id,
      channelId: channel.id,
    });

    return new Response(JSON.stringify(channel));
  },
};
