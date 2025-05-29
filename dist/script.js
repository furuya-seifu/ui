const SUPABASE_URL = 'https://vguesgqyjpohphmeyiaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndWVzZ3F5anBvaHBobWV5aWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTc2ODAsImV4cCI6MjA2Mzk3MzY4MH0.JZes7O8Q3naGO7RAHzCpIJ4NMRvHkmgw1fCfGLN4MUM';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('recipe-form');
const recipesList = document.getElementById('recipes-list');
const searchBar = document.getElementById('search-bar');

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function renderRecipe(recipe) {
  const div = document.createElement('div');
  div.className = 'recipe';

  div.innerHTML = `
    <h3>${escapeHTML(recipe.title)}</h3>
    <p><strong>カテゴリー:</strong> ${escapeHTML(recipe.category)}</p>
    <p><strong>材料:</strong><br>${escapeHTML(recipe.ingredients).replace(/\n/g, '<br>')}</p>
    <p><strong>調理手順:</strong><br>${escapeHTML(recipe.instructions).replace(/\n/g, '<br>')}</p>
  `;

  return div;
}

async function fetchRecipes(filter = '') {
  let query = supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (filter) {
    query = query.or(`title.ilike.%${filter}%,category.ilike.%${filter}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('データ取得エラー:', error);
    return;
  }

  recipesList.innerHTML = '';
  data.forEach(recipe => {
    const recipeDiv = renderRecipe(recipe);
    recipesList.appendChild(recipeDiv);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = form.title.value.trim();
  const ingredients = form.ingredients.value.trim();
  const instructions = form.instructions.value.trim();
  const category = form.category.value;

  if (!title || !ingredients || !instructions || !category) {
    alert('すべての項目を入力してください。');
    return;
  }

  const { error } = await supabase
    .from('recipes')
    .insert([{ title, ingredients, instructions, category }]);

  if (error) {
    console.error('投稿エラー:', error);
    alert('投稿に失敗しました。');
    return;
  }

  alert('レシピが投稿されました！');
  form.reset();
  fetchRecipes();
});

searchBar.addEventListener('input', () => {
  const val = searchBar.value.trim();
  fetchRecipes(val);
});

// ページロード時に全レシピを取得
fetchRecipes();
