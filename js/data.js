// Data Layer - localStorage CRUD operations
const DataStore = {
  // localStorage keys
  KEYS: {
    USERS: 'petrolube_users',
    IDEAS: 'petrolube_ideas',
    NOTIFICATIONS: 'petrolube_notifications',
    SESSION: 'petrolube_session',
    SETTINGS: 'petrolube_settings'
  },

  // 6 demo users to seed on first load
  DEFAULT_USERS: [
    { id: 'user_001', username: 'employee', password: 'pass123', displayName: 'Ahmed Al-Zahrani', role: 'regular', email: 'ahmed@petrolube.com', department: 'Operations' },
    { id: 'user_002', username: 'itadmin', password: 'pass123', displayName: 'Khalid Ibrahim', role: 'it_team', email: 'khalid@petrolube.com', department: 'IT' },
    { id: 'user_003', username: 'architect', password: 'pass123', displayName: 'Layla Hassan', role: 'arch_board', email: 'layla@petrolube.com', department: 'Architecture' },
    { id: 'user_004', username: 'finance', password: 'pass123', displayName: 'John Sliedregt', role: 'finance', email: 'john@petrolube.com', department: 'Finance' },
    { id: 'user_005', username: 'legal', password: 'pass123', displayName: 'Fatima Al-Rashid', role: 'legal', email: 'fatima@petrolube.com', department: 'Legal' },
    { id: 'user_006', username: 'ceo', password: 'pass123', displayName: 'Salman Saadat', role: 'ceo', email: 'salman@petrolube.com', department: 'Executive' }
  ],

  // Initialize/seed data on first load
  init() {
    if (!this._get(this.KEYS.USERS)) {
      this._set(this.KEYS.USERS, this.DEFAULT_USERS);
    }
    if (!this._get(this.KEYS.IDEAS)) {
      this._set(this.KEYS.IDEAS, []);
    }
    if (!this._get(this.KEYS.NOTIFICATIONS)) {
      this._set(this.KEYS.NOTIFICATIONS, []);
    }
    if (!this._get(this.KEYS.SETTINGS)) {
      this._set(this.KEYS.SETTINGS, {});
    }
  },

  // Generic localStorage helpers
  _get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('DataStore._get error for key:', key, e);
      return null;
    }
  },

  _set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('DataStore._set error for key:', key, e);
    }
  },

  // ─── Users ───────────────────────────────────────────────

  getUsers() {
    return this._get(this.KEYS.USERS) || [];
  },

  getUserById(id) {
    return this.getUsers().find(u => u.id === id) || null;
  },

  getUserByUsername(username) {
    return this.getUsers().find(u => u.username === username) || null;
  },

  // ─── Ideas ───────────────────────────────────────────────

  getIdeas() {
    return this._get(this.KEYS.IDEAS) || [];
  },

  saveIdeas(ideas) {
    this._set(this.KEYS.IDEAS, ideas);
  },

  getIdeaById(id) {
    return this.getIdeas().find(i => i.id === id) || null;
  },

  getIdeasBySubmitter(userId) {
    return this.getIdeas().filter(i => i.submitterId === userId);
  },

  getIdeasByStatus(status) {
    return this.getIdeas().filter(i => i.status === status);
  },

  getNextIdeaId() {
    const ideas = this.getIdeas();
    const nextNum = ideas.length + 1;
    return 'NEW-' + String(nextNum).padStart(3, '0');
  },

  saveIdea(idea) {
    const ideas = this.getIdeas();
    const index = ideas.findIndex(i => i.id === idea.id);
    idea.updatedAt = new Date().toISOString();
    if (index === -1) {
      // New idea - assign ID and creation timestamp
      if (!idea.id) {
        idea.id = 'idea_' + String(ideas.length + 1).padStart(3, '0');
      }
      if (!idea.createdAt) {
        idea.createdAt = new Date().toISOString();
      }
      if (!idea.auditTrail) {
        idea.auditTrail = [];
      }
      ideas.push(idea);
    } else {
      // Update existing idea
      ideas[index] = { ...ideas[index], ...idea };
    }
    this._set(this.KEYS.IDEAS, ideas);
    return idea;
  },

  // ─── Notifications ──────────────────────────────────────

  getNotifications() {
    return this._get(this.KEYS.NOTIFICATIONS) || [];
  },

  saveNotifications(notifs) {
    this._set(this.KEYS.NOTIFICATIONS, notifs);
  },

  addNotification({ targetUserId, targetRole, ideaId, type, message }) {
    const notifications = this.getNotifications();
    const notification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      targetUserId: targetUserId || null,
      targetRole: targetRole || null,
      ideaId: ideaId || null,
      type: type,
      message: message,
      read: false,
      timestamp: new Date().toISOString()
    };
    notifications.push(notification);
    this._set(this.KEYS.NOTIFICATIONS, notifications);
    return notification;
  },

  getNotificationsForUser(userId, role) {
    return this.getNotifications().filter(n => {
      return n.targetUserId === userId || n.targetRole === role;
    });
  },

  markNotificationRead(id) {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    notifications[index].read = true;
    this._set(this.KEYS.NOTIFICATIONS, notifications);
    return true;
  },

  markAllRead(userId, role) {
    const notifications = this.getNotifications();
    let changed = false;
    notifications.forEach(n => {
      if ((n.targetUserId === userId || n.targetRole === role) && !n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) {
      this._set(this.KEYS.NOTIFICATIONS, notifications);
    }
    return changed;
  },

  getUnreadCount(userId, role) {
    return this.getNotificationsForUser(userId, role).filter(n => !n.read).length;
  },

  // ─── Session ────────────────────────────────────────────

  getSession() {
    return this._get(this.KEYS.SESSION) || null;
  },

  setSession(session) {
    this._set(this.KEYS.SESSION, session);
  },

  clearSession() {
    localStorage.removeItem(this.KEYS.SESSION);
  },

  // ─── Settings ───────────────────────────────────────────

  getSettings() {
    return this._get(this.KEYS.SETTINGS) || {};
  },

  saveSettings(settings) {
    this._set(this.KEYS.SETTINGS, settings);
  }
};
