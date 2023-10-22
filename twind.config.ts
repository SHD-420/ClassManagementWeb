import { Options } from "$fresh/plugins/twind.ts";
import { apply, css } from "twind/css";
export default {
  selfURL: import.meta.url,
  preflight: {
    "@global": css`
    .stack {
      ${apply`grid`}
    }
    .stack > * {
      ${apply`row-start-1 col-start-1`}
    }
    `,
  },
} as Options;
