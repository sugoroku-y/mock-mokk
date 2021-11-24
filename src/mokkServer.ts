import express from 'express';
import { Server } from 'http';

export function mokkServer(
  port: number,
  index: string[],
  files: [string, string][]
): Promise<Server> {
  // serverの設定
  const app = express();

  const staticOptions = { index };
  for (const [location, path] of files) {
    app.use(location, express.static(path, staticOptions));
  }

  // URLで指定されたファイルが見つからない場合用のエントリー
  app.use((req, res) => {
    console.error(`ファイルが見つかりません。: ${req.path}`);
    res.sendStatus(404);
  });

  // サーバー起動
  return new Promise<Server>((resolve, reject) => {
    const server = app
      .listen(port, () => {
        console.log(`${port}番ポートで開始します。`);
        resolve(server);
      })
      .on('error', err => reject(err));
  });
}
