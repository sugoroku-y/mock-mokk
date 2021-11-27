import { toMatchSnapshot } from 'jest-snapshot';

function toConsoleOutputMatchingSnapshot(
  this: jest.MatcherContext,
  received: () => unknown,
  name: 'log' | 'debug' | 'info' | 'warn' | 'error' = 'log'
): jest.CustomMatcherResult | Promise<jest.CustomMatcherResult> {
  const method = jest.spyOn(console, name).mockImplementation();
  const snapshot = () => {
    return toMatchSnapshot.call(
      this as unknown as ThisParameterType<typeof toMatchSnapshot>,
      method.mock.calls,
      `toConsoleOutputMatchingSnapshot:${name}`
    );
  };
  let restorable = true;
  try {
    const result = received();
    if (result instanceof Promise) {
      restorable = false;
      return (async () => {
        try {
          await result;
          return snapshot();
        } finally {
          method.mockRestore();
        }
      })();
    }
    return snapshot();
  } finally {
    if (restorable) {
      method.mockRestore();
    }
  }
}
expect.extend({ toConsoleOutputMatchingSnapshot });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/ban-types
    interface Matchers<R, T = {}> {
      toConsoleOutputMatchingSnapshot(
        name?: 'log' | 'debug' | 'info' | 'warn' | 'error'
      ): T extends (...args: unknown[]) => infer TR
        ? TR extends Promise<unknown>
          ? Promise<R>
          : R
        : never;
    }
  }
}

export {};
