export async function unpromise<T>(proc: () => Promise<T>): Promise<() => T> {
  try {
    const result = await proc();
    return () => result;
  } catch (ex: unknown) {
    return () => {
      throw ex;
    };
  }
}

export function consoleOutput<
  T,
  NAMES extends Array<'log' | 'debug' | 'info' | 'warn' | 'error'>,
>(
  names: NAMES,
  received: () => Promise<T>,
): Promise<Record<NAMES[number], unknown[]>>;
export function consoleOutput<
  T,
  NAMES extends Array<'log' | 'debug' | 'info' | 'warn' | 'error'>,
>(names: NAMES, received: () => T): Record<NAMES[number], unknown[]>;
export function consoleOutput(
  names: Array<'log' | 'debug' | 'info' | 'warn' | 'error'>,
  received: () => unknown,
):
  | Record<'log' | 'debug' | 'info' | 'warn' | 'error', unknown[]>
  | Promise<Record<'log' | 'debug' | 'info' | 'warn' | 'error', unknown[]>> {
  const methods = names.map(name =>
    jest.spyOn(console, name).mockImplementation(),
  );
  const output = () =>
    Object.fromEntries(
      methods.map((method, i) => [names[i], method.mock.calls]),
    ) as Record<typeof names[number], unknown[]>;
  let restorable = true;
  try {
    const result = received();
    if (result instanceof Promise) {
      restorable = false;
      return (async () => {
        try {
          await result;
          return output();
        } finally {
          for (const method of methods) {
            method.mockRestore();
          }
        }
      })();
    }
    return output();
  } finally {
    if (restorable) {
      for (const method of methods) {
        method.mockRestore();
      }
    }
  }
}
