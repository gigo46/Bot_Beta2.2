
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        const themeText = document.getElementById('themeText');
        const body = document.body;

                // Initialize chat history from localStorage
        let chatHistory = JSON.parse(localStorage.getItem('tracoAIChatHistory')) || [];
        let currentTheme = localStorage.getItem('tracoAITheme') || 'light';


        // Apply saved theme on load
        document.body.setAttribute('data-theme', currentTheme);
        updateThemeIcon();

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

        function updateThemeIcon() {
            const themeIcon = document.getElementById('themeIcon');
            if (currentTheme === 'light') {
                themeIcon.className = 'bi bi-moon-fill';
            } else {
                themeIcon.className = 'bi bi-sun-fill';
            }
        }


        // Mobile Menu Functionality
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');

        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Navigation Active State
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                e.target.classList.add('active');
                
                // Close mobile menu if open
                navMenu.classList.remove('active');
            });
        });