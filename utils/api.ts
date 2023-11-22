import { ZodError, ZodSchema } from "$zod";

export const parseJsonFromReq = async <T>(
  req: Request,
  schema: ZodSchema<T>,
) => {
  if (req.headers.get("content-type") !== "application/json") {
    return new Response(
      "Can't process this request: content-type should be application/json!",
      { status: 400 },
    );
  }
  try {
    const rawData = await req.json();
    return schema.parse(rawData);
  } catch (error) {
    if (error instanceof ZodError) {
      const data = Object.fromEntries(
        error.issues.map((
          { path: [field], message },
        ) => [field, message]),
      );
      return new Response(JSON.stringify(data), { status: 400 });
    }
    if (error instanceof SyntaxError) {
      return new Response("Invalid JSON!", { status: 400 });
    }

    throw error;
  }
};

export const validationError = (data: unknown) =>
  new Response(JSON.stringify(data), { status: 400 });
