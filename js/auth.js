// Authentication Module
const Auth = {

  login(username, password) {
    const user = DataStore.getUserByUsername(username);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    if (user.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    const session = {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      department: user.department,
      email: user.email,
      loginAt: new Date().toISOString()
    };
    DataStore.setSession(session);
    return { success: true, user: user };
  },

  logout() {
    DataStore.clearSession();
    window.location.hash = '#login';
  },

  getSession() {
    return DataStore.getSession();
  },

  isLoggedIn() {
    return this.getSession() !== null;
  },

  hasRole(role) {
    const session = this.getSession();
    if (!session) return false;
    return session.role === role;
  },

  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    return DataStore.getUserById(session.userId);
  },

  canAccessRoute(route) {
    const session = this.getSession();
    if (!session) return false;

    // Route access definitions
    const routeAccess = {
      '#dashboard': ['all'],
      '#new-idea': ['all'],
      '#my-ideas': ['all'],
      '#idea-detail': ['all'],
      '#review-queue': ['it_team', 'arch_board', 'finance', 'legal', 'ceo'],
      '#review': ['it_team', 'arch_board', 'finance', 'legal', 'ceo'],
      '#portfolio': ['ceo'],
      '#admin': ['ceo']
    };

    const allowedRoles = routeAccess[route];
    if (!allowedRoles) return false;
    if (allowedRoles.includes('all')) return true;
    return allowedRoles.includes(session.role);
  },

  // ─── Convenience Role Checks ────────────────────────────

  canReview() {
    const session = this.getSession();
    return session ? session.role !== 'regular' : false;
  },

  isAdmin() {
    const session = this.getSession();
    return session ? session.role === 'ceo' : false;
  },

  // ─── Role Display Helpers ───────────────────────────────

  getRoleLabel(role) {
    const labels = {
      regular: 'Employee',
      it_team: 'IT Team',
      arch_board: 'Architecture Board',
      finance: 'Finance',
      legal: 'Legal',
      ceo: 'CEO'
    };
    return labels[role] || role;
  },

  getRoleColor(role) {
    const colors = {
      regular: '#6c757d',
      it_team: '#0d6efd',
      arch_board: '#6f42c1',
      finance: '#198754',
      legal: '#fd7e14',
      ceo: '#dc3545'
    };
    return colors[role] || '#6c757d';
  }
};
