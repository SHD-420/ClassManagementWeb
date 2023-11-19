import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { deleteCookie } from "$std/http/cookie.ts";
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

      // delete auth cookie since it is invalid
      const headers = new Headers();
      headers.append("location", "/login");
      deleteCookie(headers, "auth", {
        path: "/",
        domain: new URL(req.url).hostname,
      });

      return new Response(null, {
        status: 307,
        headers,
      });
    }

    ctx.state.user = user;
  }
  const res = await ctx.next();
  return res;
}
