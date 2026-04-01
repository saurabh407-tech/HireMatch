
const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});



//  INTERVIEW REPORT GENERATOR( ye interview report generate karega)

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `
You are an expert interviewer.

Generate a COMPLETE interview report in STRICT JSON format.

IMPORTANT:
- Do NOT return empty arrays
- Always generate meaningful data
- Follow this exact structure

{
  "matchScore": number,
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "severity": "low | medium | high"
    }
  ],
  "preparationPlan": [
    {
      "day": number,
      "focus": "string",
      "tasks": ["string"]
    }
  ],
  "title": "string"
}

Minimum:
- 5 technicalQuestions
- 3 behavioralQuestions
- 3 skillGaps
- 5 preparationPlan

Candidate Details:
Resume: ${resume}

Self Description: ${selfDescription}

Job Description: ${jobDescription}

Return ONLY JSON.
`;

    for (let i = 0; i < 3; i++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });

            console.log("🔥 RAW AI RESPONSE:", response.text);

            const raw = JSON.parse(response.text);

            
            if (
                raw.technicalQuestions?.length > 0 &&
                raw.behavioralQuestions?.length > 0 &&
                raw.skillGaps?.length > 0 &&
                raw.preparationPlan?.length > 0
            ) {
                return raw;
            }

        } catch (err) {
            console.log(" Error:", err.message);
        }

        console.log(" Retrying AI...");
    }

    
    //  FINAL FALLBACK 
    
    return {
        matchScore: 75,
        title: "Software Developer",

        technicalQuestions: [
            {
                question: "Explain JavaScript closures",
                intention: "Check JS fundamentals",
                answer: "Closures allow access to outer function scope even after the outer function has returned."
            },
            {
                question: "What is REST API?",
                intention: "Check API knowledge",
                answer: "REST is an architectural style using HTTP methods like GET, POST, PUT, DELETE."
            }
        ],

        behavioralQuestions: [
            {
                question: "Tell me about a challenge you faced",
                intention: "Check problem-solving ability",
                answer: "Use STAR method to explain situation, task, action, and result."
            }
        ],

        skillGaps: [
            {
                skill: "System Design",
                severity: "medium"
            }
        ],

        preparationPlan: [
            {
                day: 1,
                focus: "Data Structures",
                tasks: ["Solve array problems", "Practice sorting algorithms"]
            }
        ]
    };
}



// PDF GENERATION   ye pdf generate karega

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    });

    await browser.close();

    return pdfBuffer;
}



// RESUME PDF GENERATOR

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `
Generate a professional resume in HTML format.

Candidate Details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return JSON:
{
  "html": "<valid HTML resume>"
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    const jsonContent = JSON.parse(response.text);

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

    return pdfBuffer;
}



module.exports = {
    generateInterviewReport,
    generateResumePdf
};