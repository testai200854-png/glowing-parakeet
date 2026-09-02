// Universal Authentication & Navigation System
// Include this script at the end of every HTML page: <script src="../auth-nav.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    setupUnifiedHeader();

    // Dynamically update user name if saved during login
    const username = localStorage.getItem('dse_user_name') || 'Guest User';
    const userGreetingEl = document.getElementById('user-greeting');
    if (userGreetingEl) {
        userGreetingEl.textContent = `Hi, ${username}`;
    }

    // Highlight current page in navigation
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-pill');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.replace('../', '').replace('./', ''))) {
            link.classList.add('active');
        }
    });
});

function setupUnifiedHeader() {
    if (document.body.classList.contains('dashboard-page')) {
        const legacyHeader = document.body.firstElementChild;
        if (legacyHeader && legacyHeader.querySelector('.nav-pill')) {
            legacyHeader.remove();
        }

        const layout = document.querySelector('.dashboard-layout');
        const content = document.querySelector('.dashboard-content');
        if (layout && content) {
            const sidebar = document.createElement('aside');
            sidebar.className = 'sidebar';
            sidebar.innerHTML = `
                <div class="brand"><span class="icon">🧪</span><h2>Integrated DSE Chemistry Platform</h2></div>
                <nav class="nav-menu">
                    <button class="nav-item active" type="button" data-panel="home">🏠 Home Page</button>
                    <a class="nav-item" href="../simulations/index.html">🔬 Microscopic Animations</a>
                    <a class="nav-item" href="../qa-practice/index.html">⚡ HKDSE Types Quiz Generator</a>
                    <a class="nav-item" href="../ai-assistant/index.html">🤖 AI Chemistry Tutor</a>
                    <a class="nav-item" href="../notes/index.html">📝 Personal Note Record</a>
                </nav>`;
            layout.prepend(sidebar);

            const topBar = document.createElement('header');
            topBar.className = 'top-bar';
            topBar.innerHTML = `
                <div class="settings-dropdown">
                    <button id="settingsBtn" class="btn-settings" type="button">⚙️ Settings</button>
                    <div id="settingsMenu" class="dropdown-content hidden">
                        <div class="theme-toggle"><span>Theme:</span><button id="lightThemeBtn" type="button">☀️ Light</button><button id="darkThemeBtn" type="button">🌙 Dark</button></div>
                        <button id="helpBtn" class="dropdown-item" type="button">📚 Help & Support</button>
                        <button id="logoutBtn" class="dropdown-item danger" type="button">🚪 Log Out</button>
                    </div>
                </div>`;
            content.prepend(topBar);
        }
        setupSettingsControls();
        return;
    }

    const legacyHeader = document.body.firstElementChild;
    if (legacyHeader && legacyHeader.querySelector('.nav-pill')) {
        legacyHeader.remove();
    }

    const header = document.createElement('header');
    header.className = 'navbar';
    header.innerHTML = `
        <div class="nav-brand">🧪 DSE Chem Hub</div>
        <nav class="nav-links">
            <a href="../dashboard/index.html" class="nav-item">Dashboard</a>
            <a href="../simulations/index.html" class="nav-item">Simulations</a>
            <a href="../ai-assistant/index.html" class="nav-item">AI Marking</a>
            <a href="../qa-practice/index.html" class="nav-item">Quiz Generator</a>
            <a href="../notes/index.html" class="nav-item">Notes</a>
        </nav>
        <div class="nav-actions">
            <div class="settings-dropdown">
                <button id="settingsBtn" class="btn-settings" type="button">⚙️ Settings</button>
                <div id="settingsMenu" class="dropdown-content hidden">
                    <div class="theme-toggle"><span>Theme:</span><button id="lightThemeBtn" type="button">☀️ Light</button><button id="darkThemeBtn" type="button">🌙 Dark</button></div>
                    <button id="helpBtn" class="dropdown-item" type="button">📚 Help & Support</button>
                    <button id="logoutBtn" class="dropdown-item danger" type="button">🚪 Log Out</button>
                </div>
            </div>
        </div>`;
    document.body.prepend(header);

    setupSettingsControls();
}

function setupSettingsControls() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    if (!settingsBtn || !settingsMenu) return;

    settingsBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        settingsMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', () => settingsMenu.classList.add('hidden'));
    document.getElementById('lightThemeBtn').addEventListener('click', () => setTheme('light'));
    document.getElementById('darkThemeBtn').addEventListener('click', () => setTheme('dark'));
    document.getElementById('helpBtn').addEventListener('click', () => alert('DSE Chem Hub Help & Support'));
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    setTheme(localStorage.getItem('theme') || 'light');
}

function setTheme(theme) {
    document.documentElement.toggleAttribute('data-theme', theme === 'dark');
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme !== 'dark');
    localStorage.setItem('theme', theme);
}

function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('dse_user_token');
        localStorage.removeItem('dse_user_name');
        localStorage.removeItem('dse_session_id');
        window.location.href = '../index.html'; // Redirect to login page
    }
}

// Store username from login form
function saveUserSession(username, token = 'session_token') {
    localStorage.setItem('dse_user_name', username);
    localStorage.setItem('dse_user_token', token);
    localStorage.setItem('dse_session_id', Date.now().toString());
}

// Check if user is authenticated
function isUserAuthenticated() {
    return !!localStorage.getItem('dse_user_token');
}

// Get current username
function getCurrentUsername() {
    return localStorage.getItem('dse_user_name') || 'Guest User';
}
