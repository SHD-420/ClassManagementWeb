import { Handlers, PageProps } from "$fresh/server.ts";
import { z, ZodError } from "$zod";
import Button from "../islands/form/Button.tsx";
import TextField from "../islands/form/TextField.tsx";
import { compare } from "$bcrypt";
import { getUserByEmail } from "../db/models/user.ts";
import { login } from "../utils/auth.ts";
import IconExclamationCircle from "$tabler/exclamation-circle.tsx";
import { getUserFromReq } from "../utils/auth.ts";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(16),
});

export const handler: Handlers = {
  // redirect away the authenticated users
  async GET(req, ctx) {
    if (await getUserFromReq(req)) {
      return new Response(null, {
        status: 307,
        headers: { Location: "/app/dashboard" },
      });
    }

    return ctx.render();
  },

  async POST(req, ctx) {
    try {
      const formData = Object.fromEntries((await req.formData()).entries());
      const data = loginSchema.parse(formData);

      const user = await getUserByEmail(data.email);
      if (!user) {
        return ctx.render({
          error: "User with specified email was not found!",
          data: { ...data, password: "" },
        });
      }

      if (await compare(data.password, user.password)) {
        return new Response(null, {
          status: 303,
          headers: await login(user, new URL(req.url)),
        });
      }
      return ctx.render({
        error: "Supplied password was wrong!",
        data: { ...data, password: "" },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return ctx.render({
          error: "Error while processing the data!",
        });
      }
      throw error;
    }
  },
};

export default function Login(
  props: PageProps<
    {
      error?: string;
      data?: z.infer<typeof loginSchema>;
    }
  >,
) {
  return (
    <main class="max-w-lg mx-auto mt-8">
      <img src="/logo.svg" width={64} />
      <h2 class="text-4xl font-bold mb-8">Login to your dashboard</h2>
      <form method="POST">
        {props.data?.error && (
          <div className="bg-red-50 rounded border border-red-100 py-2 px-4 flex space-x-2 items-center mb-4">
            <p class="text-red-400">
              <IconExclamationCircle size={16} />
            </p>
            <p class="text-red-600 text-sm">
              {props.data.error}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <TextField
            value={props.data?.data?.email ?? ""}
            label="Email"
            type="email"
            name="email"
            autoComplete="none"
            required
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="none"
            minLength={4}
            maxLength={16}
            required
          />
        </div>
        <Button class="mt-4">Login</Button>
      </form>
    </main>
  );
}
