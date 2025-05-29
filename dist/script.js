// SupabaseのURLとキー

const SUPABASE_URL = 'https://vguesgqyjpohphmeyiaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndWVzZ3F5anBvaHBobWV5aWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTc2ODAsImV4cCI6MjA2Mzk3MzY4MH0.JZes7O8Q3naGO7RAHzCpIJ4NMRvHkmgw1fCfGLN4MUM';

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM取得
const messageEl = document.getElementById('messages');
const btn = document.getElementById('generateBtn');

let messages = [];

// メッセージをSupabaseから取得
async function fetchMessages() {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('text');

    if (error) {
      console.error('Supabaseエラー:', error);
      throw error;
    }

    messages = data.map(row => row.text);

    if (messages.length > 0) {
      messageEl.textContent = 'ボタンを押して、やる気アップ！';
      btn.disabled = false;
    } else {
      messageEl.textContent = 'メッセージが見つかりませんでした。';
    }
  } catch (err) {
    console.error('取得時の例外:', err);
    messageEl.textContent = 'エラーが発生しました。後でもう一度お試しください。';
  }
}

// ボタンを押したらランダム表示
btn.addEventListener('click', () => {
  if (messages.length === 0) return;
  const randomIndex = Math.floor(Math.random() * messages.length);
  messageEl.textContent = messages[randomIndex];
});

// 初回読み込み
fetchMessages();
