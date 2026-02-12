export function getSafeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    console.error(error);
  } else if (error) {
    console.error('Unknown error', error);
  }

  return fallback;
}
