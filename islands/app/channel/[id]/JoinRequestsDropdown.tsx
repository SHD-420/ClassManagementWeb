import Dropdown from "../../../Dropdown.tsx";
import Button from "../../../form/Button.tsx";
import {
  useFetch,
  useFetchMutation,
} from "../../../../utils/client-hooks/fetch.ts";
import { JoinRequest } from "../../../../db/models/joinRequest.ts";
import IconCheck from "$tabler/check.tsx";
import IconTrash from "$tabler/trash.tsx";
import { useSignal } from "@preact/signals";
import { cl } from "$cl";

const Skeleton = () => (
  <ul class="animate-pulse space-y-2">
    {new Array(4).fill(0).map((_, i) => (
      <li key={i} class="p-2">
        <div class="h-4 w-full bg-gray-200 mb-2"></div>
        <div class="h-4 w-full bg-gray-200 mb-2"></div>
        <div className="flex space-x-2">
          <div className="h-4 w-8 bg-gray-200"></div>
          <div className="h-4 w-8 bg-gray-200"></div>
        </div>
      </li>
    ))}
  </ul>
);

export default function JoinRequestsDropdown(
  props: { joinRequestCount: number; channelId: number },
) {
  // for lazy loading join requests when dropdown is opened
  const isDropdownOpenedOnce = useSignal(false);

  const { isLoading, data } = useFetch<
    (Pick<JoinRequest, "id" | "createdAt"> & { userName: string })[]
  >(
    `/api/channel/${props.channelId}/join-requests`,
    {
      isEnabled: isDropdownOpenedOnce,
    },
  );

  const acceptReqMutation = useFetchMutation("/api/join/confirm");
  const declineReqMutation = useFetchMutation("/api/join/decline");

  return (
    <Dropdown
      toggler={(toggle) => (
        <div class="flex justify-end w-72">
          <Button
            color="secondary"
            size="sm"
            onClick={() => {
              isDropdownOpenedOnce.value = true;
              toggle();
            }}
          >
            {props.joinRequestCount} pending join requests
          </Button>
        </div>
      )}
    >
      {isLoading.value ? <Skeleton /> : <></>}

      <ul
        class={cl("px-4 py-4", {
          "opacity-50 pointer-events-none":
            (acceptReqMutation.isLoading.value ||
              declineReqMutation.isLoading.value),
        })}
      >
        {data.value?.map((joinReq) => (
          <li key={joinReq.id}>
            <p>{joinReq.userName}</p>
            <p>{joinReq.createdAt}</p>

            <div className="flex space-x-2">
              <Button
                size="sm"
                color="secondary"
                iconLeft={<IconCheck size={16} />}
                onClick={() => acceptReqMutation.mutate({ id: joinReq.id })}
              >
                Accept
              </Button>
              <Button
                size="sm"
                color="danger"
                iconLeft={<IconTrash size={16} />}
                onClick={() => declineReqMutation.mutate({ id: joinReq.id })}
              >
                Decline
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Dropdown>
  );
}
