// 1. SupabaseプロジェクトのURLとanon keyを設定
// 必ずご自身のプロジェクトの値に置き換えてください！
const SUPABASE_URL = 'https://vguesgqyjpohphmeyiaf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndWVzZ3F5anBvaHBobWV5aWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTc2ODAsImV4cCI6MjA2Mzk3MzY4MH0.JZes7O8Q3naGO7RAHzCpIJ4NMRvHkmgw1fCfGLN4MUM';

// Supabaseクライアントを初期化
let supabase;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error("Supabase URLまたはAnon Keyが設定されていません。");
    alert("Supabaseの設定が正しくありません。script.jsファイルを確認してください。");
}

// HTML要素を取得
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task-button');
const taskList = document.getElementById('task-list');

// 2. タスクをSupabaseから取得して表示する関数
async function fetchTasks() {
    if (!supabase) {
        console.error("Supabase client is not initialized.");
        return;
    }

    try {
        // 'todos' テーブルから全てのタスクを選択（作成日時順に並び替え）
        const { data: todos, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false }); // 新しいものが上にくるように

        if (error) {
            console.error('タスクの取得に失敗しました:', error);
            // ユーザーへのフィードバックを改善
            if (error.message.includes("JWTExpired")) {
                alert('セッションの有効期限が切れました。ページを再読み込みしてください。');
            } else if (error.message.includes("new row violates row-level security policy")) {
                 alert('データの取得権限がありません。管理者に確認してください。(RLS Policy)');
            }
            else {
                alert('タスクの取得に失敗しました: ' + error.message);
            }
            return;
        }

        // リストをクリア
        taskList.innerHTML = '';

        // 取得したタスクをリストに追加
        if (todos && todos.length > 0) {
            todos.forEach(todo => {
                const listItem = document.createElement('li');

                const taskTextSpan = document.createElement('span');
                taskTextSpan.classList.add('task-text');
                taskTextSpan.textContent = todo.task;
                listItem.appendChild(taskTextSpan);

                // (オプション) 削除ボタンを追加する場合
                // const deleteButton = document.createElement('button');
                // deleteButton.classList.add('delete-button');
                // deleteButton.textContent = '削除';
                // deleteButton.onclick = async () => {
                //     await deleteTask(todo.id);
                // };
                // listItem.appendChild(deleteButton);

                taskList.appendChild(listItem);
            });
        } else if (todos && todos.length === 0) {
            // タスクがない場合の表示 (任意)
            const listItem = document.createElement('li');
            listItem.textContent = '登録されているタスクはありません。';
            listItem.style.textAlign = 'center';
            listItem.style.color = '#777';
            taskList.appendChild(listItem);
        }
    } catch (err) {
        console.error('予期せぬエラー (fetchTasks):', err);
        alert('タスクの取得中に予期せぬエラーが発生しました。');
    }
}

// 3. 新しいタスクをSupabaseに追加する関数
async function addTask() {
    if (!supabase) {
        console.error("Supabase client is not initialized.");
        return;
    }

    const taskText = taskInput.value.trim(); // 入力値を取得し、前後の空白を削除

    if (taskText === '') {
        alert('タスクを入力してください。');
        return;
    }

    try {
        // 'todos' テーブルに新しいタスクを挿入
        const { data, error } = await supabase
            .from('todos')
            .insert([{ task: taskText }]) // `task` カラムに `taskText` を設定
            .select(); // 挿入したデータを返すようにする (任意)

        if (error) {
            console.error('タスクの追加に失敗しました:', error);
            if (error.message.includes("new row violates row-level security policy")) {
                 alert('タスクの追加権限がありません。管理者に確認してください。(RLS Policy)');
            } else {
                alert('タスクの追加に失敗しました: ' + error.message);
            }
            return;
        }

        console.log('タスクが追加されました:', data);
        taskInput.value = ''; // 入力フィールドをクリア
        fetchTasks(); // タスクリストを再読み込み
    } catch (err) {
        console.error('予期せぬエラー (addTask):', err);
        alert('タスクの追加中に予期せぬエラーが発生しました。');
    }
}

// (オプション) タスクを削除する関数
// async function deleteTask(id) {
//     if (!supabase) {
//         console.error("Supabase client is not initialized.");
//         return;
//     }
//     try {
//         const { error } = await supabase
//             .from('todos')
//             .delete()
//             .match({ id: id });
//
//         if (error) {
//             console.error('タスクの削除に失敗しました:', error);
//             alert('タスクの削除に失敗しました: ' + error.message);
//             return;
//         }
//         console.log('タスクが削除されました:', id);
//         fetchTasks(); // タスクリストを再読み込み
//     } catch (err) {
//         console.error('予期せぬエラー (deleteTask):', err);
//         alert('タスクの削除中に予期せぬエラーが発生しました。');
//     }
// }


// イベントリスナーを設定
if (addTaskButton) {
    addTaskButton.addEventListener('click', addTask);
} else {
    console.error("Element with id 'add-task-button' not found.");
}

if (taskInput) {
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });
} else {
    console.error("Element with id 'task-input' not found.");
}

// ページ読み込み時にタスクを取得して表示
// Supabaseクライアントが初期化されていることを確認してからfetchTasksを呼び出す
if (supabase) {
    fetchTasks();
} else {
    // HTML要素が存在する場合、エラーメッセージを表示
    if (taskList) {
        taskList.innerHTML = '<li>Supabaseクライアントの初期化に失敗しました。設定を確認してください。</li>';
    }
}