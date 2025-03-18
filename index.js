const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const readline = require('readline');

/**
 * URLからHTMLを取得する関数
 * @param {string} url - 取得するURL
 * @returns {Promise<string>} - HTML文字列
 */
async function fetchHTML(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000, // 10秒タイムアウト
    });
    return response.data;
  } catch (error) {
    console.error(`エラー: ${url} からHTMLを取得できませんでした`, error.message);
    return null;
  }
}

/**
 * HTML内から特定の文字列を検索する関数
 * @param {string} html - HTML文字列
 * @param {string} searchText - 検索する文字列
 * @param {Object} options - オプション
 * @returns {boolean} - 文字列が見つかったかどうか
 */
function searchInHTML(html, searchText, options = {}) {
  if (!html) return false;
  
  const $ = cheerio.load(html);
  
  if (options.cssSelector) {
    // CSSセレクタが指定されている場合、その要素内で検索
    const elements = $(options.cssSelector);
    for (let i = 0; i < elements.length; i++) {
      const text = $(elements[i]).text();
      if (text.includes(searchText)) {
        return true;
      }
    }
    return false;
  } else {
    // セレクタが指定されていない場合、body全体で検索
    const bodyText = $('body').text();
    return bodyText.includes(searchText);
  }
}

/**
 * コマンドライン引数を解析する関数
 * @returns {Object} - 解析されたオプション
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    urlFile: null,
    searchText: null,
    outputFile: 'search_results.txt',
    cssSelector: null,
    interactive: true
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-f':
      case '--file':
        options.urlFile = args[++i];
        break;
      case '-s':
      case '--search':
        options.searchText = args[++i];
        break;
      case '-o':
      case '--output':
        options.outputFile = args[++i];
        break;
      case '-c':
      case '--css':
        options.cssSelector = args[++i];
        break;
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
        break;
    }
  }

  // 必要な引数が揃っている場合、対話モードをオフに
  if (options.urlFile && options.searchText) {
    options.interactive = false;
  }

  return options;
}

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
  console.log(`
  使用方法: node index.js [オプション]

  オプション:
    -f, --file <ファイルパス>     URLリストのファイルパス
    -s, --search <検索文字列>     検索する文字列
    -o, --output <ファイルパス>   結果を出力するファイル（デフォルト: search_results.txt）
    -c, --css <CSSセレクタ>       特定の要素内で検索する場合のCSSセレクタ
    -h, --help                    このヘルプメッセージを表示

  例:
    node index.js -f url_list.txt -s "検索したい文字列"
    node index.js -f url_list.txt -s "検索したい文字列" -c ".main-content"
  `);
}

/**
 * 対話モードでユーザーから入力を受け取る
 * @returns {Promise<Object>} - ユーザー入力値
 */
async function promptUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));
  
  const urlFilePath = await question('URLリストのファイルパスを入力してください: ');
  const searchText = await question('検索する文字列を入力してください: ');
  const cssSelector = await question('CSSセレクタを指定する場合は入力してください（省略可）: ');
  
  rl.close();
  
  return {
    urlFile: urlFilePath,
    searchText: searchText,
    cssSelector: cssSelector || null
  };
}

/**
 * 検索処理を実行する関数
 * @param {Object} options - 検索オプション
 */
async function performSearch(options) {
  try {
    // ファイルからURLリストを読み込む
    const urls = fs.readFileSync(options.urlFile, 'utf8')
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    console.log(`読み込まれたURL数: ${urls.length}`);
    console.log(`検索文字列: "${options.searchText}"`);
    if (options.cssSelector) {
      console.log(`CSSセレクタ: "${options.cssSelector}"`);
    }
    console.log('検索を開始します...\n');
    
    const results = [];
    
    // 各URLを処理
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`[${i + 1}/${urls.length}] ${url} を処理中...`);
      
      const html = await fetchHTML(url);
      const found = searchInHTML(html, options.searchText, {
        cssSelector: options.cssSelector
      });
      
      if (found) {
        console.log(`✅ 文字列が見つかりました: ${url}`);
        results.push(url);
      }
    }
    
    console.log('\n検索が完了しました');
    console.log(`検索結果: ${results.length}件のURLで文字列が見つかりました`);
    
    if (results.length > 0) {
      // 結果をファイルに保存
      const resultFilePath = path.join(process.cwd(), options.outputFile);
      fs.writeFileSync(resultFilePath, results.join('\n'));
      console.log(`結果は ${resultFilePath} に保存されました`);
    }
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
  }
}

/**
 * メイン関数
 */
async function main() {
  // コマンドライン引数を解析
  const cliOptions = parseArguments();
  
  if (cliOptions.interactive) {
    // 対話モード
    const userInput = await promptUser();
    Object.assign(cliOptions, userInput);
  }
  
  await performSearch(cliOptions);
}

// プログラム開始
if (require.main === module) {
  main();
} 