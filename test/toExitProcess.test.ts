import {thrown} from './thrown';
import './toExitProcess';

jest.setTimeout(10000);

const EXIT_MAP = {
  'does not exit': null,
  'exit without code': [],
  'exit with code: 0': [0],
  'exit with code:-1': [-1],
} as const;

const EXPECTED_MAP = {
  'without code': [],
  'with code: 0': [0],
  'with code:-1': [-1],
} as const;

describe('no-wait .toExitProcess', () => {
  test.each`
    exit                   | expected          | pass
    ${'does not exit'}     | ${'without code'} | ${false}
    ${'does not exit'}     | ${'with code: 0'} | ${false}
    ${'does not exit'}     | ${'with code:-1'} | ${false}
    ${'exit without code'} | ${'without code'} | ${true}
    ${'exit without code'} | ${'with code: 0'} | ${true}
    ${'exit without code'} | ${'with code:-1'} | ${false}
    ${'exit with code: 0'} | ${'without code'} | ${true}
    ${'exit with code: 0'} | ${'with code: 0'} | ${true}
    ${'exit with code: 0'} | ${'with code:-1'} | ${false}
    ${'exit with code:-1'} | ${'without code'} | ${true}
    ${'exit with code:-1'} | ${'with code: 0'} | ${false}
    ${'exit with code:-1'} | ${'with code:-1'} | ${true}
  `(
    'process $exit, expected to exit $expected: $pass',
    ({
      exit,
      expected,
      pass,
    }: {
      exit: keyof typeof EXIT_MAP;
      expected: keyof typeof EXPECTED_MAP;
      pass: boolean;
    }) => {
      const exitParam = EXIT_MAP[exit];
      const toExitProcessParam = EXPECTED_MAP[expected];
      if (pass) {
        expect(() => {
          exitParam && process.exit(...exitParam);
        }).toExitProcess(...toExitProcessParam);
      } else {
        expect(() =>
          expect(() => {
            exitParam && process.exit(...exitParam);
          }).toExitProcess(...toExitProcessParam)
        ).toThrowErrorMatchingSnapshot();
      }
    }
  );
});

describe('async .toExitProcess', () => {
  test.each`
    exit                   | expected          | pass
    ${'does not exit'}     | ${'without code'} | ${false}
    ${'does not exit'}     | ${'with code: 0'} | ${false}
    ${'does not exit'}     | ${'with code:-1'} | ${false}
    ${'exit without code'} | ${'without code'} | ${true}
    ${'exit without code'} | ${'with code: 0'} | ${true}
    ${'exit without code'} | ${'with code:-1'} | ${false}
    ${'exit with code: 0'} | ${'without code'} | ${true}
    ${'exit with code: 0'} | ${'with code: 0'} | ${true}
    ${'exit with code: 0'} | ${'with code:-1'} | ${false}
    ${'exit with code:-1'} | ${'without code'} | ${true}
    ${'exit with code:-1'} | ${'with code: 0'} | ${false}
    ${'exit with code:-1'} | ${'with code:-1'} | ${true}
  `(
    'process $exit, expected to exit $expected: $pass',
    async ({
      exit,
      expected,
      pass,
    }: {
      exit: keyof typeof EXIT_MAP;
      expected: keyof typeof EXPECTED_MAP;
      pass: boolean;
    }) => {
      const exitParam = EXIT_MAP[exit];
      const toExitProcessParam = EXPECTED_MAP[expected];
      if (pass) {
        await expect(async () => {
          await new Promise(r => setTimeout(r, 1));
          exitParam && process.exit(...exitParam);
        }).toExitProcess(...toExitProcessParam);
      } else {
        expect(
          await thrown(async () => {
            await expect(async () => {
              await new Promise(r => setTimeout(r, 1));
              exitParam && process.exit(...exitParam);
            }).toExitProcess(...toExitProcessParam);
          })
        ).toThrowErrorMatchingSnapshot();
      }
    }
  );
});

describe('no-wait .not.toExitProcess', () => {
  test.each`
    exit                   | expected          | pass
    ${'does not exit'}     | ${'without code'} | ${!false}
    ${'does not exit'}     | ${'with code: 0'} | ${!false}
    ${'does not exit'}     | ${'with code:-1'} | ${!false}
    ${'exit without code'} | ${'without code'} | ${!true}
    ${'exit without code'} | ${'with code: 0'} | ${!true}
    ${'exit without code'} | ${'with code:-1'} | ${!false}
    ${'exit with code: 0'} | ${'without code'} | ${!true}
    ${'exit with code: 0'} | ${'with code: 0'} | ${!true}
    ${'exit with code: 0'} | ${'with code:-1'} | ${!false}
    ${'exit with code:-1'} | ${'without code'} | ${!true}
    ${'exit with code:-1'} | ${'with code: 0'} | ${!false}
    ${'exit with code:-1'} | ${'with code:-1'} | ${!true}
  `(
    'process $exit, expected to exit $expected: $pass',
    ({
      exit,
      expected,
      pass,
    }: {
      exit: keyof typeof EXIT_MAP;
      expected: keyof typeof EXPECTED_MAP;
      pass: boolean;
    }) => {
      const exitParam = EXIT_MAP[exit];
      const toExitProcessParam = EXPECTED_MAP[expected];
      if (pass) {
        expect(() => {
          exitParam && process.exit(...exitParam);
        }).not.toExitProcess(...toExitProcessParam);
      } else {
        expect(() =>
          expect(() => {
            exitParam && process.exit(...exitParam);
          }).not.toExitProcess(...toExitProcessParam)
        ).toThrowErrorMatchingSnapshot();
      }
    }
  );
});

describe('async .not.toExitProcess', () => {
  test.each`
    exit                   | expected          | pass
    ${'does not exit'}     | ${'without code'} | ${!false}
    ${'does not exit'}     | ${'with code: 0'} | ${!false}
    ${'does not exit'}     | ${'with code:-1'} | ${!false}
    ${'exit without code'} | ${'without code'} | ${!true}
    ${'exit without code'} | ${'with code: 0'} | ${!true}
    ${'exit without code'} | ${'with code:-1'} | ${!false}
    ${'exit with code: 0'} | ${'without code'} | ${!true}
    ${'exit with code: 0'} | ${'with code: 0'} | ${!true}
    ${'exit with code: 0'} | ${'with code:-1'} | ${!false}
    ${'exit with code:-1'} | ${'without code'} | ${!true}
    ${'exit with code:-1'} | ${'with code: 0'} | ${!false}
    ${'exit with code:-1'} | ${'with code:-1'} | ${!true}
  `(
    'process $exit, expected to exit $expected: $pass',
    async ({
      exit,
      expected,
      pass,
    }: {
      exit: keyof typeof EXIT_MAP;
      expected: keyof typeof EXPECTED_MAP;
      pass: boolean;
    }) => {
      const exitParam = EXIT_MAP[exit];
      const toExitProcessParam = EXPECTED_MAP[expected];
      if (pass) {
        await expect(async () => {
          await new Promise(r => setTimeout(r, 1));
          exitParam && process.exit(...exitParam);
        }).not.toExitProcess(...toExitProcessParam);
      } else {
        expect(
          await thrown(async () => {
            await expect(async () => {
              await new Promise(r => setTimeout(r, 1));
              exitParam && process.exit(...exitParam);
            }).not.toExitProcess(...toExitProcessParam);
          })
        ).toThrowErrorMatchingSnapshot();
      }
    }
  );
});

describe('exception in .toExitProcess', () => {
  test('normal', () => {
    expect(() => {
      expect((): void => {
        throw new Error('normal');
      }).toExitProcess();
    }).toThrow('normal');
  });
  test('async', async () => {
    expect(
      await thrown(async () => {
        await expect(async (): Promise<void> => {
          await new Promise(r => setTimeout(r, 5000));
          throw new Error('async');
        }).toExitProcess();
      })
    ).toThrow('async');
  });
});

describe('exception in .not.toExitProcess', () => {
  test('normal', () => {
    expect(() => {
      expect((): void => {
        throw new Error('normal');
      }).not.toExitProcess();
    }).toThrow('normal');
  });
  test('async', async () => {
    expect(
      await thrown(async () => {
        await expect(async (): Promise<void> => {
          await new Promise(r => setTimeout(r, 5000));
          throw new Error('async');
        }).not.toExitProcess();
      })
    ).toThrow('async');
  });
});
