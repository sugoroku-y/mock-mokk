import './toConsoleOutputMatchingSnapshot';

describe('.toConsoleOutputMatchingSnapshot', () => {
  test.each`
    name       | pass
    ${'log'}   | ${true}
    ${'debug'} | ${true}
    ${'info'}  | ${true}
    ${'warn'}  | ${true}
    ${'error'} | ${true}
    ${'log'}   | ${false}
    ${'debug'} | ${false}
    ${'info'}  | ${false}
    ${'warn'}  | ${false}
    ${'error'} | ${false}
  `(
    '$name $pass',
    ({
      name,
      pass,
    }: {
      name: 'log' | 'debug' | 'info' | 'warn' | 'error';
      pass: boolean;
    }) => {
      if (pass) {
        expect(() =>
          console[name](`test: ${name} ${pass}`)
        ).toConsoleOutputMatchingSnapshot(name);
      } else {
        const {suppressedErrors, snapshotState} = expect.getState();
        const {unmatched} = snapshotState;
        const lastLength = suppressedErrors.length;
        expect(() =>
          console[name](`test: ${name} ${pass}:x`)
        ).toConsoleOutputMatchingSnapshot(name);
        expect(suppressedErrors.length).toBeGreaterThan(lastLength);
        expect(snapshotState.unmatched).toBeGreaterThan(unmatched);
        expect(suppressedErrors[lastLength]).toMatchSnapshot();
        suppressedErrors.length = lastLength;
        snapshotState.unmatched = unmatched;
      }
    }
  );
});
