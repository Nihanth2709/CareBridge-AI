import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Ensure valid base64 image data
function cleanBase64(input: string) {
  if (input.includes(';base64,')) {
    const parts = input.split(';base64,');
    return {
      mimeType: parts[0].replace('data:', '') || 'image/jpeg',
      data: parts[1],
    };
  }
  return {
    mimeType: 'image/jpeg',
    data: input,
  };
}

// Helper: Call Gemini with fallback models for high demand (503/429) spikes
async function callGeminiWithFallback(options: {
  contents: any;
  config?: any;
}) {
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: options.contents,
        config: options.config,
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying fallback if available:`, err?.message || err);
      lastError = err;
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('Resource has been exhausted');

      if (!isTransient) {
        throw err;
      }
    }
  }

  throw lastError;
}


// 1. Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 2. Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], language = 'en' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const languageNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      te: 'Telugu (తెలుగు)',
      ta: 'Tamil (தமிழ்)',
    };
    const targetLang = languageNames[language] || 'English';

    // Emergency quick detection check
    const emergencyRegex = /chest\s*pain|can'?t\s*breathe|difficulty\s*breathing|unconscious|stroke|face\s*droop|heart\s*attack|severe\s*bleeding|poison|overdose|suicide|kill\s*myself/i;
    const isEmergencyPrompt = emergencyRegex.test(message);

    const systemInstruction = `You are CareBridge AI, a compassionate, highly accurate, and safe medical information assistant for patients and families.
Target language: ${targetLang}.
Guidelines:
1. Explain medical terms in simple, clear 5th-grade language that anyone can understand.
2. Structure answers with clean bullet points and short paragraphs.
3. If the user describes emergency symptoms (e.g., crushing chest pain, sudden numbness/paralysis, severe breathing distress, heavy bleeding, poisoning), ALWAYS START with a prominent emergency alert advising them to CALL 108 or local emergency services immediately and do not delay.
4. Provide practical home care guidance, lifestyle tips, when to see a doctor, and questions to ask their doctor.
5. Clarify that you provide general health information and education, not a personal prescription or doctor diagnosis.
6. Keep tone warm, reassuring, and concise (under 250 words).`;

    // Format chat history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await callGeminiWithFallback({
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const replyText = response.text || 'I am here to help. Could you please rephrase your health question?';

    res.json({
      reply: replyText,
      isEmergency: isEmergencyPrompt || /call\s*108|emergency\s*room/i.test(replyText),
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      message: error.message || 'Unknown error occurred. Please try again.',
    });
  }
});

// Voice Consultation Endpoint (Accepts recorded voice audio or spoken text transcript)
app.post('/api/voice-consultation', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', textTranscript = '', language = 'en' } = req.body;

    const languageNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      te: 'Telugu (తెలుగు)',
      ta: 'Tamil (தமிழ்)',
    };
    const targetLang = languageNames[language] || 'English';

    let parts: any[] = [];

    const promptInstructions = `The user spoke or entered their health symptoms.
Selected Output Language: ${targetLang}.
CRITICAL LANGUAGE REQUIREMENT: You MUST write the entire "solution" strictly and 100% in ${targetLang} (use native script: Telugu script for Telugu, Devanagari script for Hindi, Tamil script for Tamil, English for English). Do not answer in any other language.
Structure the solution with:
- Warm greeting and brief assessment
- 3 to 4 actionable home care remedies & comfort measures in bullet points
- Safe precautions & diet advice
- Clear red-flag warning on when to visit a doctor or call 108
Respond strictly in valid JSON format:
{
  "transcription": "Accurate transcript of what user spoke/typed",
  "solution": "Comprehensive medical explanation, remedies, and doctor advice STRICTLY and entirely in ${targetLang}",
  "isEmergency": false
}`;

    if (audioBase64) {
      const clean = cleanBase64(audioBase64);
      parts.push({
        inlineData: {
          mimeType: clean.mimeType || mimeType,
          data: clean.data,
        },
      });
      parts.push({ text: promptInstructions });
    } else if (textTranscript) {
      parts.push({
        text: `Patient input: "${textTranscript}".\n\n${promptInstructions}`,
      });
    } else {
      res.status(400).json({ error: 'Either audioBase64 or textTranscript is required' });
      return;
    }

    let response;
    try {
      response = await callGeminiWithFallback({
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });
    } catch (apiError: any) {
      console.warn('First voice attempt failed, trying fallback:', apiError?.message);
      // Fallback 1: If text transcript is available
      if (textTranscript) {
        response = await callGeminiWithFallback({
          contents: {
            parts: [{
              text: `Patient input: "${textTranscript}".\n\n${promptInstructions}`,
            }],
          },
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });
      } else {
        // Fallback 2: General consultation in target language
        response = await callGeminiWithFallback({
          contents: {
            parts: [{
              text: `A patient attempted to consult regarding health symptoms in ${targetLang}.
Selected Output Language: ${targetLang}.
CRITICAL LANGUAGE REQUIREMENT: You MUST write the entire "solution" strictly and 100% in ${targetLang} (use native script: Telugu for Telugu, Devanagari for Hindi, Tamil for Tamil, English for English).
Provide guidance for common symptoms (fever, weakness, seasonal infections) with home remedies, hydration, rest, and doctor consultation warnings.
Respond strictly in valid JSON format:
{
  "transcription": "Spoken symptom inquiry in ${targetLang}",
  "solution": "Clear guidance and remedies in ${targetLang}",
  "isEmergency": false
}`,
            }],
          },
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });
      }
    }

    const rawText = response.text || '{}';
    let parsed: any = {};
    try {
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback if model returned plain text solution
      parsed = {
        transcription: textTranscript || 'Spoken health inquiry',
        solution: rawText,
        isEmergency: /emergency|108|urgent|hospital immediately/i.test(rawText),
      };
    }

    res.json({
      transcription: parsed.transcription || textTranscript || 'Spoken health inquiry',
      solution: parsed.solution || 'Please take rest, stay hydrated, and consult your doctor.',
      isEmergency: !!parsed.isEmergency,
    });
  } catch (error: any) {
    console.error('Voice consultation error:', error);
    res.status(500).json({
      error: 'Failed to process voice query',
      message: error.message || 'Could not understand voice recording. Please speak clearly or type.',
    });
  }
});

// Lab Report Analyser Endpoint (Blood tests, CBC, Lipid, HbA1c, Thyroid, LFT, KFT)
app.post('/api/analyze-lab-report', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', textReport = '', language = 'en' } = req.body;

    const languageNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      te: 'Telugu (తెలుగు)',
      ta: 'Tamil (தமிழ்)',
    };
    const targetLang = languageNames[language] || 'English';

    let parts: any[] = [];

    const prompt = `You are an expert clinical laboratory pathologist and diagnostic interpreter.
Analyze this medical laboratory / pathology test report (CBC, Blood Sugar, Lipid Profile, Thyroid, Liver, Kidney, Urine).
Target Language for explanations, summaries, and advice: ${targetLang}.
Extract each lab parameter carefully and return strictly valid JSON matching this schema:
{
  "isLabReport": true,
  "patientName": "Patient name if visible, or null",
  "reportDate": "Date if visible, or null",
  "labName": "Diagnostic center or Hospital name, or null",
  "tests": [
    {
      "testName": "Test Name (e.g., Platelet Count)",
      "value": "Patient's result (e.g., 92,000)",
      "unit": "Measurement unit (e.g., /cu.mm)",
      "normalRange": "Normal reference range (e.g., 150,000 - 450,000)",
      "status": "normal" | "low" | "high" | "critical",
      "simpleExplanation": "Simple 1-line explanation of what this test means in ${targetLang}",
      "advice": "1 practical food or lifestyle tip related to this value in ${targetLang}"
    }
  ],
  "overallSummary": "A warm, clear 2-3 sentence overview explaining what the results show in ${targetLang}",
  "dietaryRecommendations": [
    "Practical food/diet recommendation 1 in ${targetLang}",
    "Practical food/diet recommendation 2 in ${targetLang}"
  ],
  "doctorQuestions": [
    "Smart question to ask their doctor at follow-up in ${targetLang}",
    "Smart question to ask in ${targetLang}"
  ],
  "urgentAlerts": [
    "Any critical red flags requiring prompt medical attention"
  ]
}
If the image or text is NOT a medical lab report, set "isLabReport": false and provide an explanation in "overallSummary".`;

    if (imageBase64) {
      const clean = cleanBase64(imageBase64);
      parts.push({
        inlineData: {
          mimeType: clean.mimeType || mimeType,
          data: clean.data,
        },
      });
      parts.push({ text: prompt });
    } else if (textReport) {
      parts.push({ text: `${prompt}\n\nReport Content:\n${textReport}` });
    } else {
      res.status(400).json({ error: 'Either imageBase64 or textReport is required' });
      return;
    }

    const response = await callGeminiWithFallback({
      contents: { parts },
    });

    const rawText = response.text || '{}';
    let parsed: any = {};
    try {
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        isLabReport: true,
        tests: [],
        overallSummary: rawText,
        dietaryRecommendations: ['Maintain balanced nutrition and stay well hydrated.'],
        doctorQuestions: ['Please review these lab values with your consulting physician.'],
        urgentAlerts: [],
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Lab report analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze lab report',
      message: error.message || 'Could not process lab report. Please check image clarity.',
    });
  }
});

// 3. Prescription Scanner Endpoint
app.post('/api/scan-prescription', async (req, res) => {
  try {
    const { imageBase64, language = 'en' } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    const { mimeType, data } = cleanBase64(imageBase64);

    const prompt = `You are an expert clinical pharmacist reviewing a prescription photo, medicine strip, doctor slip, or pharmacy label.
Carefully read the text and return a valid JSON object only. Do NOT use markdown code blocks around the JSON if possible, just return raw JSON.
Language preference: ${language}.
Format strictly as this JSON:
{
  "isPrescription": true,
  "doctorOrHospital": "Doctor or Clinic name, or null if unknown",
  "patientName": "Patient name or null",
  "date": "Date or null",
  "medicines": [
    {
      "name": "Medicine Name & Strength (e.g. Paracetamol 650mg)",
      "type": "Tablet / Capsule / Syrup / Drops / Ointment / Injection",
      "purpose": "Simple purpose in plain English (e.g. Reduces high fever and body ache)",
      "dosage": "e.g. 1 tablet",
      "timing": "e.g. Morning and Night (Twice daily)",
      "foodRelation": "After meals / Before meals / With meals / As needed",
      "duration": "e.g. For 3 to 5 days",
      "warnings": "e.g. Do not exceed 4 tablets in 24 hours. Drink plenty of water."
    }
  ],
  "generalInstructions": [
    "e.g. Complete the full antibiotic course even if feeling better",
    "e.g. Drink 2-3 liters of fluids daily"
  ],
  "simpleSummary": "A warm 2-sentence summary explaining the overall plan simply.",
  "translations": {
    "hi": {
      "summary": "सरल हिंदी में पर्चे का सारांश",
      "instructions": ["हिंदी निर्देश 1", "हिंदी निर्देश 2"]
    },
    "te": {
      "summary": "తెలుగులో ప్రిస్క్రిప్షన్ సారాంశం",
      "instructions": ["తెలుగు సూచన 1", "తెలుగు సూచన 2"]
    },
    "ta": {
      "summary": "தமிழில் மருந்துச் சீட்டு விளக்கம்",
      "instructions": ["தமிழ் வழிமுறை 1", "தமிழ் வழிமுறை 2"]
    }
  },
  "cautionNote": "Always take medicines exactly as your doctor prescribed. Consult your pharmacist if you notice unexpected side effects."
}

If the image is completely blank, unreadable, or definitely NOT a medical prescription or medicine packaging, set "isPrescription": false and provide an explanation in "cautionNote".`;

    const response = await callGeminiWithFallback({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Clean possible markdown backticks
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Prescription scan error:', error);
    res.status(500).json({
      error: 'Failed to scan prescription',
      message: error.message || 'Could not process the image. Please try again with a clearer photo.',
    });
  }
});

// 4. First Aid Scanner Endpoint
app.post('/api/scan-first-aid', async (req, res) => {
  try {
    const { imageBase64, userNote = '', language = 'en' } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    const { mimeType, data } = cleanBase64(imageBase64);

    const prompt = `You are an emergency medicine first-responder triage expert.
Analyze this photo of an injury, wound, burn, bite, rash, sprain, or bleeding.
User's note: "${userNote || 'None provided'}".
Target language: ${language}.
Provide step-by-step, safe, evidence-based first aid guidance.
Return strictly valid JSON with this structure:
{
  "injuryTitle": "e.g. Superficial Thermal Burn / Minor Abrasion / Insect Bite / Deep Laceration",
  "severity": "mild" | "moderate" | "severe_emergency",
  "isLifeThreatening": false,
  "visualAssessment": "Objective description (e.g. 'Appears to be redness and mild swelling consistent with a minor first-degree burn')",
  "immediateActions": [
    "Step 1: Cool immediately under cool, gently running tap water for 15-20 minutes.",
    "Step 2: Gently remove any tight jewelry or rings before swelling develops.",
    "Step 3: Cover loosely with a clean, dry, non-stick dressing or clean cloth."
  ],
  "criticalDoNots": [
    "Do NOT apply ice, ice water, butter, toothpaste, or turmeric.",
    "Do NOT pop any blisters or rub the injured skin."
  ],
  "redFlagWarnings": [
    "Call 108 or visit an emergency room if the burn covers a large area, is on the face/hands/joints, has severe charring, or causes dizziness."
  ],
  "translations": {
    "hi": {
      "title": "हिंदी शीर्षक",
      "immediateActions": ["कदम 1...", "कदम 2..."],
      "criticalDoNots": ["क्या न करें 1...", "क्या न करें 2..."],
      "warning": "चेतावनी..."
    },
    "te": {
      "title": "తెలుగు శీర్షిక",
      "immediateActions": ["దశ 1...", "దశ 2..."],
      "criticalDoNots": ["చేయకూడనివి 1...", "చేయకూడనివి 2..."],
      "warning": "హెచ్చరిక..."
    },
    "ta": {
      "title": "தமிழ் தலைப்பு",
      "immediateActions": ["படி 1...", "படி 2..."],
      "criticalDoNots": ["செய்யக்கூடாதவை 1...", "செய்யக்கூடாதவை 2..."],
      "warning": "எச்சரிக்கை..."
    }
  },
  "disclaimer": "This is initial first-aid information and not a medical diagnosis. In any doubt or severe pain, seek emergency medical care immediately."
}
If the photo is not an injury or physical condition, clarify politely in visualAssessment.`;

    const response = await callGeminiWithFallback({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('First aid scan error:', error);
    res.status(500).json({
      error: 'Failed to analyze injury photo',
      message: error.message || 'Could not process the photo. Please check lighting and try again.',
    });
  }
});

// Vite Middleware Setup
async function startServer() {
  const distPath = path.resolve(__dirname, '..', 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development');

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareBridge AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
