import { homedir } from 'os';
import { resolve } from 'path';
import { parseOptions } from '../src/parseOptions';
import 'jest-to-exit-process';
import { consoleOutput } from './jest-utils';

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
  test('port', () => {
    expect(parseOptions(['--port', '80', '/=.'])).toEqual({
      port: 80,
      index: ['index.html', 'index.htm'],
      files: [['/', resolve('.')]],
    });
    expect(parseOptions(['-p', '80', '/=.'])).toEqual({
      port: 80,
      index: ['index.html', 'index.htm'],
      files: [['/', resolve('.')]],
    });
  });
  test('index', () => {
    expect(parseOptions(['--index', 'test.html', '/=.'])).toEqual({
      port: 50000,
      index: ['test.html'],
      files: [['/', resolve('.')]],
    });
    expect(parseOptions(['-i', 'test.html/test.htm', '/=.'])).toEqual({
      port: 50000,
      index: ['test.html', 'test.htm'],
      files: [['/', resolve('.')]],
    });
  });
  test('help', () => {
    expect(
      consoleOutput(() => {
        expect(() => parseOptions(['--help'])).toExitProcess(0);
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "log": Array [
          Array [
            "Version: @sugoroku-y/mock-mokk 0.0.1
      Usage:
        npx @sugoroku-y/mock-mokk [--port #listen_port] [--index index.html] [--] [/location/to/resource=path/to/file/or/directory...]
        npx @sugoroku-y/mock-mokk --help

      Description:
        簡易HTTPサーバーを起動します。

      Options:
        --help, -h
          このヘルプを表示します。
        --port, -p #listen_port
          サーバーのポート番号を指定します。
        --index, -i index.html
          URLが/で終わっていた場合に補完されるファイル名を指定します。
          /で区切ることで複数のファイル名を指定できます。
        [--] [/location/to/resource=path/to/file/or/directory...]
          レスポンスとして返すファイルの位置を設定するエントリーを指定します。
          {URLのパス部分}={割り当てられるファイル、もしくはディレクトリーの位置}の形式で指定します。
          URLのパスは/から始まっている必要があります。
          ファイル/ディレクトリーに相対パスを指定した場合は実行時のカレントディレクトリを基準とします。
          ファイル/ディレクトリーに$/で始まるパスを指定した場合はホームディレクトリに$/以降のパスを連結したものになります。
          ファイル/ディレクトリーには$ENVの形で環境変数を指定することができます。
          ファイル/ディレクトリーに$そのものを指定したい場合には$$としてください。
          ファイルは指定された順に検索していき、最初に見つかったものを返します。
      ",
          ],
        ],
      }
    `);
  });
  test('no entry', () => {
    expect(
      consoleOutput(() => {
        expect(() => parseOptions([])).toExitProcess(-1);
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "error": Array [
          Array [
            "エントリーが指定されていません。
      ",
          ],
        ],
        "log": Array [
          Array [
            "Version: @sugoroku-y/mock-mokk 0.0.1
      Usage:
        npx @sugoroku-y/mock-mokk [--port #listen_port] [--index index.html] [--] [/location/to/resource=path/to/file/or/directory...]
        npx @sugoroku-y/mock-mokk --help

      Description:
        簡易HTTPサーバーを起動します。

      Options:
        --help, -h
          このヘルプを表示します。
        --port, -p #listen_port
          サーバーのポート番号を指定します。
        --index, -i index.html
          URLが/で終わっていた場合に補完されるファイル名を指定します。
          /で区切ることで複数のファイル名を指定できます。
        [--] [/location/to/resource=path/to/file/or/directory...]
          レスポンスとして返すファイルの位置を設定するエントリーを指定します。
          {URLのパス部分}={割り当てられるファイル、もしくはディレクトリーの位置}の形式で指定します。
          URLのパスは/から始まっている必要があります。
          ファイル/ディレクトリーに相対パスを指定した場合は実行時のカレントディレクトリを基準とします。
          ファイル/ディレクトリーに$/で始まるパスを指定した場合はホームディレクトリに$/以降のパスを連結したものになります。
          ファイル/ディレクトリーには$ENVの形で環境変数を指定することができます。
          ファイル/ディレクトリーに$そのものを指定したい場合には$$としてください。
          ファイルは指定された順に検索していき、最初に見つかったものを返します。
      ",
          ],
        ],
      }
    `);
  });
  test('no equal', () => {
    expect(
      consoleOutput(() => {
        expect(() => parseOptions(['test'])).toExitProcess(-1);
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "error": Array [
          Array [
            "エントリーに\`='がありません。: test
      ",
          ],
        ],
        "log": Array [
          Array [
            "Version: @sugoroku-y/mock-mokk 0.0.1
      Usage:
        npx @sugoroku-y/mock-mokk [--port #listen_port] [--index index.html] [--] [/location/to/resource=path/to/file/or/directory...]
        npx @sugoroku-y/mock-mokk --help

      Description:
        簡易HTTPサーバーを起動します。

      Options:
        --help, -h
          このヘルプを表示します。
        --port, -p #listen_port
          サーバーのポート番号を指定します。
        --index, -i index.html
          URLが/で終わっていた場合に補完されるファイル名を指定します。
          /で区切ることで複数のファイル名を指定できます。
        [--] [/location/to/resource=path/to/file/or/directory...]
          レスポンスとして返すファイルの位置を設定するエントリーを指定します。
          {URLのパス部分}={割り当てられるファイル、もしくはディレクトリーの位置}の形式で指定します。
          URLのパスは/から始まっている必要があります。
          ファイル/ディレクトリーに相対パスを指定した場合は実行時のカレントディレクトリを基準とします。
          ファイル/ディレクトリーに$/で始まるパスを指定した場合はホームディレクトリに$/以降のパスを連結したものになります。
          ファイル/ディレクトリーには$ENVの形で環境変数を指定することができます。
          ファイル/ディレクトリーに$そのものを指定したい場合には$$としてください。
          ファイルは指定された順に検索していき、最初に見つかったものを返します。
      ",
          ],
        ],
      }
    `);
  });
  test('empty location', () => {
    expect(
      consoleOutput(() => {
        expect(() => parseOptions(['=test'])).toExitProcess(-1);
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "error": Array [
          Array [
            "locationが空です。: =test
      ",
          ],
        ],
        "log": Array [
          Array [
            "Version: @sugoroku-y/mock-mokk 0.0.1
      Usage:
        npx @sugoroku-y/mock-mokk [--port #listen_port] [--index index.html] [--] [/location/to/resource=path/to/file/or/directory...]
        npx @sugoroku-y/mock-mokk --help

      Description:
        簡易HTTPサーバーを起動します。

      Options:
        --help, -h
          このヘルプを表示します。
        --port, -p #listen_port
          サーバーのポート番号を指定します。
        --index, -i index.html
          URLが/で終わっていた場合に補完されるファイル名を指定します。
          /で区切ることで複数のファイル名を指定できます。
        [--] [/location/to/resource=path/to/file/or/directory...]
          レスポンスとして返すファイルの位置を設定するエントリーを指定します。
          {URLのパス部分}={割り当てられるファイル、もしくはディレクトリーの位置}の形式で指定します。
          URLのパスは/から始まっている必要があります。
          ファイル/ディレクトリーに相対パスを指定した場合は実行時のカレントディレクトリを基準とします。
          ファイル/ディレクトリーに$/で始まるパスを指定した場合はホームディレクトリに$/以降のパスを連結したものになります。
          ファイル/ディレクトリーには$ENVの形で環境変数を指定することができます。
          ファイル/ディレクトリーに$そのものを指定したい場合には$$としてください。
          ファイルは指定された順に検索していき、最初に見つかったものを返します。
      ",
          ],
        ],
      }
    `);
  });
  test('empty path', () => {
    expect(
      consoleOutput(() => {
        expect(() => parseOptions(['test='])).toExitProcess(-1);
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "error": Array [
          Array [
            "pathが空です。: test=
      ",
          ],
        ],
        "log": Array [
          Array [
            "Version: @sugoroku-y/mock-mokk 0.0.1
      Usage:
        npx @sugoroku-y/mock-mokk [--port #listen_port] [--index index.html] [--] [/location/to/resource=path/to/file/or/directory...]
        npx @sugoroku-y/mock-mokk --help

      Description:
        簡易HTTPサーバーを起動します。

      Options:
        --help, -h
          このヘルプを表示します。
        --port, -p #listen_port
          サーバーのポート番号を指定します。
        --index, -i index.html
          URLが/で終わっていた場合に補完されるファイル名を指定します。
          /で区切ることで複数のファイル名を指定できます。
        [--] [/location/to/resource=path/to/file/or/directory...]
          レスポンスとして返すファイルの位置を設定するエントリーを指定します。
          {URLのパス部分}={割り当てられるファイル、もしくはディレクトリーの位置}の形式で指定します。
          URLのパスは/から始まっている必要があります。
          ファイル/ディレクトリーに相対パスを指定した場合は実行時のカレントディレクトリを基準とします。
          ファイル/ディレクトリーに$/で始まるパスを指定した場合はホームディレクトリに$/以降のパスを連結したものになります。
          ファイル/ディレクトリーには$ENVの形で環境変数を指定することができます。
          ファイル/ディレクトリーに$そのものを指定したい場合には$$としてください。
          ファイルは指定された順に検索していき、最初に見つかったものを返します。
      ",
          ],
        ],
      }
    `);
  });
  test('not start slash', () => {
    expect(
      consoleOutput(() => {
        expect(() => parseOptions(['test=test'])).toExitProcess(-1);
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "error": Array [
          Array [
            "locationは\`/'で始まっている必要があります。: test=test
      ",
          ],
        ],
        "log": Array [
          Array [
            "Version: @sugoroku-y/mock-mokk 0.0.1
      Usage:
        npx @sugoroku-y/mock-mokk [--port #listen_port] [--index index.html] [--] [/location/to/resource=path/to/file/or/directory...]
        npx @sugoroku-y/mock-mokk --help

      Description:
        簡易HTTPサーバーを起動します。

      Options:
        --help, -h
          このヘルプを表示します。
        --port, -p #listen_port
          サーバーのポート番号を指定します。
        --index, -i index.html
          URLが/で終わっていた場合に補完されるファイル名を指定します。
          /で区切ることで複数のファイル名を指定できます。
        [--] [/location/to/resource=path/to/file/or/directory...]
          レスポンスとして返すファイルの位置を設定するエントリーを指定します。
          {URLのパス部分}={割り当てられるファイル、もしくはディレクトリーの位置}の形式で指定します。
          URLのパスは/から始まっている必要があります。
          ファイル/ディレクトリーに相対パスを指定した場合は実行時のカレントディレクトリを基準とします。
          ファイル/ディレクトリーに$/で始まるパスを指定した場合はホームディレクトリに$/以降のパスを連結したものになります。
          ファイル/ディレクトリーには$ENVの形で環境変数を指定することができます。
          ファイル/ディレクトリーに$そのものを指定したい場合には$$としてください。
          ファイルは指定された順に検索していき、最初に見つかったものを返します。
      ",
          ],
        ],
      }
    `);
  });
  test('not exist', () => {
    expect(
      consoleOutput(() => {
        expect(() => parseOptions(['/test=test/not-exist'])).toExitProcess(-1);
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "error": Array [
          Array [
            "pathが見つかりません。: /test=test/not-exist
      ",
          ],
        ],
        "log": Array [
          Array [
            "Version: @sugoroku-y/mock-mokk 0.0.1
      Usage:
        npx @sugoroku-y/mock-mokk [--port #listen_port] [--index index.html] [--] [/location/to/resource=path/to/file/or/directory...]
        npx @sugoroku-y/mock-mokk --help

      Description:
        簡易HTTPサーバーを起動します。

      Options:
        --help, -h
          このヘルプを表示します。
        --port, -p #listen_port
          サーバーのポート番号を指定します。
        --index, -i index.html
          URLが/で終わっていた場合に補完されるファイル名を指定します。
          /で区切ることで複数のファイル名を指定できます。
        [--] [/location/to/resource=path/to/file/or/directory...]
          レスポンスとして返すファイルの位置を設定するエントリーを指定します。
          {URLのパス部分}={割り当てられるファイル、もしくはディレクトリーの位置}の形式で指定します。
          URLのパスは/から始まっている必要があります。
          ファイル/ディレクトリーに相対パスを指定した場合は実行時のカレントディレクトリを基準とします。
          ファイル/ディレクトリーに$/で始まるパスを指定した場合はホームディレクトリに$/以降のパスを連結したものになります。
          ファイル/ディレクトリーには$ENVの形で環境変数を指定することができます。
          ファイル/ディレクトリーに$そのものを指定したい場合には$$としてください。
          ファイルは指定された順に検索していき、最初に見つかったものを返します。
      ",
          ],
        ],
      }
    `);
  });
});
