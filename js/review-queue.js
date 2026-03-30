// Review Queue & Review Panel Pages
const ReviewQueuePage = {
  render() {
    const session = Auth.getSession();
    if (!session) return '';
    const roleStageMap = { it_team:'it_review', arch_board:'arch_review', finance:'finance_review', legal:'legal_review', ceo:'ceo_review' };
    const myStage = roleStageMap[session.role];
    if (!myStage) return Components.renderAppShell(Components.renderEmptyState('No review access for your role','🔒'));
    const ideas = DataStore.getIdeas().filter(i => i.status === myStage && i.currentReviewStage === myStage);

    const cards = ideas.length === 0
      ? Components.renderEmptyState('No ideas pending your review','✅')
      : ideas.map(idea => {
          const c = idea.criteria || {};
          const name = c.c02_initiative_name || 'Untitled';
          const submitter = DataStore.getUserById(idea.submitterId);
          const subName = submitter ? submitter.displayName : 'Unknown';
          const daysInStage = Math.floor((Date.now() - new Date(idea.updatedAt || idea.createdAt).getTime()) / 86400000);
          return `
            <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <div>
                <div style="font-size:15px;font-weight:600;color:#1a1a1a;">${Components._escapeHtml(name)}</div>
                <div style="font-size:12px;color:#6b7280;margin-top:4px;">
                  <span>${Components._escapeHtml(c.c01_initiative_id || idea.id)}</span> · By ${Components._escapeHtml(subName)} · Submitted ${Components.formatDate(idea.submittedAt)} · <span style="color:${daysInStage>5?'#D93025':'#6b7280'};font-weight:${daysInStage>5?'600':'400'};">${daysInStage}d in stage</span>
                </div>
              </div>
              <button data-action="review-idea" data-id="${idea.id}" style="padding:8px 20px;background:linear-gradient(135deg,#2D5A3D,#3D7A52);border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;">Review</button>
            </div>`;
        }).join('');

    const content = `
      <div>
        <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;">Review Queue</h2>
        <p style="color:#6b7280;font-size:13px;margin:0 0 20px;">${ideas.length} idea(s) awaiting your review</p>
        ${cards}
      </div>`;
    return Components.renderAppShell(content);
  },

  afterRender() {
    document.querySelectorAll('[data-action="review-idea"]').forEach(btn => {
      btn.addEventListener('click', () => Router.navigate('#review/' + btn.dataset.id));
    });
  }
};

// ─── Review Panel (Split View) ─────────────────────────────────────────────────
const ReviewPanelPage = {
  render(ideaId) {
    const idea = DataStore.getIdeaById(ideaId);
    if (!idea) return Components.renderAppShell(Components.renderEmptyState('Idea not found','❓'));
    const session = Auth.getSession();
    const c = idea.criteria || {};
    const name = c.c02_initiative_name || 'Untitled';

    const leftPanel = this._renderReadOnly(idea, c);
    const rightPanel = this._renderReviewForm(idea, session);

    const content = `
      <div>
        <button onclick="Router.navigate('#review-queue')" style="background:none;border:none;color:#6b7280;font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;padding:0;margin-bottom:12px;">← Back to Queue</button>
        <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;">${Components._escapeHtml(name)}</h2>
        <p style="color:#6b7280;font-size:12px;margin:0 0 16px;">${Components._escapeHtml(idea.id)} · ${Components.renderStatusBadge(idea.status)}</p>
        <div style="display:flex;gap:0;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="flex:6;background:#fff;padding:24px;overflow-y:auto;max-height:calc(100vh - 200px);">${leftPanel}</div>
          <div style="flex:4;background:#fafbfc;padding:24px;border-left:1px solid #e5e7eb;overflow-y:auto;max-height:calc(100vh - 200px);">${rightPanel}</div>
        </div>
      </div>`;
    return Components.renderAppShell(content);
  },

  _renderReadOnly(idea, c) {
    const wp = Components.renderWorkflowProgressBar(idea.status, idea.reviews);
    const fields = [
      ['Initiative Name', c.c02_initiative_name],
      ['Strategic Domain', c.c03_strategic_domain],
      ['Category', c.c04_category],
      ['Problem Statement', c.c06_problem_statement],
      ['Proposed Solution', c.c07_proposed_solution],
      ['Expected Outcomes', c.c08_expected_outcomes],
      ['Vision 2030', c.c09_vision2030_alignment],
      ['Competitive Response', c.c10_competitive_response],
      ['Strategic Value', c.c11_strategic_value ? c.c11_strategic_value + '/5' : '--'],
      ['Financial Attractiveness', c.c12_financial_attractiveness ? c.c12_financial_attractiveness + '/5' : '--'],
      ['Feasibility & Risk', c.c13_feasibility_risk ? c.c13_feasibility_risk + '/5' : '--'],
      ['Organizational Readiness', c.c14_organizational_readiness ? c.c14_organizational_readiness + '/5' : '--'],
      ['Innovation', c.c15_innovation_differentiation ? c.c15_innovation_differentiation + '/5' : '--'],
      ['Composite Score', c.c16_composite_score ? c.c16_composite_score + '/100' : '--'],
      ['Investment (SAR M)', c.c17_total_investment],
      ['Annual Savings (SAR M)', c.c18_annual_savings],
      ['ROI %', c.c19_roi_percent],
      ['IRR %', c.c20_irr_percent],
      ['Payback (months)', c.c22_payback_months],
      ['Risk Rating', c.c29_risk_rating],
      ['Technology Stack', c.c30_technology_stack]
    ].filter(([, v]) => v != null && v !== '');

    const priorReviews = Object.entries(idea.reviews || {}).filter(([, v]) => v).map(([stage, r]) => {
      const labels = { it_review:'IT Review', arch_review:'Architecture', finance_review:'Finance', legal_review:'Legal', ceo_review:'CEO' };
      return `<div style="background:#f0f7f2;border-radius:6px;padding:10px;margin-bottom:8px;">
        <div style="font-size:12px;font-weight:600;color:#2D5A3D;">${labels[stage] || stage}: ${r.decision || 'N/A'}</div>
        ${r.comments ? `<div style="font-size:12px;color:#374151;margin-top:4px;">${Components._escapeHtml(r.comments)}</div>` : ''}
      </div>`;
    }).join('');

    return `${wp}
      <div style="margin-top:16px;">
        ${fields.map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f3f4f6;font-size:12px;"><span style="color:#6b7280;">${l}</span><span style="color:#1a1a1a;max-width:60%;text-align:right;word-break:break-word;">${Components._escapeHtml(String(v))}</span></div>`).join('')}
      </div>
      ${priorReviews ? `<div style="margin-top:16px;"><h4 style="font-size:13px;font-weight:600;margin:0 0 8px;">Prior Reviews</h4>${priorReviews}</div>` : ''}`;
  },

  _renderReviewForm(idea, session) {
    const role = session.role;
    let fields = '';
    switch(role) {
      case 'it_team': fields = this._itForm(); break;
      case 'arch_board': fields = this._archForm(); break;
      case 'finance': fields = this._financeForm(); break;
      case 'legal': fields = this._legalForm(); break;
      case 'ceo': fields = this._ceoForm(); break;
      default: return '<p>No review form for your role.</p>';
    }
    return `
      <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;">Your Review</h3>
      ${fields}
      <div style="margin-top:20px;">
        <button id="submit-review-btn" data-idea-id="${idea.id}" style="width:100%;padding:12px;background:linear-gradient(135deg,#2D5A3D,#3D7A52);border:none;border-radius:8px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;">Submit Review</button>
      </div>`;
  },

  _sel(id, label, options) {
    const opts = options.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
    return `<div style="margin-bottom:12px;"><label style="display:block;font-size:12px;font-weight:600;color:#6b7280;margin-bottom:4px;">${label}</label><select id="${id}" data-review-field="${id}" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;font-family:'Inter',sans-serif;">${opts}</select></div>`;
  },

  _ta(id, label, max) {
    return `<div style="margin-bottom:12px;"><label style="display:block;font-size:12px;font-weight:600;color:#6b7280;margin-bottom:4px;">${label}</label><textarea id="${id}" data-review-field="${id}" maxlength="${max||1000}" style="width:100%;box-sizing:border-box;min-height:80px;padding:8px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;font-family:'Inter',sans-serif;resize:vertical;"></textarea></div>`;
  },

  _inp(id, label, type) {
    return `<div style="margin-bottom:12px;"><label style="display:block;font-size:12px;font-weight:600;color:#6b7280;margin-bottom:4px;">${label}</label><input type="${type||'text'}" id="${id}" data-review-field="${id}" style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;font-family:'Inter',sans-serif;"></div>`;
  },

  _itForm() {
    return `
      ${this._sel('technical_feasibility','Technical Feasibility (1-5)',[['','Select...'],['1','1 - Not Feasible'],['2','2 - Challenging'],['3','3 - Moderate'],['4','4 - Feasible'],['5','5 - Easily Feasible']])}
      ${this._sel('infrastructure_impact','Infrastructure Impact',[['','Select...'],['none','None'],['minor','Minor'],['moderate','Moderate'],['major','Major'],['requires_new_infra','Requires New Infrastructure']])}
      ${this._ta('security_concerns','Security Concerns',500)}
      ${this._sel('integration_complexity','Integration Complexity',[['','Select...'],['low','Low'],['medium','Medium'],['high','High'],['critical','Critical']])}
      ${this._inp('estimated_effort','Estimated Technical Effort (person-months)')}
      ${this._ta('it_recommendation','IT Recommendation',1000)}
      ${this._sel('review-decision','Decision',[['','Select Decision...'],['approve_forward','Approve & Forward'],['request_changes','Request Changes'],['reject','Reject']])}
      ${this._ta('review-comments','Comments',1000)}`;
  },

  _archForm() {
    return `
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;font-weight:600;color:#6b7280;margin-bottom:4px;">Architecture Domains Affected</label>
        ${['Business','Data','Application','Infrastructure','Security','Technology'].map(d =>
          `<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#374151;margin-bottom:4px;"><input type="checkbox" data-review-field="domains" value="${d.toLowerCase()}">${d}</label>`
        ).join('')}
      </div>
      ${this._sel('framework_alignment','Framework Alignment',[['','Select...'],['togaf','TOGAF'],['zachman','Zachman'],['vision2030','Vision 2030'],['custom','Custom']])}
      ${this._sel('oracle_fit','Oracle Ecosystem Fit (1-5)',[['','Select...'],['1','1'],['2','2'],['3','3'],['4','4'],['5','5']])}
      ${this._ta('data_arch_impact','Data Architecture Impact',500)}
      ${this._sel('standards_compliance','Standards Compliance',[['','Select...'],['compliant','Compliant'],['partial','Partial'],['non_compliant','Non-Compliant'],['not_applicable','N/A']])}
      ${this._ta('arch_recommendation','Architecture Recommendation',1000)}
      ${this._sel('review-decision','Decision',[['','Select Decision...'],['approve_forward','Approve & Forward'],['request_changes','Request Changes'],['reject','Reject']])}
      ${this._ta('review-comments','Comments',1000)}`;
  },

  _financeForm() {
    return `
      ${this._sel('investment_validation','Investment Validation',[['','Select...'],['validated','Validated'],['underestimated','Underestimated'],['overestimated','Overestimated'],['needs_rework','Needs Rework']])}
      ${this._sel('roi_assessment','ROI Assessment',[['','Select...'],['exceeds_hurdle','Exceeds Hurdle Rate'],['meets_hurdle','Meets Hurdle Rate'],['below_hurdle','Below Hurdle Rate'],['insufficient_data','Insufficient Data']])}
      ${this._sel('budget_availability','Budget Availability',[['','Select...'],['available','Available'],['requires_reallocation','Requires Reallocation'],['not_available','Not Available'],['deferred_funding','Deferred Funding']])}
      ${this._sel('financial_risk','Financial Risk Rating',[['','Select...'],['low','Low'],['medium','Medium'],['high','High'],['critical','Critical']])}
      ${this._ta('revised_estimates','Revised Financial Estimates',1000)}
      ${this._sel('funding_recommendation','Funding Recommendation',[['','Select...'],['fund_fully','Fund Fully'],['fund_partially','Fund Partially'],['defer_funding','Defer Funding'],['do_not_fund','Do Not Fund']])}
      ${this._ta('finance_recommendation','Finance Recommendation',1000)}
      ${this._sel('review-decision','Decision',[['','Select Decision...'],['approve_forward','Approve & Forward'],['request_changes','Request Changes'],['reject','Reject']])}
      ${this._ta('review-comments','Comments',1000)}`;
  },

  _legalForm() {
    return `
      ${this._sel('regulatory_compliance','Regulatory Compliance',[['','Select...'],['compliant','Compliant'],['requires_modifications','Requires Modifications'],['non_compliant','Non-Compliant'],['not_applicable','N/A']])}
      ${this._sel('pdpl_privacy','PDPL Data Privacy',[['','Select...'],['compliant','Compliant'],['requires_assessment','Requires Assessment'],['non_compliant','Non-Compliant'],['not_applicable','N/A']])}
      ${this._sel('ip_considerations','IP Considerations',[['','Select...'],['no_issues','No Issues'],['ip_review_needed','IP Review Needed'],['ip_conflict','IP Conflict'],['not_applicable','N/A']])}
      ${this._sel('contract_requirements','Contract Requirements',[['','Select...'],['none','None'],['vendor_contracts','Vendor Contracts'],['partnership_agreements','Partnership Agreements'],['licensing','Licensing']])}
      ${this._sel('legal_risk','Legal Risk Rating',[['','Select...'],['low','Low'],['medium','Medium'],['high','High'],['critical','Critical']])}
      ${this._ta('legal_recommendation','Legal Recommendation',1000)}
      ${this._ta('required_legal_actions','Required Legal Actions',500)}
      ${this._sel('review-decision','Decision',[['','Select Decision...'],['approve_forward','Approve & Forward'],['request_changes','Request Changes'],['reject','Reject']])}
      ${this._ta('review-comments','Comments',1000)}`;
  },

  _ceoForm() {
    return `
      ${this._sel('strategic_alignment','Strategic Alignment (1-5)',[['','Select...'],['1','1'],['2','2'],['3','3'],['4','4'],['5','5']])}
      ${this._sel('review-priority','Board Priority',[['','Select...'],['p1_critical','P1 - Critical'],['p2_high','P2 - High'],['p3_medium','P3 - Medium'],['p4_low','P4 - Low']])}
      ${this._sel('review-tier','Tier Assignment',[['','Select...'],['tier_1a','Tier 1A'],['tier_1b','Tier 1B'],['tier_1c','Tier 1C'],['tier_1d','Tier 1D'],['tier_2','Tier 2'],['deferred','Deferred']])}
      ${this._inp('review-funding','Funding Authorization (SAR M)','number')}
      ${this._inp('review-sponsor','Executive Sponsor')}
      ${this._ta('ceo_notes','CEO Notes',2000)}
      ${this._sel('review-decision','Decision',[['','Select Decision...'],['approve','Approve'],['approve_with_conditions','Approve with Conditions'],['defer','Defer'],['request_changes','Request Changes'],['reject','Reject']])}
      <div id="conditions-group" style="display:none;">${this._ta('review-conditions','Conditions',1000)}</div>
      <div id="defer-group" style="display:none;">${this._inp('review-defer-date','Deferral Date','date')}</div>
      ${this._ta('review-comments','Comments',1000)}`;
  },

  submitReview(ideaId) {
    const idea = DataStore.getIdeaById(ideaId);
    if (!idea) return;
    const session = Auth.getSession();
    const decision = document.getElementById('review-decision')?.value;
    if (!decision) { alert('Please select a decision.'); return; }

    // Collect review data
    const reviewData = {};
    document.querySelectorAll('[data-review-field]').forEach(el => {
      const field = el.dataset.reviewField;
      if (el.type === 'checkbox') {
        if (!reviewData[field]) reviewData[field] = [];
        if (el.checked) reviewData[field].push(el.value);
      } else {
        reviewData[field] = el.value;
      }
    });
    reviewData.reviewerId = session.userId;
    reviewData.reviewerName = session.displayName;
    reviewData.decision = decision;
    reviewData.timestamp = new Date().toISOString();
    reviewData.comments = document.getElementById('review-comments')?.value || '';

    idea.reviews[idea.currentReviewStage] = reviewData;
    idea.updatedAt = new Date().toISOString();

    if (decision === 'approve_forward') {
      const nextStage = NEXT_STAGE[idea.currentReviewStage];
      if (nextStage) {
        idea.status = nextStage;
        idea.currentReviewStage = nextStage;
        idea.auditTrail.push({ timestamp: new Date().toISOString(), userId: session.userId, action: 'approved_forward', description: `${Auth.getRoleLabel(session.role)} approved, forwarded to ${(STATUS_CONFIG[nextStage]||{}).label||nextStage}`, newStatus: nextStage });
        NotificationManager.notifyStageForwarded(idea, nextStage);
      }
    } else if (decision === 'approve' || decision === 'approve_with_conditions') {
      idea.status = 'approved';
      idea.currentReviewStage = null;
      idea.priority = document.getElementById('review-priority')?.value || null;
      idea.tier = document.getElementById('review-tier')?.value || null;
      idea.fundingAuthorized = document.getElementById('review-funding')?.value || null;
      idea.executiveSponsor = document.getElementById('review-sponsor')?.value || '';
      if (decision === 'approve_with_conditions') {
        idea.conditions = document.getElementById('review-conditions')?.value || '';
      }
      idea.auditTrail.push({ timestamp: new Date().toISOString(), userId: session.userId, action: 'approved', description: `CEO approved${decision==='approve_with_conditions'?' with conditions':''}`, newStatus: 'approved' });
      NotificationManager.notifyApproved(idea);
    } else if (decision === 'defer') {
      idea.status = 'deferred';
      idea.currentReviewStage = null;
      idea.deferralDate = document.getElementById('review-defer-date')?.value || '';
      idea.auditTrail.push({ timestamp: new Date().toISOString(), userId: session.userId, action: 'deferred', description: 'CEO deferred to ' + (idea.deferralDate || 'future date'), newStatus: 'deferred' });
      NotificationManager.notifyDeferred(idea, idea.deferralDate);
    } else if (decision === 'request_changes') {
      idea.returnToStage = idea.currentReviewStage;
      idea.status = 'changes_requested';
      idea.currentReviewStage = null;
      idea.auditTrail.push({ timestamp: new Date().toISOString(), userId: session.userId, action: 'changes_requested', description: `${Auth.getRoleLabel(session.role)} requested changes`, newStatus: 'changes_requested' });
      NotificationManager.notifyChangesRequested(idea, session.role);
    } else if (decision === 'reject') {
      if (!reviewData.comments) { alert('Rejection reason is required in comments.'); return; }
      idea.status = 'rejected';
      idea.currentReviewStage = null;
      idea.auditTrail.push({ timestamp: new Date().toISOString(), userId: session.userId, action: 'rejected', description: `Rejected by ${Auth.getRoleLabel(session.role)}: ${reviewData.comments}`, newStatus: 'rejected' });
      NotificationManager.notifyRejected(idea, idea.currentReviewStage || session.role);
    }

    DataStore.saveIdea(idea);
    Router.navigate('#review-queue');
  },

  afterRender(ideaId) {
    const submitBtn = document.getElementById('submit-review-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitReview(submitBtn.dataset.ideaId));
    }
    const decisionEl = document.getElementById('review-decision');
    if (decisionEl) {
      decisionEl.addEventListener('change', () => {
        const val = decisionEl.value;
        const cg = document.getElementById('conditions-group');
        const dg = document.getElementById('defer-group');
        if (cg) cg.style.display = val === 'approve_with_conditions' ? 'block' : 'none';
        if (dg) dg.style.display = val === 'defer' ? 'block' : 'none';
      });
    }
  }
};
