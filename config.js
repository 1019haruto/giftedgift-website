// サイト共通の設定ファイル
// Apps Scriptのデプロイで取得したURLと、管理者ページのパスワードをここに設定してください。

const SITE_CONFIG = {
  // 例: "https://script.google.com/macros/s/AKfycb.../exec"
  SUBMISSION_ENDPOINT: "https://script.google.com/macros/s/AKfycbzwttIqRin12N8pKyaSLH7Esi2br07XT-UfNm52y6dCs4eoeqgpLZFcSMgLDnhCqQYSXg/exec",

  // Apps Scriptコード内のSECRETと同じ文字列にしてください
  ADMIN_SECRET: "giftsecret26",

  // LINEログインチャネルのチャネルID（チャネルシークレットではありません。これは公開情報です）
  LINE_LOGIN_CHANNEL_ID: "2011523364",

  // LINE Developersの「コールバックURL」に登録したものと同じURL（Apps ScriptのWebアプリURL）
  LINE_LOGIN_REDIRECT_URI: "https://script.google.com/macros/s/AKfycbzwttIqRin12N8pKyaSLH7Esi2br07XT-UfNm52y6dCs4eoeqgpLZFcSMgLDnhCqQYSXg/exec",
};
