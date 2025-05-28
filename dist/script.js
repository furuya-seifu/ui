const APP_PREFIX = 'coupleApp_';

// 各セクションのデータを管理するオブジェクト
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
        items: [] // task items will be objects: { text: '...', completed: false }
    }
};

// ページの読み込み時にローカルストレージからデータを読み込む
document.addEventListener('DOMContentLoaded', () => {
    for (const key in sections) {
        loadItems(key);
    }

    // Enterキーでアイテムを追加できるようにする (タスクと感謝/話し合いで挙動を分ける)
    // DOMContentLoaded内でイベントリスナーを登録
    if (sections.gratitude.inputEl) {
        sections.gratitude.inputEl.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) { // Shift+Enterで改行できるように
                event.preventDefault(); 
                addItem('gratitude');
            }
        });
    }
    if (sections.discussion.inputEl) {
        sections.discussion.inputEl.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                addItem('discussion');
            }
        });
    }
    if (sections.task.inputEl) {
        sections.task.inputEl.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                addItem('task');
            }
        });
    }
});

function loadItems(sectionKey) {
    const section = sections[sectionKey];
    if (!section) return; // sectionが存在しない場合は何もしない
    const storedItems = localStorage.getItem(section.storageKey);
    if (storedItems) {
        section.items = JSON.parse(storedItems);
    }
    renderList(sectionKey);
}

function saveItems(sectionKey) {
    const section = sections[sectionKey];
    if (!section) return;
    localStorage.setItem(section.storageKey, JSON.stringify(section.items));
}

function addItem(sectionKey) {
    const section = sections[sectionKey];
    if (!section || !section.inputEl) {
        console.error("Section or input element not found for:", sectionKey);
        return;
    }
    
    const text = section.inputEl.value.trim();

    if (text === '') {
        alert('内容を入力してください。');
        return;
    }

    if (sectionKey === 'task') {
        section.items.push({ text: text, completed: false });
    } else {
        section.items.push(text);
    }
    
    section.inputEl.value = ''; // 入力欄をクリア
    saveItems(sectionKey);
    renderList(sectionKey);
}

function deleteItem(sectionKey, index) {
    const section = sections[sectionKey];
    if (!section) return;

    if (confirm('この項目を削除しますか？')) {
        section.items.splice(index, 1);
        saveItems(sectionKey);
        renderList(sectionKey);
    }
}

function toggleTaskStatus(index) {
    const task = sections.task.items[index];
    if (!task) return;
    task.completed = !task.completed;
    saveItems('task');
    renderList('task');
}

function renderList(sectionKey) {
    const section = sections[sectionKey];
    if (!section || !section.listEl) {
        console.error("Section or list element not found for:", sectionKey);
        return;
    }
    section.listEl.innerHTML = ''; // リストをクリア

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
            itemTextSpan.textContent = item;
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

function clearAllData() {
    if (confirm('本当に全てのデータをリセットしますか？この操作は元に戻せません。')) {
        for (const key in sections) {
            if (sections[key]) {
                sections[key].items = []; // メモリ上のデータをクリア
                localStorage.removeItem(sections[key].storageKey); // ローカルストレージから削除
                renderList(key); // 表示を更新
            }
        }
        alert('全てのデータがリセットされました。');
    }
}

// HTMLのonclick属性から呼び出される関数はグローバルスコープにある必要があるため、
// script.jsのトップレベルに関数を配置したままでOKです。
// addItem, deleteItem, toggleTaskStatus, clearAllData はHTMLから直接呼び出されます。