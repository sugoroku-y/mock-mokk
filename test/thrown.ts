export async function thrown<T>(proc: () => Promise<T>): Promise<() => T> {
  try {
    const result = await proc();
    return () => result;
  } catch (ex: unknown) {
    return () => {
      throw ex;
    };
  }
}
