import './toConsoleOutputMatchingSnapshot';
import './toFailMatchingSnapshot';

describe('.toConsoleOutputMatchingSnapshot', () => {
  test.each`
    name         | pass
    ${undefined} | ${true}
    ${'log'}     | ${true}
    ${'debug'}   | ${true}
    ${'info'}    | ${true}
    ${'warn'}    | ${true}
    ${'error'}   | ${true}
    ${undefined} | ${false}
    ${'log'}     | ${false}
    ${'debug'}   | ${false}
    ${'info'}    | ${false}
    ${'warn'}    | ${false}
    ${'error'}   | ${false}
  `(
    '$name $pass',
    ({
      name,
      pass,
    }: {
      name: 'log' | 'debug' | 'info' | 'warn' | 'error' | undefined;
      pass: boolean;
    }) => {
      if (pass) {
        expect(() =>
          console[name ?? 'log'](`test: ${name} ${pass}`),
        ).toConsoleOutputMatchingSnapshot(name);
      } else {
        expect(() => {
          expect(() =>
            console[name ?? 'log'](`test: ${name} ${pass}:x`),
          ).toConsoleOutputMatchingSnapshot(name);
        }).toFailMatchingSnapshot();
      }
    },
  );
});
