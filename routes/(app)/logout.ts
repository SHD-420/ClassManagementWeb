import { Handlers } from "$fresh/server.ts";
import { logout } from "../../utils/auth.ts";
import { AuthState } from "./_middleware.ts";

export const handler: Handlers<null, AuthState> = {
  POST(req) {
    return new Response(null, {
      status: 303,
      headers: logout(new URL(req.url)),
    });
  },
};
