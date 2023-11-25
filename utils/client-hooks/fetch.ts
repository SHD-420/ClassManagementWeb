import { type Signal, useSignal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useMemo } from "preact/hooks";

// simple wrapper around fetch api to get typed data
const customFetch = async <T>(url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Error while fetching: ${url}. Check network tab for details.`,
      );
      return null;
    }
    return await response.json() as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(
        `Invalid json from: ${url}. Check network tab for details.`,
      );
      return null;
    }
    throw error;
  }
};

// for mutation (inspired by react query), use for GET ajax requests
export const useFetch = <T>(url: string | Signal<string>, options: {
  isEnabled: boolean | Signal<boolean>;
} = { isEnabled: true }) => {
  // wrap in useMemo because we want to initialize the hook only once per component mount
  return useMemo(() => {
    const getData = (url: string) => {
      if (!IS_BROWSER) return;

      const shouldMakeReq = !isLoading.peek() &&
        (typeof options.isEnabled === "boolean"
          ? options.isEnabled
          : options.isEnabled.peek());

      if (!shouldMakeReq) return;

      isLoading.value = true;
      customFetch<T>(url).then((response) => data.value = response).finally(
        () => isLoading.value = false,
      );
    };

    const isLoading = useSignal(false);
    const data = useSignal<T | null>(null);

    const refetch = () =>
      typeof url === "string" ? getData(url) : getData(url.peek());

    if (typeof url === "string") getData(url);
    else url.subscribe(getData);

    if (typeof options.isEnabled !== "boolean") {
      options.isEnabled.subscribe((isEnabled) => {
        if (isEnabled) refetch();
      });
    }

    return {
      data,
      isLoading,
      refetch,
    };
  }, []);
};

// for mutation (inspired by react query), use for POST and PATCH requests
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
