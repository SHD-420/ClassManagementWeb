import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";
import Banner from "../islands/Banner.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    
    const response = await ctx.render();
    const authCookie = getCookies(req.headers).auth;
    if (authCookie) {
      return ctx.render({
        message: authCookie
      });
    }
    return response;
  },
};

export default function Home(props: PageProps<{ message?: string }>) {
  const count = useSignal(4);

  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <Banner message={props.data?.message} />
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />
        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>
        <Counter count={count} />
      </div>
    </div>
  );
}
