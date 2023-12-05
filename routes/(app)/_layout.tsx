import { LayoutProps } from "$fresh/server.ts";
import Button from "../../islands/form/Button.tsx";
import { AuthState } from "./_middleware.ts";
import IconLogout from "$tabler/logout.tsx";
import { cl } from "$cl";

const links = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/profile", label: "Your Profile" },
];

export default function Layout(
  { Component, state, url }: LayoutProps<unknown, AuthState>,
) {
  return (
    <div class="bg-gray-100 min-h-screen py-4 grid">
      <div className="bg-white rounded-lg max-w-4xl mx-auto shadow w-full flex flex-col">
        <nav class="flex justify-between py-2 px-8 border-b">
          <div className="flex items-center">
            <h4 class="text-2xl mr-4 font-bold text-blue-600">LOGO</h4>
            {links.map((link, i) => (
              <a
                key={i}
                class={cl("text-sm px-2 rounded", {
                  "bg-gray-200": url.pathname === link.path,
                })}
                href={link.path}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex space-x-4">
            <div>
              <p>{state.user.name}</p>
              <p class="text-xs capitalize">{state.user.type.toLowerCase()}</p>
            </div>
            <form action="/logout" method="POST">
              <Button size="sm" color="secondary">
                <IconLogout />
              </Button>
            </form>
          </div>
        </nav>
        <div class="px-8 py-4 flex-grow ">
          <Component />
        </div>
      </div>
    </div>
  );
}
