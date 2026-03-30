// Idea Submission Form - 35 Criteria with AI Auto-Fill
const IdeaFormPage = {
  currentIdea: null,
  formMode: 'entry',
  activeSection: 1,
  autoSaveTimer: null,

  render(param) {
    if (param) {
      this.currentIdea = DataStore.getIdeaById(param);
      if (this.currentIdea) this.formMode = 'form';
    } else {
      this.currentIdea = null;
      this.formMode = 'entry';
    }
    const session = Auth.getSession();
    if (!session) return '';
    if (this.formMode === 'entry') return Components.renderAppShell(this._entryMode());
    return Components.renderAppShell(this._formMode());
  },

  _entryMode() {
    return `
      <div style="max-width:700px;margin:0 auto;padding:40px 0;">
        <h2 style="font-size:24px;font-weight:700;margin:0 0 8px;text-align:center;">Submit a New Innovation Idea</h2>
        <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 32px;">Describe your idea and let AI generate the full dossier, or fill it in manually.</p>
        <div style="background:#fff;border-radius:12px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">Project Description</label>
          <textarea id="project-description" maxlength="5000" placeholder="Describe your initiative idea in your own words. Include the problem, proposed solution, expected impact, and any relevant details. (Min 100 characters for AI mode)" style="width:100%;box-sizing:border-box;min-height:200px;padding:14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;font-family:'Inter',sans-serif;resize:vertical;line-height:1.6;"></textarea>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
            <span id="char-count" style="font-size:12px;color:#9AA0A6;">0 / 5000 characters</span>
          </div>
          <div style="display:flex;gap:12px;margin-top:24px;">
            <button id="ai-generate-btn" style="flex:1;padding:14px;background:linear-gradient(135deg,#667EEA,#764BA2);border:none;border-radius:10px;color:#fff;font-size:15px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;">✨ Use AI to Generate Dossier</button>
            <button id="manual-btn" style="flex:1;padding:14px;background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;color:#374151;font-size:15px;font-weight:500;cursor:pointer;font-family:'Inter',sans-serif;">📝 Enter Manually</button>
          </div>
        </div>
      </div>`;
  },

  _formMode() {
    const c = (this.currentIdea && this.currentIdea.criteria) || {};
    const ai = (this.currentIdea && this.currentIdea.aiGenerated) || {};
    const sectionNames = ['Initiative Identity','Problem & Solution','Strategic Alignment','Scoring Dimensions','Financial Projections','Implementation','Risk Assessment','Additional Information'];
    const completion = this._getSectionCompletion(c);
    const pct = Math.round(completion.filter(Boolean).length / 8 * 100);

    const sidebar = `
      <div style="width:220px;flex-shrink:0;background:#fff;border-radius:10px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);position:sticky;top:80px;align-self:flex-start;">
        <div style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#6b7280;margin-bottom:4px;"><span>Progress</span><span>${pct}%</span></div>
          <div style="height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;"><div style="height:100%;background:#2D5A3D;border-radius:3px;width:${pct}%;transition:width 0.3s;"></div></div>
        </div>
        ${sectionNames.map((name, i) => {
          const num = i + 1;
          const isActive = this.activeSection === num;
          const done = completion[i];
          return `<div data-section="${num}" style="padding:8px 10px;border-radius:6px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px;margin-bottom:2px;background:${isActive?'#f0f7f2':'transparent'};color:${isActive?'#2D5A3D':'#374151'};font-weight:${isActive?'600':'400'};">
            <span style="width:18px;height:18px;border-radius:50%;background:${done?'#2D5A3D':'#e5e7eb'};color:${done?'#fff':'#9AA0A6'};display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;">${done?'✓':num}</span>
            ${name}
          </div>`;
        }).join('')}
        <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px;">
          <button id="save-draft-btn" style="width:100%;padding:10px;background:#fff;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:'Inter',sans-serif;color:#374151;">💾 Save Draft</button>
          <button id="submit-idea-btn" style="width:100%;padding:10px;background:linear-gradient(135deg,#2D5A3D,#3D7A52);border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;color:#fff;">Submit for Review</button>
        </div>
      </div>`;

    return `
      <div style="display:flex;gap:24px;align-items:flex-start;">
        ${sidebar}
        <div style="flex:1;min-width:0;">
          <div style="background:#fff;border-radius:10px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
              <h3 style="margin:0;font-size:16px;font-weight:600;">${sectionNames[this.activeSection-1]}</h3>
              <button data-ai-section="${this.activeSection}" style="padding:6px 14px;background:linear-gradient(135deg,#667EEA,#764BA2);border:none;border-radius:6px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;">✨ AI Auto-Fill</button>
            </div>
            ${this._renderSection(this.activeSection, c, ai)}
          </div>
        </div>
      </div>`;
  },

  _renderSection(num, c, ai) {
    const g = (id, label, type, opts) => this._renderField(id, label, type, c[id], ai[id], opts);
    switch(num) {
      case 1: return `
        ${g('c01_initiative_id','Initiative ID','readonly',{placeholder:DataStore.getNextIdeaId()})}
        ${g('c02_initiative_name','Initiative Name *','text',{max:200,required:true})}
        ${g('c03_strategic_domain','Strategic Domain','select',{options:[['','Select...'],['digital_transformation','Digital Transformation'],['operational_excellence','Operational Excellence'],['market_expansion','Market Expansion'],['sustainability','Sustainability'],['workforce_development','Workforce Development'],['customer_experience','Customer Experience']]})}
        ${g('c04_category','Portfolio Category','select',{options:[['','Select...'],['core_incremental','Core Incremental'],['core_disruptive','Core Disruptive'],['non_core_incremental','Non-Core Incremental'],['non_core_disruptive','Non-Core Disruptive']]})}
        <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px;">
          <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:12px;">Three Engines Contribution (must sum to 100%)</label>
          <div id="engine-sum-warning" style="display:none;color:#D93025;font-size:12px;margin-bottom:8px;">⚠ Engines must sum to 100%</div>
          ${this._slider('c05_engine1_pct','E1: Sustain Core',c.c05_engine1_pct||60)}
          ${this._slider('c05_engine2_pct','E2: Expand',c.c05_engine2_pct||25)}
          ${this._slider('c05_engine3_pct','E3: Base Oil Integration',c.c05_engine3_pct||15)}
          <div id="engine-sum" style="text-align:right;font-size:12px;font-weight:600;color:#6b7280;margin-top:4px;">Sum: 100%</div>
        </div>`;
      case 2: return `
        ${g('c06_problem_statement','Problem Statement *','textarea',{max:2000,required:true})}
        ${g('c07_proposed_solution','Proposed Solution *','textarea',{max:2000,required:true})}
        ${g('c08_expected_outcomes','Expected Outcomes *','textarea',{max:2000,required:true})}`;
      case 3: return `
        ${g('c09_vision2030_alignment','Vision 2030 Alignment','textarea',{max:1500})}
        ${g('c10_competitive_response','Competitive Response','textarea',{max:1500})}`;
      case 4: return `
        ${this._scoreSlider('c11_strategic_value','Strategic Value',c.c11_strategic_value||0)}
        ${this._scoreSlider('c12_financial_attractiveness','Financial Attractiveness',c.c12_financial_attractiveness||0)}
        ${this._scoreSlider('c13_feasibility_risk','Feasibility & Risk',c.c13_feasibility_risk||0)}
        ${this._scoreSlider('c14_organizational_readiness','Organizational Readiness',c.c14_organizational_readiness||0)}
        ${this._scoreSlider('c15_innovation_differentiation','Innovation & Differentiation',c.c15_innovation_differentiation||0)}
        <div style="margin-top:16px;padding:16px;background:#f0f7f2;border-radius:8px;text-align:center;">
          <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Composite Score</div>
          <div id="composite-score" style="font-size:28px;font-weight:700;color:#2D5A3D;">0.0<span style="font-size:16px;color:#6b7280;">/100</span></div>
        </div>`;
      case 5: return `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          ${g('c17_total_investment','Total Investment (SAR M)','number',{step:0.1})}
          ${g('c18_annual_savings','Annual Savings/Revenue (SAR M)','number',{step:0.1})}
          ${g('c19_roi_percent','ROI (%)','number',{})}
          ${g('c20_irr_percent','IRR (%)','number',{})}
          ${g('c21_npv','NPV (SAR M)','number',{step:0.1})}
          ${g('c22_payback_months','Payback Period (months)','number',{})}
        </div>`;
      case 6: return `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          ${g('c23_start_date','Start Date','date',{defaultVal:'2026-07-01'})}
          ${g('c24_end_date','End Date','date',{defaultVal:'2027-06-30'})}
        </div>
        <div style="margin-bottom:16px;">
          <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:8px;">Milestones</label>
          <div id="milestones-container">${this._renderRepeating(c.c25_milestones,'milestone',['name','targetDate','description'])}</div>
          <button onclick="IdeaFormPage.addRow('milestones-container','milestone',['name','targetDate','description'])" style="margin-top:8px;padding:6px 14px;background:#f0f7f2;border:1px solid #2D5A3D;border-radius:6px;color:#2D5A3D;font-size:12px;font-weight:500;cursor:pointer;">+ Add Milestone</button>
        </div>
        <div style="margin-bottom:16px;">
          <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:8px;">Team Composition</label>
          <div id="team-container">${this._renderRepeating(c.c26_team_composition,'team',['role','count','source'])}</div>
          <button onclick="IdeaFormPage.addRow('team-container','team',['role','count','source'])" style="margin-top:8px;padding:6px 14px;background:#f0f7f2;border:1px solid #2D5A3D;border-radius:6px;color:#2D5A3D;font-size:12px;font-weight:500;cursor:pointer;">+ Add Team Member</button>
        </div>
        ${g('c27_dependencies','Key Dependencies','textarea',{max:1000})}`;
      case 7: return `
        <div style="margin-bottom:16px;">
          <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:8px;">Risk Register</label>
          <div id="risks-container">${this._renderRepeating(c.c28_risks,'risk',['description','likelihood','impact','mitigation'])}</div>
          <button onclick="IdeaFormPage.addRow('risks-container','risk',['description','likelihood','impact','mitigation'])" style="margin-top:8px;padding:6px 14px;background:#f0f7f2;border:1px solid #2D5A3D;border-radius:6px;color:#2D5A3D;font-size:12px;font-weight:500;cursor:pointer;">+ Add Risk</button>
        </div>
        ${g('c29_risk_rating','Overall Risk Rating','select',{options:[['','Select...'],['low','Low'],['medium','Medium'],['high','High'],['critical','Critical']]})}`;
      case 8: return `
        ${g('c30_technology_stack','Technology Stack','textarea',{})}
        ${g('c31_data_requirements','Data Requirements','textarea',{})}
        ${g('c32_change_management','Change Management','textarea',{})}
        ${g('c33_success_metrics','Success Metrics','textarea',{})}
        ${g('c34_stakeholders','Stakeholders','textarea',{})}
        ${g('c35_additional_notes','Additional Notes','textarea',{})}`;
      default: return '';
    }
  },

  _renderField(id, label, type, value, isAi, opts) {
    opts = opts || {};
    const val = value != null ? value : (opts.defaultVal || '');
    const aiClass = isAi ? 'border-left:3px solid #764ba2;padding-left:12px;' : '';
    let input = '';
    if (type === 'readonly') {
      input = `<input type="text" id="${id}" value="${Components._escapeHtml(String(val || opts.placeholder || ''))}" readonly style="width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;background:#f3f4f6;color:#6b7280;font-family:'Inter',sans-serif;">`;
    } else if (type === 'text' || type === 'number' || type === 'date') {
      input = `<input type="${type}" id="${id}" value="${Components._escapeHtml(String(val))}" ${opts.max?'maxlength="'+opts.max+'"':''} ${opts.step?'step="'+opts.step+'"':''} style="width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;font-family:'Inter',sans-serif;">`;
    } else if (type === 'textarea') {
      input = `<textarea id="${id}" ${opts.max?'maxlength="'+opts.max+'"':''} style="width:100%;box-sizing:border-box;min-height:100px;padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;font-family:'Inter',sans-serif;resize:vertical;">${Components._escapeHtml(String(val))}</textarea>`;
    } else if (type === 'select') {
      const options = (opts.options || []).map(([v, l]) => `<option value="${v}"${val==v?' selected':''}>${l}</option>`).join('');
      input = `<select id="${id}" style="width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;font-family:'Inter',sans-serif;">${options}</select>`;
    }
    return `<div style="margin-bottom:14px;${aiClass}"><label style="display:block;font-size:12px;font-weight:600;color:#6b7280;margin-bottom:4px;">${label}</label>${input}</div>`;
  },

  _slider(id, label, val) {
    return `<div style="margin-bottom:8px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:12px;color:#6b7280;min-width:140px;">${label}</span>
      <input type="range" id="${id}" class="engine-slider" min="0" max="100" value="${val||0}" style="flex:1;">
      <span id="${id}_val" style="font-size:13px;font-weight:600;color:#2D5A3D;min-width:36px;text-align:right;">${val||0}%</span>
    </div>`;
  },

  _scoreSlider(id, label, val) {
    return `<div style="margin-bottom:12px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:13px;color:#374151;min-width:200px;">${label}</span>
      <input type="range" id="${id}" class="score-slider" min="0" max="5" step="1" value="${val||0}" style="flex:1;">
      <span id="${id}_val" style="font-size:14px;font-weight:700;color:#D4AF37;min-width:20px;text-align:center;">${val||0}</span>
    </div>`;
  },

  _renderRepeating(items, prefix, fields) {
    if (!Array.isArray(items) || items.length === 0) return '';
    return items.map((item, idx) => this._repeatingRow(prefix, fields, item, idx)).join('');
  },

  _repeatingRow(prefix, fields, item, idx) {
    item = item || {};
    const inputs = fields.map(f => {
      const val = item[f] || '';
      if (f === 'likelihood' || f === 'impact') {
        const opts = [1,2,3,4,5].map(n => `<option value="${n}"${val==n?' selected':''}>${n}</option>`).join('');
        return `<select data-repeat="${prefix}" data-field="${f}" data-idx="${idx}" style="padding:6px;border:1px solid #e5e7eb;border-radius:4px;font-size:12px;width:60px;"><option value="">-</option>${opts}</select>`;
      }
      if (f === 'source') {
        return `<select data-repeat="${prefix}" data-field="${f}" data-idx="${idx}" style="padding:6px;border:1px solid #e5e7eb;border-radius:4px;font-size:12px;width:100px;"><option value="internal"${val==='internal'?' selected':''}>Internal</option><option value="external"${val==='external'?' selected':''}>External</option></select>`;
      }
      if (f === 'count') {
        return `<input type="number" data-repeat="${prefix}" data-field="${f}" data-idx="${idx}" value="${val}" min="1" style="padding:6px;border:1px solid #e5e7eb;border-radius:4px;font-size:12px;width:60px;">`;
      }
      if (f === 'targetDate') {
        return `<input type="date" data-repeat="${prefix}" data-field="${f}" data-idx="${idx}" value="${val}" style="padding:6px;border:1px solid #e5e7eb;border-radius:4px;font-size:12px;width:130px;">`;
      }
      if (f === 'mitigation' || f === 'description') {
        return `<input type="text" data-repeat="${prefix}" data-field="${f}" data-idx="${idx}" value="${Components._escapeHtml(val)}" placeholder="${f}" style="padding:6px;border:1px solid #e5e7eb;border-radius:4px;font-size:12px;flex:1;min-width:100px;">`;
      }
      return `<input type="text" data-repeat="${prefix}" data-field="${f}" data-idx="${idx}" value="${Components._escapeHtml(val)}" placeholder="${f}" style="padding:6px;border:1px solid #e5e7eb;border-radius:4px;font-size:12px;flex:1;min-width:80px;">`;
    }).join('');
    return `<div class="repeat-row" data-prefix="${prefix}" data-idx="${idx}" style="display:flex;gap:6px;align-items:center;margin-bottom:6px;flex-wrap:wrap;">${inputs}<button onclick="this.parentElement.remove()" style="padding:4px 8px;background:#fef2f2;border:1px solid #fecaca;border-radius:4px;color:#D93025;font-size:11px;cursor:pointer;">✕</button></div>`;
  },

  addRow(containerId, prefix, fields) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const idx = container.querySelectorAll('.repeat-row').length;
    const div = document.createElement('div');
    div.innerHTML = this._repeatingRow(prefix, fields, {}, idx);
    container.appendChild(div.firstElementChild);
  },

  collectFormData() {
    const c = {};
    const ids = ['c01_initiative_id','c02_initiative_name','c03_strategic_domain','c04_category','c05_engine1_pct','c05_engine2_pct','c05_engine3_pct','c06_problem_statement','c07_proposed_solution','c08_expected_outcomes','c09_vision2030_alignment','c10_competitive_response','c11_strategic_value','c12_financial_attractiveness','c13_feasibility_risk','c14_organizational_readiness','c15_innovation_differentiation','c17_total_investment','c18_annual_savings','c19_roi_percent','c20_irr_percent','c21_npv','c22_payback_months','c23_start_date','c24_end_date','c27_dependencies','c29_risk_rating','c30_technology_stack','c31_data_requirements','c32_change_management','c33_success_metrics','c34_stakeholders','c35_additional_notes'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) c[id] = el.value; });
    // Composite score
    const scores = ['c11_strategic_value','c12_financial_attractiveness','c13_feasibility_risk','c14_organizational_readiness','c15_innovation_differentiation'];
    const sum = scores.reduce((s, id) => s + (parseFloat(c[id]) || 0), 0);
    c.c16_composite_score = ((sum / 25) * 100).toFixed(1);
    // Repeating groups
    c.c25_milestones = this._collectRepeating('milestone', ['name','targetDate','description']);
    c.c26_team_composition = this._collectRepeating('team', ['role','count','source']);
    c.c28_risks = this._collectRepeating('risk', ['description','likelihood','impact','mitigation']);
    return c;
  },

  _collectRepeating(prefix, fields) {
    const rows = document.querySelectorAll(`.repeat-row[data-prefix="${prefix}"]`);
    const items = [];
    rows.forEach(row => {
      const item = {};
      fields.forEach(f => {
        const el = row.querySelector(`[data-field="${f}"]`);
        if (el) item[f] = el.value;
      });
      if (Object.values(item).some(v => v)) items.push(item);
    });
    return items;
  },

  saveDraft() {
    const session = Auth.getSession();
    const criteria = this.collectFormData();
    if (!this.currentIdea) {
      this.currentIdea = {
        id: 'idea_' + Date.now(),
        submitterId: session.userId,
        status: 'draft',
        currentReviewStage: null,
        projectDescription: '',
        criteria: criteria,
        aiGenerated: {},
        reviews: {},
        auditTrail: [{ timestamp: new Date().toISOString(), userId: session.userId, action: 'created', description: 'Idea created as draft' }],
        createdAt: new Date().toISOString()
      };
      criteria.c01_initiative_id = criteria.c01_initiative_id || DataStore.getNextIdeaId();
    } else {
      this.currentIdea.criteria = { ...this.currentIdea.criteria, ...criteria };
    }
    DataStore.saveIdea(this.currentIdea);
    this._showToast('Draft saved');
  },

  submitIdea() {
    this.saveDraft();
    const c = this.currentIdea.criteria;
    if (!c.c02_initiative_name) { alert('Initiative name is required.'); return; }
    this.currentIdea.status = this.currentIdea.returnToStage || 'submitted';
    this.currentIdea.currentReviewStage = this.currentIdea.returnToStage || 'it_review';
    this.currentIdea.submittedAt = this.currentIdea.submittedAt || new Date().toISOString();
    const isResubmit = !!this.currentIdea.returnToStage;
    this.currentIdea.auditTrail.push({
      timestamp: new Date().toISOString(),
      userId: Auth.getSession().userId,
      action: isResubmit ? 'resubmitted' : 'submitted',
      description: isResubmit ? 'Revised and resubmitted' : 'Submitted for review',
      newStatus: this.currentIdea.status
    });
    delete this.currentIdea.returnToStage;
    DataStore.saveIdea(this.currentIdea);
    if (isResubmit) {
      NotificationManager.notifyResubmitted(this.currentIdea, this.currentIdea.currentReviewStage);
    } else {
      NotificationManager.notifyIdeaSubmitted(this.currentIdea);
    }
    this.stopAutoSave();
    Router.navigate('#my-ideas');
  },

  async handleAIGenerate() {
    const desc = document.getElementById('project-description')?.value || '';
    if (desc.length < 100) { alert('Please enter at least 100 characters for AI analysis.'); return; }
    AIModule.showLoading('AI is analyzing your idea...');
    try {
      const result = await AIModule.generateFullDossier(desc);
      const session = Auth.getSession();
      this.currentIdea = {
        id: 'idea_' + Date.now(), submitterId: session.userId, status: 'draft', currentReviewStage: null,
        projectDescription: desc, criteria: { c01_initiative_id: DataStore.getNextIdeaId(), ...result },
        aiGenerated: {}, reviews: {},
        auditTrail: [{ timestamp: new Date().toISOString(), userId: session.userId, action: 'created', description: 'Idea created via AI auto-fill' }],
        createdAt: new Date().toISOString()
      };
      Object.keys(result).forEach(k => { this.currentIdea.aiGenerated[k] = true; });
      DataStore.saveIdea(this.currentIdea);
      this.formMode = 'form';
      Router.render();
    } catch (err) { alert('AI Error: ' + err.message); }
    finally { AIModule.hideLoading(); }
  },

  async handleAISectionFill(sectionNum) {
    const desc = this.currentIdea?.projectDescription || '';
    if (!desc) { alert('No project description available.'); return; }
    AIModule.showLoading('AI filling section...');
    try {
      const result = await AIModule.generateSection(sectionNum, desc, this.currentIdea?.criteria || {});
      this.currentIdea.criteria = { ...this.currentIdea.criteria, ...result };
      Object.keys(result).forEach(k => { this.currentIdea.aiGenerated[k] = true; });
      DataStore.saveIdea(this.currentIdea);
      Router.render();
    } catch (err) { alert('AI Error: ' + err.message); }
    finally { AIModule.hideLoading(); }
  },

  _getSectionCompletion(c) {
    return [
      !!(c.c02_initiative_name),
      !!(c.c06_problem_statement && c.c07_proposed_solution && c.c08_expected_outcomes),
      !!(c.c09_vision2030_alignment || c.c10_competitive_response),
      !!(c.c11_strategic_value > 0 || c.c12_financial_attractiveness > 0),
      !!(c.c17_total_investment || c.c18_annual_savings),
      !!(c.c23_start_date || c.c24_end_date),
      !!(c.c29_risk_rating),
      !!(c.c30_technology_stack || c.c33_success_metrics)
    ];
  },

  startAutoSave() { this.stopAutoSave(); this.autoSaveTimer = setInterval(() => { if (this.currentIdea && this.formMode === 'form') this.saveDraft(); }, 30000); },
  stopAutoSave() { if (this.autoSaveTimer) { clearInterval(this.autoSaveTimer); this.autoSaveTimer = null; } },

  _showToast(msg) {
    let t = document.getElementById('form-toast');
    if (!t) { t = document.createElement('div'); t.id = 'form-toast'; document.body.appendChild(t); }
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#2D5A3D;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:500;z-index:9999;opacity:1;transition:opacity 0.3s;';
    t.textContent = msg;
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2000);
  },

  afterRender(param) {
    // Entry mode events
    const aiBtn = document.getElementById('ai-generate-btn');
    if (aiBtn) aiBtn.addEventListener('click', () => this.handleAIGenerate());
    const manBtn = document.getElementById('manual-btn');
    if (manBtn) manBtn.addEventListener('click', () => {
      const desc = document.getElementById('project-description')?.value || '';
      const session = Auth.getSession();
      this.currentIdea = { id: 'idea_' + Date.now(), submitterId: session.userId, status: 'draft', currentReviewStage: null, projectDescription: desc, criteria: { c01_initiative_id: DataStore.getNextIdeaId() }, aiGenerated: {}, reviews: {}, auditTrail: [{ timestamp: new Date().toISOString(), userId: session.userId, action: 'created', description: 'Idea created as draft' }], createdAt: new Date().toISOString() };
      DataStore.saveIdea(this.currentIdea);
      this.formMode = 'form';
      Router.render();
    });
    const descEl = document.getElementById('project-description');
    if (descEl) descEl.addEventListener('input', () => { const cc = document.getElementById('char-count'); if(cc) cc.textContent = descEl.value.length + ' / 5000 characters'; });

    // Form mode events
    document.querySelectorAll('[data-section]').forEach(el => {
      el.addEventListener('click', () => { this.activeSection = parseInt(el.dataset.section); Router.render(); });
    });
    document.querySelectorAll('[data-ai-section]').forEach(el => {
      el.addEventListener('click', () => this.handleAISectionFill(parseInt(el.dataset.aiSection)));
    });
    const saveBtn = document.getElementById('save-draft-btn');
    if (saveBtn) saveBtn.addEventListener('click', () => this.saveDraft());
    const submitBtn = document.getElementById('submit-idea-btn');
    if (submitBtn) submitBtn.addEventListener('click', () => this.submitIdea());

    // Score sliders
    document.querySelectorAll('.score-slider').forEach(sl => {
      sl.addEventListener('input', () => {
        const valEl = document.getElementById(sl.id + '_val');
        if (valEl) valEl.textContent = sl.value;
        const scores = ['c11_strategic_value','c12_financial_attractiveness','c13_feasibility_risk','c14_organizational_readiness','c15_innovation_differentiation'];
        const sum = scores.reduce((s, id) => { const e = document.getElementById(id); return s + (e ? parseFloat(e.value) || 0 : 0); }, 0);
        const comp = document.getElementById('composite-score');
        if (comp) comp.innerHTML = ((sum/25)*100).toFixed(1) + '<span style="font-size:16px;color:#6b7280;">/100</span>';
      });
    });
    // Engine sliders
    document.querySelectorAll('.engine-slider').forEach(sl => {
      sl.addEventListener('input', () => {
        const valEl = document.getElementById(sl.id + '_val');
        if (valEl) valEl.textContent = sl.value + '%';
        const ids = ['c05_engine1_pct','c05_engine2_pct','c05_engine3_pct'];
        const sum = ids.reduce((s, id) => { const e = document.getElementById(id); return s + (e ? parseInt(e.value) || 0 : 0); }, 0);
        const sumEl = document.getElementById('engine-sum');
        const warnEl = document.getElementById('engine-sum-warning');
        if (sumEl) sumEl.textContent = 'Sum: ' + sum + '%';
        if (warnEl) warnEl.style.display = sum !== 100 ? 'block' : 'none';
      });
    });
    // Trigger score calc on load
    const firstScoreSlider = document.querySelector('.score-slider');
    if (firstScoreSlider) firstScoreSlider.dispatchEvent(new Event('input'));

    if (this.formMode === 'form') this.startAutoSave();
  }
};
