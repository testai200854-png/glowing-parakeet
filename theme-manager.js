/**
 * Theme Manager & Settings Menu
 * Handles Dark/Light mode toggling, Help & Support modal, and Log Out
 */

class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    // Apply saved theme on page load
    this.applyTheme(this.theme);
    
    // Setup Settings button
    this.setupSettingsMenu();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const settingsMenu = document.getElementById('settingsMenu');
      const settingsBtn = document.getElementById('settingsBtn');
      if (settingsMenu && settingsBtn && !settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
        settingsMenu.classList.add('hidden');
      }
    });
  }

  setupSettingsMenu() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    if (!settingsBtn || !settingsMenu) return;

    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsMenu.classList.toggle('hidden');
    });

    // Setup menu options
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    lightThemeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTheme('light');
      settingsMenu.classList.add('hidden');
    });
    darkThemeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTheme('dark');
      settingsMenu.classList.add('hidden');
    });

    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showHelpModal();
        settingsMenu.classList.add('hidden');
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    // Update theme buttons display based on current theme
    this.updateThemeButtonStates();
  }

  switchTheme(newTheme) {
    this.theme = newTheme;
    this.applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    this.updateThemeButtonStates();
  }

  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }

  updateThemeButtonStates() {
    const lightBtn = document.getElementById('lightThemeBtn');
    const darkBtn = document.getElementById('darkThemeBtn');

    if (lightBtn && darkBtn) {
      if (this.theme === 'dark') {
        darkBtn.classList.add('active');
        lightBtn.classList.remove('active');
      } else {
        lightBtn.classList.add('active');
        darkBtn.classList.remove('active');
      }
    }
  }

  showHelpModal() {
    let modal = document.getElementById('help-modal');
    if (!modal) {
      modal = this.createHelpModal();
      document.body.appendChild(modal);
    }
    modal.classList.add('open');

    // Close modal on close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }

  createHelpModal() {
    const modal = document.createElement('div');
    modal.id = 'help-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <span>📚 Help & Support</span>
          <button class="modal-close" aria-label="Close">×</button>
        </div>

        <div class="modal-section">
          <h3>🔬 DSE Chemistry Hub</h3>
          <p>A comprehensive platform for exploring HKDSE Chemistry concepts through interactive simulations, AI marking, practice quizzes, and personal notes archive.</p>
        </div>

        <div class="modal-section">
          <h3>📖 How to Use</h3>
          <ul>
            <li><strong>Microscopic Animations:</strong> Watch visual simulations of chemical reactions like substitution, polymerization, and dissolution.</li>
            <li><strong>AI Marking Assistant:</strong> Submit chemistry questions and get AI-powered HKEAA exam feedback.</li>
            <li><strong>Quiz Generator:</strong> Generate authentic HKDSE exam-style questions aligned to Paper 1A, 1B, 2, and syllabi patterns.</li>
            <li><strong>Notes:</strong> Save, archive, and review your graded chemistry questions, marking schemes, and personal notes.</li>
          </ul>
        </div>

        <div class="modal-section">
          <h3>💡 Tips for Learning</h3>
          <ul>
            <li>Use animations to understand reaction mechanisms step-by-step.</li>
            <li>Use the AI Marking Assistant to get detailed feedback on your answers.</li>
            <li>Generate practice quizzes regularly to reinforce key concepts.</li>
            <li>Review saved notes and mark schemes in the Notes tab to understand what examiners look for.</li>
          </ul>
        </div>

        <div class="modal-section">
          <h3>⚙️ Settings</h3>
          <p><strong>Theme:</strong> Toggle between Light and Dark modes for comfortable viewing in any lighting condition.</p>
          <p><strong>Language:</strong> Interface supports both English and Traditional Chinese (繁體中文).</p>
        </div>

        <div class="modal-section">
          <h3>❓ Troubleshooting</h3>
          <ul>
            <li><strong>Animations not loading:</strong> Ensure JavaScript is enabled and try refreshing the page.</li>
            <li><strong>AI Marking not working:</strong> Check that your API key is valid and properly configured.</li>
            <li><strong>Questions not generating:</strong> Clear your browser cache and try again.</li>
          </ul>
        </div>

        <div class="modal-section">
          <h3>📧 Contact</h3>
          <p>For bug reports or feature requests, please contact the development team or open an issue in the project repository.</p>
        </div>
      </div>
    `;

    return modal;
  }

  logout() {
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = '../index.html';
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
  });
} else {
  new ThemeManager();
}
