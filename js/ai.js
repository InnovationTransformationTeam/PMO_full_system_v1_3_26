// AI Integration Module - Anthropic Claude API
const AIModule = {
  PETROLUBE_SYSTEM_PROMPT: `You are an expert strategic analyst for Petrolube, a Saudi Arabian lubricants company with:
- 43% market share, SAR 3.2B revenue, 824 employees
- Wholly owned by Al-Dabbagh Group
- Competitive threat: Aramco acquired Valvoline ($2.65B) in March 2023
- Strategic framework: Three Engines (E1: Sustain Core 60%, E2: Expand 25%, E3: Base Oil Integration 15%)
- BCG i2i Innovation Maturity: Current 59/100, Target 80+ by 2030
- Technology: Oracle Fusion Cloud (HCM, EPM, ERP, SCM), MiRA route accounting system
- Year 1 Portfolio: 71 initiatives, SAR 95-130M investment, 50 core + 21 contingent

Respond ONLY with valid JSON. No markdown, no explanation, no backticks.
The JSON keys must exactly match the field IDs specified.
For scoring dimensions (c11-c15), provide scores on the 0-5 scale per sub-dimension.
For financial fields, use SAR millions with 1 decimal place.
For text fields, be specific to Petrolube's context.
Apply conservative financial estimates.`,

  getApiKey() {
    const settings = DataStore.getSettings();
    return settings ? settings.apiKey : null;
  },

  async callClaude(userPrompt) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not configured. Go to Settings to add your Anthropic API key.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: this.PETROLUBE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Try to parse JSON from response, handling possible markdown wrapping
    let jsonStr = text;
    if (text.includes('```')) {
      jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }
    return JSON.parse(jsonStr);
  },

  async generateFullDossier(projectDescription) {
    const prompt = `Analyze this initiative idea for Petrolube and generate all criteria fields as a JSON object.

The JSON must have these exact keys:
- c02_initiative_name: string (concise name for the initiative)
- c03_strategic_domain: one of "digital_transformation", "operational_excellence", "market_expansion", "sustainability", "workforce_development", "customer_experience"
- c04_category: one of "core_incremental", "core_disruptive", "non_core_incremental", "non_core_disruptive"
- c05_engine1_pct: number (Engine 1: Sustain Core %, the three engines must sum to 100)
- c05_engine2_pct: number (Engine 2: Expand %)
- c05_engine3_pct: number (Engine 3: Base Oil Integration %)
- c06_problem_statement: string (detailed problem, 200-500 chars)
- c07_proposed_solution: string (detailed solution, 200-500 chars)
- c08_expected_outcomes: string (measurable outcomes, 200-500 chars)
- c09_vision2030_alignment: string (how it aligns with Saudi Vision 2030)
- c10_competitive_response: string (how it addresses Aramco/Valvoline competitive threat)
- c11_strategic_value: number 0-5
- c12_financial_attractiveness: number 0-5
- c13_feasibility_risk: number 0-5
- c14_organizational_readiness: number 0-5
- c15_innovation_differentiation: number 0-5
- c17_total_investment: number (SAR millions, 1 decimal)
- c18_annual_savings: number (SAR millions, 1 decimal)
- c19_roi_percent: number (percentage)
- c20_irr_percent: number (percentage)
- c21_npv: number (SAR millions, 1 decimal)
- c22_payback_months: number (months)
- c23_start_date: string (ISO date, in 2026)
- c24_end_date: string (ISO date, in 2026-2027)
- c25_milestones: array of {name, targetDate, description}
- c26_team_composition: array of {role, count, skillset}
- c27_dependencies: string
- c28_risks: array of {description, likelihood: 1-5, impact: 1-5, mitigation}
- c29_risk_rating: one of "low", "medium", "high", "critical"
- c30_technology_stack: string
- c31_data_requirements: string
- c32_change_management: string
- c33_success_metrics: string
- c34_stakeholders: string
- c35_additional_notes: string

Project Description:
${projectDescription}`;

    return await this.callClaude(prompt);
  },

  async generateSection(sectionNumber, projectDescription, existingCriteria) {
    const sectionFields = {
      1: ['c02_initiative_name', 'c03_strategic_domain', 'c04_category', 'c05_engine1_pct', 'c05_engine2_pct', 'c05_engine3_pct'],
      2: ['c06_problem_statement', 'c07_proposed_solution', 'c08_expected_outcomes'],
      3: ['c09_vision2030_alignment', 'c10_competitive_response'],
      4: ['c11_strategic_value', 'c12_financial_attractiveness', 'c13_feasibility_risk', 'c14_organizational_readiness', 'c15_innovation_differentiation'],
      5: ['c17_total_investment', 'c18_annual_savings', 'c19_roi_percent', 'c20_irr_percent', 'c21_npv', 'c22_payback_months'],
      6: ['c23_start_date', 'c24_end_date', 'c25_milestones', 'c26_team_composition', 'c27_dependencies'],
      7: ['c28_risks', 'c29_risk_rating'],
      8: ['c30_technology_stack', 'c31_data_requirements', 'c32_change_management', 'c33_success_metrics', 'c34_stakeholders', 'c35_additional_notes']
    };

    const sectionNames = {
      1: 'Classification & Strategy',
      2: 'Problem, Solution & Outcomes',
      3: 'Strategic Alignment',
      4: 'Scoring Dimensions',
      5: 'Financial Analysis',
      6: 'Timeline & Resources',
      7: 'Risk Assessment',
      8: 'Technical & Operational Details'
    };

    const fields = sectionFields[sectionNumber];
    if (!fields) {
      throw new Error(`Invalid section number: ${sectionNumber}. Must be 1-8.`);
    }

    const sectionName = sectionNames[sectionNumber] || `Section ${sectionNumber}`;
    const contextStr = existingCriteria && Object.keys(existingCriteria).length > 0
      ? `\n\nExisting criteria already filled in (use as context for consistency):\n${JSON.stringify(existingCriteria, null, 2)}`
      : '';

    const fieldDescriptions = {
      c02_initiative_name: 'string (concise name for the initiative)',
      c03_strategic_domain: 'one of "digital_transformation", "operational_excellence", "market_expansion", "sustainability", "workforce_development", "customer_experience"',
      c04_category: 'one of "core_incremental", "core_disruptive", "non_core_incremental", "non_core_disruptive"',
      c05_engine1_pct: 'number (Engine 1: Sustain Core %, three engines must sum to 100)',
      c05_engine2_pct: 'number (Engine 2: Expand %)',
      c05_engine3_pct: 'number (Engine 3: Base Oil Integration %)',
      c06_problem_statement: 'string (detailed problem statement, 200-500 chars)',
      c07_proposed_solution: 'string (detailed proposed solution, 200-500 chars)',
      c08_expected_outcomes: 'string (measurable expected outcomes, 200-500 chars)',
      c09_vision2030_alignment: 'string (how it aligns with Saudi Vision 2030)',
      c10_competitive_response: 'string (how it addresses Aramco/Valvoline competitive threat)',
      c11_strategic_value: 'number 0-5 (strategic value score)',
      c12_financial_attractiveness: 'number 0-5 (financial attractiveness score)',
      c13_feasibility_risk: 'number 0-5 (feasibility and risk score)',
      c14_organizational_readiness: 'number 0-5 (organizational readiness score)',
      c15_innovation_differentiation: 'number 0-5 (innovation and differentiation score)',
      c17_total_investment: 'number (SAR millions, 1 decimal place)',
      c18_annual_savings: 'number (SAR millions, 1 decimal place)',
      c19_roi_percent: 'number (ROI percentage)',
      c20_irr_percent: 'number (IRR percentage)',
      c21_npv: 'number (NPV in SAR millions, 1 decimal place)',
      c22_payback_months: 'number (payback period in months)',
      c23_start_date: 'string (ISO date, in 2026)',
      c24_end_date: 'string (ISO date, in 2026-2027)',
      c25_milestones: 'array of {name, targetDate, description}',
      c26_team_composition: 'array of {role, count, skillset}',
      c27_dependencies: 'string (key dependencies)',
      c28_risks: 'array of {description, likelihood: 1-5, impact: 1-5, mitigation}',
      c29_risk_rating: 'one of "low", "medium", "high", "critical"',
      c30_technology_stack: 'string (technology stack details)',
      c31_data_requirements: 'string (data requirements)',
      c32_change_management: 'string (change management approach)',
      c33_success_metrics: 'string (measurable success metrics)',
      c34_stakeholders: 'string (key stakeholders)',
      c35_additional_notes: 'string (any additional notes)'
    };

    const fieldList = fields.map(f => `- ${f}: ${fieldDescriptions[f] || 'string'}`).join('\n');

    const prompt = `For this Petrolube initiative, generate ONLY the "${sectionName}" section fields as a JSON object.

Return a JSON object with exactly these keys:
${fieldList}
${contextStr}

Project Description:
${projectDescription}`;

    return await this.callClaude(prompt);
  },

  // Show loading overlay during AI operations
  showLoading(message) {
    let overlay = document.getElementById('ai-loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ai-loading-overlay';
      overlay.className = 'loading-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10000;';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<div class="loading-content" style="background:#fff;border-radius:12px;padding:40px 50px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
      <div class="spinner" style="width:48px;height:48px;border:4px solid #e0e0e0;border-top-color:#0d6efd;border-radius:50%;animation:ai-spin 0.8s linear infinite;margin:0 auto 16px;"></div>
      <p style="margin:0;font-size:16px;color:#333;font-weight:500;">${message || 'AI is analyzing your idea...'}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#888;">This may take 10-30 seconds</p>
      <style>@keyframes ai-spin{to{transform:rotate(360deg)}}</style>
    </div>`;
    overlay.style.display = 'flex';
  },

  hideLoading() {
    const overlay = document.getElementById('ai-loading-overlay');
    if (overlay) overlay.style.display = 'none';
  },

  // Render API key settings modal
  renderSettingsModal() {
    const currentKey = this.getApiKey();
    const maskedKey = currentKey ? currentKey.substring(0, 10) + '...' + currentKey.substring(currentKey.length - 4) : '';

    return `<div class="modal-overlay" id="ai-settings-modal" onclick="AIModule.closeSettingsModal(event)">
      <div class="modal-content" onclick="event.stopPropagation()" style="background:#fff;border-radius:12px;padding:32px;max-width:500px;width:90%;margin:auto;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
        <button class="modal-close" onclick="AIModule.closeSettingsModal()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;color:#666;">&times;</button>
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;">AI Settings</h2>
        <p style="margin:0 0 20px;color:#666;font-size:14px;">Configure your Anthropic API key to enable AI-powered dossier generation.</p>
        ${currentKey ? `<div style="margin-bottom:16px;padding:10px 14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;font-size:13px;color:#0369a1;">
          Current key: <code style="font-family:monospace;">${maskedKey}</code>
        </div>` : ''}
        <label style="display:block;margin-bottom:6px;font-size:14px;font-weight:500;color:#333;">Anthropic API Key</label>
        <input type="password" id="ai-api-key-input" placeholder="sk-ant-..." value="${currentKey || ''}"
          style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;margin-bottom:20px;" />
        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button onclick="AIModule.closeSettingsModal()" style="padding:8px 20px;border:1px solid #d1d5db;background:#fff;border-radius:8px;cursor:pointer;font-size:14px;color:#333;">Cancel</button>
          <button onclick="AIModule.saveApiKeyFromModal()" style="padding:8px 20px;border:none;background:#0d6efd;color:#fff;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;">Save Key</button>
        </div>
      </div>
    </div>`;
  },

  showSettingsModal() {
    const existing = document.getElementById('ai-settings-modal');
    if (existing) existing.remove();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.renderSettingsModal();
    const modal = wrapper.firstElementChild;
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10001;';
    document.body.appendChild(modal);

    const input = document.getElementById('ai-api-key-input');
    if (input) input.focus();
  },

  closeSettingsModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('ai-settings-modal');
    if (modal) modal.remove();
  },

  saveApiKey(key) {
    const settings = DataStore.getSettings();
    settings.apiKey = key;
    DataStore.saveSettings(settings);
  },

  saveApiKeyFromModal() {
    const input = document.getElementById('ai-api-key-input');
    if (!input) return;

    const key = input.value.trim();
    if (!key) {
      alert('Please enter a valid API key.');
      return;
    }

    this.saveApiKey(key);
    this.closeSettingsModal();
    alert('API key saved successfully.');
  }
};
