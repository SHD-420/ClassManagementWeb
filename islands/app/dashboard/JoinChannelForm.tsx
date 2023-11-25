import { useFetchMutation } from "../../../utils/client-hooks/fetch.ts";
import Button from "../../form/Button.tsx";
import ErrorMessage from "../../form/ErrorMessage.tsx";
import ModalForm from "../../form/ModalForm.tsx";
import TextField from "../../form/TextField.tsx";

export default function JoinChannelForm() {
  const { mutate, isLoading, errors } = useFetchMutation<
    "ok",
    { code: string }
  >(
    "/api/join/request",
  );

  return (
    <ModalForm
      title="JOIN A CHANNEL"
      toggler={(showModalForm) => (
        <Button onClick={showModalForm}>
          Join a channel
        </Button>
      )}
      onSubmit={async (data) => {
        const { wasSuccess } = await mutate(data);
        return { shouldClose: wasSuccess, shouldReset: wasSuccess };
      }}
    >
      <div className="space-y-4">
        <ErrorMessage error={errors.value?.code} />
        <TextField
          label="Channel code"
          name="code"
          maxLength={6}
          minLength={6}
          required
        />
        <Button isLoading={isLoading}>Join</Button>
      </div>
    </ModalForm>
  );
}
