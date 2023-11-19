import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import IconCheck from "$tabler/check.tsx";
import { cl } from "$cl";
import { JSX } from "preact";

export default function Checkbox(props: {
  label: string;
  name?: string;
  defaultChecked?: true;
  class?: string;
  onChange?: (newVal: boolean) => void;
}) {
  const input = useSignal(props.defaultChecked ?? false);

  const inputElRef = useRef<HTMLInputElement>(null);

  const handleInputChange: JSX.EventHandler<JSX.TargetedEvent> = (ev) => {
    const newIsChecked = (ev.target as HTMLInputElement).checked;
    input.value = newIsChecked;

    props.onChange?.(newIsChecked);
  };

  // when corresponding form is reset, make sure to reset the state
  useEffect(() => {
    const form = inputElRef.current?.form;
    if (!form) return;
    const resetCheckbox = () => {
      input.value = !!props.defaultChecked;
      props.onChange?.(input.value);
    };
    form.addEventListener("reset", resetCheckbox);
    return () => form.removeEventListener("reset", resetCheckbox);
  }, []);

  return (
    <button
      className={cl(
        "flex items-center space-x-2 focus:outline-none",
        props.class,
      )}
      type="button"
      onClick={() => inputElRef.current?.click()}
    >
      <span class="w-6 h-6 border rounded grid place-content-center text-gray-600">
        {input.value &&
          <IconCheck size={16} />}
      </span>
      <label for={props.name}>{props.label}</label>

      <input
        name={props.name}
        ref={inputElRef}
        checked={input}
        type="checkbox"
        onChange={handleInputChange}
        class="hidden"
      />
    </button>
  );
}
