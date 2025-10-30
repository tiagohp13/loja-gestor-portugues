export function getUserFriendlyError(error: unknown, fallback = "Ocorreu um erro inesperado"): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  const anyError = error as any;
  return anyError?.message || fallback;
}
