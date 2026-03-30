// CEO Portfolio Dashboard
const Portfolio = {
  charts: {},

  render() {
    const ideas = DataStore.getIdeas();
    const approved = ideas.filter(i => i.status === 'approved');
    const totalInvestment = approved.reduce((sum, i) => {
      const val = parseFloat((i.criteria && i.criteria.c17_total_investment) || 0);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    const avgROI = approved.length > 0
      ? approved.reduce((sum, i) => {
          const val = parseFloat((i.criteria && i.criteria.c19_roi_percent) || 0);
          return sum + (isNaN(val) ? 0 : val);
        }, 0) / approved.length
      : 0;
    const pendingCEO = ideas.filter(i => i.status === 'ceo_review').length;
    const topIdeas = this.getTopByScore(ideas, 10);
    const ceoReviewIdeas = ideas.filter(i => i.status === 'ceo_review');

    return `
      <div class="portfolio-dashboard" style="font-family:'Inter',sans-serif;">
        <!-- Row 1: Stat Cards -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:28px;">
          ${this._statCard('Total Ideas', ideas.length, '#1967D2', '\uD83D\uDCA1')}
          ${this._statCard('Total Investment', Components.formatSAR(totalInvestment), '#2D5A3D', '\uD83D\uDCB0')}
          ${this._statCard('Average ROI', avgROI.toFixed(1) + '%', '#F9AB00', '\uD83D\uDCC8')}
          ${this._statCard('Pending CEO Review', pendingCEO, '#D4AF37', '\uD83D\uDC51')}
        </div>

        <!-- Row 2: Status + Pipeline Charts -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;">
          <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a1a1a;">Ideas by Status</h3>
            <div style="position:relative;height:280px;">
              <canvas id="portfolioStatusChart"></canvas>
            </div>
          </div>
          <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a1a1a;">Approval Pipeline</h3>
            <div style="position:relative;height:280px;">
              <canvas id="portfolioPipelineChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Row 3: Domain + Category Charts -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;">
          <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a1a1a;">Ideas by Strategic Domain</h3>
            <div style="position:relative;height:280px;">
              <canvas id="portfolioDomainChart"></canvas>
            </div>
          </div>
          <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a1a1a;">Portfolio Category Mix</h3>
            <div style="position:relative;height:280px;">
              <canvas id="portfolioCategoryChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Row 4: Engine + Trend Charts -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;">
          <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a1a1a;">Three Engines Alignment</h3>
            <div style="position:relative;height:280px;">
              <canvas id="portfolioEngineChart"></canvas>
            </div>
          </div>
          <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a1a1a;">Monthly Submission Trend</h3>
            <div style="position:relative;height:280px;">
              <canvas id="portfolioTrendChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Row 5: Top 10 by Composite Score -->
        <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-bottom:28px;">
          <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a1a1a;">Top 10 by Composite Score</h3>
          ${topIdeas.length > 0 ? `
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr style="border-bottom:2px solid #e5e7eb;">
                    <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;">Rank</th>
                    <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;">ID</th>
                    <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;">Name</th>
                    <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;">Submitter</th>
                    <th style="padding:10px 12px;text-align:center;font-weight:600;color:#374151;">Score / 100</th>
                    <th style="padding:10px 12px;text-align:center;font-weight:600;color:#374151;">Status</th>
                    <th style="padding:10px 12px;text-align:center;font-weight:600;color:#374151;">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  ${topIdeas.map((idea, idx) => {
                    const name = (idea.criteria && idea.criteria.c02_initiative_name) || 'Untitled';
                    const submitter = DataStore.getUserById(idea.submitterId);
                    const submitterName = submitter ? Components._escapeHtml(submitter.displayName) : 'Unknown';
                    const score = idea.criteria && idea.criteria.c16_composite_score != null
                      ? parseFloat(idea.criteria.c16_composite_score).toFixed(1)
                      : this._calcCompositeScore(idea).toFixed(1);
                    const priority = idea.priority || idea.criteria && idea.criteria.priority || null;
                    return `
                      <tr style="border-bottom:1px solid #f3f4f6;${idx % 2 === 0 ? '' : 'background:#f9fafb;'}">
                        <td style="padding:10px 12px;font-weight:600;color:#6b7280;">#${idx + 1}</td>
                        <td style="padding:10px 12px;color:#6b7280;font-size:12px;">${Components._escapeHtml(idea.id)}</td>
                        <td style="padding:10px 12px;">
                          <a href="#idea-detail/${idea.id}" style="color:#1967D2;text-decoration:none;font-weight:500;" data-action="view-idea" data-id="${idea.id}">${Components._escapeHtml(name)}</a>
                        </td>
                        <td style="padding:10px 12px;color:#374151;">${submitterName}</td>
                        <td style="padding:10px 12px;text-align:center;">
                          <span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;color:#fff;background:${this._scoreColor(parseFloat(score))};">${score}</span>
                        </td>
                        <td style="padding:10px 12px;text-align:center;">${Components.renderStatusBadge(idea.status)}</td>
                        <td style="padding:10px 12px;text-align:center;">${Components.renderPriorityBadge(priority)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : Components.renderEmptyState('No ideas submitted yet', '\uD83D\uDCCA')}
        </div>

        <!-- Row 6: Pending CEO Review -->
        <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a1a1a;">Pending CEO Review</h3>
          ${ceoReviewIdeas.length > 0 ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">
              ${ceoReviewIdeas.map(idea => {
                const name = (idea.criteria && idea.criteria.c02_initiative_name) || 'Untitled';
                const submitter = DataStore.getUserById(idea.submitterId);
                const submitterName = submitter ? Components._escapeHtml(submitter.displayName) : 'Unknown';
                const domain = (idea.criteria && idea.criteria.c03_strategic_domain) || '--';
                const investment = idea.criteria && idea.criteria.c17_total_investment
                  ? Components.formatSAR(parseFloat(idea.criteria.c17_total_investment))
                  : 'SAR --';
                const score = idea.criteria && idea.criteria.c16_composite_score != null
                  ? parseFloat(idea.criteria.c16_composite_score).toFixed(1)
                  : this._calcCompositeScore(idea).toFixed(1);
                return `
                  <div style="border:1px solid #e5e7eb;border-radius:10px;padding:18px;background:#fefce8;transition:box-shadow 0.15s;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                      <h4 style="margin:0;font-size:14px;font-weight:600;color:#1a1a1a;flex:1;margin-right:8px;">${Components._escapeHtml(name)}</h4>
                      <span style="font-size:11px;color:#6b7280;white-space:nowrap;">${Components._escapeHtml(idea.id)}</span>
                    </div>
                    <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">By: ${submitterName}</div>
                    <div style="display:flex;gap:12px;font-size:12px;color:#6b7280;margin-bottom:12px;">
                      <span>Domain: <strong style="color:#374151;">${this._formatDomain(domain)}</strong></span>
                      <span>Investment: <strong style="color:#374151;">${investment}</strong></span>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                      <span style="font-size:12px;color:#6b7280;">Score: <strong style="color:${this._scoreColor(parseFloat(score))}">${score}/100</strong></span>
                      <button data-action="review-idea" data-id="${idea.id}" style="
                        padding:7px 18px;border:none;border-radius:6px;
                        background:linear-gradient(135deg,#D4AF37,#c5a028);
                        color:#1a1a1a;font-size:12px;font-weight:600;
                        font-family:'Inter',sans-serif;cursor:pointer;
                        transition:transform 0.15s,box-shadow 0.15s;
                      ">Review Now</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : Components.renderEmptyState('No ideas pending CEO review', '\u2705')}
        </div>
      </div>
    `;
  },

  initCharts() {
    const ideas = DataStore.getIdeas();
    this._initStatusChart(ideas);
    this._initPipelineChart(ideas);
    this._initDomainChart(ideas);
    this._initCategoryChart(ideas);
    this._initEngineChart(ideas);
    this._initTrendChart(ideas);
  },

  destroyCharts() {
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key] && typeof this.charts[key].destroy === 'function') {
        this.charts[key].destroy();
      }
    });
    this.charts = {};
  },

  // ─── Chart Initializers ──────────────────────────────────

  _initStatusChart(ideas) {
    const el = document.getElementById('portfolioStatusChart');
    if (!el) return;
    const dist = this.getStatusDistribution(ideas);
    this.charts.status = new Chart(el, {
      type: 'doughnut',
      data: {
        labels: dist.labels,
        datasets: [{
          data: dist.data,
          backgroundColor: dist.colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { padding: 12, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } } }
        }
      }
    });
  },

  _initPipelineChart(ideas) {
    const el = document.getElementById('portfolioPipelineChart');
    if (!el) return;
    const pipeline = this.getPipelineData(ideas);
    this.charts.pipeline = new Chart(el, {
      type: 'bar',
      data: {
        labels: pipeline.labels,
        datasets: [{
          label: 'Ideas',
          data: pipeline.data,
          backgroundColor: pipeline.colors,
          borderRadius: 4,
          barThickness: 22
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f3f4f6' } },
          y: { ticks: { font: { size: 11 } }, grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
  },

  _initDomainChart(ideas) {
    const el = document.getElementById('portfolioDomainChart');
    if (!el) return;
    const dist = this.getDomainDistribution(ideas);
    const colors = ['#1967D2', '#2D5A3D', '#F9AB00', '#D93025', '#7B1FA2', '#00897B'];
    this.charts.domain = new Chart(el, {
      type: 'bar',
      data: {
        labels: dist.labels,
        datasets: [{
          label: 'Ideas',
          data: dist.data,
          backgroundColor: colors.slice(0, dist.labels.length),
          borderRadius: 4,
          barThickness: 30
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f3f4f6' } },
          x: { ticks: { font: { size: 10 }, maxRotation: 45 }, grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
  },

  _initCategoryChart(ideas) {
    const el = document.getElementById('portfolioCategoryChart');
    if (!el) return;
    const dist = this.getCategoryDistribution(ideas);
    const colors = ['#1967D2', '#2D5A3D', '#F9AB00', '#D93025'];
    this.charts.category = new Chart(el, {
      type: 'doughnut',
      data: {
        labels: dist.labels,
        datasets: [{
          data: dist.data,
          backgroundColor: colors.slice(0, dist.labels.length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { padding: 12, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } } }
        }
      }
    });
  },

  _initEngineChart(ideas) {
    const el = document.getElementById('portfolioEngineChart');
    if (!el) return;
    const engineData = this.getEngineData(ideas);
    this.charts.engine = new Chart(el, {
      type: 'bar',
      data: {
        labels: engineData.labels,
        datasets: [
          { label: 'Engine 1: Sustain Core', data: engineData.engine1, backgroundColor: '#2D5A3D', borderRadius: 2 },
          { label: 'Engine 2: Expand', data: engineData.engine2, backgroundColor: '#1967D2', borderRadius: 2 },
          { label: 'Engine 3: Base Oil', data: engineData.engine3, backgroundColor: '#D4AF37', borderRadius: 2 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, ticks: { font: { size: 10 }, maxRotation: 45 }, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, max: 100, ticks: { callback: function(v) { return v + '%'; }, font: { size: 11 } }, grid: { color: '#f3f4f6' } }
        },
        plugins: {
          legend: { position: 'top', labels: { padding: 14, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } } }
        }
      }
    });
  },

  _initTrendChart(ideas) {
    const el = document.getElementById('portfolioTrendChart');
    if (!el) return;
    const trend = this.getMonthlyTrend(ideas);
    this.charts.trend = new Chart(el, {
      type: 'line',
      data: {
        labels: trend.labels,
        datasets: [{
          label: 'Submissions',
          data: trend.data,
          borderColor: '#1967D2',
          backgroundColor: 'rgba(25,103,210,0.08)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#1967D2',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f3f4f6' } },
          x: { ticks: { font: { size: 10 }, maxRotation: 45 }, grid: { display: false } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  // ─── Data Helpers ────────────────────────────────────────

  getStatusDistribution(ideas) {
    const counts = {};
    ideas.forEach(i => {
      const s = i.status || 'draft';
      counts[s] = (counts[s] || 0) + 1;
    });
    const labels = [];
    const data = [];
    const colors = [];
    Object.keys(STATUS_CONFIG).forEach(key => {
      if (counts[key]) {
        labels.push(STATUS_CONFIG[key].label);
        data.push(counts[key]);
        colors.push(STATUS_CONFIG[key].color);
      }
    });
    return { labels, data, colors };
  },

  getPipelineData(ideas) {
    const stages = [
      { key: 'submitted', label: 'Submitted' },
      { key: 'it_review', label: 'IT Review' },
      { key: 'arch_review', label: 'Architecture Review' },
      { key: 'finance_review', label: 'Finance Review' },
      { key: 'legal_review', label: 'Legal Review' },
      { key: 'ceo_review', label: 'CEO Review' },
      { key: 'approved', label: 'Approved' },
      { key: 'rejected', label: 'Rejected' }
    ];
    const counts = {};
    ideas.forEach(i => {
      const s = i.status || 'draft';
      counts[s] = (counts[s] || 0) + 1;
    });
    const stageColors = {
      submitted: '#1967D2',
      it_review: '#1967D2',
      arch_review: '#7B1FA2',
      finance_review: '#F9AB00',
      legal_review: '#00897B',
      ceo_review: '#D4AF37',
      approved: '#2D5A3D',
      rejected: '#D93025'
    };
    return {
      labels: stages.map(s => s.label),
      data: stages.map(s => counts[s.key] || 0),
      colors: stages.map(s => stageColors[s.key] || '#9AA0A6')
    };
  },

  getDomainDistribution(ideas) {
    const domainLabels = {
      digital_transformation: 'Digital Transformation',
      operational_excellence: 'Operational Excellence',
      market_expansion: 'Market Expansion',
      sustainability: 'Sustainability',
      workforce_development: 'Workforce Development',
      customer_experience: 'Customer Experience'
    };
    const counts = {};
    ideas.forEach(i => {
      const d = (i.criteria && i.criteria.c03_strategic_domain) || 'unknown';
      counts[d] = (counts[d] || 0) + 1;
    });
    const labels = [];
    const data = [];
    Object.keys(domainLabels).forEach(key => {
      if (counts[key]) {
        labels.push(domainLabels[key]);
        data.push(counts[key]);
      }
    });
    // Include unknown if any
    if (counts['unknown']) {
      labels.push('Unclassified');
      data.push(counts['unknown']);
    }
    return { labels, data };
  },

  getCategoryDistribution(ideas) {
    const catLabels = {
      core_incremental: 'Core Incremental',
      core_disruptive: 'Core Disruptive',
      non_core_incremental: 'Non-Core Incremental',
      non_core_disruptive: 'Non-Core Disruptive'
    };
    const counts = {};
    ideas.forEach(i => {
      const c = (i.criteria && i.criteria.c04_category) || 'unknown';
      counts[c] = (counts[c] || 0) + 1;
    });
    const labels = [];
    const data = [];
    Object.keys(catLabels).forEach(key => {
      if (counts[key]) {
        labels.push(catLabels[key]);
        data.push(counts[key]);
      }
    });
    if (counts['unknown']) {
      labels.push('Unclassified');
      data.push(counts['unknown']);
    }
    return { labels, data };
  },

  getEngineData(ideas) {
    const approved = ideas.filter(i => i.status === 'approved');
    if (approved.length === 0) {
      return { labels: ['No approved ideas'], engine1: [0], engine2: [0], engine3: [0] };
    }
    const labels = [];
    const engine1 = [];
    const engine2 = [];
    const engine3 = [];
    approved.forEach(idea => {
      const name = (idea.criteria && idea.criteria.c02_initiative_name) || idea.id;
      const shortName = name.length > 20 ? name.substring(0, 18) + '..' : name;
      labels.push(shortName);
      engine1.push(parseFloat((idea.criteria && idea.criteria.c05_engine1_pct) || 0));
      engine2.push(parseFloat((idea.criteria && idea.criteria.c05_engine2_pct) || 0));
      engine3.push(parseFloat((idea.criteria && idea.criteria.c05_engine3_pct) || 0));
    });
    return { labels, engine1, engine2, engine3 };
  },

  getMonthlyTrend(ideas) {
    const now = new Date();
    const labels = [];
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      labels.push(monthLabel);
      const count = ideas.filter(idea => {
        if (!idea.createdAt) return false;
        const created = new Date(idea.createdAt);
        return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
      }).length;
      data.push(count);
    }
    return { labels, data };
  },

  getTopByScore(ideas, limit) {
    const scored = ideas.map(idea => {
      let score = 0;
      if (idea.criteria && idea.criteria.c16_composite_score != null) {
        score = parseFloat(idea.criteria.c16_composite_score);
      } else {
        score = this._calcCompositeScore(idea);
      }
      return { ...idea, _sortScore: isNaN(score) ? 0 : score };
    });
    scored.sort((a, b) => b._sortScore - a._sortScore);
    return scored.slice(0, limit || 10);
  },

  // ─── Events ──────────────────────────────────────────────

  bindEvents() {
    const container = document.querySelector('.portfolio-dashboard');
    if (!container) return;
    container.addEventListener('click', (e) => {
      const reviewBtn = e.target.closest('[data-action="review-idea"]');
      if (reviewBtn) {
        const ideaId = reviewBtn.getAttribute('data-id');
        if (ideaId) {
          window.location.hash = '#review/' + ideaId;
        }
        return;
      }
      const viewBtn = e.target.closest('[data-action="view-idea"]');
      if (viewBtn) {
        // Navigation handled by href, but prevent default if needed
        return;
      }
    });
  },

  // ─── Private Helpers ─────────────────────────────────────

  _statCard(label, value, color, icon) {
    return `
      <div style="background:#fff;border-radius:12px;padding:22px 20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;align-items:center;gap:16px;border-left:4px solid ${color};">
        <div style="width:48px;height:48px;border-radius:12px;background:${color}12;display:flex;align-items:center;justify-content:center;font-size:22px;">${icon}</div>
        <div>
          <div style="font-size:12px;color:#6b7280;font-weight:500;margin-bottom:4px;">${label}</div>
          <div style="font-size:22px;font-weight:700;color:#1a1a1a;">${value}</div>
        </div>
      </div>
    `;
  },

  _calcCompositeScore(idea) {
    if (!idea.criteria) return 0;
    const c = idea.criteria;
    const s1 = parseFloat(c.c11_strategic_value) || 0;
    const s2 = parseFloat(c.c12_financial_attractiveness) || 0;
    const s3 = parseFloat(c.c13_feasibility_risk) || 0;
    const s4 = parseFloat(c.c14_organizational_readiness) || 0;
    const s5 = parseFloat(c.c15_innovation_differentiation) || 0;
    // Each dimension is 0-5, total max 25, scale to 100
    return ((s1 + s2 + s3 + s4 + s5) / 25) * 100;
  },

  _scoreColor(score) {
    if (score >= 75) return '#2D5A3D';
    if (score >= 50) return '#1967D2';
    if (score >= 25) return '#F9AB00';
    return '#D93025';
  },

  _formatDomain(domain) {
    const map = {
      digital_transformation: 'Digital Transformation',
      operational_excellence: 'Operational Excellence',
      market_expansion: 'Market Expansion',
      sustainability: 'Sustainability',
      workforce_development: 'Workforce Development',
      customer_experience: 'Customer Experience'
    };
    return map[domain] || domain;
  }
};

// Alias for Router compatibility
const PortfolioPage = {
  render(param) {
    return Portfolio.render();
  },
  afterRender(param) {
    Portfolio.initCharts();
    Portfolio.bindEvents();
  }
};
