import { Handlers } from "$fresh/server.ts";
import { z } from "$zod";
import {
  createChannel,
  doesChannelExistByCode,
  getChannelCreatorId,
  updateChannel,
} from "../../../../db/models/channel.ts";
import { parseJsonFromReq } from "../../../../utils/api.ts";
import { AuthState } from "../../_middleware.ts";

export const createChannelSchema = z.object({
  name: z.string(),
  code: z.string().refine(
    (str) => !str || /^[A-Z|a-z|0-9]{6}$/.test(str),
    "Only alphabets and numbers are allowed.",
  ),
  autoGenCode: z.literal("on").optional(),
});

export const editChannelSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const getRandomCode = () => {
  const buffer = new Uint8Array(3);
  crypto.getRandomValues(buffer);
  let code = "";
  buffer.forEach((b) => code += ("0" + b.toString(16)).slice(-2));
  return code;
};

export const handler: Handlers<null, AuthState> = {
  // create a channel
  async POST(req, ctx) {
    const data = await parseJsonFromReq(req, createChannelSchema);
    if (data instanceof Response) {
      return data;
    }

    let channelCode = data.code;

    // generate a unique random channel code if 'autoGenCode' is true
    if (data.autoGenCode === "on") {
      channelCode = getRandomCode();
      while (await doesChannelExistByCode(channelCode)) {
        channelCode = getRandomCode();
      }
    } else if (!channelCode || (await doesChannelExistByCode(channelCode))) {
      return new Response(JSON.stringify({ code: "Code already in use" }), {
        status: 400,
      });
    }
    
    const channelId = await createChannel({
      ...data,
      code: channelCode,
      creatorId: ctx.state.user.id,
    });

    return new Response(JSON.stringify({
      name: data.name,
      id: channelId,
      code: channelCode,
    }));
  },

  // edit an existing channel
  async PATCH(req, ctx) {
    const data = await parseJsonFromReq(req, editChannelSchema);
    if (data instanceof Response) {
      return data;
    }

    if ((await getChannelCreatorId(data.id)) !== ctx.state.user.id) {
      return new Response("", { status: 401 });
    }

    await updateChannel(data.id, data);
    return new Response("ok");
  },
};
