export default function Banner(props: { message?: string }) {
  return (
    <p class="py-2 bg-red-200 text-red-700 shadow rounded-lg font-semibold text-center px-4 text-4xl">
      {props.message ?? "Hello world"}
    </p>
  );
}
