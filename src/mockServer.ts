import express from 'express';

export function mockServer(
  port: number,
  index: string[],
  files: [string, string][]
) {
  // serverの設定
  const app = express();

  const staticOptions: Parameters<typeof express.static>[1] = {index};
  for (const [location, path] of files) {
    app.use(location, express.static(path, staticOptions));
  }
  // URLで指定されたファイルが見つからない場合用のエントリー
  app.use((req, res) => {
    console.error(`ファイルが見つかりません。: ${req.path}`);
    res.sendStatus(404);
  });

  // サーバー起動
  app.listen(port, () => {
    console.log(`${port}番ポートで開始します。`);
  });
  return app;
}
