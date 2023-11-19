import { JSX } from "preact";
import { Signal, useComputed, useSignal } from "@preact/signals";
import { cl } from "$cl";
import IconEye from "$tabler/eye.tsx";
import IconEyeOff from "$tabler/eye-off.tsx";
import { useEffect, useRef } from "preact/hooks";

export default function TextField(
  { label, name, value, type, disabled, error, ...props }:
    & {
      label: string;
      value?: string;
      error?: string | null;
      name?: string;
      type?: "text" | "email" | "password";
      disabled?: boolean | Signal<boolean>;
    }
    & Pick<
      JSX.HTMLAttributes<HTMLInputElement>,
      | "required"
      | "min"
      | "max"
      | "maxLength"
      | "minLength"
      | "autoComplete"
      | "pattern"
    >,
) {
  const input = useSignal(value ?? "");
  const inputType = useSignal(type ?? "text");

  const hasValue = useComputed(() => !!input.value.length);

  const isDisabled = useComputed(() =>
    typeof disabled === "boolean" ? disabled : disabled?.value
  );

  const hasError = typeof error === "string";

  const inputElRef = useRef<HTMLInputElement>(null);

  // when corresponding form is reset, make sure to reset the state
  useEffect(() => {
    const form = inputElRef.current?.form;
    if (!form) return;
    const resetTextField = () => {
      input.value = value ?? "";
    };
    form.addEventListener("reset", resetTextField);
    return () => form.removeEventListener("reset", resetTextField);
  }, []);

  return (
    <div
      class={cl("stack border group px-4 focus-within:ring-2 rounded", {
        "bg-red-50 ring-red-100": hasError,
        "bg-gray-50": isDisabled.value,
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
          isDisabled.value ? "opacity-50" : null,
        )}
        for={name}
      >
        {label}
      </label>
      <input
        ref={inputElRef}
        value={input}
        type={inputType}
        name={name}
        readOnly={isDisabled.value}
        onInput={(ev) => input.value = (ev.target as HTMLInputElement).value}
        class={cl("bg-transparent py-4 focus:outline-none", {
          "text-red-600": hasError,
          "pointer-events-none opacity-50": isDisabled.value,
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
