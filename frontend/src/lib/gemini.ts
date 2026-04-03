import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export interface AnalysisResult {
  total_score: number;
  is_qualified: boolean;
  reasoning: string;
  summary: string; // Ditambahkan sesuai tipe data UI
  skills_found: string[]; // Diubah dari found_skills
  extracted_text: string;
  mandatory_check: {
    criteria: string;
    passed: boolean;
    note: string; // Ditambahkan sesuai tipe data UI
  }[];
}

export async function analyzeCandidate(
  pdfBuffer: Buffer,
  jobTitle: string,
  mandatoryCriteria: string[],
  optionalCriteria: string[],
  passingGrade: number
): Promise<AnalysisResult> {
  const prompt = `
    Analisis CV (Curriculum Vitae) terlampir untuk posisi "${jobTitle}".
    
    Syarat Wajib (SEMUA harus terpenuhi agar is_qualified = true):
    ${mandatoryCriteria.map((c) => `- ${c}`).join("\n")}
    
    Kriteria Opsional:
    ${optionalCriteria.map((c) => `- ${c}`).join("\n")}
    
    Passing Grade untuk skor opsional: ${passingGrade}
    
    Tugas Anda:
    1. Berikan skor (0-100) berdasarkan kecocokan kriteria.
    2. Tentukan status 'is_qualified'.
    3. Buat ringkasan singkat hasil (1 kalimat) untuk properti 'summary'.
    4. Ekstrak seluruh teks mentah dari CV ke 'extracted_text'.
    5. Berikan alasan mendalam (reasoning) dalam Bahasa Indonesia.
    6. Untuk setiap syarat wajib, berikan 'note' singkat kenapa lulus/gagal.
    
    Hasilkan output dalam format JSON berikut:
    {
      "total_score": number,
      "is_qualified": boolean,
      "summary": "string (max 100 karakter)",
      "reasoning": "string (penjelasan detail)",
      "skills_found": ["skill1", "skill2"],
      "extracted_text": "string",
      "mandatory_check": [
        { "criteria": "string", "passed": boolean, "note": "string" }
      ]
    }
  `;

  const result = await model.generateContent([
    {
      inlineData: {
        data: pdfBuffer.toString("base64"),
        mimeType: "application/pdf",
      },
    },
    { text: prompt },
  ]);

  const responseText = result.response.text();
  
  try {
    return JSON.parse(responseText) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", responseText);
    throw new Error("Invalid AI response format");
  }
}
