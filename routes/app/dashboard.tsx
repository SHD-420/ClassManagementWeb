import { PageProps } from "$fresh/server.ts";
import { AuthState } from "./_middleware.ts";

export default function Dashboard(props: PageProps<{}, AuthState>) {
  return (
    <p>
      {JSON.stringify(props.state.user)}
    </p>
  );
}
