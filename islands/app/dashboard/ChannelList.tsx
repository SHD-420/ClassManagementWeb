import { Signal, useSignal } from "@preact/signals";
import { Channel } from "../../../db/models/channel.ts";

import { format } from "$std/datetime/mod.ts";
import { z } from "$zod";
import { createChannelSchema } from "../../../routes/(app)/api/channel/index.ts";
import { useFetchMutation } from "../../../utils/client-hooks/fetch.ts";
import Button from "../../form/Button.tsx";
import Checkbox from "../../form/Checkbox.tsx";
import ModalForm from "../../form/ModalForm.tsx";
import TextField from "../../form/TextField.tsx";

import IconPencil from "$tabler/pencil.tsx";
import IconPlus from "$tabler/plus.tsx";
import IconTrash from "$tabler/trash.tsx";

type CreateChannelField = z.infer<typeof createChannelSchema>;

type ChannelCompact = Omit<Channel, "creatorId" | "creator" | "createdAt"> & {
  createdAt: number | string;
};

const NewChannelButton = (
  props: { onSave: (channel: ChannelCompact) => void },
) => {
  const shouldAutoGenerateCode = useSignal(true);

  const { isLoading, mutate, errors } = useFetchMutation<
    Pick<Channel, "id" | "code" | "name">,
    CreateChannelField
  >("/api/channel", {
    onSuccess: (data) => props.onSave({ ...data, createdAt: Date.now() }),
  });

  return (
    <ModalForm
      onSubmit={async (data) => {
        const { wasSuccess } = await mutate(data);
        return {
          shouldClose: wasSuccess,
          shouldReset: wasSuccess,
        };
      }}
      title="NEW STUDY CHANNEL"
      toggler={(showModalForm) => (
        <Button
          iconLeft={<IconPlus size={16} />}
          size="sm"
          onClick={showModalForm}
        >
          New Channel
        </Button>
      )}
    >
      <div className="space-y-2 mb-4">
        <TextField
          label="Channel Name"
          name="name"
          required
          maxLength={255}
        />
        <TextField
          disabled={shouldAutoGenerateCode}
          required={!shouldAutoGenerateCode.value}
          label="Channel Code"
          name="code"
          maxLength={6}
          pattern="[A-Z\|a-z\|0-9]{6}"
          error={errors.value?.code}
        />
        <p className="text-xs text-gray-500">
          <span class="font-semibold">NOTE:</span>{" "}
          Use 6 alphabets or numbers for code.
        </p>
      </div>
      <Checkbox
        defaultChecked
        name="autoGenCode"
        onChange={(newVal) => shouldAutoGenerateCode.value = newVal}
        label="Automatic channel code?"
      />

      <Button isLoading={isLoading} class="mt-8">Create</Button>
    </ModalForm>
  );
};

const EditChannelButton = (
  props: {
    name: string;
    id: number;
    onSave: (newData: { name: string }) => void;
  },
) => {
  const { mutate, isLoading } = useFetchMutation(
    `api/channel/${props.id}`,
    {
      method: "PATCH",
    },
  );

  return (
    <ModalForm
      title="EDIT CHANNEL"
      onSubmit={async (data) => {
        await mutate({ ...data, id: props.id });
        props.onSave(data as { name: string });
        return { shouldClose: true, shouldReset: false };
      }}
      toggler={(showModalForm) => (
        <Button
          onClick={showModalForm}
          size="sm"
          color="secondary"
          iconLeft={<IconPencil size={16} />}
        >
          Edit
        </Button>
      )}
    >
      <TextField value={props.name} name="name" label="Channel Name" />
      <Button class="mt-4" isLoading={isLoading}>
        Save
      </Button>
    </ModalForm>
  );
};

const DeleteChannelButton = (
  props: { id: number; name: Signal<string>; onDeleteConfirm: () => void },
) => {
  return (
    <ModalForm
      onSubmit={() => {
        props.onDeleteConfirm();

        fetch(`/api/channel/${props.id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        });

        return {
          shouldClose: true,
          shouldReset: true,
        };
      }}
      toggler={(showModalForm) => (
        <Button
          color="danger"
          size="sm"
          onClick={showModalForm}
        >
          <IconTrash size={24} />
        </Button>
      )}
    >
      <p class="text-gray-600 mb-4">
        Please confirm, this action will permanently delete the channel{" "}
        <span class="font-semibold">
          {props.name}
        </span>?
      </p>
      <Button color="danger">Yes, delete it</Button>
    </ModalForm>
  );
};

const formatDate = (date: string | number) =>
  format(new Date(date), "dd/MM/yyyy 'at' hh:mm a");

const ChannelListItem = (
  props: { channel: ChannelCompact; onDeleted: () => void },
) => {
  const channelName = useSignal(props.channel.name);

  return (
    <li class="py-2 flex justify-between">
      <div>
        <h4 class="font-bold text-2xl text-gray-500">{channelName}</h4>
        <p>{props.channel.code}</p>
        <p class="text-sm">{formatDate(props.channel.createdAt)}</p>
      </div>
      <div className="flex items-center space-x-2">
        <EditChannelButton
          name={props.channel.name}
          id={props.channel.id}
          onSave={({ name }) => channelName.value = name}
        />
        <DeleteChannelButton
          id={props.channel.id}
          name={channelName}
          onDeleteConfirm={props.onDeleted}
        />
      </div>
    </li>
  );
};

export default function ChannelList(
  props: { initialList: ChannelCompact[] },
) {
  const channels = useSignal(props.initialList);

  return (
    <section>
      <ul class="divide-y mb-8">
        {channels.value.map((channel, i) => (
          <ChannelListItem
            channel={channel}
            onDeleted={() =>
              channels.value = [
                ...channels.value.slice(0, i),
                ...channels.value.slice(i + 1),
              ]}
          />
        ))}
      </ul>
      <NewChannelButton
        onSave={(newChannel) =>
          channels.value = [...channels.value, newChannel]}
      />
    </section>
  );
}
