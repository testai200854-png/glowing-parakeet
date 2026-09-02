require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let savedNotesList = [];

const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'all-code')));
app.use(express.static(path.join(__dirname, 'ai-assistant')));

app.get('/api/notes', (req, res) => res.json(savedNotesList));

// 完整對應 Quiz Generator 與 Note Archive 的 Topic/Part 映射
function detectTopicAndPart(qText, topic, part) {
    let finalTopic = topic;
    let finalPart = part || 'General';
    const q = qText.toLowerCase();

    if (!finalTopic || finalTopic === 'All Chapters & Topics' || finalTopic === 'General Chemistry') {
        if (q.includes('limiting reagent') || q.includes('percentage yield') || q.includes('mole') || q.includes('stoichiometry')) {
            finalTopic = 'Ch10-13 Metals';
            finalPart = 'Part 2: Extraction Methods & Mole Calculations';
        } else if (q.includes('ethene') || q.includes('ethane') || q.includes('c=c') || q.includes('alkene')) {
            finalTopic = 'Ch20-22 Fossil Fuels & Carbon Compounds';
            finalPart = 'Part 2: Homologous Series, Alkanes & Alkenes';
        } else if (q.includes('acid') || q.includes('base') || q.includes('ph') || q.includes('titration') || q.includes('hcl') || q.includes('standard solution')) {
            finalTopic = 'Ch14-19 Acids and Bases';
            finalPart = 'Part 3: Volumetric Analysis & Titration Stoichiometry';
        } else if (q.includes('bond') || q.includes('structure') || q.includes('melting point') || q.includes('sodium')) {
            finalTopic = 'Ch5-9 Microscopic World I';
            finalPart = 'Part 3: Structures and Properties of Substances';
        } else {
            finalTopic = 'Ch1-4 Planet Earth';
            finalPart = 'Part 0: Introduction to Chemistry';
        }
    }
    return { finalTopic, finalPart };
}

app.post('/api/grade', async (req, res) => {
    const { question, answer, topic, part } = req.body;
    const cleanAns = (answer || '').trim();
    const qText = question || 'Describe how limiting reagent and percentage yield are used to evaluate reaction efficiency in industrial chemistry.';

    const { finalTopic, finalPart } = detectTopicAndPart(qText, topic, part);

    let htmlOutput = '';

    if (!GROQ_API_KEY) {
        htmlOutput = `<div style="color:red; font-weight:bold;">⚠️ Error: GROQ_API_KEY is missing.</div>`;
    } else {
        try {
            // Generate system prompt with STRICT MARKDOWN FORMAT (no HTML)
            const systemPrompt = `You are a strict HKDSE Chemistry examiner. Assess responses ONLY against the official HKDSE Chemistry Syllabus (Topics 1-12).

【CRITICAL SYLLABUS BOUNDARIES】
- Acids and Bases (Topic 4): Define a strong acid strictly as an acid that fully or completely ionises in water to form hydrogen ions (H+).
- For basic acid-strength questions, NEVER mention university or elective concepts such as conjugate acid-base pairs, conjugate bases, pKa, bond dissociation energy, or bond dissociation enthalpy.
- DO NOT use "Lattice Energy" (晶格能) for metals like Sodium. Lattice energy applies ONLY to ionic lattices.
- Metallic bonding in metals depends on: Ionic charge, Ionic radius, and Charge density of the metal cations.
- ALWAYS use standard Markdown formatting. NEVER output raw HTML tags (such as <div>, <span>, style attributes, or <u> tags).
- Use **bold** for emphasis, not HTML tags.

【LANGUAGE REQUIREMENT FOR MARKING SCHEME】
- The "Marking Scheme" section MUST be written 100% IN ENGLISH using official HKDSE Chemistry terminology.
- Do NOT mix Chinese characters into the Marking Scheme points.
- Use precise HKDSE English chemical terms (e.g., "delocalised electrons", "ionic radius", "electrostatic attraction").

【HKDSE Marking Principles】
1. **Syllabus Boundary**: Assess ONLY within HKDSE Chemistry syllabus Topics 1-12. Reject university-level concepts like pi/sigma bond orbital overlap, hybridization, molecular orbital theory. Use only HKDSE-approved terminology.
2. **Dynamic Mark Allocation**: Analyze the question context to determine total marks (N marks, typically 1-10). Generate EXACTLY N distinct marking points (Point 1 to Point N), each worth 1 mark.
3. **Keyword Matching**: Award 1 mark per point ONLY if student provides required DSE chemical term or logically equivalent wording.
4. **Zero Tolerance**: If answer is gibberish, off-topic, or irrelevant, award 0/N marks.

【REQUIRED MARKDOWN OUTPUT FORMAT - NO HTML TAGS】

${finalTopic} | ${finalPart} | ${new Date().toISOString().split('T')[0]}

**Question:** [Question Text]

**Answer:** [Student Answer]

🎯 **整體評語**
[1-2 sentence overall summary in Traditional Chinese, highlighting strengths and weaknesses]

📊 **分數與給分點分析 (Mark Allocation Analysis)**
* **Total Question Marks:** [N] Marks
* **Mark Awarded:** [Score]/[N]
* **Point 1 ([DSE Marking Concept]):** [✅ 1/1 Mark OR ❌ 0/1 Mark] ([Concise rationale])
* **Point 2 ([DSE Marking Concept]):** [✅ 1/1 Mark OR ❌ 0/1 Mark] ([Concise rationale])
*(Dynamically generate Point 1 to Point N matching the question's total marks)*

🔍 **詳細分析**
* [Bullet points evaluating presence/absence of required HKDSE chemical terms]
* [Syllabus alignment verification]

📝 **參考答案 (Marking Scheme)**
* **Point 1:** [Complete standard HKDSE marking point - MUST BE 100% ENGLISH - with precise chemical terminology] [1 mark]
* **Point 2:** [Complete standard HKDSE marking point - MUST BE 100% ENGLISH - with precise chemical terminology] [1 mark]
*(Generate all N points in STRICT ENGLISH format - NO Chinese characters in marking points)*

💡 **考生建議 (Student Tips)**
* [DSE exam strategy specific to this question type]
* [Common misconceptions to avoid]
* [Key procedural/conceptual elements to emphasize]

**分數: [Score]/[N]**`;

            const prompt = `${systemPrompt}

Now grade this specific student response:

Question: "${qText}"
Student Answer: "${cleanAns}"
Chapter Tag: ${finalTopic}
Section Tag: ${finalPart}

Generate the marking report following the REQUIRED MARKDOWN FORMAT above. Ensure:
- Use ONLY Markdown (no HTML tags, no <div>, no <span>, no <u>)
- Use **bold text** for emphasis instead of HTML
- Total marks = Inferred from question context (default 2 marks if ambiguous)
- Generate EXACTLY that many Point entries
- Each point must match HKDSE syllabus only
- NO university-level concepts
- NO mention of "Lattice Energy" for metallic compounds
- Award 1 mark = student provided required concept; 0 marks = missing concept
    - **CRITICAL: Marking Scheme section MUST be 100% ENGLISH. Use official HKDSE Chemistry English terminology (delocalised electrons, charge density, electrostatic attraction, etc.). Do NOT include any Chinese text in the marking points.**
    - **For Topic 4 acid-strength questions, the Marking Scheme must use only complete ionisation in water to form H+; exclude conjugate base, pKa, bond dissociation energy, and bond dissociation enthalpy.**`;

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: DEFAULT_GROQ_MODEL, messages: [{ role: 'user', content: prompt }] })
            });

            const data = await response.json();
            htmlOutput = data.choices?.[0]?.message?.content || "無回應";
            htmlOutput = htmlOutput.replace(/^```html\s*/i, '').replace(/\s*```$/, '').trim();
        } catch (err) {
            htmlOutput = `<div style="color:red;">⚠️ API Error: ${err.message}</div>`;
        }
    }

    const noteEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        question: qText,
        answer: cleanAns,
        evaluation: htmlOutput,
        aiResponse: htmlOutput,
        topic: finalTopic,
        part: finalPart,
        timestamp: new Date().toISOString()
    };
    savedNotesList.unshift(noteEntry);

    return res.json({
        result: htmlOutput,
        topic: noteEntry.topic,
        part: noteEntry.part,
        savedNote: noteEntry,
        success: true
    });
});

app.use((req, res) => {
    const allCodeIndex = path.join(__dirname, 'all-code', 'index.html');
    if (fs.existsSync(allCodeIndex)) return res.sendFile(allCodeIndex);
    return res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 3100;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
