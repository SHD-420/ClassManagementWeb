import { JSX } from "preact";
import { computed, useSignal } from "@preact/signals";
import { cl } from "$cl";
import IconEye from "$tabler/eye.tsx";
import IconEyeOff from "$tabler/eye-off.tsx";

export default function TextField(
  { label, name, value, type, error, ...props }:
    & {
      label: string;
      value?: string;
      error?: string | null;
      name?: string;
      type?: "text" | "email" | "password";
    }
    & Pick<
      JSX.HTMLAttributes<HTMLInputElement>,
      "required" | "min" | "max" | "maxLength" | "minLength" | "autoComplete"
    >,
) {
  const input = useSignal(value ?? "");
  const inputType = useSignal(type ?? "text");

  const hasValue = computed(() => !!input.value.length);

  const hasError = typeof error === "string";

  return (
    <div
      class={cl("stack border group px-4 focus-within:ring-2 rounded", {
        "bg-red-50 ring-red-100": hasError,
      })}
    >
      {hasError && (
        <p className="text-red-400 text-xs justify-self-end flex self-start space-x-2 items-center py-1">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          <span>
            {error}
          </span>
        </p>
      )}
      <label
        class={cl(
          "group-focus-within:scale-75 group-focus-within:translate-y-0 origin-top-left duration-150 pointer-events-none",
          hasValue.value ? "scale-75 translate-y-0" : "translate-y-4",
          hasError ? "text-red-400" : "text-gray-600",
        )}
        for={name}
      >
        {label}
      </label>
      <input
        value={input}
        type={inputType}
        name={name}
        onInput={(ev) => input.value = (ev.target as HTMLInputElement).value}
        class={cl("bg-transparent py-4 focus:outline-none", {
          "text-red-600": hasError,
        })}
        {...props}
      />
      {(type === "password" && hasValue.value) &&
        (
          <button
            type="button"
            class={cl(
              "justify-self-end self-center focus:outline-none",
              hasError ? "text-red-400" : "text-gray-500",
            )}
            onClick={() => {
              inputType.value = inputType.value === "password"
                ? "text"
                : "password";
            }}
          >
            {inputType.value === "password"
              ? <IconEye size={24} />
              : <IconEyeOff size={24} />}
          </button>
        )}
    </div>
  );
}
