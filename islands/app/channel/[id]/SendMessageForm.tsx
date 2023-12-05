import IconFileTypePdf from "$tabler/file-type-pdf.tsx";
import IconMovie from "$tabler/movie.tsx";
import IconPhoto from "$tabler/photo.tsx";
import IconSend from "$tabler/send.tsx";
import { useFetchMutation } from "../../../../utils/client-hooks/fetch.ts";
import Button from "../../../form/Button.tsx";

export default function SendMessageForm(props: { channelId: number }) {
  const { mutate, isLoading } = useFetchMutation(
    `/api/channel/${props.channelId}/text-message`,
  );

  const sendTextMessage = async (ev: Event) => {
    ev.preventDefault();

    const form = ev.target as HTMLFormElement;

    const messageInputEl = form.elements.namedItem("message");

    if (messageInputEl instanceof HTMLInputElement) {
      await mutate({
        message: messageInputEl.value,
      });

      form.reset();
    }
  };

  return (
    <div className="flex space-x-4">
      <form
        onSubmit={sendTextMessage}
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
      <Button
        color="secondary"
        iconLeft={<IconFileTypePdf size={24} />}
        size="sm"
      />
      <Button color="secondary" iconLeft={<IconPhoto size={24} />} size="sm" />
      <Button
        color="secondary"
        iconLeft={<IconMovie size={24} />}
        size="sm"
      />
    </div>
  );
}
