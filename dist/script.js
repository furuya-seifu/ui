const SUPABASE_URL = 'https://vguesgqyjpohphmeyiaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndWVzZ3F5anBvaHBobWV5aWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTc2ODAsImV4cCI6MjA2Mzk3MzY4MH0.JZes7O8Q3naGO7RAHzCpIJ4NMRvHkmgw1fCfGLN4MUM';

const supabase = window.supabase; // supabase-js を CDN で読み込んでいることを前提
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const messageList = document.getElementById('message-list');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const usernameInput = document.getElementById('username-input');
    const clearButton = document.getElementById('clear-button');
    const chatWindow = document.getElementById('chat-window');

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function displayMessage(messageObj) {
        const li = document.createElement('li');

        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'username';
        usernameSpan.textContent = escapeHTML(messageObj.username);

        const messageTextSpan = document.createElement('span');
        messageTextSpan.className = 'message-text';
        messageTextSpan.textContent = escapeHTML(messageObj.text);

        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        timestampSpan.textContent = new Date(messageObj.timestamp).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });

        li.appendChild(usernameSpan);
        li.appendChild(messageTextSpan);
        li.appendChild(timestampSpan);

        if (messageObj.username === (usernameInput.value.trim() || '匿名')) {
            li.classList.add('my-message');
        } else {
            li.classList.add('other-message');
        }

        messageList.appendChild(li);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function loadMessages() {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .order('timestamp', { ascending: true });

        if (error) {
            console.error('読み込みエラー:', error.message);
            return;
        }

        messageList.innerHTML = '';
        data.forEach(displayMessage);
    }

    async function sendMessage() {
        const messageText = messageInput.value.trim();
        const username = usernameInput.value.trim() || '匿名';

        if (messageText === '') return;

        const messageObj = {
            username: username,
            text: messageText,
            timestamp: new Date().toISOString()
        };

        const { error } = await supabaseClient
            .from('messages')
            .insert([messageObj]);

        if (error) {
            console.error('送信エラー:', error.message);
            alert('メッセージの送信に失敗しました。\n' + error.message);
            return;
        }

        displayMessage(messageObj);
        messageInput.value = '';
        messageInput.focus();
    }

    async function clearMessages() {
        if (confirm('チャット履歴をすべて削除しますか？')) {
            const { error } = await supabaseClient
                .from('messages')
                .delete()
                .neq('id', 0);

            if (error) {
                console.error('削除エラー:', error.message);
                alert('削除に失敗しました。');
                return;
            }

            messageList.innerHTML = '';
            alert('チャット履歴がクリアされました。');
        }
    }

    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    clearButton.addEventListener('click', clearMessages);

    loadMessages();
});
