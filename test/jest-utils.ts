const ConsoleOutputNames = ['log', 'debug', 'info', 'warn', 'error'] as const;
type ConsoleOutputResult = Partial<
  Record<typeof ConsoleOutputNames[number], unknown[]>
>;

export function consoleOutput<T>(
  received: () => Promise<T>,
): Promise<ConsoleOutputResult>;
export function consoleOutput<T>(received: () => T): ConsoleOutputResult;
export function consoleOutput(
  received: () => unknown,
): ConsoleOutputResult | Promise<ConsoleOutputResult> {
  const methods = ConsoleOutputNames.map(
    name => [name, jest.spyOn(console, name).mockImplementation()] as const,
  );
  const output = () => {
    const map: ConsoleOutputResult = {};
    for (const [name, method] of methods) {
      if (method.mock.calls.length === 0) {
        continue;
      }
      map[name] = method.mock.calls;
    }
    return map;
  };
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
          for (const [, method] of methods) {
            method.mockRestore();
          }
        }
      })();
    }
    return output();
  } finally {
    if (restorable) {
      for (const [, method] of methods) {
        method.mockRestore();
      }
    }
  }
}
