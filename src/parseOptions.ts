import { existsSync } from 'fs';
import { homedir } from 'os';
import { resolve, sep } from 'path';
import { parse, helpString, unnamed } from 'optionalist';

declare global {
  interface String {
    replace(
      re: RegExp,
      replacer: (match: string, ...captures: (string | undefined)[]) => string,
    ): string;
  }
}

/**
 * パスを指定する文字列を絶対パスに解決する。
 *
 * 文字列中に以下のパターンがあればそれぞれ置換します。
 *
 * - 先頭にある`$/`はホームディレクトリに
 * - `$ENV`もしくは`${ENV}`は環境変数ENVの値に
 * - `$$`は文字`$`そのものに
 *
 * @param {string} path
 * @returns {string}
 */
function resolvePathSpec(path: string): string {
  return resolve(
    path.replace(
      /^\$\/|\$\$|\$\{(\w+)}|\$(\w+)/g,
      (match, bracketedName, bareName) => {
        if (match === '$/') {
          // 先頭から`$/`で始まっていたらホームディレクトリ
          return homedir() + sep;
        }
        if (match === '$$') {
          // `$$`は`$`1文字
          return '$';
        }
        const name = bracketedName ?? bareName;
        // `$ENV`、`${ENV}`は環境変数ENVの値に、ENVがなければ空文字列
        return (name && process.env[name]) || ''; //
      },
    ),
  );
}

/**
 * コマンドラインを解析して必要な情報を取得する。
 *
 * @export
 * @param {Iterable<string>} [args]
 * @returns
 */
export function parseOptions(args?: Iterable<string>) {
  // コマンドライン解析
  const options = parse(
    {
      help: {
        alias: 'h',
        type: 'boolean',
        alone: true,
        describe: 'このヘルプを表示します。',
      },
      port: {
        alias: 'p',
        type: 'number',
        default: 50000,
        example: '#listen_port',
        describe: 'サーバーのポート番号を指定します。',
      },
      index: {
        alias: 'i',
        type: 'string',
        default: 'index.html/index.htm',
        example: 'index.html',
        describe: `
      URLが/で終わっていた場合に補完されるファイル名を指定します。
      /で区切ることで複数のファイル名を指定できます。
    `,
      },
      [unnamed]: {
        example: '/location/to/resource=path/to/file/or/directory',
        describe: `
      レスポンスとして返すファイルの位置を設定するエントリーを指定します。
      {URLのパス部分}={割り当てられるファイル、もしくはディレクトリーの位置}の形式で指定します。
      URLのパスは/から始まっている必要があります。
      ファイル/ディレクトリーに相対パスを指定した場合は実行時のカレントディレクトリを基準とします。
      ファイル/ディレクトリーに$/で始まるパスを指定した場合はホームディレクトリに$/以降のパスを連結したものになります。
      ファイル/ディレクトリーには$ENVの形で環境変数を指定することができます。
      ファイル/ディレクトリーに$そのものを指定したい場合には$$としてください。
      ファイルは指定された順に検索していき、最初に見つかったものを返します。
    `,
      },
      [helpString]: {
        showUsageOnError: true,
        describe: `
    簡易HTTPサーバーを起動します。
    `,
      },
    },
    args,
  );

  // --help/-hが指定されたときはヘルプ文字列を出力して終了
  if ('help' in options) {
    console.log(options[helpString]);
    process.exit(0);
  }

  // ファイルエントリの解析
  const errors: string[] = [];
  const files = options[unnamed]
    .map(entry => {
      const eq = entry.indexOf('=');
      if (eq < 0) {
        // =がない
        errors.push(`エントリーに\`='がありません。: ${entry}`);
        return undefined;
      }
      if (eq === 0) {
        // locationがない
        errors.push(`locationが空です。: ${entry}`);
        return undefined;
      }
      if (eq === entry.length - 1) {
        // pathがない
        errors.push(`pathが空です。: ${entry}`);
        return undefined;
      }
      const location = entry.slice(0, eq);
      if (location.charAt(0) !== '/') {
        // pathがない
        errors.push(`locationは\`/'で始まっている必要があります。: ${entry}`);
        return undefined;
      }
      const path = resolvePathSpec(entry.slice(eq + 1));
      if (!existsSync(path)) {
        errors.push(`pathが見つかりません。: ${entry}`);
        return undefined;
      }
      return [location, path] as [string, string];
    })
    // undefinedを除外
    .filter(<T>(o: T): o is NonNullable<T> => !!o);
  // エラーがなくてもエントリーがなければエラー
  if (!errors.length && !files.length) {
    errors.push(`エントリーが指定されていません。`);
  }

  // エラーがあったら使い方を表示して終了
  if (errors.length) {
    console.error(errors.map(s => `${s}\n`).join(''));
    console.log(options[helpString]);
    process.exit(-1);
  }
  return {
    port: options.port,
    index: options.index.split('/'),
    files,
  };
}
