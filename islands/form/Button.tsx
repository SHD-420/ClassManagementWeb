import { cl } from "$cl";
import { Signal, useComputed } from "@preact/signals";
import { JSX } from "preact";

export default function Button(
  {
    size = "md",
    color = "primary",
    iconLeft,
    iconRight,
    isLoading,
    children,
    onClick,
    ...props
  }:
    & Omit<JSX.HTMLAttributes<HTMLButtonElement>, "size">
    & {
      size?: "sm" | "lg" | "md";
      color?: "primary" | "secondary" | "danger";
      iconLeft?: JSX.Element;
      iconRight?: JSX.Element;
      isLoading?: Signal<boolean>;
    },
) {
  const hasIcon = useComputed(() => !!(iconLeft || iconRight || isLoading));

  const buttonSizeClass = useComputed(() => {
    if (size === "sm") return "py-2 px-4";
    if (size === "md") return "py-3 px-6 text-lg";
    return "py-4 text-2xl px-8";
  });

  const buttonColorClass = useComputed(() => {
    if (color === "primary") {
      return "bg-gradient-to-b from-blue-500 to-blue-700 hover:to-blue-600 text-white";
    }
    if (color === "danger") {
      return "bg-gradient-to-b from-red-100 to-red-200 text-red-400";
    }
    return "bg-gradient-to-b from-gray-100 to-gray-200 text-gray-600";
  });

  const handleButtonClick = (ev: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
    if (isLoading?.value || props.disabled) {
      ev.preventDefault();
      return;
    }
    onClick?.(ev);
  };

  return (
    <button
      {...props}
      onClick={handleButtonClick}
      class={cl(
        props.class,
        "font-medium rounded hover:shadow focus:outline-none focus:ring-2 active:scale-95 disabled:opacity-75",
        buttonSizeClass.value,
        buttonColorClass.value,
        {
          "flex space-x-2 items-center": hasIcon.value,
        },
      )}
    >
      {iconLeft ? iconLeft : null}
      {children && (
        <span>
          {children}
        </span>
      )}
      {iconRight ? iconRight : null}
      {isLoading?.value
        ? (
          <span
            class={cl(
              "rounded-full w-3 h-3 border-2 border-b-transparent animate-spin opacity-50",
              color === "primary" ? "border-white" : "border-gray-600",
            )}
          >
          </span>
        )
        : null}
    </button>
  );
}
