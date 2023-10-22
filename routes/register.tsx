import { Handlers, PageProps } from "$fresh/server.ts";
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import TextField from "../islands/form/TextField.tsx";

type RegisterField = "username" | "email" | "password" | "password_confirm";

export const handler: Handlers = {
  async POST(req, ctx) {
    const formData = Object.fromEntries((await req.formData()).entries());
    try {
      const data = z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string().min(4).max(16),
        password_confirm: z.string().min(4).max(16),
      }).parse(formData);

      if (data.password !== data.password_confirm) {
        return ctx.render({
          errors: new Set<RegisterField>(["password_confirm"]),
          data: { ...data, password: "", password_confirm: "" },
        });
      }

      console.log(data);
    } catch (error) {
      if (error instanceof ZodError) {
        return ctx.render({
          errors: new Set<RegisterField>(
            error.issues.map(({ path }) => path[0] as RegisterField),
          ),
        });
      }
    }
    const url = new URL(req.url);
    // url.pathname = "/";
    return Response.redirect(url);
  },
};

export default function Register(
  props: PageProps<
    { errors?: Set<RegisterField>; data?: Record<RegisterField, string> }
  >,
) {
  return (
    <div class="max-w-lg mx-auto mt-8">
      <h1 class="text-6xl font-bold mb-8">Register</h1>
      <form method="POST">
        <div className="space-y-2">
          <TextField
            value={props.data?.data?.username}
            label="Username"
            name="username"
            autoComplete="none"
            required
          />
          <TextField
            value={props.data?.data?.email}
            type="email"
            label="Email"
            name="email"
            required
            error={props.data?.errors?.has("email")
              ? "Email already exists!"
              : null}
          />
          <TextField
            value={props.data?.data?.password}
            label="Password"
            type="password"
            name="password"
            required
          />
          <TextField
            value={props.data?.data?.password_confirm}
            label="Confirm Password"
            type="password"
            name="password_confirm"
            required
            error={props.data?.errors?.has("password_confirm")
              ? "Invalid password confirmation"
              : null}
          />
        </div>
        <button class="bg-blue-500 hover:bg-blue-400 text-white w-full py-2 rounded mt-4">
          Register
        </button>
      </form>
    </div>
  );
}
