import {homedir} from 'os';
import {resolve} from 'path';
import {parseOptions, ShowUsageException} from '../src/parseOptions';

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
    process.env.TESTENV = 'test/$';
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
    delete process.env.TESTENV;
    expect(parseOptions(['/=test/$TESTENV$'])).toEqual({
      port: 50000,
      index: ['index.html', 'index.htm'],
      files: [['/', resolve('test', '$')]],
    });
  });
  test('help', () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    try {
      expect(() => parseOptions(['--help'])).toThrow(new ShowUsageException(0));
      expect(consoleError).toHaveBeenCalledTimes(0);
      expect(consoleLog).toHaveBeenCalledTimes(1);
    } finally {
      consoleLog.mockRestore();
      consoleError.mockRestore();
    }
  });
  test('no entry', () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    try {
      expect(() => parseOptions([])).toThrow(new ShowUsageException(-1));
      expect(consoleError).toHaveBeenCalledWith(
        `エントリーが指定されていません。\n`
      );
      expect(consoleLog).toHaveBeenCalledTimes(1);
    } finally {
      consoleLog.mockRestore();
      consoleError.mockRestore();
    }
  });
  test('no equal', () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    try {
      expect(() => parseOptions(['test'])).toThrow(new ShowUsageException(-1));
      expect(consoleError).toHaveBeenCalledWith(
        `エントリーに\`='がありません。: test\n`
      );
      expect(consoleLog).toHaveBeenCalledTimes(1);
    } finally {
      consoleLog.mockRestore();
      consoleError.mockRestore();
    }
  });
  test('empty location', () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    try {
      expect(() => parseOptions(['=test'])).toThrow(new ShowUsageException(-1));
      expect(consoleError).toHaveBeenCalledWith(`locationが空です。: =test\n`);
      expect(consoleLog).toHaveBeenCalledTimes(1);
    } finally {
      consoleLog.mockRestore();
      consoleError.mockRestore();
    }
  });
  test('empty path', () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    try {
      expect(() => parseOptions(['test='])).toThrow(new ShowUsageException(-1));
      expect(consoleError).toHaveBeenCalledWith(`pathが空です。: test=\n`);
      expect(consoleLog).toHaveBeenCalledTimes(1);
    } finally {
      consoleLog.mockRestore();
      consoleError.mockRestore();
    }
  });
  test('not start slash', () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    try {
      expect(() => parseOptions(['test=test'])).toThrow(
        new ShowUsageException(-1)
      );
      expect(consoleError).toHaveBeenCalledWith(
        `locationは\`/'で始まっている必要があります。: test=test\n`
      );
      expect(consoleLog).toHaveBeenCalledTimes(1);
    } finally {
      consoleLog.mockRestore();
      consoleError.mockRestore();
    }
  });
  test('not exist', () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    try {
      expect(() => parseOptions(['/test=test/not-exist'])).toThrow(
        new ShowUsageException(-1)
      );
      expect(consoleError).toHaveBeenCalledWith(
        `pathが見つかりません。: /test=test/not-exist\n`
      );
      expect(consoleLog).toHaveBeenCalledTimes(1);
    } finally {
      consoleLog.mockRestore();
      consoleError.mockRestore();
    }
  });
});
