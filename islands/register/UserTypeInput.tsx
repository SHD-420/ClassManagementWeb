import { User } from "../../db/models/user.ts";
import Select from "../form/Select.tsx";

const toSentenceCase = (str: string) =>
  str.length ? str[0].toUpperCase() + str.slice(1).toLowerCase() : "";

export default function UserTypeInput(props: { default: User["type"] }) {
  return (
    <Select
      label="User Type"
      name="type"
      options={["STUDENT", "STAFF"]}
      optionToString={toSentenceCase}
      default={props.default}
    />
  );
}
