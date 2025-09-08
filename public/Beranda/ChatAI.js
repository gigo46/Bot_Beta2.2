// ========================== BAGIAN: Inisialisasi Chat & Tema ==========================
let chatHistory = JSON.parse(localStorage.getItem('tracoAIChatHistory')) || [];
let currentTheme = localStorage.getItem('tracoAITheme') || 'light';

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

// ========================== BAGIAN: Kirim Pesan ==========================
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    const sendButton = document.getElementById('sendButton');
    
    if (message === '') return;
    
    // Animasi tombol kirim
    sendButton.classList.add('sending');
    setTimeout(() => {
        sendButton.classList.remove('sending');
    }, 600);
    
    // Tambah pesan user
    const userMessage = {
        type: 'user',
        content: message,
        time: getCurrentTime(),
        file: null,
        image: null
    };

    // ========================== BAGIAN: Lampiran File / Gambar ==========================
    if (attachedFile) {
        if (attachedFile.type.startsWith('image/')) {
            const previewImg = document.querySelector('.image-preview');
            if (previewImg) {
                userMessage.image = previewImg.src;
            }
        } else {
            userMessage.file = { name: attachedFile.name, size: attachedFile.size };
        }
    }
    
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
    
    //=======================Simulasi Balasan AI ==========================
    setTimeout(() => {
        removeTypingIndicator();
        const aiResponse = {
            type: 'ai',
            content: generateMockResponse(message),
            time: getCurrentTime()
        };
        chatHistory.push(aiResponse);
        saveChatHistory();
        displayMessage(aiResponse);
    }, 1500);
}

// ========================== BAGIAN: Respon AI Sementara ==========================
function generateMockResponse(userMessage) {
    const responses = {
        'analisis eur/usd hari ini': 'Berdasarkan analisis teknikal, EUR/USD saat ini berada di level support kuat di 1.0850...',
        'prediksi btc/usdt': 'Bitcoin sedang dalam fase konsolidasi di kisaran $42,000-$44,000...',
        'strategi trading untuk pemula': 'Untuk pemula, saya sarankan:\n1. Mulai dengan demo account\n2. Pelajari analisis teknikal...',
        'analisis teknikal gold': 'Gold (XAU/USD) sedang dalam uptrend jangka menengah. Level $2,050 menjadi resistance psikologis...'
    };
    
    const lowerMessage = userMessage.toLowerCase();
    for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return value;
        }
    }
    
    return `Terima kasih atas pertanyaan Anda tentang "${userMessage}". Saya akan menganalisis data terkini...`;
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
    
    // Gambar
    if (message.image) {
        attachmentContent = `
            <img src="${message.image}" class="message-image" onclick="window.open(this.src, '_blank')" alt="Attached image">
        `;
    }
    // File
    else if (message.file) {
        attachmentContent = `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; padding: 0.25rem 0.5rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <i class="bi bi-file-earmark-fill" style="font-size: 0.9rem;"></i>
                <span style="font-size: 0.85rem;">${message.file.name}</span>
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${attachmentContent}
            <div>${message.content}</div>
            <div class="message-time">${message.time}</div>
        </div>
    `;
    document.getElementById('chatWrapper').appendChild(messageDiv);
    scrollToBottom();
}

// ========================== BAGIAN: Riwayat Chat ==========================
function loadChatHistory() {
    const chatWrapper = document.getElementById('chatWrapper');
    chatWrapper.innerHTML = '';
    
    if (chatHistory.length === 0) {
        return;
    }
    
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
let attachedFile = null;

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
            
            if (file.type.startsWith('image/')) {
                showImagePreview(file);
            } else {
                showFileInfo(file);
            }
            
            uploadButton.style.transform = 'scale(1.2) rotate(360deg)';
            setTimeout(() => {
                uploadButton.style.transform = '';
            }, 300);
        }, 800);
    }
}

// ========================== BAGIAN: Preview Gambar ==========================
function showImagePreview(file) {
    const existingInfo = document.querySelector('.file-info');
    const existingPreview = document.querySelector('.image-preview-container');
    if (existingInfo) existingInfo.remove();
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

// ========================== BAGIAN: Info File ==========================
function showFileInfo(file) {
    const existingInfo = document.querySelector('.file-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.innerHTML = `
        <i class="bi bi-file-earmark-fill"></i>
        <span>${file.name} (${formatFileSize(file.size)})</span>
        <button onclick="removeFile()">
            <i class="bi bi-x-circle"></i>
        </button>
    `;
    
    const inputWrapper = document.querySelector('.input-wrapper');
    const inputGroup = document.querySelector('.input-group-custom');
    inputWrapper.insertBefore(fileInfo, inputGroup);
}

// ========================== BAGIAN: Format Ukuran File ==========================
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ========================== BAGIAN: Hapus File ==========================
function removeFile() {
    attachedFile = null;
    
    const fileInfo = document.querySelector('.file-info');
    const imagePreview = document.querySelector('.image-preview-container');
    
    if (fileInfo) {
        fileInfo.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => fileInfo.remove(), 300);
    }
    
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
