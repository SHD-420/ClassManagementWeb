import { Signal, useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { JSX } from "preact";
import { cl } from "$cl";

const DropdownContent = (
  props: { shouldShow: Signal<boolean>; children: JSX.Element | JSX.Element[] },
) => {
  return (
    <div
      class={cl("rounded-lg shadow-lg border duration-150", {
        "opacity-0 -translate-y-2": !props.shouldShow.value,
      })}
    >
      {props.children}
    </div>
  );
};

export default function Dropdown(
  props: {
    toggler: (toggle: () => void) => JSX.Element;
    children: JSX.Element | JSX.Element[];
  },
) {
  const shouldShowContent = useSignal(false);

  const toggle = () => (shouldShowContent.value = !shouldShowContent.value);

  const wrapperElRef = useRef<HTMLDivElement>(null);

  // hide content on outside click
  useEffect(() => {
    const closeOnOutsideClick = (ev: Event) => {
      if (
        shouldShowContent.peek() && wrapperElRef.current &&
        !ev.composedPath().includes(wrapperElRef.current)
      ) {
        shouldShowContent.value = false;
      }
    };
    addEventListener("click", closeOnOutsideClick);
    return () => removeEventListener("click", closeOnOutsideClick);
  }, []);

  return (
    <div class="relative" ref={wrapperElRef}>
      {props.toggler(toggle)}
      <DropdownContent shouldShow={shouldShowContent}>
        {props.children}
      </DropdownContent>
    </div>
  );
}
