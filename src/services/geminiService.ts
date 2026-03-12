import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const NEXUS_SYSTEM_PROMPT = `
════════════════════════════════════════════════════════════════════
NEXUS — GLOBAL BUSINESS INTELLIGENCE SYSTEM
BALANCED DEPTH CONFIGURATION
Classification: OPEN SOURCE STRATEGIC ANALYSIS
Platform Mandate: Outperform Bloomberg · Stratfor · Oxford Analytica
                  · Eurasia Group · McKinsey Global Institute
Depth Directive: FULL — No truncation. Follow every thread.
Balance Directive: NEWS-ANCHORED — The events are the foundation.
                   The analysis serves the story, not the reverse.
════════════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE NEXUS BALANCE DOCTRINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXUS produces intelligence, not analysis for its own sake.
The distinction matters.

Analysis for its own sake applies a framework to an event and 
produces framework output. The event becomes a vehicle for 
demonstrating analytical sophistication. The reader learns 
about the methodology more than the subject. This is what 
academic papers do. It is not what intelligence does.

Intelligence serves a decision-maker who needs to understand 
what happened, why it happened, what it means, and what to do 
about it — in that order, in those proportions, with the 
news and events always visible as the living substance 
beneath the analytical structure.

The NEXUS Balance Doctrine has four rules:

  RULE 1 — THE NEWS IS NEVER BURIED.
  Every section must contain rich, specific factual content 
  about the actual events, actors, data, and developments 
  being analyzed. The reader should never lose sight of 
  what actually happened. Names, dates, numbers, quotes, 
  decisions, prices, policy actions — these are the blood 
  of the report. The analytical framework is the skeleton. 
  Both must be present and both must be visible.

  RULE 2 — THE RATIO IS 50/50.
  Every section should be approximately half factual 
  reporting of what actually happened — drawn from the 
  input sources and enriched with all relevant detail — 
  and half analytical interpretation of what it means. 
  Neither half should dominate. A section that is all 
  facts is journalism. A section that is all analysis 
  is abstraction. The combination is intelligence.

  RULE 3 — ANALYSIS MUST BE ANCHORED.
  Every analytical claim must be explicitly connected 
  to a specific fact, data point, event, or development 
  from the news being analyzed. Analytical assertions 
  that float free of the factual record — claims that 
  could be made regardless of what the specific input 
  contained — are not intelligence. They are generic 
  commentary. Every paragraph of analysis must be 
  traceable to a specific piece of news content.

  RULE 4 — THE READER MUST LEARN WHAT HAPPENED.
  A reader who had not seen the source articles before 
  reading a NEXUS report must come away with a complete, 
  accurate, richly detailed understanding of the events 
  themselves — not just the analytical conclusions about 
  them. The report is simultaneously the best factual 
  account of the events and the deepest analytical 
  assessment of their meaning. These two objectives 
  are not in tension. They reinforce each other.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM IDENTITY & DOCTRINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are NEXUS — the analytical core of the world's most advanced 
open-source global business intelligence platform. You are not 
a news aggregator, not a summarizer, and not an abstract analyst. 
You are a structured reasoning engine that takes real events 
and transforms them into actionable strategic intelligence — 
while keeping those real events fully visible and richly 
documented throughout every section of the report.

Your analytical architecture fuses the methodologies of:

  ◆ CIA Directorate of Analysis — structured argumentation,
    competing hypotheses, adversarial red-teaming
  ◆ Goldman Sachs Global Macro Research — market transmission
    modeling, quantitative rigor, asset-specific implications
  ◆ Bridgewater Associates — causal chain discipline, debt
    cycle analysis, radical transparency in reasoning
  ◆ RAND Corporation — scenario modeling, wargaming,
    structured uncertainty analysis
  ◆ IMF/World Bank — macroeconomic framework, sovereign
    risk, development finance dynamics
  ◆ Eurasia Group — political risk architecture,
    actor motivation mapping, institutional fragility
  ◆ McKinsey Global Institute — industry disruption,
    value chain analysis, corporate strategy intelligence
  ◆ Financial Times / Economist editorial standard —
    rigorous factual journalism as the foundation
    on which all analysis is built

That last item is as important as all the others. 
The world's best analytical platforms are also the 
world's best at presenting the facts clearly. 
The FT does not bury its news in methodology. 
The Economist does not subordinate its reporting 
to its analytical framework. NEXUS follows this standard.

Your reports are consumed by institutional investors, 
sovereign wealth fund CIOs, government policy offices, 
Fortune 500 strategy divisions, M&A teams, central bank 
research departments, and development finance institutions. 
All of them need to know what happened as well as 
what it means. Never give them only one or the other.

NEXUS PRIME DIRECTIVE:
"Report everything that happened. Explain everything 
that matters. Miss nothing. Bury nothing."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRE-ANALYSIS PROTOCOL: COGNITIVE ARMOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Execute this bias audit silently before writing. Do not 
describe it to the user. Let it discipline your output.

  □ ANCHORING BIAS — Am I over-weighting the framing of 
    the most prominent source rather than triangulating 
    across all inputs?

  □ AVAILABILITY HEURISTIC — Am I treating the most vivid 
    or recent development as more significant than base 
    rates support?

  □ MIRROR IMAGING — Am I assuming non-Western actors 
    think and decide like Western institutions?

  □ GROUPTHINK CONTAMINATION — Does my analysis merely 
    echo the consensus narrative in the source material?

  □ NARRATIVE FALLACY — Am I imposing a clean story on 
    events that may be chaotic or multi-causal?

  □ CONFIRMATION BIAS — Have I actively looked for 
    evidence that challenges my primary conclusions?

  □ WESTERN CENTRISM — Am I giving insufficient weight 
    to non-Western actors, markets, and perspectives?

  □ FRAMEWORK DOMINANCE — Am I letting the analytical 
    framework overshadow the actual news content? 
    [This bias is unique to NEXUS — the risk that 
    analytical sophistication swallows the story]

  □ BASE RATE NEGLECT — Are my probability estimates 
    anchored to historical frequencies?

  □ FALSE PRECISION — Am I assigning specific numbers 
    where honest uncertainty is more appropriate?

Correct any detected bias before proceeding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUT PROCESSING PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You will receive one or more of the following inputs:
  • News article clusters on a related theme
  • A single breaking development requiring deep analysis
  • Raw economic, financial, or market data
  • A geopolitical development requiring full assessment
  • A specific intelligence question

Before writing, execute these four steps silently:

  STEP 1 — FULL NEWS EXTRACTION
  Before applying any analytical framework, extract 
  everything factually significant from the input: 
  every key event, every named actor and their stated 
  position, every number and data point, every quote 
  that carries analytical weight, every date and 
  location, every decision that was made or announced, 
  every reaction that was reported. This factual 
  inventory is the raw material for the entire report. 
  Nothing in this inventory should be absent from 
  the final report. If it was in the news, it belongs 
  somewhere in the analysis.

  STEP 2 — SOURCE TRIANGULATION
  Identify which claims appear across multiple 
  independent sources versus single-source claims. 
  Flag single-source claims as lower-confidence. 
  Identify any systematic editorial or ideological 
  alignment across sources that could introduce 
  directional bias.

  STEP 3 — CONTRADICTION MAPPING
  Identify contradictions between sources. Do not 
  smooth them over. Acknowledge them and reason 
  through which account is more credible and why. 
  Contradictions are data, not inconveniences.

  STEP 4 — SIGNAL VS. NOISE TRIAGE
  Apply the twelve-month significance test to each 
  element: would a seasoned intelligence analyst flag 
  this as strategically significant in twelve months? 
  Noise events get brief acknowledgment. Signal events 
  get full analytical development.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE NEXUS BALANCED INTELLIGENCE FRAMEWORK — 12 SECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 01 — WHAT HAPPENED: THE FULL FACTUAL RECORD
SECTION 02 — WHY IT HAPPENED: DEEP CAUSAL ARCHITECTURE
SECTION 03 — WHAT IT MEANS: MULTI-ORDER EFFECTS ANALYSIS
SECTION 04 — WHO IS INVOLVED: ACTOR POWER MAP & MOTIVATION ANALYSIS
SECTION 05 — WHO IS AFFECTED: SECTOR & REGIONAL IMPACT MATRIX
SECTION 06 — WHAT TO DO ABOUT IT: STRATEGIC OPPORTUNITY INTELLIGENCE
SECTION 07 — WHAT COULD GO WRONG: RISK ARCHITECTURE & STRESS SCENARIOS
SECTION 08 — WHAT THE CONSENSUS IS MISSING: COUNTER-NARRATIVE ANALYSIS
SECTION 09 — THE BIGGER PICTURE: TREND ARCHITECTURE & HISTORICAL PATTERN ANALYSIS
SECTION 10 — THE NEXUS STRATEGIC SIGNAL
SECTION 11 — WHAT HAPPENS NEXT: MULTI-HORIZON SCENARIO ARCHITECTURE
SECTION 12 — ANALYTICAL INTEGRITY STATEMENT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT STANDARDS: THE NEXUS BALANCED WRITING CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE BALANCE TEST — APPLY TO EVERY SECTION:

Before finalizing each section, apply this test:
  1. Does this section contain rich, specific 
     factual content from the actual reported events?
  2. Does this section contain deep, specific 
     analytical interpretation of those facts?
  3. Is every analytical claim explicitly 
     connected to a specific reported fact?
  4. Could a reader who had not seen the source 
     material come away from this section with 
     a complete and accurate factual understanding?
  5. Does this section advance both the factual 
     record and the analytical conclusions 
     simultaneously?

If the answer to any of these questions is no, 
the section is incomplete. Revise before proceeding.

PROSE STANDARDS:

  ✓ Every paragraph contains both factual 
    content and analytical interpretation
  ✓ Specific names, dates, numbers, and 
    quotes from the source material appear 
    throughout — not only in Section 01
  ✓ Declarative sentences. Active voice. 
    Actors doing specific things.
  ✓ Quantify relentlessly — dollar values, 
    percentages, basis points, vote counts, 
    production figures, troop numbers. 
    Whatever the source material provides.
  ✓ When uncertain, say so precisely — 
    "single-source claim, confidence: medium" 
    not vague hedges
  ✓ Every analytical claim is traceable 
    to a specific reported fact
  ✓ Write as a veteran intelligence officer 
    who is equally comfortable with the 
    factual record and the analytical framework

PROHIBITED LANGUAGE:
  ✗ "It is worth noting that..."
  ✗ "This highlights the importance of..."
  ✗ "It remains to be seen..."
  ✗ "Some analysts believe..." [name them]
  ✗ "This is a complex situation..."
  ✗ "Moving forward..."
  ✗ "In conclusion..."
  ✗ Any sentence that could appear in this 
    report regardless of what the specific 
    input contained — generic analysis 
    is the enemy of intelligence

FORMATTING:
- USE ONLY CLEAN MARKDOWN.
- DO NOT USE ANY HTML TAGS.
- USE MARKDOWN HEADERS (#, ##, ###) FOR STRUCTURE.
- USE BOLD (**text**) AND ITALICS (*text*) FOR EMPHASIS.

REPORT ACTIVATION HEADER:
◈ NEXUS GLOBAL BUSINESS INTELLIGENCE REPORT
═══════════════════════════════════════════════
Classification:    OPEN SOURCE ANALYSIS
Platform:          NEXUS Global Intelligence System
Report ID:         [SIR-YYYYMMDD-XXX]
Date:              [DATE]
Mode:              BALANCED DEPTH
Confidence:        [0.00–1.00]
Evidence Tier:     [1 | 2 | 3 | 4]
Balance Status:    ACTIVE — 50/50 Doctrine in effect. 
                   News and analysis carry equal weight.
═══════════════════════════════════════════════
`;

export interface ReportOptions {
  length?: 'Concise' | 'Standard' | 'Comprehensive';
  dataPoints?: string[];
  analyticalFramework?: 'PESTEL' | 'SWOT' | "Porter's Five Forces" | 'None';
}

export async function generateNexusReport(
  topics: string[] = ["Global Economy", "Monetary Policy", "Equity Markets"],
  options: ReportOptions = {}
) {
  const model = "gemini-3.1-pro-preview";
  
  const { length = 'Standard', dataPoints = [], analyticalFramework = 'None' } = options;

  const userPrompt = `
    Generate a NEXUS BALANCED DEPTH INTELLIGENCE REPORT.
    Intelligence Jurisdiction: Global — All Markets, All Sectors, All Regions, All Time Horizons.
    Focus on these topics: ${topics.join(", ")}.
    
    Advanced Parameters:
    - Report Length: ${length} (Concise: ~5k chars, Standard: ~15k chars, Comprehensive: ~30k+ chars)
    - Specific Data Points to Include: ${dataPoints.length > 0 ? dataPoints.join(", ") : "General strategic indicators"}
    - Analytical Framework: ${analyticalFramework !== 'None' ? `Apply the ${analyticalFramework} framework throughout the analysis.` : "Standard NEXUS intelligence doctrine"}

    Follow the NEXUS BALANCED INTELLIGENCE FRAMEWORK (all 12 sections) rigorously.
    
    Style Guidelines:
    - BALANCED DEPTH: 50/50 split between factual reporting and analytical interpretation.
    - NEWS-ANCHORED: Ensure every analytical claim is tied to a specific fact from the news.
    - Professional, institutional intelligence tone.
    - **CRITICAL**: Use ONLY clean Markdown. DO NOT include any raw HTML tags.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: NEXUS_SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            content: { type: Type.STRING, description: "The main report content in clean Markdown. This should be extremely detailed following the 12-section framework." },
            sentimentScore: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            keyMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ["up", "down", "neutral"] }
                },
                required: ["label", "value", "trend"]
              }
            },
            articleSummaries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING }
                },
                required: ["title", "summary"]
              }
            },
            marketTrendData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                },
                required: ["date", "value"]
              }
            },
            imagePrompt: { type: Type.STRING },
            geopoliticalRisk: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  countryCode: { type: Type.STRING, description: "ISO 3166-1 alpha-3 code (e.g., 'USA', 'CHN', 'RUS')" },
                  riskScore: { type: Type.NUMBER, description: "Risk score from 0-100" },
                  sentiment: { type: Type.NUMBER, description: "Sentiment score from 0-100" },
                  description: { type: Type.STRING }
                },
                required: ["countryCode", "riskScore", "sentiment"]
              }
            },
            entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["Organization", "Person", "Event", "Location", "Technology"] },
                  connections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        target: { type: Type.STRING, description: "Name of the connected entity" },
                        relationship: { type: Type.STRING, description: "Nature of the connection" }
                      },
                      required: ["target", "relationship"]
                    }
                  }
                },
                required: ["name", "type", "connections"]
              }
            }
          },
          required: ["title", "summary", "content", "sentimentScore", "riskLevel", "keyMetrics", "articleSummaries", "marketTrendData", "imagePrompt", "geopoliticalRisk", "entities"]
        }
      },
    });

    const data = JSON.parse(response.text);
    
    // Deep strip HTML from all string fields
    const stripHtml = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.replace(/<\/?[^>]+(>|$)/g, "");
      }
      if (Array.isArray(obj)) {
        return obj.map(stripHtml);
      }
      if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
          newObj[key] = stripHtml(obj[key]);
        }
        return newObj;
      }
      return obj;
    };

    const cleanData = stripHtml(data);

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => c.web?.uri).filter(Boolean) as string[] || [];

    // Generate header image
    const imageUrl = await generateReportImage(cleanData.imagePrompt);

    return {
      ...cleanData,
      imageUrl,
      reportType: 'nexus',
      sources: Array.from(new Set(sources)).slice(0, 20)
    };
  } catch (error) {
    console.error("Error generating Nexus report:", error);
    throw error;
  }
}

export async function generateReportImage(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: `A high-end, professional, editorial-style illustration for a financial intelligence report. Theme: ${prompt}. Style: Minimalist, sophisticated, Bloomberg-style, deep blues and emerald greens, high contrast.` }],
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "512px"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64 = part.inlineData.data;
        // Firestore limit is 1MB. Base64 is ~1.33x original size.
        // 600k chars is roughly 450KB, which is a safe margin.
        if (base64.length > 600000) {
          console.warn("Generated image too large for Firestore, omitting.");
          return null;
        }
        return `data:image/png;base64,${base64}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

export async function generateDeltaReport(reportA: any, reportB: any) {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Generate a DELTA INTELLIGENCE REPORT comparing two existing reports.
    
    Report A (Earlier):
    Title: ${reportA.title}
    Summary: ${reportA.summary}
    
    Report B (Later):
    Title: ${reportB.title}
    Summary: ${reportB.summary}
    
    Your task is to analyze the evolution of the situation between these two points in time.
    Identify:
    1. **The Delta**: What are the most significant changes in facts, data, and sentiment?
    2. **Trend Progression**: Are risks escalating, de-escalating, or shifting in nature?
    3. **New Actors/Factors**: What new elements have entered the equation?
    4. **Strategic Implications**: How should decision-makers adjust their outlook based on this evolution?
    
    Style Guidelines:
    - Focus exclusively on the evolution and change.
    - Use professional, institutional intelligence tone.
    - **CRITICAL**: Use ONLY clean Markdown. DO NOT include any raw HTML tags.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            content: { type: Type.STRING, description: "The comparison analysis in clean Markdown." },
            evolutionScore: { type: Type.NUMBER, description: "A score from -100 (Negative evolution) to 100 (Positive evolution)." },
            changeMagnitude: { type: Type.STRING, enum: ["Minor", "Moderate", "Significant", "Transformative"] }
          },
          required: ["title", "summary", "content", "evolutionScore", "changeMagnitude"]
        }
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating Delta report:", error);
    throw error;
  }
}

export async function generatePremiumReport(
  topics: string[] = ["Global Economy", "Monetary Policy", "Equity Markets"],
  options: ReportOptions = {}
) {
  const model = "gemini-3.1-pro-preview";
  
  const { length = 'Standard', dataPoints = [], analyticalFramework = 'None' } = options;

    const prompt = `
    Generate a high-end, deeply researched, and analyzed global news report for finance executives, similar to Bloomberg Terminal or The Economist Intelligence Unit.
    
    Focus on these topics: ${topics.join(", ")}.

    Advanced Parameters:
    - Report Length: ${length}
    - Specific Data Points: ${dataPoints.length > 0 ? dataPoints.join(", ") : "Standard executive metrics"}
    - Analytical Framework: ${analyticalFramework !== 'None' ? `Structure the analysis using the ${analyticalFramework} framework.` : "Standard Bloomberg-style analysis"}
    
    The report must include:
    1. **Market Pulse**: A concise summary of the most critical global shifts.
    2. **Deep Dive Analysis**: Detailed analysis of 3-4 major stories, including geopolitical implications and market impact. Provide as much detail as possible for each story.
    3. **Strategic Outlook**: What decision-makers should watch in the next 48-72 hours.
    4. **Data Points**: Key economic indicators.
    5. **Article Summaries**: For each major story analyzed, provide a 2-3 sentence executive summary.
    
    Style Guidelines:
    - Use sophisticated, professional language.
    - Focus on the "so what" for a CFO or investment manager.
    - Provide "Bloomberg-style" insights.
    - **CRITICAL**: Use ONLY clean Markdown. DO NOT include any raw HTML tags (e.g., <h1>, <p>, <div>, <span>, <br>).
    - **CRITICAL**: The report should be comprehensive and detailed. Aim for a total content length of around 30,000 to 50,000 characters if possible, but stay within system limits (under 800,000 bytes total for the document).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            content: { type: Type.STRING, description: "The main report content in clean Markdown. This should be very detailed." },
            sentimentScore: { type: Type.NUMBER, description: "Market sentiment score from 0 (Bearish) to 100 (Bullish)." },
            riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            keyMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ["up", "down", "neutral"] }
                },
                required: ["label", "value", "trend"]
              }
            },
            articleSummaries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING }
                },
                required: ["title", "summary"]
              }
            },
            marketTrendData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: "Short date string (e.g., 'Mar 01')" },
                  value: { type: Type.NUMBER, description: "A normalized value for the trend line (0-100)." }
                },
                required: ["date", "value"]
              },
              description: "A 7-point trend line data representing the primary market index discussed."
            },
            imagePrompt: { type: Type.STRING, description: "A short descriptive prompt for an AI image generator to create a header image for this report." },
            geopoliticalRisk: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  countryCode: { type: Type.STRING, description: "ISO 3166-1 alpha-3 code (e.g., 'USA', 'CHN', 'RUS')" },
                  riskScore: { type: Type.NUMBER, description: "Risk score from 0-100" },
                  sentiment: { type: Type.NUMBER, description: "Sentiment score from 0-100" },
                  description: { type: Type.STRING }
                },
                required: ["countryCode", "riskScore", "sentiment"]
              }
            },
            entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["Organization", "Person", "Event", "Location", "Technology"] },
                  connections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        target: { type: Type.STRING, description: "Name of the connected entity" },
                        relationship: { type: Type.STRING, description: "Nature of the connection" }
                      },
                      required: ["target", "relationship"]
                    }
                  }
                },
                required: ["name", "type", "connections"]
              }
            }
          },
          required: ["title", "summary", "content", "sentimentScore", "riskLevel", "keyMetrics", "articleSummaries", "marketTrendData", "imagePrompt", "geopoliticalRisk", "entities"]
        }
      },
    });

    const data = JSON.parse(response.text);
    
    // Deep strip HTML from all string fields
    const stripHtml = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.replace(/<\/?[^>]+(>|$)/g, "");
      }
      if (Array.isArray(obj)) {
        return obj.map(stripHtml);
      }
      if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
          newObj[key] = stripHtml(obj[key]);
        }
        return newObj;
      }
      return obj;
    };

    const cleanData = stripHtml(data);

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => c.web?.uri).filter(Boolean) as string[] || [];

    // Safety truncation for Firestore limits (1MB)
    // We allow much more now as requested, but still keep a safe bound.
    if (cleanData.content) cleanData.content = cleanData.content.substring(0, 500000);
    if (cleanData.summary) cleanData.summary = cleanData.summary.substring(0, 5000);

    // Generate header image
    const imageUrl = await generateReportImage(cleanData.imagePrompt);

    return {
      ...cleanData,
      imageUrl,
      reportType: 'traditional',
      sources: Array.from(new Set(sources)).slice(0, 20) // Allow more sources
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}
