import type { Signal } from "@preact/signals";

interface CounterProps {
  count: Signal<number>;
}

export default function Counter(props: CounterProps) {
  return (
    <div class="flex gap-8 py-6">
      <button onClick={() => props.count.value -= 1}>-1</button>
      <p class="text-3xl">{props.count}</p>
      <button onClick={() => props.count.value += 1}>+1</button>
    </div>
  );
}
