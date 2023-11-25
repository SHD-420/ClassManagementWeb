import { Handlers } from "$fresh/server.ts";
import { z } from "$zod";
import { checkExists, insertOne } from "../../../../db/index.ts";
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

const doesChannelExist = (code: string) =>
  checkExists({
    sql: "SELECT 1 FROM CHANNELS WHERE CODE = ?",
    args: [code],
  });

export const handler: Handlers<null, AuthState> = {
  // create a channel
  async POST(req, ctx) {
    // authenticated user must be off staff
    if (
      !(await checkExists({
        sql: "SELECT 1 FROM USERS WHERE TYPE = 'STAFF' AND ID = ?",
        args: [ctx.state.user.id],
      }))
    ) {
      return new Response("", { status: 401 });
    }

    const data = await parseJsonFromReq(req, createChannelSchema);
    if (data instanceof Response) {
      return data;
    }

    let channelCode = data.code;

    // generate a unique random channel code if 'autoGenCode' is true
    if (data.autoGenCode === "on") {
      channelCode = getRandomCode();
      while (await doesChannelExist(channelCode)) {
        channelCode = getRandomCode();
      }
    } else if (!channelCode || (await doesChannelExist(channelCode))) {
      return new Response(JSON.stringify({ code: "Code already in use" }), {
        status: 400,
      });
    }

    // insert the channel into db
    const newChannelId = await insertOne({
      sql: "INSERT INTO CHANNELS (NAME, CREATOR_ID, CODE) VALUES (?,?,?)",
      args: [data.name, ctx.state.user.id, channelCode],
    });

    if (!newChannelId) return new Response("", { status: 500 });

    // insert the creator as member into the channel
    await insertOne({
      sql: "INSERT INTO CHANNEL_USER_PIVOTS (CHANNEL_ID, USER_ID) VALUES (?,?)",
      args: [newChannelId, ctx.state.user.id],
    });

    return new Response(JSON.stringify({
      name: data.name,
      id: newChannelId,
      code: channelCode,
    }));
  },
};
