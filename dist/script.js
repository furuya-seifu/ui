// HTMLのDOM構造が完全に読み込まれてからスクリプトを実行
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing script...");

    // 1. SupabaseプロジェクトのURLとanon keyを設定
    const SUPABASE_URL = 'https://vguesgqyjpohphmeyiaf.supabase.co';
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★ 必ずSupabaseダッシュボードから新しいAnon Keyをコピーしてここに貼り付けてください！ ★
    // ★ 古いキーでは動作しない可能性が非常に高いです。                          ★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    const SUPABASE_ANON_KEY = 'YOUR_NEW_SUPABASE_ANON_KEY'; // 例: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. ...'

    console.log("Supabase URL:", SUPABASE_URL);
    console.log("Supabase ANON_KEY (first 10 chars):", SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 10) + "..." : "NOT SET or EMPTY");


    // Supabaseクライアントを初期化
    let supabase;

    // Supabase JSライブラリが読み込まれているか確認
    if (typeof supabaseJs === 'undefined') {
        console.error("CRITICAL: Supabase JS library (supabaseJs) is not loaded. Check the script tag in index.html.");
        alert("Supabaseライブラリが読み込まれていません。index.htmlの<script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script>タグを確認してください。");
        return; // ライブラリがないと処理を続けられない
    }

    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_NEW_SUPABASE_ANON_KEY') { // キーが初期値のままではないか確認
        try {
            supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("Supabase client initialized:", supabase ? "Success" : "Failed (check URL/Key)");
        } catch (e) {
            console.error("CRITICAL: Error initializing Supabase client:", e);
            alert("Supabaseクライアントの初期化中にエラーが発生しました: " + e.message + "\nURLとAnon Keyを確認してください。");
            return; // 初期化失敗時は処理を中断
        }
    } else {
        console.error("CRITICAL: Supabase URLまたはAnon Keyが設定されていないか、初期値のままです。script.jsを編集してください。");
        alert("SupabaseのURLまたはAnon Keyが正しく設定されていません。\nscript.js内のSUPABASE_URLとSUPABASE_ANON_KEYを確認し、特にANON_KEYをSupabaseダッシュボードから取得した新しいものに置き換えてください。");
        if (document.getElementById('task-list')) {
            document.getElementById('task-list').innerHTML = '<li>Supabaseの設定が不完全です。script.jsを確認してください。</li>';
        }
        return; // 設定がないと処理を中断
    }

    // HTML要素を取得
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');

    console.log("Checking HTML Elements:");
    console.log("taskInput:", taskInput ? "Found" : "NOT FOUND - Check ID in index.html");
    console.log("addTaskButton:", addTaskButton ? "Found" : "NOT FOUND - Check ID in index.html");
    console.log("taskList:", taskList ? "Found" : "NOT FOUND - Check ID in index.html");

    if (!taskInput || !addTaskButton || !taskList) {
        console.error("CRITICAL: One or more essential HTML elements are missing. Script cannot proceed correctly.");
        alert("ページに必要なHTML要素（入力欄、追加ボタン、タスクリスト）のいずれかが見つかりません。index.htmlのID属性を確認してください。");
        // return; // ここで止めると何も表示されなくなるので、状況によってはコメントアウト
    }

    // 2. タスクをSupabaseから取得して表示する関数
    async function fetchTasks() {
        console.log("fetchTasks: Attempting to fetch tasks...");
        if (!supabase) {
            console.error("fetchTasks: Supabase client is not initialized. Cannot fetch.");
            return;
        }

        try {
            const { data: todos, error } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('fetchTasks: タスクの取得に失敗しました:', error);
                alert('タスクの取得に失敗しました: ' + error.message + '\nSupabaseのRLSポリシーやテーブル名を確認してください。');
                return;
            }

            console.log("fetchTasks: Tasks fetched successfully:", todos);
            taskList.innerHTML = ''; // リストをクリア

            if (todos && todos.length > 0) {
                todos.forEach(todo => {
                    const listItem = document.createElement('li');
                    const taskTextSpan = document.createElement('span');
                    taskTextSpan.classList.add('task-text');
                    taskTextSpan.textContent = todo.task;
                    listItem.appendChild(taskTextSpan);
                    taskList.appendChild(listItem);
                });
            } else {
                console.log("fetchTasks: No tasks found or todos array is empty.");
                const listItem = document.createElement('li');
                listItem.textContent = '登録されているタスクはありません。';
                listItem.style.textAlign = 'center';
                listItem.style.color = '#777';
                taskList.appendChild(listItem);
            }
        } catch (err) {
            console.error('fetchTasks: 予期せぬエラー:', err);
            alert('タスクの取得中に予期せぬエラーが発生しました: ' + err.message);
        }
    }

    // 3. 新しいタスクをSupabaseに追加する関数
    async function addTask() {
        console.log("addTask: Attempting to add task...");
        if (!supabase) {
            console.error("addTask: Supabase client is not initialized. Cannot add.");
            return;
        }

        if (!taskInput) {
            console.error("addTask: taskInput element not found.");
            alert("タスク入力欄が見つかりません。");
            return;
        }
        const taskText = taskInput.value.trim();

        if (taskText === '') {
            alert('タスクを入力してください。');
            return;
        }
        console.log("addTask: Task text:", taskText);

        try {
            const { data, error } = await supabase
                .from('todos')
                .insert([{ task: taskText }])
                .select();

            if (error) {
                console.error('addTask: タスクの追加に失敗しました:', error);
                alert('タスクの追加に失敗しました: ' + error.message + '\nSupabaseのRLSポリシーやテーブル/カラム名を確認してください。');
                return;
            }

            console.log('addTask: タスクが追加されました:', data);
            taskInput.value = '';
            fetchTasks(); // タスクリストを再読み込み
        } catch (err) {
            console.error('addTask: 予期せぬエラー:', err);
            alert('タスクの追加中に予期せぬエラーが発生しました: ' + err.message);
        }
    }

    // イベントリスナーを設定
    if (addTaskButton) {
        addTaskButton.addEventListener('click', () => {
            console.log("EVENT: Add task button clicked.");
            addTask();
        });
        console.log("Event listener for addTaskButton successfully ADDED.");
    } else {
        console.error("CRITICAL: Could not add event listener because addTaskButton was not found.");
    }

    if (taskInput) {
        taskInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                console.log("EVENT: Enter key pressed in taskInput.");
                addTask();
            }
        });
        console.log("Event listener for taskInput (keypress) successfully ADDED.");
    } else {
        console.error("Could not add event listener because taskInput was not found.");
    }

    // ページ読み込み時にタスクを取得して表示
    if (supabase) {
        console.log("Initial task fetch on page load...");
        fetchTasks();
    } else {
        console.error("Cannot perform initial task fetch: Supabase client is not initialized.");
        // このメッセージは既にクライアント初期化失敗時に表示されている可能性あり
    }

    console.log("Script initialization finished.");
});