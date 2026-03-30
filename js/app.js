// ─── LoginPage ────────────────────────────────────────────────────────────────
// Defined here because index.html does not load js/components/login.js directly.
// Guarded so it won't overwrite if LoginPage is already available.
if (typeof LoginPage === 'undefined') {
  var LoginPage = {

    render() {
      return `
        <div class="login-page" style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a3d0a 0%, #1a5c1a 40%, #0d4d2b 70%, #062d06 100%);
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        ">
          <!-- Background decorative circles -->
          <div style="
            position: absolute; top: -100px; right: -100px;
            width: 350px; height: 350px;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.06);
            pointer-events: none;
          "></div>
          <div style="
            position: absolute; bottom: -140px; left: -80px;
            width: 450px; height: 450px;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.04);
            pointer-events: none;
          "></div>
          <div style="
            position: absolute; top: 40%; left: -60px;
            width: 200px; height: 200px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.02);
            pointer-events: none;
          "></div>

          <div style="
            width: 100%; max-width: 430px;
            padding: 20px;
          ">
            <!-- Branding Header -->
            <div style="text-align: center; margin-bottom: 36px;">
              <div style="font-size: 52px; margin-bottom: 10px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));">
                \u2699\uFE0F
              </div>
              <h1 style="
                font-size: 40px; font-weight: 700;
                color: #D4AF37;
                letter-spacing: 6px;
                margin: 0 0 10px 0;
                text-shadow: 0 2px 10px rgba(0,0,0,0.35);
              ">PETROLUBE</h1>
              <p style="
                color: rgba(255,255,255,0.85);
                font-size: 15px; font-weight: 400;
                letter-spacing: 1.5px; margin: 0;
              ">Innovation Pipeline System</p>
              <div style="
                width: 60px; height: 2px;
                background: linear-gradient(90deg, transparent, #D4AF37, transparent);
                margin: 14px auto 0 auto;
              "></div>
            </div>

            <!-- Login Card -->
            <div id="login-card" style="
              background: #ffffff;
              border-radius: 14px;
              box-shadow: 0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,175,55,0.08);
              padding: 40px 34px 30px 34px;
            ">
              <h2 style="
                margin: 0 0 6px 0;
                font-size: 21px; font-weight: 600;
                color: #1a1a1a; text-align: center;
              ">Welcome Back</h2>
              <p style="
                margin: 0 0 26px 0;
                font-size: 13px; color: #6b7280;
                text-align: center;
              ">Sign in to access the innovation pipeline</p>

              <!-- Error Message -->
              <div id="login-error" style="
                display: none;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 10px 14px;
                margin-bottom: 20px;
                color: #b91c1c;
                font-size: 13px;
                text-align: center;
              ">
                Invalid username or password.
              </div>

              <!-- Username Field -->
              <div style="margin-bottom: 18px;">
                <label for="login-username" style="
                  display: block;
                  font-size: 13px; font-weight: 500;
                  color: #374151;
                  margin-bottom: 6px;
                ">Username</label>
                <div style="position: relative;">
                  <span style="
                    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
                    font-size: 15px; color: #9ca3af; pointer-events: none;
                  ">\uD83D\uDC64</span>
                  <input type="text" id="login-username" autocomplete="username" placeholder="Enter your username" style="
                    width: 100%; box-sizing: border-box;
                    padding: 11px 14px 11px 38px;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: 'Inter', sans-serif;
                    color: #111827;
                    background: #fafafa;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                  " onfocus="this.style.borderColor='#D4AF37';this.style.boxShadow='0 0 0 3px rgba(212,175,55,0.12)';this.style.background='#fff'"
                     onblur="this.style.borderColor='#e5e7eb';this.style.boxShadow='none';this.style.background='#fafafa'">
                </div>
              </div>

              <!-- Password Field -->
              <div style="margin-bottom: 26px;">
                <label for="login-password" style="
                  display: block;
                  font-size: 13px; font-weight: 500;
                  color: #374151;
                  margin-bottom: 6px;
                ">Password</label>
                <div style="position: relative;">
                  <span style="
                    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
                    font-size: 15px; color: #9ca3af; pointer-events: none;
                  ">\uD83D\uDD12</span>
                  <input type="password" id="login-password" autocomplete="current-password" placeholder="Enter your password" style="
                    width: 100%; box-sizing: border-box;
                    padding: 11px 14px 11px 38px;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: 'Inter', sans-serif;
                    color: #111827;
                    background: #fafafa;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                  " onfocus="this.style.borderColor='#D4AF37';this.style.boxShadow='0 0 0 3px rgba(212,175,55,0.12)';this.style.background='#fff'"
                     onblur="this.style.borderColor='#e5e7eb';this.style.boxShadow='none';this.style.background='#fafafa'">
                </div>
              </div>

              <!-- Login Button -->
              <button id="login-btn" style="
                width: 100%;
                padding: 12px 0;
                background: linear-gradient(135deg, #D4AF37 0%, #c5a028 100%);
                color: #1a1a1a;
                font-size: 15px;
                font-weight: 600;
                font-family: 'Inter', sans-serif;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: transform 0.15s, box-shadow 0.15s;
                box-shadow: 0 2px 10px rgba(212,175,55,0.3);
                letter-spacing: 0.5px;
              " onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 16px rgba(212,175,55,0.4)'"
                 onmouseout="this.style.transform='none';this.style.boxShadow='0 2px 10px rgba(212,175,55,0.3)'">
                Sign In
              </button>
            </div>

            <!-- Demo Accounts Collapsible Section -->
            <div style="margin-top: 26px;">
              <button id="demo-accounts-toggle" style="
                display: flex; align-items: center; justify-content: center;
                width: 100%; background: none; border: none;
                color: rgba(255,255,255,0.5);
                font-size: 12px; font-family: 'Inter', sans-serif;
                cursor: pointer; padding: 6px 0;
                transition: color 0.2s;
                letter-spacing: 0.3px;
              " onmouseover="this.style.color='rgba(255,255,255,0.85)'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">
                <span id="demo-toggle-icon" style="margin-right: 6px; transition: transform 0.25s; font-size: 10px;">&#9654;</span>
                Demo Accounts
              </button>
              <div id="demo-accounts-panel" style="
                display: none;
                background: rgba(0,0,0,0.28);
                border-radius: 10px;
                padding: 16px 18px;
                margin-top: 8px;
                backdrop-filter: blur(6px);
                border: 1px solid rgba(255,255,255,0.06);
              ">
                <p style="color: rgba(255,255,255,0.45); font-size: 11px; margin: 0 0 12px 0; text-align: center;">
                  All accounts use password: <span style="color: #D4AF37; font-weight: 600;">pass123</span>
                </p>
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                  <tbody>
                    ${this._renderDemoRow('employee', 'Ahmed Al-Zahrani', 'Employee', '\uD83D\uDC64')}
                    ${this._renderDemoRow('itadmin', 'Khalid Ibrahim', 'IT Team', '\uD83D\uDCBB')}
                    ${this._renderDemoRow('architect', 'Layla Hassan', 'Arch. Board', '\uD83C\uDFD7\uFE0F')}
                    ${this._renderDemoRow('finance', 'John Sliedregt', 'Finance', '\uD83D\uDCB0')}
                    ${this._renderDemoRow('legal', 'Fatima Al-Rashid', 'Legal', '\u2696\uFE0F')}
                    ${this._renderDemoRow('ceo', 'Salman Saadat', 'CEO', '\uD83D\uDC51')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Footer -->
            <p style="
              text-align: center;
              color: rgba(255,255,255,0.25);
              font-size: 11px;
              margin-top: 30px;
              letter-spacing: 0.3px;
            ">\u00A9 2026 Petrolube \u00B7 Innovation Pipeline v1.3</p>
          </div>

          <style>
            @keyframes loginShake {
              0%, 100% { transform: translateX(0); }
              15% { transform: translateX(-8px); }
              30% { transform: translateX(7px); }
              45% { transform: translateX(-6px); }
              60% { transform: translateX(5px); }
              75% { transform: translateX(-3px); }
              90% { transform: translateX(2px); }
            }
            .login-shake {
              animation: loginShake 0.5s ease-in-out;
            }
            @keyframes loginFadeIn {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            #login-card {
              animation: loginFadeIn 0.4s ease-out;
            }
          </style>
        </div>
      `;
    },

    _renderDemoRow(username, displayName, role, icon) {
      return `
        <tr>
          <td style="padding: 5px 6px; font-size: 13px; width: 22px;">${icon}</td>
          <td style="padding: 5px 6px; color: #D4AF37; font-weight: 500; cursor: pointer; white-space: nowrap;"
              class="demo-user-btn" data-username="${username}"
              onmouseover="this.style.textDecoration='underline'"
              onmouseout="this.style.textDecoration='none'">
            ${username}
          </td>
          <td style="padding: 5px 6px; color: rgba(255,255,255,0.6); font-size: 11px;">${displayName}</td>
          <td style="padding: 5px 6px; color: rgba(255,255,255,0.4); text-align: right; font-size: 10px; letter-spacing: 0.3px;">${role}</td>
        </tr>
      `;
    },

    afterRender() {
      const usernameInput = document.getElementById('login-username');
      const passwordInput = document.getElementById('login-password');
      const loginBtn = document.getElementById('login-btn');
      const errorDiv = document.getElementById('login-error');
      const toggleBtn = document.getElementById('demo-accounts-toggle');
      const panel = document.getElementById('demo-accounts-panel');
      const toggleIcon = document.getElementById('demo-toggle-icon');

      if (!loginBtn) return;

      // Login handler
      const doLogin = () => {
        const username = (usernameInput.value || '').trim();
        const password = (passwordInput.value || '').trim();

        if (!username || !password) {
          this._showError(errorDiv, 'Please enter both username and password.');
          return;
        }

        const result = Auth.login(username, password);
        // Auth.login returns { success: true/false, ... }
        if (result && result.success) {
          errorDiv.style.display = 'none';
          window.location.hash = '#dashboard';
        } else {
          this._showError(errorDiv, 'Invalid username or password.');
          const card = document.getElementById('login-card');
          if (card) {
            card.classList.remove('login-shake');
            void card.offsetWidth;
            card.classList.add('login-shake');
          }
        }
      };

      loginBtn.addEventListener('click', doLogin);

      passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doLogin();
      });

      usernameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') passwordInput.focus();
      });

      // Demo accounts toggle
      let panelOpen = false;
      toggleBtn.addEventListener('click', () => {
        panelOpen = !panelOpen;
        panel.style.display = panelOpen ? 'block' : 'none';
        toggleIcon.style.transform = panelOpen ? 'rotate(90deg)' : 'rotate(0deg)';
      });

      // Demo user quick-fill buttons
      document.querySelectorAll('.demo-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          usernameInput.value = btn.getAttribute('data-username');
          passwordInput.value = 'pass123';
          usernameInput.style.borderColor = '#D4AF37';
          passwordInput.style.borderColor = '#D4AF37';
          setTimeout(() => {
            usernameInput.style.borderColor = '#e5e7eb';
            passwordInput.style.borderColor = '#e5e7eb';
          }, 800);
        });
      });

      // Focus username on load
      setTimeout(() => usernameInput.focus(), 100);
    },

    _showError(el, msg) {
      if (!el) return;
      el.textContent = msg;
      el.style.display = 'block';
    }
  };
}


// ─── AdminPage ────────────────────────────────────────────────────────────────
// Simple user-management and AI settings page for the CEO role.
const AdminPage = {
  render() {
    const session = Auth.getSession();
    if (!session || session.role !== 'ceo') {
      return Components.renderAppShell('<p>Access denied</p>');
    }

    const users = DataStore.getUsers();

    const content = `
      <div>
        <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;">Administration</h2>

        <!-- API Key Settings -->
        <div style="background:#fff;border-radius:10px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.06);margin-bottom:24px;">
          <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;">AI Settings</h3>
          <p style="font-size:13px;color:#6b7280;margin:0 0 12px;">Configure the Anthropic API key for AI-powered dossier generation.</p>
          <button onclick="AIModule.showSettingsModal()" style="padding:8px 18px;background:linear-gradient(135deg,#667EEA,#764BA2);border:none;border-radius:8px;color:#fff;font-weight:600;font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;">Configure API Key</button>
        </div>

        <!-- User Management -->
        <div style="background:#fff;border-radius:10px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;">User Management</h3>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="border-bottom:2px solid #e5e7eb;">
                  <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;">Name</th>
                  <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;">Username</th>
                  <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;">Role</th>
                  <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;">Email</th>
                  <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;">Department</th>
                </tr>
              </thead>
              <tbody>
                ${users.map((u, idx) => `
                  <tr style="border-bottom:1px solid #f3f4f6;${idx % 2 ? 'background:#f9fafb;' : ''}">
                    <td style="padding:10px 12px;font-weight:500;">${Components._escapeHtml(u.displayName)}</td>
                    <td style="padding:10px 12px;color:#6b7280;">${Components._escapeHtml(u.username)}</td>
                    <td style="padding:10px 12px;">${Components.renderRoleBadge(u.role)}</td>
                    <td style="padding:10px 12px;color:#6b7280;">${Components._escapeHtml(u.email || '')}</td>
                    <td style="padding:10px 12px;color:#6b7280;">${Components._escapeHtml(u.department || '')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    return Components.renderAppShell(content);
  },

  afterRender() {
    // No dynamic behaviour needed after render
  }
};


// ─── App ──────────────────────────────────────────────────────────────────────
// Main application entry point.  Loaded LAST after every other module.
const App = {

  init() {
    // 1. Initialise the data layer (seeds demo users on first visit)
    DataStore.init();

    // 2. Register the full component map on the router so _renderPage can
    //    resolve every page name.  This keeps the router file itself free of
    //    page-object imports while guaranteeing LoginPage and AdminPage
    //    (both defined in this file) are included.
    this._registerComponents();

    // 3. Boot the router (attaches hashchange listener and renders the
    //    current route, which will redirect to #login if unauthenticated).
    Router.init();
  },

  // Overwrite Router._renderPage with a version that uses the authoritative
  // component map assembled here in app.js.  This is the single place where
  // every page object is wired to its route name.
  _registerComponents() {
    const componentMap = {
      'Login':       typeof LoginPage       !== 'undefined' ? LoginPage       : null,
      'Dashboard':   typeof DashboardPage   !== 'undefined' ? DashboardPage   : null,
      'IdeaForm':    typeof IdeaFormPage     !== 'undefined' ? IdeaFormPage    : null,
      'MyIdeas':     typeof MyIdeasPage      !== 'undefined' ? MyIdeasPage     : null,
      'IdeaDetail':  typeof IdeaDetailPage   !== 'undefined' ? IdeaDetailPage  : null,
      'ReviewQueue': typeof ReviewQueuePage  !== 'undefined' ? ReviewQueuePage : null,
      'ReviewPanel': typeof ReviewPanelPage  !== 'undefined' ? ReviewPanelPage : null,
      'Portfolio':   typeof PortfolioPage    !== 'undefined' ? PortfolioPage   : null,
      'Admin':       typeof AdminPage        !== 'undefined' ? AdminPage       : null
    };

    Router._renderPage = function (componentName, param) {
      const appEl = document.getElementById('app');
      if (!appEl) return;

      const page = componentMap[componentName];

      if (page && page.render) {
        appEl.innerHTML = page.render(param);
        if (page.afterRender) {
          // Defer afterRender so the freshly-injected DOM is queryable
          setTimeout(() => page.afterRender(param), 0);
        }
      } else {
        appEl.innerHTML = '<div style="text-align:center;padding:60px;color:#6b7280;">Page not found</div>';
      }
    };
  }
};


// ─── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
