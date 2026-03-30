// Dashboard Page Component
const DashboardPage = {

  render() {
    const session = Auth.getSession();
    if (!session) return '';

    const allIdeas = DataStore.getIdeas();
    const myIdeas = allIdeas.filter(i => i.submitterId === session.userId);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Stat counts
    const draftCount = myIdeas.filter(i => i.status === 'draft').length;
    const inReviewStatuses = ['submitted', 'it_review', 'arch_review', 'finance_review', 'legal_review', 'ceo_review'];
    const inReviewCount = myIdeas.filter(i => inReviewStatuses.includes(i.status)).length;
    const approvedCount = myIdeas.filter(i => i.status === 'approved').length;
    const rejectedCount = myIdeas.filter(i => i.status === 'rejected').length;

    // Recent activity from user's ideas audit trails
    const recentActivity = [];
    myIdeas.forEach(idea => {
      if (idea.auditTrail && idea.auditTrail.length > 0) {
        idea.auditTrail.forEach(entry => {
          recentActivity.push({
            ideaId: idea.id,
            ideaName: (idea.criteria && idea.criteria.c02_initiative_name) || 'Untitled',
            ...entry
          });
        });
      }
    });
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const last5 = recentActivity.slice(0, 5);

    let activityHtml = '';
    if (last5.length === 0) {
      activityHtml = Components.renderEmptyState('No recent activity', '\uD83D\uDCCB');
    } else {
      activityHtml = last5.map(entry => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #f0f0f0;">
          <div style="width:8px;height:8px;border-radius:50%;background:${(STATUS_CONFIG[entry.newStatus] || {color:'#9AA0A6'}).color};margin-top:6px;flex-shrink:0;"></div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;color:#1a1a1a;font-weight:500;">${Components._escapeHtml(entry.action || entry.message || 'Status changed')}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:2px;">${Components._escapeHtml(entry.ideaName)} &middot; ${Components.formatDateTime(entry.timestamp)}</div>
          </div>
          ${entry.newStatus ? Components.renderStatusBadge(entry.newStatus) : ''}
        </div>
      `).join('');
    }

    let ceoSection = '';
    if (session.role === 'ceo') {
      // Portfolio overview - all ideas by status
      const statusCounts = {};
      Object.keys(STATUS_CONFIG).forEach(s => { statusCounts[s] = 0; });
      allIdeas.forEach(i => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1; });

      const pendingCeoCount = allIdeas.filter(i => i.status === 'ceo_review').length;

      // This month's approvals
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const monthApprovals = allIdeas.filter(i => {
        if (i.status !== 'approved') return false;
        const approvedEntry = (i.auditTrail || []).find(e => e.newStatus === 'approved');
        if (!approvedEntry) return false;
        const d = new Date(approvedEntry.timestamp);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
      const monthSAR = monthApprovals.reduce((sum, i) => {
        const inv = (i.criteria && i.criteria.c17_total_investment) || 0;
        return sum + parseFloat(inv || 0);
      }, 0);

      // Pipeline counts per stage
      const pipelineCounts = WORKFLOW_STAGES.map(s => allIdeas.filter(i => i.status === s).length);

      ceoSection = `
        <div style="margin-top:28px;">
          <h3 style="font-size:16px;font-weight:600;color:#1a1a1a;margin:0 0 16px;">Executive Overview</h3>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
            <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-left:4px solid #D4AF37;">
              <div style="font-size:12px;color:#6b7280;font-weight:500;">Pending My Review</div>
              <div style="font-size:28px;font-weight:700;color:#D4AF37;margin-top:4px;">${pendingCeoCount}</div>
            </div>
            <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-left:4px solid #2D5A3D;">
              <div style="font-size:12px;color:#6b7280;font-weight:500;">This Month's Approvals</div>
              <div style="font-size:28px;font-weight:700;color:#2D5A3D;margin-top:4px;">${monthApprovals.length}</div>
              <div style="font-size:11px;color:#6b7280;margin-top:2px;">${Components.formatSAR(monthSAR)} total</div>
            </div>
            <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-left:4px solid #1967D2;">
              <div style="font-size:12px;color:#6b7280;font-weight:500;">Total Ideas</div>
              <div style="font-size:28px;font-weight:700;color:#1967D2;margin-top:4px;">${allIdeas.length}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
              <h4 style="font-size:14px;font-weight:600;color:#1a1a1a;margin:0 0 16px;">Portfolio by Status</h4>
              <div style="height:220px;display:flex;align-items:center;justify-content:center;">
                <canvas id="statusChart" width="220" height="220"></canvas>
              </div>
            </div>
            <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
              <h4 style="font-size:14px;font-weight:600;color:#1a1a1a;margin:0 0 16px;">Approval Pipeline</h4>
              <div style="height:220px;display:flex;align-items:center;justify-content:center;">
                <canvas id="pipelineChart" width="340" height="220"></canvas>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const contentHtml = `
      <div>
        <!-- Welcome Banner -->
        <div style="background:linear-gradient(135deg,#0a3d0a 0%,#1a5c1a 100%);border-radius:12px;padding:28px 32px;margin-bottom:24px;color:#fff;">
          <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;">Welcome back, ${Components._escapeHtml(session.displayName)}</h2>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);">${dateStr}</p>
        </div>

        <!-- Stat Cards -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
          <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);text-align:center;">
            <div style="font-size:11px;color:#6b7280;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">My Drafts</div>
            <div style="font-size:32px;font-weight:700;color:#9AA0A6;margin-top:6px;">${draftCount}</div>
          </div>
          <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);text-align:center;">
            <div style="font-size:11px;color:#6b7280;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">In Review</div>
            <div style="font-size:32px;font-weight:700;color:#1967D2;margin-top:6px;">${inReviewCount}</div>
          </div>
          <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);text-align:center;">
            <div style="font-size:11px;color:#6b7280;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Approved</div>
            <div style="font-size:32px;font-weight:700;color:#2D5A3D;margin-top:6px;">${approvedCount}</div>
          </div>
          <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);text-align:center;">
            <div style="font-size:11px;color:#6b7280;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Rejected</div>
            <div style="font-size:32px;font-weight:700;color:#D93025;margin-top:6px;">${rejectedCount}</div>
          </div>
        </div>

        <!-- Recent Activity + Quick Actions -->
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:24px;">
          <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <h3 style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 12px;">Recent Activity</h3>
            ${activityHtml}
          </div>
          <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);display:flex;flex-direction:column;gap:12px;">
            <h3 style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 4px;">Quick Actions</h3>
            <button id="dash-new-idea-btn" style="width:100%;padding:12px;background:linear-gradient(135deg,#D4AF37,#c5a028);color:#1a1a1a;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;">
              \uD83D\uDCA1 Submit New Idea
            </button>
            <button id="dash-my-ideas-btn" style="width:100%;padding:12px;background:#fff;color:#1a1a1a;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:'Inter',sans-serif;">
              \uD83D\uDCCB View My Ideas
            </button>
          </div>
        </div>

        ${ceoSection}
      </div>
    `;

    return Components.renderAppShell(contentHtml);
  },

  afterRender() {
    this.bindEvents();
    const session = Auth.getSession();
    if (session && session.role === 'ceo') {
      this.initCharts();
    }
  },

  initCharts() {
    if (typeof Chart === 'undefined') return;

    const allIdeas = DataStore.getIdeas();

    // Status Doughnut Chart
    const statusCanvas = document.getElementById('statusChart');
    if (statusCanvas) {
      const statusCounts = {};
      Object.keys(STATUS_CONFIG).forEach(s => { statusCounts[s] = 0; });
      allIdeas.forEach(i => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1; });

      const activeStatuses = Object.keys(statusCounts).filter(s => statusCounts[s] > 0);
      const labels = activeStatuses.map(s => STATUS_CONFIG[s].label);
      const data = activeStatuses.map(s => statusCounts[s]);
      const colors = activeStatuses.map(s => STATUS_CONFIG[s].color);

      new Chart(statusCanvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { size: 11, family: "'Inter', sans-serif" }, padding: 12 }
            }
          }
        }
      });
    }

    // Pipeline Bar Chart
    const pipelineCanvas = document.getElementById('pipelineChart');
    if (pipelineCanvas) {
      const stageLabels = ['Submitted', 'IT Review', 'Architecture', 'Finance', 'Legal', 'CEO'];
      const stageCounts = WORKFLOW_STAGES.map(s => allIdeas.filter(i => i.status === s).length);
      const stageColors = WORKFLOW_STAGES.map(s => STATUS_CONFIG[s].color);

      new Chart(pipelineCanvas, {
        type: 'bar',
        data: {
          labels: stageLabels,
          datasets: [{
            label: 'Ideas',
            data: stageCounts,
            backgroundColor: stageColors,
            borderRadius: 4,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, font: { size: 11, family: "'Inter', sans-serif" } },
              grid: { color: '#f0f0f0' }
            },
            x: {
              ticks: { font: { size: 10, family: "'Inter', sans-serif" } },
              grid: { display: false }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  },

  bindEvents() {
    const newIdeaBtn = document.getElementById('dash-new-idea-btn');
    if (newIdeaBtn) {
      newIdeaBtn.addEventListener('click', () => Router.navigate('#new-idea'));
    }
    const myIdeasBtn = document.getElementById('dash-my-ideas-btn');
    if (myIdeasBtn) {
      myIdeasBtn.addEventListener('click', () => Router.navigate('#my-ideas'));
    }
  }
};
