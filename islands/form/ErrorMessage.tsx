import { Signal } from "@preact/signals";
import IconExclamationCircle from "$tabler/exclamation-circle.tsx";

export default function ErrorMessage(
  props: { error?: string | Signal<string | null> },
) {
  const errorString = typeof props.error === "string"
    ? props.error
    : props.error?.value;

  if (!errorString) return <></>;

  return (
    <div className="bg-red-50 rounded border border-red-100 py-2 px-4 flex space-x-2 items-center mb-4">
      <p class="text-red-400">
        <IconExclamationCircle size={16} />
      </p>
      <p class="text-red-600 text-sm">
        {errorString}
      </p>
    </div>
  );
}
