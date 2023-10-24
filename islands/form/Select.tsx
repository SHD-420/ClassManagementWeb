import { useSignal } from "@preact/signals";
import { cl } from "$cl";
import { useEffect, useRef } from "preact/hooks";

export default function Select<T,>(
  props:
    & {
      options: readonly T[];
      label: string;
      fieldName?: string;
      onChange?: (newVal: T) => void;
      default?: T;
    }
    & (T extends string ? { optionToString?: (v: T) => string }
      : { optionToString: (v: T) => string }),
) {
  const optionToString = props.optionToString ?? ((v: string) => v);

  const selectedOption = useSignal(props.default);
  const changeSelectedOption = (newOption: T) => () => {
    selectedOption.value = newOption;
    shouldShowOptions.value = false;
  };

  const shouldShowOptions = useSignal(false);

  const wrapperElRef = useRef<HTMLDivElement>(null);

  // hide options on outside click
  useEffect(() => {
    const closeOnOutsideClick = (ev: Event) => {
      if (
        shouldShowOptions.value && wrapperElRef.current &&
        !ev.composedPath().includes(wrapperElRef.current)
      ) {
        shouldShowOptions.value = false;
      }
    };

    addEventListener("click", closeOnOutsideClick);
    return () => removeEventListener("click", closeOnOutsideClick);
  }, []);

  return (
    <div class="relative" ref={wrapperElRef}>
      <button
        type="button"
        onClick={() => shouldShowOptions.value = !shouldShowOptions.value}
        class="stack text-left border px-4 w-full rounded focus:outline-none focus:ring-2 h-14"
      >
        <label
          class={cl(
            "origin-top-left duration-150 pointer-events-none text-gray-600",
            (typeof selectedOption.value === "string") ||
              (shouldShowOptions.value)
              ? "scale-75 translate-y-0"
              : "translate-y-4",
          )}
        >
          {props.label}
        </label>
        {typeof selectedOption.value === "string"
          ? (
            <input
              type="hidden"
              value={selectedOption.value}
              name={props.fieldName}
            />
          )
          : null}

        <span class="block focus:outline-none self-center">
          {typeof selectedOption.value === "undefined"
            ? ""
            : optionToString(selectedOption.value)}
        </span>
      </button>
      <ul
        class={cl(
          "bg-gray-50 p-2 rounded shadow-sm space-y-1 duration-100 absolute z-10 w-full",
          shouldShowOptions.value
            ? "translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none",
        )}
      >
        {props.options.map((option) => (
          <li>
            <button
              class={cl(
                "p-2 w-full text-left hover:bg-blue-50 rounded focus:outline-none focus:ring-2",
                {
                  "bg-blue-50": option === selectedOption.value,
                },
              )}
              type="button"
              onClick={changeSelectedOption(option)}
            >
              {optionToString(option)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
