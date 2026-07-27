const solutionRules = `Rules for all solution-side stages:
- Use only the provided case material, earlier Case War Room outputs, and user instructions.
- Do not use external web search, outside company facts, recent news, or model memory.
- If data is missing, write exactly: "Not available in the provided case."
- If assumptions are required, label them clearly as "Assumption required."
- Keep every recommendation evidence-bound and presentation-ready.
- Return valid JSON only.`;

export const strategyPrompt = `${solutionRules}

Create Stage 5: Strategy Builder.

Choose frameworks based on the case subject and the evidence already decoded.

Framework selection guide by subject:
Marketing: STP, 4Ps, consumer journey, funnel analysis, brand positioning, competitor mapping.
Strategy: Porter's Five Forces, SWOT, PESTLE, Ansoff Matrix, value chain, business model canvas.
Operations: bottleneck analysis, capacity planning, process flow, cost-quality-speed tradeoff, supply chain mapping.
Finance: profitability analysis, unit economics, break-even, NPV, sensitivity analysis.
Product: user journey, RICE, Kano, Jobs-to-Be-Done, funnel metrics, retention analysis.
Analytics: hypothesis tree, metric tree, segmentation, driver analysis, correlation/causation caution.
HR: organization design, motivation theories, capability mapping, culture analysis, change management.

Return a JSON object with this exact shape:
{
  "best_frameworks_for_this_case": [
    {
      "framework": string,
      "why_it_fits": string,
      "how_to_apply": string
    }
  ],
  "frameworks_not_suitable": [
    {
      "framework": string,
      "why_not_suitable": string
    }
  ],
  "strategic_directions": [
    {
      "direction": string,
      "what_it_means": string,
      "advantages": string[],
      "disadvantages": string[],
      "when_it_works": string,
      "risk_level": string,
      "expected_business_impact": string,
      "data_needed_to_support_it": string[],
      "defensibility_in_presentation": string
    }
  ],
  "evidence_bound_notes": string[],
  "missing_data_or_assumptions": string[]
}`;

export const evaluationPrompt = `${solutionRules}

Create Stage 6: Evaluation Matrix.

Generate a clean evaluation matrix comparing the strategic options from the Strategy Builder. If strategic options are missing, infer only from the provided case and clearly label what is not available.

Score each option from 1 to 5, where 5 is strongest. Add short reasoning for each score.

Criteria:
- Market potential
- Feasibility
- Cost
- Risk
- Long-term fit
- Financial attractiveness
- Customer impact
- Operational complexity
- Strategic defensibility
- Overall score

Return a JSON object with this exact shape:
{
  "summary": string,
  "scoring_scale": string,
  "matrix": [
    {
      "strategic_option": string,
      "market_potential": { "score": number, "reasoning": string },
      "feasibility": { "score": number, "reasoning": string },
      "cost": { "score": number, "reasoning": string },
      "risk": { "score": number, "reasoning": string },
      "long_term_fit": { "score": number, "reasoning": string },
      "financial_attractiveness": { "score": number, "reasoning": string },
      "customer_impact": { "score": number, "reasoning": string },
      "operational_complexity": { "score": number, "reasoning": string },
      "strategic_defensibility": { "score": number, "reasoning": string },
      "overall_score": { "score": number, "reasoning": string }
    }
  ],
  "presentation_ready_takeaway": string,
  "missing_data_or_assumptions": string[]
}`;

export const riskPrompt = `${solutionRules}

Create Stage 7: Risk Matrix.

Generate risks tied to the proposed strategic options and final decision context.

Risk types to consider:
- market risk
- financial risk
- operational risk
- customer risk
- competitive risk
- execution risk
- regulatory risk
- brand risk
- data/assumption risk

Return a JSON object with this exact shape:
{
  "summary": string,
  "risks": [
    {
      "risk": string,
      "risk_type": string,
      "probability": string,
      "impact": string,
      "mitigation": string,
      "early_warning_indicators": string[],
      "owner_or_team_responsibility": string
    }
  ],
  "highest_priority_risks": string[],
  "missing_data_or_assumptions": string[]
}`;

export const recommendationPrompt = `${solutionRules}

Create Stage 8: Final Recommendation.

Build a defensible final recommendation using:
- provided case facts
- exhibits
- business logic
- constraints
- clearly labeled assumptions

Return a JSON object with this exact shape:
{
  "recommended_decision": string,
  "why_this_recommendation_is_best": string,
  "reasoning_chain": {
    "provided_case_facts": string[],
    "exhibit_logic": string[],
    "business_logic": string[],
    "constraints_considered": string[],
    "assumptions_required": string[]
  },
  "implementation_roadmap": [
    {
      "phase": string,
      "timeline": string,
      "action": string,
      "owner": string,
      "expected_outcome": string,
      "success_metric": string
    }
  ],
  "success_metrics": string[],
  "financial_implications": string,
  "strategic_implications": string,
  "operational_implications": string,
  "what_could_go_wrong": string[],
  "backup_plan": string,
  "one_line_executive_recommendation": string,
  "sixty_second_presentation_summary": string,
  "missing_data_or_assumptions": string[]
}`;

export const pptPrompt = `${solutionRules}

Create Stage 9: PPT Storyline.

Generate a slide-by-slide structure. If the user gave a slide limit, follow that slide limit exactly.

Default 5-slide structure:
1. Context and problem
2. Exhibit insights
3. Strategic options
4. Recommendation
5. Implementation and risks

Default 10-slide structure:
1. Context and decision problem
2. Company/industry situation
3. Market/customer insight
4. Exhibit insights
5. Key challenges
6. Strategic options
7. Evaluation matrix
8. Recommended strategy
9. Implementation roadmap
10. Risks and expected impact

Return a JSON object with this exact shape:
{
  "slide_limit_used": string,
  "storyline_summary": string,
  "slides": [
    {
      "slide_number": number,
      "slide_title": string,
      "main_message": string,
      "key_content": string[],
      "suggested_chart_or_table": string,
      "speaker_note": string,
      "exhibit_or_data_to_use": string,
      "design_suggestion": string
    }
  ],
  "presentation_flow_note": string,
  "missing_data_or_assumptions": string[]
}`;

export const reflectionPrompt = `${solutionRules}

Create Stage 10: Reflection Questions.

Generate questions that help the user test the quality of the case solution.

Return a JSON object with this exact shape:
{
  "reflection_questions": [
    {
      "question": string,
      "why_it_matters": string,
      "what_a_strong_answer_should_include": string
    }
  ],
  "required_questions_covered": {
    "what_is_the_real_decision": string,
    "which_exhibit_matters_most": string,
    "what_are_we_solving_for": string,
    "what_assumptions_are_we_making": string,
    "is_the_recommendation_realistic": string,
    "can_we_defend_this": string,
    "what_would_make_the_solution_fail": string,
    "what_data_would_strengthen_the_recommendation": string,
    "what_would_a_critic_say": string,
    "what_is_the_simplest_version_of_the_answer": string
  },
  "missing_data_or_assumptions": string[]
}`;

export const readinessScorePrompt = `${solutionRules}

Create Stage 11: Case Readiness Score.

Score the solution out of 100 using the criteria below:
- Problem clarity
- Exhibit understanding
- Framework fit
- Strategic option quality
- Recommendation strength
- Financial logic
- Feasibility
- Risk coverage
- Presentation readiness
- Defensibility

Return a JSON object with this exact shape:
{
  "overall_case_readiness_score": number,
  "sub_scores": {
    "problem_clarity": number,
    "exhibit_understanding": number,
    "framework_fit": number,
    "strategic_option_quality": number,
    "recommendation_strength": number,
    "financial_logic": number,
    "feasibility": number,
    "risk_coverage": number,
    "presentation_readiness": number,
    "defensibility": number
  },
  "strongest_area": string,
  "weakest_area": string,
  "what_to_improve_before_submission": string[],
  "three_priority_fixes": string[],
  "judge_or_professor_likely_questions": string[],
  "missing_data_or_assumptions": string[]
}`;
