// SupabaseのURLとキー

const SUPABASE_URL = 'https://vguesgqyjpohphmeyiaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndWVzZ3F5anBvaHBobWV5aWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTc2ODAsImV4cCI6MjA2Mzk3MzY4MH0.JZes7O8Q3naGO7RAHzCpIJ4NMRvHkmgw1fCfGLN4MUM';

const messageEl = document.getElementById('message');
const btn = document.getElementById('generateBtn');

let messages = [];

// メッセージをAPIから取得
async function fetchMessages() {
  try {
    const response = await fetch('/api/messages'); // ← 必要に応じてURL変更
    if (!response.ok) throw new Error('メッセージ取得に失敗しました');
    const data = await response.json();
    messages = data.messages || []; // {"messages": ["...", "..."]} を想定

    if (messages.length > 0) {
      messageEl.textContent = "ボタンを押して、やる気アップ！";
      btn.disabled = false;
    } else {
      messageEl.textContent = "メッセージが見つかりませんでした。";
    }
  } catch (err) {
    console.error(err);
    messageEl.textContent = "エラーが発生しました。後でもう一度お試しください。";
  }
}

// ボタン押下でランダムメッセージ表示
btn.addEventListener('click', () => {
  if (messages.length === 0) return;
  const randomIndex = Math.floor(Math.random() * messages.length);
  messageEl.textContent = messages[randomIndex];
});

// 初期化
fetchMessages();
