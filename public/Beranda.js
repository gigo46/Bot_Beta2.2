// ==================== BAGIAN: VARIABEL GLOBAL ====================
const themeToggle = document.getElementById('themeToggle'); 
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');
const body = document.body;

// Chat history & tema awal
let chatHistory = JSON.parse(localStorage.getItem('tracoAIChatHistory')) || [];
let currentTheme = localStorage.getItem('tracoAITheme') || 'light';

// ==================== BAGIAN: INISIALISASI TEMA ====================
// Terapkan tema yang tersimpan saat halaman dimuat
document.body.setAttribute('data-theme', currentTheme);
updateThemeIcon();

// ==================== BAGIAN: TOGGLE TEMA ====================
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

// ==================== BAGIAN: UPDATE IKON TEMA ====================
function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    if (currentTheme === 'light') {
        themeIcon.className = 'bi bi-moon-fill';
    } else {
        themeIcon.className = 'bi bi-sun-fill';
    }
}

// ==================== BAGIAN: MENU MOBILE ====================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// ==================== BAGIAN: NAVIGASI ACTIVE STATE ====================
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        navLinks.forEach(l => l.classList.remove('active')); // hapus aktif semua
        e.target.classList.add('active'); // aktifkan yang diklik
        navMenu.classList.remove('active'); // tutup menu mobile
    });
});

// ==================== BAGIAN: SMOOTH SCROLLING CTA ====================
document.querySelector('.cta-button').addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector('#features');
    target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

// ==================== BAGIAN: EFEK SCROLL PADA HEADER ====================
let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.style.transform = 'translateY(-100%)'; // scroll turun
    } else {
        header.style.transform = 'translateY(0)'; // scroll naik
    }
    
    lastScrollTop = scrollTop;
});

// ==================== BAGIAN: ANIMASI FEATURE CARD SAAT SCROLL ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Inisialisasi feature cards
document.addEventListener('DOMContentLoaded', () => {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
});

// ==================== BAGIAN: EFEK KETIK HERO TITLE ====================
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Jalankan efek ketik saat halaman load
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    const originalText = heroTitle.textContent;
    typeWriter(heroTitle, originalText, 80);
});

// ====== JS 1 SELESAI ======