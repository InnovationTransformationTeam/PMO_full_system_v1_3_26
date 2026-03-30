// Hash-based Router
const Router = {
  routes: {
    '#dashboard': { component: 'Dashboard', roles: ['all'] },
    '#new-idea': { component: 'IdeaForm', roles: ['all'] },
    '#my-ideas': { component: 'MyIdeas', roles: ['all'] },
    '#idea-detail': { component: 'IdeaDetail', roles: ['all'] },
    '#review-queue': { component: 'ReviewQueue', roles: ['it_team', 'arch_board', 'finance', 'legal', 'ceo'] },
    '#review': { component: 'ReviewPanel', roles: ['it_team', 'arch_board', 'finance', 'legal', 'ceo'] },
    '#portfolio': { component: 'Portfolio', roles: ['ceo'] },
    '#admin': { component: 'Admin', roles: ['ceo'] }
  },

  currentRoute: null,

  init() {
    window.addEventListener('hashchange', () => this.render());
    this.render();
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  getCurrentRoute() {
    const fullHash = window.location.hash || '#dashboard';
    const parts = fullHash.split('/');
    const route = parts[0];
    const param = parts.length > 1 ? parts.slice(1).join('/') : null;
    return { route, param, fullHash };
  },

  render() {
    const { route, param } = this.getCurrentRoute();

    // Auth guard: redirect to login if not authenticated
    if (!Auth.isLoggedIn() && route !== '#login') {
      window.location.hash = '#login';
      return;
    }

    // If logged in and on login page, redirect to dashboard
    if (Auth.isLoggedIn() && route === '#login') {
      window.location.hash = '#dashboard';
      return;
    }

    // Handle login page separately (no route definition needed)
    if (route === '#login') {
      this.currentRoute = '#login';
      this._renderPage('Login', null);
      return;
    }

    // Look up the route definition
    const routeDef = this.routes[route];

    // Unknown route - redirect to dashboard
    if (!routeDef) {
      if (Auth.isLoggedIn()) {
        window.location.hash = '#dashboard';
      } else {
        window.location.hash = '#login';
      }
      return;
    }

    // Role-based access control
    if (!Auth.canAccessRoute(route)) {
      window.location.hash = '#dashboard';
      return;
    }

    this.currentRoute = route;
    this._renderPage(routeDef.component, param);
  },

  _renderPage(componentName, param) {
    const contentEl = document.getElementById('content') || document.getElementById('app');
    if (!contentEl) return;

    // Map component names to page objects
    const componentMap = {
      'Login': typeof LoginPage !== 'undefined' ? LoginPage : null,
      'Dashboard': typeof DashboardPage !== 'undefined' ? DashboardPage : null,
      'IdeaForm': typeof IdeaFormPage !== 'undefined' ? IdeaFormPage : null,
      'MyIdeas': typeof MyIdeasPage !== 'undefined' ? MyIdeasPage : null,
      'IdeaDetail': typeof IdeaDetailPage !== 'undefined' ? IdeaDetailPage : null,
      'ReviewQueue': typeof ReviewQueuePage !== 'undefined' ? ReviewQueuePage : null,
      'ReviewPanel': typeof ReviewPanelPage !== 'undefined' ? ReviewPanelPage : null,
      'Portfolio': typeof PortfolioPage !== 'undefined' ? PortfolioPage : null,
      'Admin': typeof AdminPage !== 'undefined' ? AdminPage : null
    };

    const page = componentMap[componentName];

    if (page && page.render) {
      contentEl.innerHTML = page.render(param);
      if (page.afterRender) {
        page.afterRender(param);
      }
    } else {
      contentEl.innerHTML = '<div class="page-loading">Loading ' + componentName + '...</div>';
    }
  }
};
