const SUPABASE_URL = 'https://vguesgqyjpohphmeyiaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndWVzZ3F5anBvaHBobWV5aWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTc2ODAsImV4cCI6MjA2Mzk3MzY4MH0.JZes7O8Q3naGO7RAHzCpIJ4NMRvHkmgw1fCfGLN4MUM';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Supabaseクライアント初期化
const SUPABASE_URL = 'https://your-project.supabase.co'; // あなたのSupabase URL
const SUPABASE_ANON_KEY = 'your-anon-key';              // あなたのanon公開鍵

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const container = document.getElementById('sweets-container');
const modalBg = document.getElementById('modal-bg');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalClose = document.getElementById('modal-close');

let sweetsData = [];

// Supabaseからお菓子データを取得して表示
async function loadSweets() {
  const { data, error } = await supabase
    .from('sweets')
    .select('*');

  if(error) {
    console.error('データ取得エラー:', error);
    container.textContent = 'お菓子のデータを読み込めませんでした。';
    return;
  }

  sweetsData = data; // グローバルに保持

  data.forEach((sweet, index) => {
    const card = createCard(sweet, index);
    container.appendChild(card);
  });
}

// カード作成関数
function createCard(sweet, index) {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <img src="${sweet.img}" alt="${sweet.title}" />
    <div class="card-body">
      <h3>${sweet.title}</h3>
      <p>${sweet.desc}</p>
      <button class="btn-detail" data-index="${index}">詳細を見る</button>
    </div>
  `;

  return card;
}

// 詳細ボタンイベント
container.addEventListener('click', (e) => {
  if(e.target.classList.contains('btn-detail')) {
    const idx = e.target.getAttribute('data-index');
    const sweet = sweetsData[idx];

    modalImg.src = sweet.img;
    modalTitle.textContent = sweet.title;
    modalDesc.textContent = sweet.desc;
    modalBg.style.display = 'flex';
  }
});

// モーダル閉じる
modalClose.addEventListener('click', () => {
  modalBg.style.display = 'none';
});

// 背景クリックで閉じる
modalBg.addEventListener('click', (e) => {
  if(e.target === modalBg) {
    modalBg.style.display = 'none';
  }
});

// ページロード時にデータ取得
loadSweets();
