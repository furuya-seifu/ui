document.addEventListener('DOMContentLoaded', () => {
    const messageList = document.getElementById('message-list');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const usernameInput = document.getElementById('username-input');
    const clearButton = document.getElementById('clear-button');
    const chatWindow = document.getElementById('chat-window');

    const STORAGE_KEY_MESSAGES = 'chatAppMessages';
    const STORAGE_KEY_USERNAME = 'chatAppUsername';

    // 以前のユーザー名を読み込む
    const savedUsername = localStorage.getItem(STORAGE_KEY_USERNAME);
    if (savedUsername) {
        usernameInput.value = savedUsername;
    }

    // ローカルストレージからメッセージを読み込む関数
    function loadMessages() {
        const storedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
        return storedMessages ? JSON.parse(storedMessages) : [];
    }

    // メッセージをローカルストレージに保存する関数
    function saveMessages(messages) {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    }

    // メッセージを画面に表示する関数
    function displayMessage(messageObj) {
        const li = document.createElement('li');

        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'username';
        usernameSpan.textContent = escapeHTML(messageObj.username); // XSS対策

        const messageTextSpan = document.createElement('span');
        messageTextSpan.className = 'message-text';
        messageTextSpan.textContent = escapeHTML(messageObj.text); // XSS対策

        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        timestampSpan.textContent = new Date(messageObj.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

        li.appendChild(usernameSpan);
        li.appendChild(messageTextSpan);
        li.appendChild(timestampSpan);

        // 自分のメッセージかどうかの判定（例：現在の入力名と一致するか）
        if (messageObj.username === (usernameInput.value.trim() || '匿名')) {
            li.classList.add('my-message');
        } else {
            li.classList.add('other-message');
        }

        messageList.appendChild(li);
        chatWindow.scrollTop = chatWindow.scrollHeight; // 自動スクロール
    }

    // HTMLエスケープ関数 (簡易的なXSS対策)
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // 送信処理
    function sendMessage() {
        const messageText = messageInput.value.trim();
        const username = usernameInput.value.trim() || '匿名'; // 名前が空なら匿名

        if (messageText === '') {
            return; // 空のメッセージは送信しない
        }

        const messageObj = {
            username: username,
            text: messageText,
            timestamp: new Date().toISOString()
        };

        // 現在のメッセージリストを取得し、新しいメッセージを追加
        const messages = loadMessages();
        messages.push(messageObj);
        saveMessages(messages); // 保存

        displayMessage(messageObj); // 画面に表示

        messageInput.value = ''; // 入力欄をクリア
        messageInput.focus(); // 入力欄にフォーカスを戻す

        // ユーザー名を保存
        localStorage.setItem(STORAGE_KEY_USERNAME, username);
    }

    // イベントリスナー
    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (event) => {
        // Enterキーで送信 (Shift+Enterで改行)
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // デフォルトの改行動作をキャンセル
            sendMessage();
        }
    });

    clearButton.addEventListener('click', () => {
        if (confirm('チャット履歴をすべて削除しますか？')) {
            localStorage.removeItem(STORAGE_KEY_MESSAGES);
            messageList.innerHTML = ''; // 表示されているメッセージもクリア
            alert('チャット履歴がクリアされました。');
        }
    });

    // 初期表示時に保存されているメッセージを読み込んで表示
    const initialMessages = loadMessages();
    initialMessages.forEach(displayMessage);
});