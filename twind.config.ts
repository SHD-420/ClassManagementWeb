import { Options } from "$fresh/plugins/twind.ts";
import { animation, apply, css } from "twind/css";

const dialogAnimation = animation(
  ({ theme }) => `200ms ${theme("transitionTimingFunction.ease-out")}`,
  {
    from: {
      transform: `translateY(1rem)`,
      opacity: 0
    },
    to: {
      transform: `translateY(0)`,
      opacity: 1
    },
  },
);

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
    
    dialog[open] {
      ${apply(dialogAnimation)}
    }
    `,
  },
} as Options;
