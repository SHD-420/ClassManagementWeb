import IconFileTypePdf from "$tabler/file-type-pdf.tsx";
import IconPhoto from "$tabler/photo.tsx";
import IconSend from "$tabler/send.tsx";
import { useRef } from "preact/hooks";
import { useFetchMutation } from "../../../../utils/client-hooks/fetch.ts";
import Button from "../../../form/Button.tsx";
import { resolvePDFJS } from "https://esm.sh/pdfjs-serverless@0.4.0";
import TextField from "../../../form/TextField.tsx";
import { JSX } from "preact";
import { useSignal } from "@preact/signals";
import { asset } from "$fresh/runtime.ts";

const { getDocument } = await resolvePDFJS();

/**
 * Form with common functionalites for different types of media message buttons.
 */
const FileUploadPreviewForm = (
  props: {
    accept: string;
    icon: JSX.Element;
    previewContent: JSX.Element;
    readerConfig: {
      method: "readAsDataURL" | "readAsArrayBuffer";
      onLoad: (result: ArrayBuffer | string) => void;
    };
  },
) => {
  const inputEl = useRef<HTMLInputElement>(null);
  const previewDialogEl = useRef<HTMLDialogElement>(null);

  // show previewDialog whenever a file is selected
  const onInputChange = () => {
    const uploadedFile = inputEl.current?.files?.[0];
    const previewDialog = previewDialogEl.current;

    if (!uploadedFile || !previewDialog) return;

    const reader = new FileReader();
    reader.addEventListener("load", (ev) => {
      const result = ev.target?.result;
      if (!result) return;
      previewDialog.showModal();
      props.readerConfig.onLoad(result);
    });
    reader.readAsDataURL;
    reader.readAsArrayBuffer;
    reader[props.readerConfig.method](uploadedFile);
  };

  return (
    <div class="grid">
      <dialog ref={previewDialogEl} class="w-full bg-transparent">
        {props.previewContent}
        <div className="h-2"></div>
        <div className="bg-white p-2 rounded mb-8 w-80 mx-auto shadow">
          <TextField label="Label" />
        </div>
        <form
          className="flex space-x-4 justify-center items-center"
          method="dialog"
        >
          <Button size="sm" color="secondary">CANCEL</Button>
          <Button
            size="sm"
            iconLeft={<IconSend size={16} />}
            class="mx-auto"
          >
            SEND
          </Button>
        </form>
      </dialog>
      <input
        type="file"
        accept={props.accept}
        class="hidden"
        ref={inputEl}
        onChange={onInputChange}
      />
      <Button
        onClick={() => inputEl.current?.click()}
        color="secondary"
        iconLeft={props.icon}
        size="sm"
      />
    </div>
  );
};

const SendPdfButton = () => {
  const previewCanvasEl = useRef<HTMLCanvasElement>(null);

  // render the first page of pdf from result ArrayBuffer on preview canvas
  const onPreviewLoad = async (result: string | ArrayBuffer) => {
    const previewCanvasContext = previewCanvasEl.current?.getContext(
      "2d",
    );
    if (!previewCanvasContext) return;

    if (!(result instanceof ArrayBuffer)) return;
    const typedArray = new Uint8Array(result);

    try {
      const pdf = await getDocument(typedArray).promise;
      const page = await pdf.getPage(1);
      const originalViewport = page.getViewport({ scale: 1 });
      await page.render({
        viewport: originalViewport.clone({
          scale: PREVIEW_IMG_SIZE / originalViewport.width,
        }),
        canvasContext: previewCanvasContext,
      }).promise;

      previewCanvasEl.current?.toBlob((blob) => {
        console.log(blob);
      });
    } catch (err: unknown) {
      // handle password protected pdf - show a lock image
      if (
        err && typeof err === "object" && "name" in err &&
        err.name === "PasswordException"
      ) {
        const lockImage = new Image(PREVIEW_IMG_SIZE, PREVIEW_IMG_SIZE);
        lockImage.src = asset("/lock.jpg");
        lockImage.addEventListener("load", () => {
          previewCanvasContext.drawImage(
            lockImage,
            0,
            0,
            PREVIEW_IMG_SIZE,
            PREVIEW_IMG_SIZE,
          );
        });

        return;
      }
      throw err;
    }
  };

  return (
    <FileUploadPreviewForm
      accept="application/pdf"
      icon={<IconFileTypePdf size={24} />}
      previewContent={
        <canvas
          ref={previewCanvasEl}
          width={PREVIEW_IMG_SIZE}
          height={PREVIEW_IMG_SIZE}
          class="rounded shadow mx-auto"
        >
        </canvas>
      }
      readerConfig={{
        method: "readAsArrayBuffer",
        onLoad: onPreviewLoad,
      }}
    />
  );
};

const SendImageButton = () => {
  const previewSrc = useSignal<string | null>(null);
  return (
    <FileUploadPreviewForm
      accept="image/*"
      icon={<IconPhoto size={24} />}
      previewContent={
        <img
          src={previewSrc.value ?? ""}
          alt="Preview"
          class="w-80 h-80 mx-auto object-contain rounded"
        />
      }
      readerConfig={{
        method: "readAsDataURL",
        onLoad(result) {
          if (typeof result !== "string") return;
          previewSrc.value = result;
        },
      }}
    />
  );
};

const SendTextMessageForm = (props: { channelId: number }) => {
  const { mutate, isLoading } = useFetchMutation(
    `/api/channel/${props.channelId}/text-message`,
  );

  const send = async (ev: Event) => {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const messageInputEl = form.elements.namedItem("message");
    if (
      messageInputEl instanceof HTMLInputElement && messageInputEl.value.length
    ) {
      await mutate({
        message: messageInputEl.value,
      });
      form.reset();
    }
  };

  return (
    <form
      onSubmit={send}
      class="bg-gray-50 flex p-2 flex-grow rounded focus-within:ring-2 border"
    >
      <input
        type="text"
        placeholder="Type here..."
        name="message"
        class="bg-transparent flex-grow focus:outline-none px-2"
        rows={1}
      />
      <Button
        size="sm"
        isLoading={isLoading}
        iconLeft={<IconSend size={16} />}
      >
        SEND
      </Button>
    </form>
  );
};

const PREVIEW_IMG_SIZE = 320;

export default function SendMessageForm(props: { channelId: number }) {
  return (
    <div className="flex space-x-4">
      <SendTextMessageForm channelId={props.channelId} />

      <SendPdfButton />

      <SendImageButton />
    </div>
  );
}
