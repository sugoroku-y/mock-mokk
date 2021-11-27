import { SnapshotStateType } from 'jest-snapshot';

function toFailMatchingSnapshot(
  this: jest.MatcherContext,
  received: () => unknown,
): jest.CustomMatcherResult | Promise<jest.CustomMatcherResult> {
  let state: { ex: unknown } | undefined;
  const { suppressedErrors, snapshotState } = this as typeof this & {
    snapshotState: SnapshotStateType;
  };
  const { length } = suppressedErrors;
  const { unmatched, matched } = snapshotState;
  const check = () => {
    if (
      suppressedErrors.length <= length ||
      snapshotState.unmatched <= unmatched
    ) {
      if (state) {
        throw state.ex;
      }
      return {
        pass: false,
        message:
          snapshotState.matched === matched
            ? () => 'No snapshot'
            : () => 'Snapshot matched',
      };
    }
    snapshotState.unmatched = unmatched;
    suppressedErrors.length = length;
    return {
      pass: true,
      message: () => 'Snapshot unmatched',
    };
  };
  try {
    const result = received();
    if (result instanceof Promise) {
      return (async (): Promise<jest.CustomMatcherResult> => {
        try {
          await result;
        } catch (ex: unknown) {
          state = { ex };
        }
        return check();
      })();
    }
  } catch (ex: unknown) {
    state = { ex };
  }
  return check();
}
expect.extend({ toFailMatchingSnapshot });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/ban-types
    interface Matchers<R, T = {}> {
      toFailMatchingSnapshot(): T extends (...args: unknown[]) => infer TR
        ? TR extends Promise<unknown>
          ? Promise<R>
          : R
        : never;
    }
  }
}

export {};
