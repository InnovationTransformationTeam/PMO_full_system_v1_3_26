// Notification System
const NotificationManager = {

  // Stage-to-role mapping
  STAGE_ROLE_MAP: {
    it_review: 'it_team',
    arch_review: 'arch_board',
    finance_review: 'finance',
    legal_review: 'legal',
    ceo_review: 'ceo'
  },

  // Stage display labels
  STAGE_LABELS: {
    it_review: 'IT Review',
    arch_review: 'Architecture Board Review',
    finance_review: 'Finance Review',
    legal_review: 'Legal Review',
    ceo_review: 'CEO Review'
  },

  // Notification type icons
  TYPE_ICONS: {
    new_submission: '\u{1F4E5}',
    stage_forwarded: '\u{1F4CB}',
    changes_requested: '\u{1F504}',
    rejected: '\u{274C}',
    approved: '\u{2705}',
    deferred: '\u{23F0}',
    resubmitted: '\u{1F4E8}'
  },

  // ─── Workflow Event Notifiers ─────────────────────────────

  notifyIdeaSubmitted(idea) {
    const submitter = DataStore.getUserById(idea.submitterId);
    const submitterName = submitter ? submitter.displayName : 'Unknown';
    const ideaName = (idea.criteria && idea.criteria.c02_initiative_name) || 'Untitled';

    DataStore.addNotification({
      targetUserId: null,
      targetRole: 'it_team',
      ideaId: idea.id,
      type: 'new_submission',
      message: `New idea submitted: ${ideaName} by ${submitterName}`,
      read: false
    });
  },

  notifyStageForwarded(idea, nextStage) {
    const targetRole = this.STAGE_ROLE_MAP[nextStage];
    if (!targetRole) return;

    const ideaName = (idea.criteria && idea.criteria.c02_initiative_name) || 'Untitled';

    DataStore.addNotification({
      targetUserId: null,
      targetRole: targetRole,
      ideaId: idea.id,
      type: 'stage_forwarded',
      message: `Idea "${ideaName}" ready for your review`,
      read: false
    });
  },

  notifyChangesRequested(idea, reviewerRole) {
    const ideaName = (idea.criteria && idea.criteria.c02_initiative_name) || 'Untitled';
    const roleLabel = Auth.getRoleLabel(reviewerRole);

    DataStore.addNotification({
      targetUserId: idea.submitterId,
      targetRole: null,
      ideaId: idea.id,
      type: 'changes_requested',
      message: `Changes requested on "${ideaName}" by ${roleLabel}`,
      read: false
    });
  },

  notifyRejected(idea, stage) {
    const ideaName = (idea.criteria && idea.criteria.c02_initiative_name) || 'Untitled';
    const stageLabel = this.STAGE_LABELS[stage] || stage;

    DataStore.addNotification({
      targetUserId: idea.submitterId,
      targetRole: null,
      ideaId: idea.id,
      type: 'rejected',
      message: `Idea "${ideaName}" was rejected at ${stageLabel}`,
      read: false
    });
  },

  notifyApproved(idea) {
    const ideaName = (idea.criteria && idea.criteria.c02_initiative_name) || 'Untitled';

    DataStore.addNotification({
      targetUserId: idea.submitterId,
      targetRole: null,
      ideaId: idea.id,
      type: 'approved',
      message: `Your idea "${ideaName}" has been approved!`,
      read: false
    });
  },

  notifyDeferred(idea, deferDate) {
    const ideaName = (idea.criteria && idea.criteria.c02_initiative_name) || 'Untitled';
    const formattedDate = deferDate ? new Date(deferDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'a future date';

    DataStore.addNotification({
      targetUserId: idea.submitterId,
      targetRole: null,
      ideaId: idea.id,
      type: 'deferred',
      message: `Idea "${ideaName}" deferred until ${formattedDate}`,
      read: false
    });
  },

  notifyResubmitted(idea, targetStage) {
    const ideaName = (idea.criteria && idea.criteria.c02_initiative_name) || 'Untitled';
    const targetRole = this.STAGE_ROLE_MAP[targetStage];

    // Notify the reviewer role for the target stage
    if (targetRole) {
      DataStore.addNotification({
        targetUserId: null,
        targetRole: targetRole,
        ideaId: idea.id,
        type: 'resubmitted',
        message: `"${ideaName}" has been revised and resubmitted`,
        read: false
      });
    }
  },

  // ─── UI Rendering ─────────────────────────────────────────

  renderBell() {
    const session = Auth.getSession();
    if (!session) return '';
    const count = DataStore.getUnreadCount(session.userId, session.role);
    return `<div class="notification-bell" onclick="NotificationManager.toggleDropdown()">
      \u{1F514}
      ${count > 0 ? `<span class="notif-badge">${count}</span>` : ''}
    </div>`;
  },

  renderDropdown() {
    const session = Auth.getSession();
    if (!session) return '';

    const notifications = DataStore.getNotificationsForUser(session.userId, session.role);
    // Sort by timestamp descending and take last 20
    const sorted = notifications
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    if (sorted.length === 0) {
      return `<div class="notif-dropdown" id="notif-dropdown">
        <div class="notif-dropdown-header">
          <span>Notifications</span>
        </div>
        <div class="notif-empty">No notifications yet</div>
      </div>`;
    }

    const items = sorted.map(n => {
      const icon = this.TYPE_ICONS[n.type] || '\u{1F514}';
      const timeAgo = this.formatTimeAgo(n.timestamp);
      const readClass = n.read ? 'notif-read' : 'notif-unread';

      return `<div class="notif-item ${readClass}" onclick="NotificationManager.handleClick('${n.id}', '${n.ideaId}')">
        <span class="notif-icon">${icon}</span>
        <div class="notif-body">
          <div class="notif-message">${this._escapeHtml(n.message)}</div>
          <div class="notif-time">${timeAgo}</div>
        </div>
      </div>`;
    }).join('');

    const unreadCount = sorted.filter(n => !n.read).length;

    return `<div class="notif-dropdown" id="notif-dropdown">
      <div class="notif-dropdown-header">
        <span>Notifications</span>
        ${unreadCount > 0 ? `<button class="notif-mark-all" onclick="NotificationManager.markAllAsRead(event)">Mark all read</button>` : ''}
      </div>
      <div class="notif-list">${items}</div>
    </div>`;
  },

  toggleDropdown() {
    let dropdown = document.getElementById('notif-dropdown');
    if (dropdown) {
      // Already open, close it
      dropdown.remove();
      return;
    }

    // Create and insert the dropdown
    const bell = document.querySelector('.notification-bell');
    if (!bell) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.renderDropdown();
    dropdown = wrapper.firstElementChild;

    // Position relative to the bell
    bell.style.position = 'relative';
    bell.appendChild(dropdown);

    // Close dropdown when clicking outside
    const closeHandler = (e) => {
      if (!bell.contains(e.target)) {
        const dd = document.getElementById('notif-dropdown');
        if (dd) dd.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    // Use setTimeout to avoid the current click from closing it immediately
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
  },

  handleClick(notifId, ideaId) {
    // Mark as read
    DataStore.markNotificationRead(notifId);

    // Close dropdown
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) dropdown.remove();

    // Navigate to the idea
    if (ideaId) {
      window.location.hash = '#idea/' + ideaId;
    }

    // Refresh the bell count
    this.refreshBell();
  },

  markAllAsRead(event) {
    if (event) {
      event.stopPropagation();
    }
    const session = Auth.getSession();
    if (!session) return;

    DataStore.markAllRead(session.userId, session.role);

    // Close and re-render the dropdown
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) dropdown.remove();

    this.refreshBell();
  },

  refreshBell() {
    const bellContainer = document.querySelector('.notification-bell');
    if (!bellContainer && document.querySelector('.nav-notifications')) {
      // Re-render into a nav container if one exists
      const navContainer = document.querySelector('.nav-notifications');
      navContainer.innerHTML = this.renderBell();
    } else if (bellContainer) {
      const parent = bellContainer.parentElement;
      if (parent) {
        const session = Auth.getSession();
        if (session) {
          const count = DataStore.getUnreadCount(session.userId, session.role);
          const badge = bellContainer.querySelector('.notif-badge');
          if (count > 0) {
            if (badge) {
              badge.textContent = count;
            } else {
              const span = document.createElement('span');
              span.className = 'notif-badge';
              span.textContent = count;
              bellContainer.appendChild(span);
            }
          } else if (badge) {
            badge.remove();
          }
        }
      }
    }
  },

  formatTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWeek < 5) return `${diffWeek}w ago`;
    return `${diffMonth}mo ago`;
  },

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
