import IconArrowRight from "$tabler/arrow-right.tsx";
import Button from "../../form/Button.tsx";

export default function RegisterButton() {
  return (
    <Button class="mt-8" iconRight={<IconArrowRight size={16} />}>
      Register
    </Button>
  );
}
