// My Ideas Page & Idea Detail Page
const MyIdeasPage = {
  currentFilter: 'all',

  render() {
    const session = Auth.getSession();
    if (!session) return '';
    const ideas = DataStore.getIdeasBySubmitter(session.userId);
    let filtered = ideas;
    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'in_review') {
        filtered = ideas.filter(i => ['submitted','it_review','arch_review','finance_review','legal_review','ceo_review'].includes(i.status));
      } else {
        filtered = ideas.filter(i => i.status === this.currentFilter);
      }
    }
    filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    const content = `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="margin:0;font-size:22px;font-weight:700;">My Ideas</h2>
          <div style="display:flex;gap:10px;align-items:center;">
            <select id="idea-filter" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;font-family:'Inter',sans-serif;">
              <option value="all"${this.currentFilter==='all'?' selected':''}>All Status</option>
              <option value="draft"${this.currentFilter==='draft'?' selected':''}>Drafts</option>
              <option value="in_review"${this.currentFilter==='in_review'?' selected':''}>In Review</option>
              <option value="approved"${this.currentFilter==='approved'?' selected':''}>Approved</option>
              <option value="rejected"${this.currentFilter==='rejected'?' selected':''}>Rejected</option>
              <option value="changes_requested"${this.currentFilter==='changes_requested'?' selected':''}>Changes Requested</option>
            </select>
            <button onclick="Router.navigate('#new-idea')" style="padding:8px 18px;background:linear-gradient(135deg,#D4AF37,#c5a028);border:none;border-radius:8px;color:#1a1a1a;font-weight:600;font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;">+ New Idea</button>
          </div>
        </div>
        ${filtered.length === 0
          ? Components.renderEmptyState('No ideas found. Submit your first idea!', '\uD83D\uDCA1')
          : this._renderTable(filtered)
        }
      </div>
    `;
    return Components.renderAppShell(content);
  },

  _renderTable(ideas) {
    const rows = ideas.map((idea, idx) => {
      const c = idea.criteria || {};
      const name = c.c02_initiative_name || 'Untitled';
      const id = c.c01_initiative_id || idea.id;
      const score = c.c16_composite_score != null ? parseFloat(c.c16_composite_score).toFixed(1) : '--';
      const stage = idea.currentReviewStage ? (STATUS_CONFIG[idea.currentReviewStage] || {}).label || '--' : '--';
      return `
        <tr style="border-bottom:1px solid #f3f4f6;cursor:pointer;${idx%2?'background:#f9fafb;':''}" onclick="Router.navigate('#idea-detail/${idea.id}')">
          <td style="padding:10px 14px;color:#6b7280;font-size:12px;font-weight:500;">${Components._escapeHtml(id)}</td>
          <td style="padding:10px 14px;font-weight:500;color:#1967D2;">${Components._escapeHtml(name)}</td>
          <td style="padding:10px 14px;">${Components.renderStatusBadge(idea.status)}</td>
          <td style="padding:10px 14px;font-size:12px;color:#6b7280;">${stage}</td>
          <td style="padding:10px 14px;font-size:12px;color:#6b7280;">${Components.formatDate(idea.submittedAt || idea.createdAt)}</td>
          <td style="padding:10px 14px;font-size:12px;color:#6b7280;">${Components.formatDate(idea.updatedAt)}</td>
          <td style="padding:10px 14px;text-align:center;font-weight:600;">${score}</td>
          <td style="padding:10px 14px;text-align:center;">${Components.renderPriorityBadge(idea.priority)}</td>
        </tr>`;
    }).join('');
    return `
      <div style="background:#fff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.06);overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="border-bottom:2px solid #e5e7eb;">
              <th style="padding:10px 14px;text-align:left;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;">ID</th>
              <th style="padding:10px 14px;text-align:left;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;">Name</th>
              <th style="padding:10px 14px;text-align:left;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;">Status</th>
              <th style="padding:10px 14px;text-align:left;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;">Stage</th>
              <th style="padding:10px 14px;text-align:left;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;">Submitted</th>
              <th style="padding:10px 14px;text-align:left;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;">Updated</th>
              <th style="padding:10px 14px;text-align:center;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;">Score</th>
              <th style="padding:10px 14px;text-align:center;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;">Priority</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  afterRender() {
    const filter = document.getElementById('idea-filter');
    if (filter) {
      filter.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        Router.render();
      });
    }
  }
};

// ─── Idea Detail Page ──────────────────────────────────────────────────────────
const IdeaDetailPage = {
  activeTab: 'overview',

  render(ideaId) {
    const idea = DataStore.getIdeaById(ideaId);
    if (!idea) return Components.renderAppShell(Components.renderEmptyState('Idea not found', '\u2753'));
    const submitter = DataStore.getUserById(idea.submitterId);
    const c = idea.criteria || {};
    const ai = idea.aiGenerated || {};

    const tabs = ['overview', 'dossier', 'reviews', 'audit'];
    const tabLabels = { overview: 'Overview', dossier: 'Full Dossier', reviews: 'Reviews', audit: 'Audit Trail' };

    const tabBar = tabs.map(t =>
      `<button data-tab="${t}" style="padding:8px 20px;border:none;border-bottom:2px solid ${this.activeTab===t?'#2D5A3D':'transparent'};background:none;font-size:13px;font-weight:${this.activeTab===t?'600':'400'};color:${this.activeTab===t?'#2D5A3D':'#6b7280'};cursor:pointer;font-family:'Inter',sans-serif;">${tabLabels[t]}</button>`
    ).join('');

    let tabContent = '';
    switch (this.activeTab) {
      case 'overview': tabContent = this._renderOverview(idea, c, submitter); break;
      case 'dossier': tabContent = this._renderDossier(c, ai); break;
      case 'reviews': tabContent = this._renderReviews(idea); break;
      case 'audit': tabContent = this._renderAudit(idea); break;
    }

    const content = `
      <div>
        <div style="margin-bottom:16px;">
          <button onclick="Router.navigate('#my-ideas')" style="background:none;border:none;color:#6b7280;font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;padding:0;">&larr; Back to My Ideas</button>
        </div>
        <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div>
              <h2 style="margin:0;font-size:20px;font-weight:700;">${Components._escapeHtml(c.c02_initiative_name || 'Untitled')}</h2>
              <span style="font-size:12px;color:#6b7280;">${Components._escapeHtml(c.c01_initiative_id || idea.id)}</span>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              ${Components.renderStatusBadge(idea.status)}
              ${idea.priority ? Components.renderPriorityBadge(idea.priority) : ''}
            </div>
          </div>
          ${Components.renderWorkflowProgressBar(idea.status, idea.reviews)}
        </div>
        <div style="border-bottom:1px solid #e5e7eb;margin-bottom:20px;display:flex;gap:0;">${tabBar}</div>
        ${tabContent}
        ${idea.status === 'changes_requested' ? `<div style="margin-top:20px;"><button onclick="Router.navigate('#new-idea/${idea.id}')" style="padding:10px 24px;background:linear-gradient(135deg,#FF8F00,#F9AB00);border:none;border-radius:8px;color:#fff;font-weight:600;font-size:14px;cursor:pointer;font-family:'Inter',sans-serif;">Edit & Resubmit</button></div>` : ''}
        ${idea.status === 'draft' ? `<div style="margin-top:20px;"><button onclick="Router.navigate('#new-idea/${idea.id}')" style="padding:10px 24px;background:linear-gradient(135deg,#2D5A3D,#3D7A52);border:none;border-radius:8px;color:#fff;font-weight:600;font-size:14px;cursor:pointer;font-family:'Inter',sans-serif;">Continue Editing</button></div>` : ''}
      </div>`;
    return Components.renderAppShell(content);
  },

  _renderOverview(idea, c, submitter) {
    const domainLabels = { digital_transformation:'Digital Transformation', operational_excellence:'Operational Excellence', market_expansion:'Market Expansion', sustainability:'Sustainability', workforce_development:'Workforce Development', customer_experience:'Customer Experience' };
    const catLabels = { core_incremental:'Core Incremental', core_disruptive:'Core Disruptive', non_core_incremental:'Non-Core Incremental', non_core_disruptive:'Non-Core Disruptive' };
    const score = c.c16_composite_score != null ? parseFloat(c.c16_composite_score).toFixed(1) : '--';
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;">Details</h3>
          ${this._field('Strategic Domain', domainLabels[c.c03_strategic_domain] || c.c03_strategic_domain || '--')}
          ${this._field('Category', catLabels[c.c04_category] || c.c04_category || '--')}
          ${this._field('Submitter', submitter ? submitter.displayName : 'Unknown')}
          ${this._field('Created', Components.formatDateTime(idea.createdAt))}
          ${this._field('Submitted', Components.formatDateTime(idea.submittedAt))}
          ${this._field('Last Updated', Components.formatDateTime(idea.updatedAt))}
        </div>
        <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;">Scores & Financials</h3>
          ${this._field('Composite Score', score + '/100')}
          ${this._field('Total Investment', c.c17_total_investment ? 'SAR ' + c.c17_total_investment + 'M' : '--')}
          ${this._field('Annual Savings', c.c18_annual_savings ? 'SAR ' + c.c18_annual_savings + 'M' : '--')}
          ${this._field('ROI', c.c19_roi_percent ? c.c19_roi_percent + '%' : '--')}
          ${this._field('IRR', c.c20_irr_percent ? c.c20_irr_percent + '%' : '--')}
          ${this._field('Payback', c.c22_payback_months ? c.c22_payback_months + ' months' : '--')}
        </div>
      </div>
      ${c.c06_problem_statement ? `<div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);margin-top:20px;">
        <h3 style="margin:0 0 8px;font-size:15px;font-weight:600;">Problem Statement</h3>
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${Components._escapeHtml(c.c06_problem_statement)}</p>
      </div>` : ''}
      ${c.c07_proposed_solution ? `<div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);margin-top:20px;">
        <h3 style="margin:0 0 8px;font-size:15px;font-weight:600;">Proposed Solution</h3>
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${Components._escapeHtml(c.c07_proposed_solution)}</p>
      </div>` : ''}`;
  },

  _field(label, value) {
    return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:13px;"><span style="color:#6b7280;">${label}</span><span style="color:#1a1a1a;font-weight:500;">${value}</span></div>`;
  },

  _renderDossier(c, ai) {
    const sections = [
      { title: '1. Initiative Identity', fields: [
        ['Initiative ID', c.c01_initiative_id, 'c01_initiative_id'],
        ['Name', c.c02_initiative_name, 'c02_initiative_name'],
        ['Strategic Domain', c.c03_strategic_domain, 'c03_strategic_domain'],
        ['Category', c.c04_category, 'c04_category'],
        ['Engine 1 %', c.c05_engine1_pct, 'c05_engine1_pct'],
        ['Engine 2 %', c.c05_engine2_pct, 'c05_engine2_pct'],
        ['Engine 3 %', c.c05_engine3_pct, 'c05_engine3_pct']
      ]},
      { title: '2. Problem & Solution', fields: [
        ['Problem Statement', c.c06_problem_statement, 'c06_problem_statement'],
        ['Proposed Solution', c.c07_proposed_solution, 'c07_proposed_solution'],
        ['Expected Outcomes', c.c08_expected_outcomes, 'c08_expected_outcomes']
      ]},
      { title: '3. Strategic Alignment', fields: [
        ['Vision 2030 Alignment', c.c09_vision2030_alignment, 'c09_vision2030_alignment'],
        ['Competitive Response', c.c10_competitive_response, 'c10_competitive_response']
      ]},
      { title: '4. Scoring Dimensions', fields: [
        ['Strategic Value', c.c11_strategic_value, 'c11_strategic_value'],
        ['Financial Attractiveness', c.c12_financial_attractiveness, 'c12_financial_attractiveness'],
        ['Feasibility & Risk', c.c13_feasibility_risk, 'c13_feasibility_risk'],
        ['Organizational Readiness', c.c14_organizational_readiness, 'c14_organizational_readiness'],
        ['Innovation & Differentiation', c.c15_innovation_differentiation, 'c15_innovation_differentiation'],
        ['Composite Score', c.c16_composite_score, 'c16_composite_score']
      ]},
      { title: '5. Financial Projections', fields: [
        ['Total Investment (SAR M)', c.c17_total_investment, 'c17_total_investment'],
        ['Annual Savings (SAR M)', c.c18_annual_savings, 'c18_annual_savings'],
        ['ROI %', c.c19_roi_percent, 'c19_roi_percent'],
        ['IRR %', c.c20_irr_percent, 'c20_irr_percent'],
        ['NPV (SAR M)', c.c21_npv, 'c21_npv'],
        ['Payback (months)', c.c22_payback_months, 'c22_payback_months']
      ]},
      { title: '6. Implementation', fields: [
        ['Start Date', c.c23_start_date, 'c23_start_date'],
        ['End Date', c.c24_end_date, 'c24_end_date'],
        ['Dependencies', c.c27_dependencies, 'c27_dependencies']
      ]},
      { title: '7. Risk Assessment', fields: [
        ['Risk Rating', c.c29_risk_rating, 'c29_risk_rating']
      ]},
      { title: '8. Additional', fields: [
        ['Technology Stack', c.c30_technology_stack, 'c30_technology_stack'],
        ['Data Requirements', c.c31_data_requirements, 'c31_data_requirements'],
        ['Change Management', c.c32_change_management, 'c32_change_management'],
        ['Success Metrics', c.c33_success_metrics, 'c33_success_metrics'],
        ['Stakeholders', c.c34_stakeholders, 'c34_stakeholders'],
        ['Additional Notes', c.c35_additional_notes, 'c35_additional_notes']
      ]}
    ];

    return sections.map(sec => `
      <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);margin-bottom:16px;">
        <h3 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#2D5A3D;">${sec.title}</h3>
        ${sec.fields.map(([label, val, key]) => {
          const isAi = ai[key];
          const displayVal = val != null && val !== '' ? String(val) : '--';
          return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:13px;${isAi?'border-left:3px solid #764ba2;padding-left:10px;':''}"><span style="color:#6b7280;min-width:180px;">${label}</span><span style="color:#1a1a1a;font-weight:400;text-align:right;flex:1;word-break:break-word;">${Components._escapeHtml(displayVal)}</span></div>`;
        }).join('')}
        ${sec.title.includes('6') && Array.isArray(c.c25_milestones) && c.c25_milestones.length > 0 ? `
          <div style="margin-top:10px;"><strong style="font-size:12px;color:#6b7280;">Milestones:</strong>
          ${c.c25_milestones.map(m => `<div style="padding:4px 0;font-size:12px;border-bottom:1px solid #f9fafb;">${Components._escapeHtml(m.name||'')} - ${m.targetDate||''} - ${Components._escapeHtml(m.description||'')}</div>`).join('')}</div>` : ''}
        ${sec.title.includes('6') && Array.isArray(c.c26_team_composition) && c.c26_team_composition.length > 0 ? `
          <div style="margin-top:10px;"><strong style="font-size:12px;color:#6b7280;">Team:</strong>
          ${c.c26_team_composition.map(t => `<div style="padding:4px 0;font-size:12px;border-bottom:1px solid #f9fafb;">${Components._escapeHtml(t.role||'')} x${t.count||1} (${t.source||t.skillset||''})</div>`).join('')}</div>` : ''}
        ${sec.title.includes('7') && Array.isArray(c.c28_risks) && c.c28_risks.length > 0 ? `
          <div style="margin-top:10px;"><strong style="font-size:12px;color:#6b7280;">Risk Register:</strong>
          ${c.c28_risks.map(r => `<div style="padding:6px 0;font-size:12px;border-bottom:1px solid #f9fafb;"><div>${Components._escapeHtml(r.description||'')}</div><div style="color:#6b7280;">L:${r.likelihood||'?'} I:${r.impact||'?'} | ${Components._escapeHtml(r.mitigation||'')}</div></div>`).join('')}</div>` : ''}
      </div>
    `).join('');
  },

  _renderReviews(idea) {
    const stages = ['it_review', 'arch_review', 'finance_review', 'legal_review', 'ceo_review'];
    const stageLabels = { it_review:'IT Review', arch_review:'Architecture Review', finance_review:'Finance Review', legal_review:'Legal Review', ceo_review:'CEO Review' };
    const reviews = idea.reviews || {};

    return stages.map(stage => {
      const review = reviews[stage];
      if (!review) {
        return `<div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin-bottom:12px;border:1px solid #e5e7eb;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:14px;font-weight:500;color:#9AA0A6;">${stageLabels[stage]}</span>
            <span style="font-size:12px;color:#9AA0A6;background:#f0f0f0;padding:2px 10px;border-radius:10px;">Pending</span>
          </div>
        </div>`;
      }
      const decisionColors = { approve_forward:'#2D5A3D', approve:'#2D5A3D', approve_with_conditions:'#D4AF37', request_changes:'#FF8F00', reject:'#D93025', defer:'#5F6368' };
      const decisionLabels = { approve_forward:'Approved & Forwarded', approve:'Approved', approve_with_conditions:'Approved with Conditions', request_changes:'Changes Requested', reject:'Rejected', defer:'Deferred' };
      const dc = decisionColors[review.decision] || '#6b7280';
      const dl = decisionLabels[review.decision] || review.decision;

      const fields = Object.entries(review).filter(([k]) => !['reviewerId','reviewerName','decision','timestamp','comments'].includes(k));

      return `<div style="background:#fff;border-radius:10px;padding:20px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-left:4px solid ${dc};">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div>
            <span style="font-size:14px;font-weight:600;color:#1a1a1a;">${stageLabels[stage]}</span>
            <span style="font-size:12px;color:#6b7280;margin-left:8px;">by ${Components._escapeHtml(review.reviewerName || 'Unknown')}</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <span style="font-size:12px;color:#6b7280;">${Components.formatDateTime(review.timestamp)}</span>
            <span style="padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;color:#fff;background:${dc};">${dl}</span>
          </div>
        </div>
        ${fields.length > 0 ? fields.map(([k, v]) => {
          const label = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          const val = Array.isArray(v) ? v.join(', ') : String(v);
          return `<div style="font-size:12px;padding:3px 0;"><span style="color:#6b7280;">${label}:</span> <span style="color:#1a1a1a;">${Components._escapeHtml(val)}</span></div>`;
        }).join('') : ''}
        ${review.comments ? `<div style="margin-top:8px;padding:10px;background:#f9fafb;border-radius:6px;font-size:13px;color:#374151;"><strong>Comments:</strong> ${Components._escapeHtml(review.comments)}</div>` : ''}
      </div>`;
    }).join('');
  },

  _renderAudit(idea) {
    const trail = (idea.auditTrail || []).slice().reverse();
    if (trail.length === 0) return Components.renderEmptyState('No audit trail entries', '\uD83D\uDCCB');

    return `<div style="position:relative;padding-left:28px;">
      <div style="position:absolute;left:8px;top:0;bottom:0;width:2px;background:#e5e7eb;"></div>
      ${trail.map(entry => {
        const user = entry.userId ? DataStore.getUserById(entry.userId) : null;
        const userName = user ? user.displayName : 'System';
        const statusColor = entry.newStatus ? (STATUS_CONFIG[entry.newStatus] || {}).color || '#6b7280' : '#6b7280';
        return `
          <div style="position:relative;margin-bottom:20px;">
            <div style="position:absolute;left:-24px;top:4px;width:12px;height:12px;border-radius:50%;background:${statusColor};border:2px solid #fff;"></div>
            <div style="background:#fff;border-radius:8px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span style="font-size:13px;font-weight:600;color:#1a1a1a;">${Components._escapeHtml(entry.action || 'Action')}</span>
                <span style="font-size:11px;color:#9AA0A6;">${Components.formatDateTime(entry.timestamp)}</span>
              </div>
              <div style="font-size:12px;color:#6b7280;">by ${Components._escapeHtml(userName)}</div>
              ${entry.description ? `<div style="font-size:12px;color:#374151;margin-top:4px;">${Components._escapeHtml(entry.description)}</div>` : ''}
              ${entry.newStatus ? `<div style="margin-top:6px;">${Components.renderStatusBadge(entry.newStatus)}</div>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>`;
  },

  afterRender(ideaId) {
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        Router.render();
      });
    });
  }
};
