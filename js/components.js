// Shared UI Components & Constants
const STATUS_CONFIG = {
  draft: { label: 'Draft', color: '#9AA0A6' },
  submitted: { label: 'Submitted', color: '#1967D2' },
  it_review: { label: 'IT Review', color: '#1967D2' },
  arch_review: { label: 'Architecture Review', color: '#7B1FA2' },
  finance_review: { label: 'Finance Review', color: '#F9AB00' },
  legal_review: { label: 'Legal Review', color: '#00897B' },
  ceo_review: { label: 'CEO Review', color: '#D4AF37' },
  approved: { label: 'Approved', color: '#2D5A3D' },
  rejected: { label: 'Rejected', color: '#D93025' },
  changes_requested: { label: 'Changes Requested', color: '#FF8F00' },
  deferred: { label: 'Deferred', color: '#5F6368' }
};

const WORKFLOW_STAGES = ['submitted', 'it_review', 'arch_review', 'finance_review', 'legal_review', 'ceo_review'];

const STAGE_TO_ROLE = {
  it_review: 'it_team',
  arch_review: 'arch_board',
  finance_review: 'finance',
  legal_review: 'legal',
  ceo_review: 'ceo'
};

const NEXT_STAGE = {
  submitted: 'it_review',
  it_review: 'arch_review',
  arch_review: 'finance_review',
  finance_review: 'legal_review',
  legal_review: 'ceo_review'
};

const Components = {

  renderAppShell(contentHtml) {
    const session = Auth.getSession();
    if (!session) return contentHtml;
    const sidebarItems = this.getSidebarItems(session.role);
    const currentRoute = Router.getCurrentRoute().route;
    const unreadCount = DataStore.getUnreadCount(session.userId, session.role);

    return `
      <div class="app-shell" style="display:flex;min-height:100vh;font-family:'Inter',sans-serif;">
        <!-- Sidebar -->
        <aside class="sidebar" style="width:250px;background:linear-gradient(180deg,#0a3d0a 0%,#1a5c1a 100%);color:#fff;display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100;">
          <div style="padding:24px 20px 20px;border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="font-size:28px;text-align:center;margin-bottom:4px;">&#9881;&#65039;</div>
            <h1 style="font-size:18px;font-weight:700;color:#D4AF37;letter-spacing:3px;text-align:center;margin:0;">PETROLUBE</h1>
            <p style="font-size:10px;color:rgba(255,255,255,0.6);text-align:center;margin:4px 0 0;letter-spacing:1px;">Innovation Pipeline</p>
          </div>
          <nav style="flex:1;padding:16px 0;overflow-y:auto;">
            ${sidebarItems.map(item => {
              const isActive = currentRoute === item.hash;
              return `<a href="${item.hash}" style="display:flex;align-items:center;padding:11px 20px;color:${isActive ? '#D4AF37' : 'rgba(255,255,255,0.8)'};text-decoration:none;font-size:14px;font-weight:${isActive ? '600' : '400'};background:${isActive ? 'rgba(212,175,55,0.12)' : 'transparent'};border-left:3px solid ${isActive ? '#D4AF37' : 'transparent'};transition:all 0.15s;">
                <span style="margin-right:10px;font-size:16px;">${item.icon}</span>${item.label}
              </a>`;
            }).join('')}
          </nav>
          <div style="padding:16px 20px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:rgba(255,255,255,0.3);text-align:center;">v1.3.26</div>
        </aside>

        <!-- Main Area -->
        <div style="flex:1;margin-left:250px;display:flex;flex-direction:column;min-height:100vh;background:#f5f6fa;">
          <!-- Header -->
          <header style="height:60px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 28px;position:sticky;top:0;z-index:90;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size:15px;color:#374151;font-weight:500;">
              ${this._getPageTitle(currentRoute)}
            </div>
            <div style="display:flex;align-items:center;gap:16px;">
              <!-- Notification Bell -->
              <div class="notification-bell" onclick="NotificationManager.toggleDropdown()" style="position:relative;cursor:pointer;font-size:20px;padding:4px;">
                &#128276;
                ${unreadCount > 0 ? `<span class="notif-badge" style="position:absolute;top:-2px;right:-4px;background:#D93025;color:#fff;font-size:10px;font-weight:700;min-width:16px;height:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 4px;">${unreadCount}</span>` : ''}
              </div>
              <!-- Settings -->
              <span style="cursor:pointer;font-size:18px;" onclick="window.location.hash='#admin'" title="Settings">&#9881;&#65039;</span>
              <!-- User Info -->
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0a3d0a,#1a5c1a);color:#D4AF37;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">${session.displayName.split(' ').map(w => w[0]).join('').substring(0, 2)}</div>
                <div>
                  <div style="font-size:13px;font-weight:600;color:#1a1a1a;">${this._escapeHtml(session.displayName)}</div>
                  <div style="font-size:11px;color:#6b7280;">${Auth.getRoleLabel(session.role)}</div>
                </div>
              </div>
              <!-- Logout -->
              <button onclick="Auth.logout()" style="background:none;border:1px solid #e5e7eb;border-radius:6px;padding:6px 12px;font-size:12px;color:#6b7280;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.15s;" onmouseover="this.style.borderColor='#D93025';this.style.color='#D93025'" onmouseout="this.style.borderColor='#e5e7eb';this.style.color='#6b7280'">Logout</button>
            </div>
          </header>

          <!-- Content -->
          <main style="flex:1;padding:28px;">
            ${contentHtml}
          </main>
        </div>
      </div>
    `;
  },

  _getPageTitle(route) {
    const titles = {
      '#dashboard': 'Dashboard',
      '#new-idea': 'New Idea',
      '#my-ideas': 'My Ideas',
      '#idea-detail': 'Idea Details',
      '#review-queue': 'Review Queue',
      '#review': 'Review',
      '#portfolio': 'Portfolio Overview',
      '#admin': 'Administration'
    };
    return titles[route] || 'Dashboard';
  },

  getSidebarItems(role) {
    const items = [
      { hash: '#dashboard', icon: '\uD83D\uDCCA', label: 'Dashboard' },
      { hash: '#new-idea', icon: '\uD83D\uDCA1', label: 'New Idea' },
      { hash: '#my-ideas', icon: '\uD83D\uDCCB', label: 'My Ideas' }
    ];
    if (['it_team', 'arch_board', 'finance', 'legal', 'ceo'].includes(role)) {
      items.push({ hash: '#review-queue', icon: '\uD83D\uDCDD', label: 'Review Queue' });
    }
    if (role === 'ceo') {
      items.push({ hash: '#portfolio', icon: '\uD83D\uDCC8', label: 'Portfolio' });
      items.push({ hash: '#admin', icon: '\uD83D\uDC64', label: 'Admin' });
    }
    return items;
  },

  renderStatusBadge(status) {
    const cfg = STATUS_CONFIG[status] || { label: status, color: '#9AA0A6' };
    return `<span class="status-badge status-badge--${status}" style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;color:#fff;background:${cfg.color};white-space:nowrap;">${cfg.label}</span>`;
  },

  renderPriorityBadge(priority) {
    const colors = { p1_critical: '#D93025', p2_high: '#F9AB00', p3_medium: '#1967D2', p4_low: '#9AA0A6' };
    const labels = { p1_critical: 'P1', p2_high: 'P2', p3_medium: 'P3', p4_low: 'P4' };
    const color = colors[priority] || '#9AA0A6';
    const label = labels[priority] || priority || '--';
    return `<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;color:#fff;background:${color};">${label}</span>`;
  },

  renderWorkflowProgressBar(currentStatus, reviews) {
    const stages = [
      { key: 'submitted', label: 'Submitted' },
      { key: 'it_review', label: 'IT' },
      { key: 'arch_review', label: 'Architecture' },
      { key: 'finance_review', label: 'Finance' },
      { key: 'legal_review', label: 'Legal' },
      { key: 'ceo_review', label: 'CEO' },
      { key: 'decision', label: 'Decision' }
    ];
    const reviewData = reviews || {};
    const terminalStatuses = ['approved', 'rejected', 'deferred'];
    const isTerminal = terminalStatuses.includes(currentStatus);
    const currentIdx = stages.findIndex(s => s.key === currentStatus);

    const stepsHtml = stages.map((stage, idx) => {
      let state = 'future';
      if (isTerminal) {
        if (idx < stages.length - 1) {
          state = 'completed';
        } else {
          state = currentStatus === 'approved' ? 'completed' : (currentStatus === 'rejected' ? 'rejected' : 'deferred');
        }
      } else if (stage.key === currentStatus) {
        state = 'active';
      } else if (currentIdx > -1 && idx < currentIdx) {
        state = 'completed';
      } else if (reviewData[stage.key]) {
        state = 'completed';
      }

      const bgColors = { completed: '#2D5A3D', active: '#1967D2', future: '#e0e0e0', rejected: '#D93025', deferred: '#5F6368' };
      const textColors = { completed: '#fff', active: '#fff', future: '#9AA0A6', rejected: '#fff', deferred: '#fff' };
      const bg = bgColors[state];
      const tc = textColors[state];
      const icon = state === 'completed' ? '\u2713' : (state === 'rejected' ? '\u2717' : (idx + 1));
      const lineColor = (state === 'completed' || state === 'rejected' || state === 'deferred') ? bg : '#e0e0e0';

      return `
        <div style="display:flex;align-items:center;flex:${idx < stages.length - 1 ? '1' : '0'};">
          <div style="display:flex;flex-direction:column;align-items:center;min-width:60px;">
            <div style="width:28px;height:28px;border-radius:50%;background:${bg};color:${tc};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">${icon}</div>
            <div style="font-size:10px;color:${state === 'active' ? '#1967D2' : '#6b7280'};margin-top:4px;font-weight:${state === 'active' ? '600' : '400'};white-space:nowrap;">${stage.label}</div>
          </div>
          ${idx < stages.length - 1 ? `<div style="flex:1;height:3px;background:${lineColor};margin:0 4px;border-radius:2px;margin-bottom:18px;"></div>` : ''}
        </div>
      `;
    }).join('');

    return `<div style="display:flex;align-items:flex-start;padding:16px 8px;">${stepsHtml}</div>`;
  },

  renderRoleBadge(role) {
    const color = Auth.getRoleColor(role);
    const label = Auth.getRoleLabel(role);
    return `<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;color:#fff;background:${color};">${label}</span>`;
  },

  formatDate(isoString) {
    if (!isoString) return '--';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  formatDateTime(isoString) {
    if (!isoString) return '--';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  },

  formatSAR(number) {
    if (number === null || number === undefined || isNaN(number)) return 'SAR --';
    const num = parseFloat(number);
    if (Math.abs(num) >= 1000) return 'SAR ' + (num / 1000).toFixed(1) + 'B';
    if (Math.abs(num) >= 1) return 'SAR ' + num.toFixed(1) + 'M';
    return 'SAR ' + (num * 1000).toFixed(0) + 'K';
  },

  renderModal(title, bodyHtml, footerHtml) {
    return `
      <div class="modal-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;" onclick="if(event.target===this)this.remove()">
        <div style="background:#fff;border-radius:12px;width:90%;max-width:600px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
          <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;">
            <h3 style="margin:0;font-size:18px;font-weight:600;color:#1a1a1a;">${title}</h3>
            <button onclick="this.closest('.modal-overlay').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;padding:4px;">&times;</button>
          </div>
          <div style="padding:24px;overflow-y:auto;flex:1;">${bodyHtml}</div>
          ${footerHtml ? `<div style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:10px;">${footerHtml}</div>` : ''}
        </div>
      </div>
    `;
  },

  renderEmptyState(message, icon) {
    return `
      <div style="text-align:center;padding:60px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">${icon || '\uD83D\uDCED'}</div>
        <p style="font-size:15px;color:#6b7280;margin:0;">${message || 'No items found'}</p>
      </div>
    `;
  },

  renderLoading(message) {
    return `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;">
        <div style="text-align:center;">
          <div style="width:40px;height:40px;border:4px solid #e0e0e0;border-top-color:#1967D2;border-radius:50%;animation:comp-spin 0.8s linear infinite;margin:0 auto 16px;"></div>
          <p style="font-size:14px;color:#374151;margin:0;">${message || 'Loading...'}</p>
          <style>@keyframes comp-spin{to{transform:rotate(360deg)}}</style>
        </div>
      </div>
    `;
  },

  _escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
