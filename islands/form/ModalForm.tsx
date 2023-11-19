import { useRef } from "preact/hooks";
import { JSX } from "preact";
import IconX from "$tabler/x.tsx";

export default function ModalForm(
  props: {
    toggler: (showModal: () => void) => JSX.Element;
    children: JSX.Element | JSX.Element[];
    onSubmit?: (
      data: object,
    ) =>
      | { shouldClose: boolean; shouldReset: boolean }
      | Promise<{ shouldClose: boolean; shouldReset: boolean }>;
    title?: string;
  },
) {
  const dialogElRef = useRef<HTMLDialogElement>(null);
  const formElRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (ev: Event) => {
    ev.preventDefault();
    const form = formElRef.current;
    if (!props.onSubmit || !form) return;
    const { shouldClose, shouldReset } = await props.onSubmit(
      Object.fromEntries(
        new FormData(form)
          .entries(),
      ),
    );
    if (shouldReset) {
      formElRef.current?.reset();
    }
    if (shouldClose) {
      dialogElRef.current?.close?.();
    }
  };

  return (
    <div>
      {props.toggler(() => dialogElRef.current?.showModal())}
      <dialog ref={dialogElRef} class="w-96 border rounded-lg">
        <div className="flex justify-between mb-4">
          <h4 class="text-2xl font-bold text-gray-500">{props.title}</h4>
          <button
            class="focus:outline-none text-gray-600"
            onClick={() => dialogElRef.current?.close()}
          >
            <IconX />
          </button>
        </div>
        <form onSubmit={handleSubmit} ref={formElRef}>
          {props.children}
        </form>
      </dialog>
    </div>
  );
}
