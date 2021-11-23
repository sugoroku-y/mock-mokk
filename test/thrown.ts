export async function thrown(
  proc: () => Promise<unknown>
): Promise<() => void> {
  try {
    await proc();
  } catch (ex: unknown) {
    return () => {
      throw ex;
    };
  }
  fail('procedure did not throw');
}
