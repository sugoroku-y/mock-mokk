import {resolve} from 'path';
import {Server} from 'http';
import axios from 'axios';
import {thrown} from './thrown';
import './toConsoleOutputMatchingSnapshot';
import {mokkServer} from '../src/mokkServer';

describe('mock-mokk', () => {
  let app: Server;
  beforeAll(async () => {
    await expect(async () => {
      app = await mokkServer(
        50000,
        ['index.html', 'index.htm'],
        [['/', resolve('test', '$')]]
      );
    }).toConsoleOutputMatchingSnapshot();
  });
  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      app.close(err => {
        err ? reject(err) : resolve();
      });
    });
  });
  test('get', async () => {
    await expect(async () => {
      await expect(async () => {
        const client = axios.create();
        expect(
          await (
            await client.get('http://localhost:50000')
          ).data
        ).toMatchSnapshot();
      }).toConsoleOutputMatchingSnapshot('log');
    }).toConsoleOutputMatchingSnapshot('error');
  });
  test('not found', async () => {
    await expect(async () => {
      await expect(async () => {
        expect(
          await thrown(async () => {
            const client = axios.create();
            await client.get('http://localhost:50000/notexist.txt');
          })
        ).toThrowErrorMatchingSnapshot();
      }).toConsoleOutputMatchingSnapshot('log');
    }).toConsoleOutputMatchingSnapshot('error');
  });
  test('port used', async () => {
    expect(
      await thrown(async () => {
        await mokkServer(
          50000,
          ['index.html', 'index.htm'],
          [['/', resolve('test', '$')]]
        );
      })
    ).toThrowErrorMatchingSnapshot();
  });
});
