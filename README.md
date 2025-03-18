# DOMチェッカー

URLのリストからDOM解析を行い、特定の文字列を検索するツールです。

## 機能

- 複数のURLから一括でHTML内の文字列を検索
- 検索結果をファイルに保存
- シンプルなコンソールインターフェース
- CSSセレクタによる特定要素内のみの検索
- コマンドライン引数のサポート

## 必要条件

- Node.js (v12以降推奨)
- npm

## インストール方法

1. リポジトリをクローンまたはダウンロードします
2. 依存パッケージをインストールします

```bash
npm install
```

## 使用方法

### 対話モード

1. URLリストを準備します
   - 1行に1つのURLを記載したテキストファイル（例: `url_list.txt`）を作成します

2. スクリプトを実行します

```bash
npm start
```

3. プロンプトに従って入力します
   - URLリストのファイルパス（例: `url_list.txt`）
   - 検索したい文字列
   - CSSセレクタ（省略可）

4. 結果確認
   - 検索結果は `search_results.txt` に保存されます

### コマンドライン引数を使用する方法

コマンドライン引数を使用して直接実行することもできます：

```bash
node index.js -f url_list.txt -s "検索したい文字列"
```

#### 利用可能なオプション

| オプション | 説明 |
|------------|------|
| `-f, --file <ファイルパス>` | URLリストのファイルパス |
| `-s, --search <検索文字列>` | 検索する文字列 |
| `-o, --output <ファイルパス>` | 結果を出力するファイル（デフォルト: search_results.txt） |
| `-c, --css <CSSセレクタ>` | 特定の要素内で検索する場合のCSSセレクタ |
| `-h, --help` | ヘルプメッセージを表示 |

#### 例

基本的な使用方法：
```bash
node index.js -f url_list.txt -s "検索したい文字列"
```

CSSセレクタを指定して特定の要素内のみを検索：
```bash
node index.js -f url_list.txt -s "検索したい文字列" -c ".main-content"
```

出力ファイルを指定：
```bash
node index.js -f url_list.txt -s "検索したい文字列" -o "results.txt"
```

## 出力例

```
読み込まれたURL数: 4
検索文字列: "検索したい文字列"
検索を開始します...

[1/4] https://www.google.com を処理中...
[2/4] https://www.yahoo.co.jp を処理中...
✅ 文字列が見つかりました: https://www.yahoo.co.jp
[3/4] https://github.com を処理中...
[4/4] https://www.wikipedia.org を処理中...

検索が完了しました
検索結果: 1件のURLで文字列が見つかりました
結果は /path/to/search_results.txt に保存されました
```

## 注意事項

- 大量のURLを処理する場合は時間がかかることがあります
- 一部のWebサイトはスクレイピングを禁止している場合があります。利用規約を確認してください
- 検索は大文字・小文字を区別します
- CSSセレクタを使用すると、特定の要素内のみを検索できますが、サイトの構造が変わるとセレクタが機能しなくなる可能性があります
