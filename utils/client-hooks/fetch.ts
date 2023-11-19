import { type Signal, useSignal } from "@preact/signals";

export const useFetchMutation = <TExpectedResponse, TExpectedError>(
  url: string | Signal<string>,
  options?: {
    method?: "POST" | "PATCH";
    onSuccess?: (res: TExpectedResponse) => void;
  },
) => {
  const isLoading = useSignal(false);
  const errors = useSignal<TExpectedError | null>(null);

  return {
    isLoading,
    errors,
    async mutate(body?: unknown): Promise<{ wasSuccess: boolean }> {
      errors.value = null;
      isLoading.value = true;
      const targetUrl = typeof url === "string" ? url : url.peek();
      try {
        const response = await fetch(targetUrl, {
          method: options?.method ?? "POST",
          body: body ? JSON.stringify(body) : null,
          headers: {
            "content-type": "application/json",
          },
        });

        // bad request, handle validations
        if (response.status === 400) {
          errors.value = await response.json() as TExpectedError;
          return { wasSuccess: false };
        }

        if (!response.ok) return { wasSuccess: false };

        options?.onSuccess?.(await response.json() as TExpectedResponse);
        return { wasSuccess: true };
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.error(
            `Invalid json from: ${targetUrl}. Check network tab for details.`,
          );
          return { wasSuccess: false };
        }
        throw error;
      } finally {
        isLoading.value = false;
      }
    },
  };
};
