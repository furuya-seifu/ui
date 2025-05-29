document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing script...");

    // 1. SupabaseプロジェクトのURLとanon keyを設定
    const SUPABASE_URL = 'https://vguesgqyjpohphmeyiaf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndWVzZ3F5anBvaHBobWV5aWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTc2ODAsImV4cCI6MjA2Mzk3MzY4MH0.JZes7O8Q3naGO7RAHzCpIJ4NMRvHkmgw1fCfGLN4MUM';

    if (SUPABASE_ANON_KEY.includes('YOUR_NEW_SUPABASE_ANON_KEY') || SUPABASE_ANON_KEY.includes('★')) {
        alert("SupabaseのAnon Keyが設定されていません。script.jsを編集してください。");
        return;
    }

    // ✅ Supabaseクライアントを初期化（修正済み）
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // HTML要素取得
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');

    // タスク取得関数
    async function fetchTasks() {
        try {
            const { data: todos, error } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            taskList.innerHTML = '';

            if (todos.length === 0) {
                const li = document.createElement('li');
                li.textContent = '登録されているタスクはありません。';
                li.style.color = '#777';
                taskList.appendChild(li);
                return;
            }

            todos.forEach(todo => {
                const li = document.createElement('li');
                li.textContent = todo.task;
                taskList.appendChild(li);
            });
        } catch (err) {
            console.error("タスクの取得に失敗:", err);
            alert('タスクの取得に失敗しました: ' + err.message);
        }
    }

    // タスク追加関数
    async function addTask() {
        const task = taskInput.value.trim();
        if (!task) {
            alert("タスクを入力してください。");
            return;
        }

        try {
            const { error } = await supabase
                .from('todos')
                .insert([{ task }]);

            if (error) throw error;

            taskInput.value = '';
            fetchTasks();
        } catch (err) {
            console.error("タスクの追加に失敗:", err);
            alert('タスクの追加に失敗しました: ' + err.message);
        }
    }

    // イベント設定
    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // 初回読み込み
    fetchTasks();
});
