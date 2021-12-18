import { resolve } from 'path';
import { Server } from 'http';
import axios from 'axios';
import { mokkServer } from '../src/mokkServer';
import { consoleOutput, unpromise } from './jest-utils';

describe('mock-mokk', () => {
  const PORT_FOR_TEST = 50001;
  let app: Server;
  beforeAll(async () => {
    expect(
      await consoleOutput(['log'], async () => {
        app = await mokkServer(
          PORT_FOR_TEST,
          ['index.html', 'index.htm'],
          [['/', resolve('test', '$')]],
        );
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "log": Array [
          Array [
            "50001番ポートで開始します。",
          ],
        ],
      }
    `);
  });
  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      app.close(err => {
        err ? reject(err) : resolve();
      });
    });
  });
  test('get', async () => {
    const output = await consoleOutput(['error', 'log'], async () => {
      const client = axios.create();
      expect(await (await client.get(`http://localhost:${PORT_FOR_TEST}`)).data)
        .toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html lang=\\"ja\\">
        <head>
          <meta charset=\\"UTF-8\\">
          <meta http-equiv=\\"X-UA-Compatible\\" content=\\"IE=edge\\">
          <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">
          <title>テスト</title>
        </head>
        <body>
          <h1>テスト</h1>
        </body>
        </html>"
      `);
    });
    expect(output).toMatchInlineSnapshot(`
      Object {
        "error": Array [],
        "log": Array [],
      }
    `);
  });
  test('not found', async () => {
    const output = await consoleOutput(['error', 'log'], async () => {
      expect(
        await unpromise(async () => {
          const client = axios.create();
          await client.get(`http://localhost:${PORT_FOR_TEST}/notexist.txt`);
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Request failed with status code 404"`,
      );
    });
    expect(output).toMatchInlineSnapshot(`
      Object {
        "error": Array [
          Array [
            "ファイルが見つかりません。: /notexist.txt",
          ],
        ],
        "log": Array [],
      }
    `);
  });
  test('port used', async () => {
    expect(
      await unpromise(async () => {
        await mokkServer(
          PORT_FOR_TEST,
          ['index.html', 'index.htm'],
          [['/', resolve('test', '$')]],
        );
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"listen EADDRINUSE: address already in use :::50001"`,
    );
  });
});
