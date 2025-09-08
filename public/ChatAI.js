// ========================== BAGIAN: Inisialisasi Chat & Tema ==========================
let chatHistory = JSON.parse(localStorage.getItem('tracoAIChatHistory')) || [];
let currentTheme = localStorage.getItem('tracoAITheme') || 'light';
let attachedFile = null;

// Terapkan tema yang tersimpan saat halaman dimuat
document.body.setAttribute('data-theme', currentTheme);
updateThemeIcon();

// ========================== BAGIAN: Fungsi Toggle Tema ==========================
function toggleTheme() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.classList.add('rotating');
    
    setTimeout(() => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('tracoAITheme', currentTheme);
        updateThemeIcon();
        themeToggle.classList.remove('rotating');
    }, 250);
}

// ========================== BAGIAN: Update Icon Tema ==========================
function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    if (currentTheme === 'light') {
        themeIcon.className = 'bi bi-moon-fill';
    } else {
        themeIcon.className = 'bi bi-sun-fill';
    }
}

// ========================== BAGIAN: Waktu Saat Ini ==========================
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ========================== BAGIAN: Set Rekomendasi Pesan ==========================
function setRecommendation(text) {
    document.getElementById('messageInput').value = text;
    document.getElementById('messageInput').focus();
}

// ========================== BAGIAN: Deteksi Tekan Enter ==========================
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// ========================== BAGIAN: Kirim Pesan & File ke Server ==========================
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    const sendButton = document.getElementById('sendButton');
    
    if (message === '' && !attachedFile) return;
    
    // Animasi tombol kirim
    sendButton.classList.add('sending');
    setTimeout(() => {
        sendButton.classList.remove('sending');
    }, 600);
    
    // Siapkan FormData untuk dikirim
    const formData = new FormData();
    if (message !== '') {
        formData.append('text', message);
    }
    if (attachedFile) {
        formData.append('image', attachedFile);
    }
    
    // Tambah pesan user ke riwayat
    const userMessage = {
        type: 'user',
        content: message,
        time: getCurrentTime(),
        image: attachedFile ? URL.createObjectURL(attachedFile) : null
    };
    chatHistory.push(userMessage);
    saveChatHistory();
    displayMessage(userMessage);

    // Reset input dan file
    input.value = '';
    if (attachedFile) {
        removeFile();
    }
    
    // Tampilkan indikator mengetik
    showTypingIndicator();
    
    // ======================= Panggil API Server =======================
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        removeTypingIndicator();
        
        const aiResponse = {
            type: 'ai',
            content: data.reply || "[Tidak ada jawaban dari AI]",
            time: getCurrentTime()
        };
        chatHistory.push(aiResponse);
        saveChatHistory();
        displayMessage(aiResponse);

    } catch (err) {
        console.error('Fetch error:', err);
        removeTypingIndicator();
        const errorMessage = {
            type: 'ai',
            content: "[Terjadi kesalahan koneksi ke server]",
            time: getCurrentTime()
        };
        chatHistory.push(errorMessage);
        saveChatHistory();
        displayMessage(errorMessage);
    }
}

// ========================== BAGIAN: Indikator Mengetik ==========================
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-message';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    document.getElementById('chatWrapper').appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingMessage = document.querySelector('.typing-message');
    if (typingMessage) {
        typingMessage.remove();
    }
}

// ========================== BAGIAN: Tampilkan Pesan ==========================
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    
    let attachmentContent = '';
    if (message.image) {
        attachmentContent = `
            <img src="${message.image}" class="message-image" onclick="window.open(this.src, '_blank')" alt="Attached image">
        `;
    }
    
    // Ganti teks biasa dengan teks yang sudah diformat dari Markdown
    const formattedContent = convertMarkdownToHtml(message.content);
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${attachmentContent}
            <div>${formattedContent}</div>
            <div class="message-time">${message.time}</div>
        </div>
    `;
    document.getElementById('chatWrapper').appendChild(messageDiv);
    scrollToBottom();
}


// ========================== BAGIAN: Konversi Markdown ==========================
function convertMarkdownToHtml(markdown) {
    let html = markdown
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Mengubah **teks** menjadi <b>teks</b>
        .replace(/^(#+)\s*(.*)$/gim, (match, hashes, content) => { // Mengubah # Heading menjadi <hN>Heading</hN>
            const level = hashes.length;
            return `<h${level}>${content}</h${level}>`;
        });

    // Handle ordered list (1. Item)
    html = html.replace(/^(\d+)\.\s*(.*)$/gim, (match, number, content) => {
        return `<li data-ordered-num="${number}">${content}</li>`;
    });

    // Handle unordered list (- Item)
    html = html.replace(/^- (.*)$/gim, '<li>$1</li>');

    // Bungkus list item dalam <ul> atau <ol>
    // Ini agak tricky karena bisa ada campuran. Pendekatan sederhana:
    // Jika ada li yang punya data-ordered-num, anggap itu ordered list.
    // Jika ada li biasa dan tidak ada ordered list, anggap itu unordered.
    let tempHtml = '';
    let inOrderedList = false;
    let inUnorderedList = false;
    const lines = html.split('\n');

    for (const line of lines) {
        if (line.trim().startsWith('<li data-ordered-num')) {
            if (!inOrderedList) {
                if (inUnorderedList) { tempHtml += '</ul>'; inUnorderedList = false; }
                tempHtml += '<ol>';
                inOrderedList = true;
            }
            tempHtml += line;
        } else if (line.trim().startsWith('<li>')) {
            if (!inUnorderedList) {
                if (inOrderedList) { tempHtml += '</ol>'; inOrderedList = false; }
                tempHtml += '<ul>';
                inUnorderedList = true;
            }
            tempHtml += line;
        } else {
            if (inOrderedList) { tempHtml += '</ol>'; inOrderedList = false; }
            if (inUnorderedList) { tempHtml += '</ul>'; inUnorderedList = false; }
            tempHtml += line;
        }
    }
    if (inOrderedList) { tempHtml += '</ol>'; }
    if (inUnorderedList) { tempHtml += '</ul>'; }
    
    // Pastikan tidak ada ul/ol kosong
    html = tempHtml.replace(/<ol>\s*<\/ol>/g, '').replace(/<ul>\s*<\/ul>/g, '');

    // Mengganti baris kosong ganda dengan <br><br> agar ada jarak antar paragraf
    html = html.replace(/\n\s*\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>'); // Mengganti baris baru dengan <br>
    
    return html;
}





// ========================== BAGIAN: Riwayat Chat ==========================
function loadChatHistory() {
    const chatWrapper = document.getElementById('chatWrapper');
    chatWrapper.innerHTML = '';
    if (chatHistory.length === 0) return;
    chatHistory.forEach(message => {
        displayMessage(message);
    });
}

function saveChatHistory() {
    localStorage.setItem('tracoAIChatHistory', JSON.stringify(chatHistory));
}

function startNewChat() {
    if (chatHistory.length > 0) {
        if (confirm('Apakah Anda yakin ingin memulai chat baru? Riwayat chat akan dihapus.')) {
            chatHistory = [];
            localStorage.removeItem('tracoAIChatHistory');
            loadChatHistory();
            showWelcomeMessage();
        }
    }
}

// ========================== BAGIAN: Upload File ==========================
function triggerFileUpload() {
    document.getElementById('fileInput').click();
}

function fileSelected(event) {
    const file = event.target.files[0];
    if (file) {
        const uploadButton = document.getElementById('uploadButton');
        uploadButton.classList.add('uploading');
        
        setTimeout(() => {
            attachedFile = file;
            uploadButton.classList.remove('uploading');
            uploadButton.classList.add('file-attached');
            
            showImagePreview(file);
            
            uploadButton.style.transform = 'scale(1.2) rotate(360deg)';
            setTimeout(() => {
                uploadButton.style.transform = '';
            }, 300);
        }, 800);
    }
}

// ========================== BAGIAN: Preview Gambar ==========================
function showImagePreview(file) {
    const existingPreview = document.querySelector('.image-preview-container');
    if (existingPreview) existingPreview.remove();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'image-preview-container';
        previewContainer.innerHTML = `
            <img src="${e.target.result}" class="image-preview" alt="Preview">
            <button class="image-preview-remove" onclick="removeFile()">
                <i class="bi bi-x"></i>
            </button>
        `;
        
        const inputWrapper = document.querySelector('.input-wrapper');
        const inputGroup = document.querySelector('.input-group-custom');
        inputWrapper.insertBefore(previewContainer, inputGroup);
    };
    reader.readAsDataURL(file);
}

// ========================== BAGIAN: Hapus File ==========================
function removeFile() {
    attachedFile = null;
    
    const imagePreview = document.querySelector('.image-preview-container');
    
    if (imagePreview) {
        imagePreview.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => imagePreview.remove(), 300);
    }
    
    const uploadButton = document.getElementById('uploadButton');
    uploadButton.classList.remove('file-attached');
    document.getElementById('fileInput').value = '';
}

// ========================== BAGIAN: Scroll Chat ke Bawah ==========================
function scrollToBottom() {
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ========================== BAGIAN: Event Fokus Input ==========================
document.getElementById('messageInput').addEventListener('focus', function() {
    this.parentElement.style.borderColor = '#0d6efd';
});

document.getElementById('messageInput').addEventListener('blur', function() {
    this.parentElement.style.borderColor = 'var(--border-color)';
});

// ========================== BAGIAN: Welcome Message ==========================
function showWelcomeMessage() {
    if (chatHistory.length === 0) {
        const welcome = {
            type: 'ai',
            content: "👋 Halo! Saya TracoAI, siap bantu analisis trading kamu.",
            time: getCurrentTime()
        };
        chatHistory.push(welcome);
        saveChatHistory();
        displayMessage(welcome);
    }
}

// ========================== BAGIAN: Inisialisasi Saat Load ==========================
window.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    showWelcomeMessage();
});
