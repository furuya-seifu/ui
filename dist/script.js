// Supabase初期化
const SUPABASE_URL = 'https://vguesgqyjpohphmeyiaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndWVzZ3F5anBvaHBobWV5aWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTc2ODAsImV4cCI6MjA2Mzk3MzY4MH0.JZes7O8Q3naGO7RAHzCpIJ4NMRvHkmgw1fCfGLN4MUM';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const APP_PREFIX = 'coupleApp_';

const sections = {
    gratitude: {
        inputEl: document.getElementById('gratitude-input'),
        listEl: document.getElementById('gratitude-list'),
        storageKey: APP_PREFIX + 'gratitudeItems',
        items: []
    },
    discussion: {
        inputEl: document.getElementById('discussion-input'),
        listEl: document.getElementById('discussion-list'),
        storageKey: APP_PREFIX + 'discussionItems',
        items: []
    },
    task: {
        inputEl: document.getElementById('task-input'),
        listEl: document.getElementById('task-list'),
        storageKey: APP_PREFIX + 'taskItems',
        items: []
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    for (const key in sections) {
        await loadItemsFromSupabase(key);
    }

    if (sections.gratitude.inputEl) {
        sections.gratitude.inputEl.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                addItem(key);
            }
        });
    }
    if (sections.discussion.inputEl) {
        sections.discussion.inputEl.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                addItem(key);
            }
        });
    }
    if (sections.task.inputEl) {
        sections.task.inputEl.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                addItem(key);
            }
        });
    }
});

async function addItem(sectionKey) {
    const section = sections[sectionKey];
    if (!section || !section.inputEl) return;

    const text = section.inputEl.value.trim();
    if (text === '') {
        alert('内容を入力してください。');
        return;
    }

    let newItem;
    if (sectionKey === 'task') {
        newItem = { text, completed: false };
    } else {
        newItem = { text };
    }

    section.items.push(newItem);
    section.inputEl.value = '';
    saveItems(sectionKey);
    renderList(sectionKey);

    await saveItemToSupabase(sectionKey, newItem);
}

function deleteItem(sectionKey, index) {
    const section = sections[sectionKey];
    if (!section) return;

    if (confirm('この項目を削除しますか？')) {
        section.items.splice(index, 1);
        saveItems(sectionKey);
        renderList(sectionKey);
        // Supabase側の削除も必要なら追加可能
    }
}

function toggleTaskStatus(index) {
    const task = sections.task.items[index];
    if (!task) return;
    task.completed = !task.completed;
    saveItems('task');
    renderList('task');
    // Supabaseに更新を送信してもよい
}

function renderList(sectionKey) {
    const section = sections[sectionKey];
    if (!section || !section.listEl) return;
    section.listEl.innerHTML = '';

    section.items.forEach((item, index) => {
        const li = document.createElement('li');
        const itemTextSpan = document.createElement('span');
        itemTextSpan.classList.add('item-text');

        if (sectionKey === 'task') {
            itemTextSpan.textContent = item.text;
            if (item.completed) {
                li.classList.add('completed');
            }

            const toggleBtn = document.createElement('button');
            toggleBtn.classList.add('toggle-btn');
            toggleBtn.textContent = item.completed ? '未完了に戻す' : '完了';
            toggleBtn.onclick = () => toggleTaskStatus(index);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = '削除';
            deleteBtn.onclick = () => deleteItem(sectionKey, index);

            const buttonsDiv = document.createElement('div');
            buttonsDiv.appendChild(toggleBtn);
            buttonsDiv.appendChild(deleteBtn);

            li.appendChild(itemTextSpan);
            li.appendChild(buttonsDiv);
        } else {
            itemTextSpan.textContent = item.text;
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = '削除';
            deleteBtn.onclick = () => deleteItem(sectionKey, index);

            li.appendChild(itemTextSpan);
            li.appendChild(deleteBtn);
        }

        section.listEl.appendChild(li);
    });
}

function saveItems(sectionKey) {
    const section = sections[sectionKey];
    if (!section) return;
    localStorage.setItem(section.storageKey, JSON.stringify(section.items));
}

async function saveItemToSupabase(sectionKey, item) {
    let tableName = '';
    if (sectionKey === 'gratitude') tableName = 'gratitude_items';
    else if (sectionKey === 'discussion') tableName = 'discussion_items';
    else if (sectionKey === 'task') tableName = 'task_items';
    else return;

    const { error } = await supabase.from(tableName).insert([item]);
    if (error) {
        console.error('Supabaseへの保存中にエラー:', error.message);
    }
}

async function loadItemsFromSupabase(sectionKey) {
    let tableName = '';
    if (sectionKey === 'gratitude') tableName = 'gratitude_items';
    else if (sectionKey === 'discussion') tableName = 'discussion_items';
    else if (sectionKey === 'task') tableName = 'task_items';
    else return;

    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Supabaseからの読み込みエラー:', error.message);
        return;
    }

    sections[sectionKey].items = data || [];
    renderList(sectionKey);
}

function clearAllData() {
    if (confirm('本当に全てのデータをリセットしますか？この操作は元に戻せません。')) {
        for (const key in sections) {
            if (sections[key]) {
                sections[key].items = [];
                localStorage.removeItem(sections[key].storageKey);
                renderList(key);
                // Supabaseからの削除も必要なら追加
            }
        }
        alert('全てのデータがリセットされました。');
    }
}

// HTMLから呼び出される関数（グローバルスコープ）
window.addItem = addItem;
window.deleteItem = deleteItem;
window.toggleTaskStatus = toggleTaskStatus;
window.clearAllData = clearAllData;
