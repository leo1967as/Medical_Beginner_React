// File: backend/diagnosisService.js (No changes from original)
// ... (เนื้อหาทั้งหมดของไฟล์ diagnosisService.js เดิม) ...
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("FATAL ERROR: OPENROUTER_API_KEY is not defined in your .env file.");
}
if (!process.env.GEMINI_API_KEY) {
    throw new Error("FATAL ERROR: GEMINI_API_KEY is not defined for fallback usage in your .env file.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const diagnosisModelGemini = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { response_mime_type: "application/json" }
});

async function generateWithOpenRouter(prompt) {
    const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
    const model = process.env.OPENROUTER_MODEL || "google/gemini-flash";
    console.log(`🔌 [AI Service] Sending request to OpenRouter (Primary) with model: ${model}...`);
    
    // Use environment variables for production-safe headers
    const httpReferer = process.env.OPENROUTER_HTTP_REFERER || 'https://medical-learner.vercel.app';
    const xTitle = process.env.OPENROUTER_X_TITLE || 'Medical Learner AI';
    
    const systemPrompt = `**Role and Goal:** You are an Analytical Wellness Advisor AI. Your sole purpose is to analyze the provided patient data to generate a coherent, safe, and logically structured analysis in a complete JSON object format.`;
    const body = {
        model: model,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
        response_format: { "type": "json_object" }
    };
    
    const response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': httpReferer,
            'X-Title': xTitle,
        },
        body: JSON.stringify(body),
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        // Log minimal error info to prevent exposure
        console.error(`❌ [AI Service] OpenRouter API failed with status ${response.status}`);
        throw new Error(`OpenRouter API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
    } else {
        throw new Error("Invalid response structure from OpenRouter API");
    }
}

async function generateWithGemini(prompt) {
    console.log("⚡️ [AI Service] OpenRouter failed. Falling back to Google Gemini...");
    try {
        const result = await diagnosisModelGemini.generateContent(prompt);
        const responseText = result.response.text();
        console.log("✅ [AI Service] Received response from Gemini successfully.");
        return responseText;
    } catch (geminiError) {
        console.error('❌ [AI Service] Gemini Error:', geminiError.message);
        throw new Error(`AI service failed: ${geminiError.message}`);
    }
}

async function generateContent(prompt) {
    try {
        const result = await generateWithOpenRouter(prompt);
        console.log("✅ [AI Service] Received response from OpenRouter successfully.");
        return result;
    } catch (error) {
        console.error('❌ [AI Service] OpenRouter Error:', error.message);
        return await generateWithGemini(prompt);
    }
}

const calculateBMI = (weight, height) => {
    if (!weight || !height || height <= 0) return { value: 0, category: 'ข้อมูลไม่ถูกต้อง' };
    const heightInMeters = parseFloat(height) / 100;
    const bmiValue = (parseFloat(weight) / (heightInMeters * heightInMeters)).toFixed(2);
    let category = '';
    if (bmiValue < 18.5) category = 'น้ำหนักน้อยกว่าเกณฑ์';
    else if (bmiValue < 23) category = 'น้ำหนักปกติ (สมส่วน)';
    else if (bmiValue < 25) category = 'น้ำหนักเกิน';
    else if (bmiValue < 30) category = 'โรคอ้วนระดับที่ 1';
    else category = 'โรคอ้วนระดับที่ 2 (อันตราย)';
    return { value: bmiValue, category: category };
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function buildFullContext(userData, bmi) {
    const parts = [];
    const profile = userData.health_profile || {};
    const allergies = profile.allergies || {};
    const lifestyle = profile.lifestyle_factors || {};
    if (allergies.drug) parts.push(`**ประวัติแพ้ยา (สำคัญมาก): ${allergies.drug}**`);
    if (allergies.food) parts.push(`**ประวัติแพ้อาหาร: ${allergies.food}**`);
    if (allergies.other) parts.push(`**ประวัติแพ้อื่นๆ: ${allergies.other}**`);
    if (profile.current_medications?.length > 0) {
        const medList = profile.current_medications.map(m => `${m.name} ${m.dose} ${m.frequency}`).join(', ');
        parts.push(`**ยาที่ใช้ปัจจุบัน: ${medList}**`);
    }
    if (profile.chronic_conditions?.length > 0) parts.push(`โรคประจำตัวคือ ${profile.chronic_conditions.join(', ')}`);
    if (profile.past_surgical_history) parts.push(`ประวัติการผ่าตัด: ${profile.past_surgical_history}`);
    if (profile.family_history) parts.push(`ประวัติโรคในครอบครัว: ${profile.family_history}`);
    if (lifestyle.smoking && lifestyle.smoking !== 'never') parts.push(`การสูบบุหรี่: ${lifestyle.smoking}`);
    if (lifestyle.alcohol && lifestyle.alcohol !== 'none') parts.push(`การดื่มแอลกอฮอล์: ${lifestyle.alcohol}`);
    if (profile.additional_notes) parts.push(`บันทึกเพิ่มเติม: "${profile.additional_notes}"`);
    const profileContext = parts.length > 0 ? parts.join('. ') : "ผู้ใช้ไม่มีข้อมูลโปรไฟล์สุขภาพที่ระบุไว้เป็นพิเศษ";
    const vitals = userData.vitals || {};
    const vitalsParts = [];
    if (vitals.bp) vitalsParts.push(`ความดัน ${vitals.bp} mmHg`);
    if (vitals.hr) vitalsParts.push(`ชีพจร ${vitals.hr}/min`);
    if (vitals.rr) vitalsParts.push(`หายใจ ${vitals.rr}/min`);
    if (vitals.temp) vitalsParts.push(`อุณหภูมิ ${vitals.temp}°C`);
    const vitalsContext = vitalsParts.length > 0 ? `- **สัญญาณชีพ:** ${vitalsParts.join(', ')}` : '';
    return `
      วิเคราะห์ผู้ใช้ชื่อ ${userData.name} (อายุ ${userData.age} ปี, เพศ ${userData.sex}) ที่มี BMI ${bmi.value} (${bmi.category}).
      **สถานการณ์ปัจจุบัน:**
      - **อาการ:** "${userData.symptoms}"
      - **เป็นมานาน:** ${userData.symptom_duration}
      - **อาหารมื้อล่าสุด:** ${userData.previous_meal || 'ไม่ได้ระบุ'}
      ${vitalsContext}
      
      **ข้อมูลโปรไฟล์สุขภาพ (สำคัญที่สุด!): ${profileContext}**
    `;
}

async function getAiAnalysis(userData) {
    const bmi = calculateBMI(userData.weight, userData.height);
    const fullContext = buildFullContext(userData, bmi);
    console.log("🤖 [Service] Creating Prompt with V3 (Hybrid) Context:\n", fullContext);
    
    // --- START: UPDATED PROMPT ---
    const prompt = `
      **ข้อมูลดิบสำหรับการวิเคราะห์ (RAW DATA FOR ANALYSIS):**
      ${fullContext}

      **กระบวนการคิดวิเคราะห์ (MANDATORY THINKING PROCESS):**
      ก่อนที่จะสร้าง JSON สุดท้าย ให้คุณเขียนกระบวนการคิดของคุณตามขั้นตอนต่อไปนี้:
      1.  **สรุปข้อเท็จจริง (Fact Summary):** สรุปข้อมูลสำคัญทั้งหมดของผู้ใช้ (อาการ, ระยะเวลา, โปรไฟล์สุขภาพ) โดยไม่มีการตีความ
      2.  **ระบุภาวะที่เป็นไปได้ (Potential Conditions Analysis):** จาก "อาการปัจจุบัน" เป็นหลัก ให้ลิสต์ภาวะหรือโรคที่เป็นไปได้ 2-3 อย่าง พร้อมให้เหตุผลสั้นๆ ว่าทำไมถึงคิดว่าเป็นภาวะนั้นๆ
      3.  **ประเมินและจัดลำดับความเสี่ยง (Risk Evaluation & Triage):** นำภาวะจากข้อ 2 มาประเมินเทียบกับ "ข้อมูลโปรไฟล์สุขภาพ" เพื่อจัดลำดับความเสี่ยงจากสูงไปต่ำสุด อธิบายว่าทำไมภาวะ A ถึงเสี่ยงกว่าภาวะ B
      4.  **สรุปผลการวิเคราะห์ (Final Conclusion):** สรุปภาวะที่น่าจะเป็นไปได้มากที่สุดเพื่อนำไปสร้าง JSON
      
      **ข้อบังคับเรื่องข้อมูล (DATA ADHERENCE MANDATE):**
      วิเคราะห์จาก "ข้อมูลดิบ" ที่ให้มา *เท่านั้น* ห้ามอ้างอิงถึงโรคหรืออาการที่ไม่มีอยู่ในข้อมูลโดยเด็ดขาด การสร้างข้อมูลที่ไม่มีอยู่จริง (Hallucination) จะถือว่าเป็นการทำผิดคำสั่งร้ายแรง

      **โครงสร้าง JSON ที่ต้องส่งออก (MANDATORY JSON STRUCTURE):**
      สร้างผลลัพธ์เป็น JSON object ที่สมบูรณ์ตามโครงสร้างนี้เท่านั้น **โดยเนื้อหาในทุกฟิลด์ต้องผ่านกระบวนการคิดที่เชื่อมโยงกับ "ข้อมูลโปรไฟล์สุขภาพ" หากมีข้อมูลดังกล่าว** หากไม่เชื่อมโยงจะถือว่าทำผิดคำสั่ง
      {
        "primary_assessment": "เขียนบทสรุปที่ต้องขึ้นต้นด้วยการกล่าวถึงผลกระทบของข้อมูลจาก 'โปรไฟล์สุขภาพ' ที่มีต่อ 'อาการปัจจุบัน' ก่อนเสมอ",
        "risk_analysis": [{"condition": "...", "risk_level": "...", "rationale": "ต้องอธิบายว่าข้อมูลใน 'โปรไฟล์สุขภาพ' เพิ่มหรือลดความเสี่ยงของภาวะนี้อย่างไร"}],
        "personalized_care": {
          "immediate_actions": ["..."],
          "general_wellness": ["ต้องมีคำแนะนำอย่างน้อย 1 ข้อที่จำเพาะเจาะจงกับข้อมูลใน 'โปรไฟล์สุขภาพ' โดยตรง"],
          "activity_guidance": { "recommended": ["..."], "to_avoid": ["..."] }
        },
        "dietary_recommendations": {
          "concept": "ต้องอธิบายแนวคิดการทานอาหารที่สอดคล้องกับทั้ง 'อาการปัจจุบัน' และข้อมูลใน 'โปรไฟล์สุขภาพ'",
          "foods_to_eat": { "main_dishes": ["..."], "snacks_and_fruits": ["..."], "drinks": ["..."] },
          "foods_to_avoid": ["ต้องมีเหตุผลที่เชื่อมโยงกับข้อมูลใน 'โปรไฟล์สุขภาพ' และสอดคล้องกับ 'อาการปัจจุบัน' อย่างชัดเจน และต้องมีเหตุผลประกอบ บอกเป็น Bullet Point"]
        },
        "red_flags": ["ต้องมีสัญญาณอันตรายอย่างน้อย 1 ข้อที่เกี่ยวข้องกับข้อมูลใน 'โปรไฟล์สุขภาพ' และบอกออกมาเป็นหัวข้อ Bullet Point"],
        "disclaimer": "การประเมินนี้สร้างโดย AI เพื่อให้คำแนะนำเบื้องต้นเท่านั้น และพิจารณาจากข้อมูลที่คุณให้มา ไม่สามารถใช้แทนการวินิจฉัยจากแพทย์ได้ กรุณาปรึกษาบุคลากรทางการแพทย์เพื่อรับการวินิจฉัยและการรักษาที่ถูกต้อง"
      }
      
      **ข้อบังคับในการสร้างผลลัพธ์ (OUTPUT RULES):**
      1.  **เชื่อมโยงข้อมูล:** คำแนะนำทุกส่วน ต้องอ้างอิงและพิจารณาข้อมูล 'โปรไฟล์สุขภาพ' (ถ้ามี) เป็นอันดับแรกเสมอ
      2.  สำหรับ "risk_level" ให้ใช้ค่าใดค่าหนึ่งเท่านั้น: 'high', 'medium', 'low', 'info'
      3.  เรียงลำดับ "risk_analysis" จากความเสี่ยงสูงสุดไปต่ำสุด
      4.  ต้องสร้าง JSON ให้ครบทุกฟิลด์ ห้ามขาดหรือเกิน
      5.  เนื้อหาต้องปลอดภัย ห้ามวินิจฉัยโรค และ**ห้ามแนะนำให้ซื้อหรือใช้ยาใดๆ ทั้งสิ้น**
      6.  สำหรับ "risk_analysis" ต้องมีชื่อโรคเป็นภาษาไทยและวงเล็บ (ภาษาอังกฤษ) เช่น "โรคเบาหวาน (Diabetes)"
      7.  สำหรับ "foods_to_eat" ต้องมีข้อมูลในทุกหมวดหมู่ย่อย
      8.  ตอบเป็นภาษาไทยทั้งหมด
       `;
    // --- END: UPDATED PROMPT ---

    const jsonStringResponse = await generateContent(prompt); 
    try {
        const parsedResponse = JSON.parse(jsonStringResponse);
        console.log("✅ [AI Service] Successfully parsed JSON response");
        return parsedResponse;
    } catch (parseError) {
        console.error('❌ [AI Service] Failed to parse JSON response:', parseError.message);
        // Log only first 500 chars to avoid sensitive data exposure
        console.error('📄 [AI Service] Response content:', jsonStringResponse.substring(0, 500));
        throw new Error('AI service returned invalid response format. Please check API configuration or try again later.');
    }
}

const normalizeAiResponse = (analysis) => {
    console.log("🔄 [Service] Normalizing AI Response...");

    // Personalized Care normalization
    if (!analysis.personalized_care) analysis.personalized_care = {};
    const care = analysis.personalized_care;
    if (typeof care.general_wellness === 'string') care.general_wellness = [care.general_wellness];
    else if (!Array.isArray(care.general_wellness)) care.general_wellness = [];
    if (Array.isArray(care.activity_guidance)) care.activity_guidance = { recommended: care.activity_guidance, to_avoid: [] };
    else if (typeof care.activity_guidance !== 'object' || care.activity_guidance === null) care.activity_guidance = { recommended: [], to_avoid: [] };

    // --- START: ADDED FIX ---
    // Dietary Recommendations normalization: Ensure the object and its children exist
    if (!analysis.dietary_recommendations) {
        analysis.dietary_recommendations = {
            concept: 'ไม่มีข้อมูล',
            foods_to_eat: { main_dishes: [], snacks_and_fruits: [], drinks: [] },
            foods_to_avoid: []
        };
    } else {
        if (!analysis.dietary_recommendations.foods_to_eat) {
            analysis.dietary_recommendations.foods_to_eat = { main_dishes: [], snacks_and_fruits: [], drinks: [] };
        }
        if (typeof analysis.dietary_recommendations.foods_to_avoid === 'object' && !Array.isArray(analysis.dietary_recommendations.foods_to_avoid)) {
            if (analysis.dietary_recommendations.foods_to_avoid.reasoning) {
                analysis.dietary_recommendations.foods_to_avoid = [analysis.dietary_recommendations.foods_to_avoid.reasoning];
            } else {
                analysis.dietary_recommendations.foods_to_avoid = [];
            }
        } else if (!Array.isArray(analysis.dietary_recommendations.foods_to_avoid)) {
            analysis.dietary_recommendations.foods_to_avoid = [];
        }
    }
    // --- END: ADDED FIX ---
    
    // Red Flags normalization
    if (Array.isArray(analysis.red_flags) && analysis.red_flags.length > 0 && typeof analysis.red_flags[0] === 'object') {
        analysis.red_flags = analysis.red_flags.map(flag => flag.condition || "ข้อมูลไม่ถูกต้อง");
    }

    console.log("👍 [Service] Normalization complete.");
    return analysis;
};


async function getAiAssessment(userData) {
    const { name } = userData;
    console.log(`[Service] Starting assessment process for: ${name}`);
    const bmi = calculateBMI(userData.weight, userData.height);
    let analysis;
    let lastAiError = null;
    const maxRetries = 3; 

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[Service Attempt ${attempt}/${maxRetries}] Calling AI...`);
            let rawAnalysis = await getAiAnalysis(userData);
            analysis = normalizeAiResponse(rawAnalysis); 
            lastAiError = null;
            break; 
        } catch (aiError) {
            lastAiError = aiError;
            console.error(`❌ [Service Attempt ${attempt}] Failed: ${aiError.message}`);
            if (attempt < maxRetries) {
                await delay(2000);
            }
        }
    }

    if (lastAiError) {
        throw new Error(`Could not communicate with AI after ${maxRetries} attempts: ${lastAiError.message}`);
    }
    
    return {
        userInfo: { name: userData.name, age: userData.age, sex: userData.sex },
        bmi: { ...bmi, weight: userData.weight, height: userData.height },
        analysis: analysis
    };
}

export default { getAiAssessment };