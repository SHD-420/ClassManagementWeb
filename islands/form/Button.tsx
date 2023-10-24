import { cl } from "$cl";
import { computed } from "@preact/signals";
import { Component, JSX } from "preact";

export default function Button(
  { size = "md", color = "primary", iconLeft, iconRight, children, ...props }:
    & Omit<JSX.HTMLAttributes<HTMLButtonElement>, "size">
    & {
      size?: "sm" | "lg" | "md";
      color?: "primary" | "secondary";
      iconLeft?: JSX.Element;
      iconRight?: JSX.Element;
    },
) {
  const hasIcon = computed(() => !!(iconLeft || iconRight));

  const buttonSizeClass = computed(() => {
    if (size === "sm") return "py-2 px-4";
    if (size === "md") return "py-3 px-6 text-lg";
    return "py-4 text-2xl px-8";
  });

  const buttonColorClass = computed(() => {
    if (color === "primary") {
      return "bg-gradient-to-b from-blue-500 to-blue-700 hover:to-blue-600 text-white";
    }
    return "bg-gradient-to-b from-gray-100 to-gray-300 text-gray-600";
  });

  return (
    <button
      {...props}
      class={cl(
        props.class,
        "font-medium rounded hover:shadow focus:outline-none active:scale-95 disabled:opacity-75",
        buttonSizeClass.value,
        buttonColorClass.value,
        {
          "flex space-x-2 items-center": hasIcon.value,
        },
      )}
    >
      {iconLeft ? iconLeft : null}
      <span>
        {children}
      </span>
      {iconRight ? iconRight : null}
    </button>
  );
}
