import { compareSync } from "$bcrypt";
import { Handlers, PageProps } from "$fresh/server.ts";
import { z, ZodError } from "$zod";
import { selectOne } from "../db/index.ts";
import { User } from "../db/models/user.ts";
import Button from "../islands/form/Button.tsx";
import ErrorMessage from "../islands/form/ErrorMessage.tsx";
import TextField from "../islands/form/TextField.tsx";
import { getUserFromReq, login } from "../utils/auth.ts";

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
        headers: { Location: "/dashboard" },
      });
    }

    return ctx.render();
  },

  async POST(req, ctx) {
    try {
      const formData = Object.fromEntries((await req.formData()).entries());
      const data = loginSchema.parse(formData);

      // get user by provided email
      const user = await selectOne<
        Pick<User, "id" | "name" | "type"> & { password: string }
      >({
        sql: `SELECT 
        ID as id,
        NAME as name,
        PASSWORD as password,
        TYPE as type
      FROM USERS WHERE EMAIL = ?`,
        args: [data.email],
      });

      if (!user) {
        return ctx.render({
          error: "User with specified email was not found!",
          data: { ...data, password: "" },
        });
      }

      if (compareSync(data.password, user.password)) {
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
        <ErrorMessage error={props.data?.error} />

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
