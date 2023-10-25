import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getUserFromReq, JWTPayload } from "../../utils/auth.ts";

export type AuthState = {
  user: JWTPayload;
};

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<AuthState>,
) {
  if (ctx.destination === "route") {
    const user = await getUserFromReq(req);

    if (!user) {
      return new Response(null, {
        status: 307,
        headers: { Location: "/login" },
      });
    }

    ctx.state.user = user;
  }
  const res = await ctx.next();
  return res;
}
