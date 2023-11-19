import { Handlers } from "$fresh/server.ts";
import { AuthState } from "../../_middleware.ts";
import {
  deleteChannel,
  getChannelCreatorId,
  updateChannel,
} from "../../../../db/models/channel.ts";
import { parseJsonFromReq } from "../../../../utils/api.ts";
import { z } from "$zod";

export const editChannelSchema = z.object({
  name: z.string(),
});

export const handler: Handlers<null, AuthState> = {
  // update an existing channel
  async PATCH(req, ctx) {
    const channelId = parseInt(ctx.params.id);

    if (Number.isNaN(channelId)) {
      return new Response("Channel id should be integer!", { status: 400 });
    }

    if ((await getChannelCreatorId(channelId)) !== ctx.state.user.id) {
      return new Response("", { status: 401 });
    }

    const data = await parseJsonFromReq(req, editChannelSchema);
    if (data instanceof Response) {
      return data;
    }
    await updateChannel(channelId, data);
    return new Response("ok");
  },

  // delete an existing channel
  async DELETE(_, ctx) {
    const channelId = parseInt(ctx.params.id);

    if (Number.isNaN(channelId)) {
      return new Response("Channel id should be integer!", { status: 400 });
    }

    if ((await getChannelCreatorId(channelId)) !== ctx.state.user.id) {
      return new Response("", { status: 401 });
    }

    await deleteChannel(channelId);

    return new Response("ok");
  },
};
