import { useComputed, useSignal } from "@preact/signals";
import { useFetchMutation } from "../../../utils/client-hooks/fetch.ts";
import Button from "../../form/Button.tsx";
import ModalForm from "../../form/ModalForm.tsx";
import TextField from "../../form/TextField.tsx";

export default function JoinChannelForm() {
  const channelCode = useSignal("");

  const { mutate } = useFetchMutation(
    useComputed(() => `/api/join/${channelCode.value}`),
  );

  return (
    <ModalForm
      title="JOIN A CHANNEL"
      toggler={(showModalForm) => (
        <Button onClick={showModalForm}>
          Join a channel
        </Button>
      )}
      onSubmit={async () => {
        const { wasSuccess } = await mutate();
        return { shouldClose: wasSuccess, shouldReset: wasSuccess };
      }}
    >
      <TextField
        label="Channel code"
        name="code"
        maxLength={6}
        minLength={6}
        required
        onInput={(val) => channelCode.value = val}
      />
      <Button class="mt-4">Join</Button>
    </ModalForm>
  );
}
