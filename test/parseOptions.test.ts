import {homedir} from 'os';
import {resolve} from 'path';
import {parseOptions} from '../src/parseOptions';
import './toExitProcess';
import './toConsoleOutputMatchingSnapshot';

describe('parseOptions', () => {
  test('minimum', () => {
    expect(parseOptions(['/=.'])).toEqual({
      port: 50000,
      index: ['index.html', 'index.htm'],
      files: [['/', resolve('.')]],
    });
  });
  test('homedir', () => {
    expect(parseOptions(['/=$/'])).toEqual({
      port: 50000,
      index: ['index.html', 'index.htm'],
      files: [['/', homedir()]],
    });
  });
  test('dollar', () => {
    expect(parseOptions(['/=test/$$'])).toEqual({
      port: 50000,
      index: ['index.html', 'index.htm'],
      files: [['/', resolve('test', '$')]],
    });
  });
  test('env', () => {
    process.env['TESTENV'] = 'test/$';
    expect(parseOptions(['/=$TESTENV'])).toEqual({
      port: 50000,
      index: ['index.html', 'index.htm'],
      files: [['/', resolve('test', '$')]],
    });
    expect(parseOptions(['/=${TESTENV}'])).toEqual({
      port: 50000,
      index: ['index.html', 'index.htm'],
      files: [['/', resolve('test', '$')]],
    });
    delete process.env['TESTENV'];
    expect(parseOptions(['/=test/$TESTENV$'])).toEqual({
      port: 50000,
      index: ['index.html', 'index.htm'],
      files: [['/', resolve('test', '$')]],
    });
  });
  test('help', () => {
    expect(() => {
      expect(() => {
        expect(() => parseOptions(['--help'])).toExitProcess(0);
      }).toConsoleOutputMatchingSnapshot('log');
    }).toConsoleOutputMatchingSnapshot('error');
  });
  test('no entry', () => {
    expect(() => {
      expect(() => {
        expect(() => parseOptions([])).toExitProcess(-1);
      }).toConsoleOutputMatchingSnapshot('log');
    }).toConsoleOutputMatchingSnapshot('error');
  });
  test('no equal', () => {
    expect(() => {
      expect(() => {
        expect(() => parseOptions(['test'])).toExitProcess(-1);
      }).toConsoleOutputMatchingSnapshot('log');
    }).toConsoleOutputMatchingSnapshot('error');
  });
  test('empty location', () => {
    expect(() => {
      expect(() => {
        expect(() => parseOptions(['=test'])).toExitProcess(-1);
      }).toConsoleOutputMatchingSnapshot('log');
    }).toConsoleOutputMatchingSnapshot('error');
  });
  test('empty path', () => {
    expect(() => {
      expect(() => {
        expect(() => parseOptions(['test='])).toExitProcess(-1);
      }).toConsoleOutputMatchingSnapshot('log');
    }).toConsoleOutputMatchingSnapshot('error');
  });
  test('not start slash', () => {
    expect(() => {
      expect(() => {
        expect(() => parseOptions(['test=test'])).toExitProcess(-1);
      }).toConsoleOutputMatchingSnapshot('log');
    }).toConsoleOutputMatchingSnapshot('error');
  });
  test('not exist', () => {
    expect(() => {
      expect(() => {
        expect(() => parseOptions(['/test=test/not-exist'])).toExitProcess(-1);
      }).toConsoleOutputMatchingSnapshot('log');
    }).toConsoleOutputMatchingSnapshot('error');
  });
});
