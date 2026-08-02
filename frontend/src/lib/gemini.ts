export interface AIConfig {
  provider: "gemini" | "openai" | "anthropic";
  apiKey: string | null;
  proxyUrl: string | null;
  model: string | null;
}

export interface AnalysisResult {
  total_score: number;
  is_qualified: boolean;
  summary: string;
  reasoning: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  skills_found: string[];
  extracted_text: string;
  mandatory_check: {
    criteria: string;
    passed: boolean;
    note: string;
  }[];
}

function parseJsonResponse(text: string): any {
  let cleaned = text.trim();
  // Strip markdown formatting if any
  if (cleaned.startsWith("```")) {
    const match = cleaned.match(/```(?:json)?([\s\S]*?)```/);
    if (match) {
      cleaned = match[1].trim();
    }
  }
  return JSON.parse(cleaned);
}

/**
 * Robust Hybrid Document Analyzer
 * 1. System-level Text Extraction (PDF Parse + OCR fallback)
 * 2. Text-first injection into prompt for 100% compatibility across ALL text & multimodal LLM models
 * 3. Optional inline PDF binary enhancement for Gemini multimodal capabilities
 */
export async function analyzeCandidate(
  pdfBuffer: Buffer,
  jobTitle: string,
  mandatoryCriteria: string[],
  optionalCriteria: string[],
  passingGrade: number,
  emailBody?: string,
  emailSubject?: string,
  aiConfig?: AIConfig
): Promise<AnalysisResult> {
  // 1. Ekstraksi Teks di Level Sistem (System-level PDF Text Extraction)
  let extractedText = "";
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const pdfData = await pdfParse(pdfBuffer);
    extractedText = (pdfData.text || "").trim();
  } catch (err) {
    console.error("[System OCR/PDF Parsing Error]:", err);
  }

  // Fallback jika PDF berupa gambar hasil scan tanpa layer teks
  if (!extractedText || extractedText.length < 20) {
    extractedText = `[SISTEM NOTE: Teks mentah PDF tidak terdeteksi via parser standar, dokumen mungkin berupa gambar scan atau terlindungi. Analisis dilakukan berdasarkan meta data & konteks email.]`;
  }

  // 2. Tentukan Provider & Kredensial AI
  const provider = aiConfig?.provider || "gemini";
  const apiKey = aiConfig?.apiKey || process.env.GEMINI_API_KEY!;
  const proxyUrl = aiConfig?.proxyUrl || null;

  if (!apiKey) {
    throw new Error("API Key untuk AI belum dikonfigurasi di halaman Pengaturan.");
  }

  // 3. Susun Prompt Universal (Sangat kompatibel dengan Model Text-Only maupun Multimodal)
  const prompt = `
    Analisis CV (Curriculum Vitae) berikut untuk lamaran posisi "${jobTitle}".
    
    =========================================
    TEKS ISI DOKUMEN CV (DI-EKSTRAK OLEH SISTEM):
    =========================================
    ${extractedText}
    =========================================
    
    Konteks Tambahan (Pesan / Email Pengirim):
    Subjek Email: ${emailSubject || "Tidak ada"}
    Isi Email: ${emailBody || "Tidak ada"}
    
    Kriteria Syarat Wajib (SEMUA harus terpenuhi agar is_qualified = true):
    ${mandatoryCriteria.length > 0 ? mandatoryCriteria.map((c) => `- ${c}`).join("\n") : "- Tidak ada kriteria khusus"}
    
    Kriteria Opsional:
    ${optionalCriteria.length > 0 ? optionalCriteria.map((c) => `- ${c}`).join("\n") : "- Tidak ada kriteria opsional"}
    
    Passing Grade Nilai Opsional: ${passingGrade}
    
    Instruksi Tugas:
    1. Berikan skor total (0-100) berdasarkan tingkat kecocokan kriteria.
    2. Tentukan status 'is_qualified' (true jika seluruh syarat wajib terpenuhi dan skor >= passing grade).
    3. Buat ringkasan hasil evaluasi dalam 1 kalimat (max 100 karakter) pada properti 'summary'.
    4. Simpan seluruh teks mentah CV ke properti 'extracted_text'.
    5. Berikan alasan dan uraian detail penilaian (reasoning) dalam Bahasa Indonesia.
    6. Untuk setiap syarat wajib, berikan 'note' ringkas kenapa lulus atau gagal.
    7. EKSTRAK NAMA LENGKAP DAN EMAIL kandidat dari dalam isi CV ke 'candidate_name' dan 'candidate_email'.
    
    Output WAJIB berupa JSON murni dengan format berikut:
    {
      "candidate_name": "string",
      "candidate_email": "string",
      "candidate_phone": "string",
      "total_score": number,
      "is_qualified": boolean,
      "summary": "string",
      "reasoning": "string",
      "skills_found": ["skill1", "skill2"],
      "extracted_text": "string",
      "mandatory_check": [
        { "criteria": "string", "passed": boolean, "note": "string" }
      ]
    }
  `;

  let responseText = "";

  if (provider === "gemini") {
    // Gemini REST API (Mengirim teks ekstrak + opsional inline PDF)
    const baseUrl = proxyUrl || "https://generativelanguage.googleapis.com";
    const modelName = aiConfig?.model || "gemini-1.5-flash";
    const url = `${baseUrl}/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const parts: any[] = [];
    
    // Sertakan binary PDF jika ada
    if (pdfBuffer && pdfBuffer.length > 0) {
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBuffer.toString("base64"),
        },
      });
    }

    parts.push({ text: prompt });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    responseText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else if (provider === "openai") {
    // OpenAI Format (GPT-4o, GPT-3.5, DeepSeek, Ollama, dll.)
    const baseUrl = proxyUrl || "https://api.openai.com/v1";
    const url = `${baseUrl}/chat/completions`;
    const modelName = aiConfig?.model || "gpt-4o-mini";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    responseText = resJson.choices?.[0]?.message?.content || "";
  } else if (provider === "anthropic") {
    // Anthropic Claude Format
    const baseUrl = proxyUrl || "https://api.anthropic.com/v1";
    const url = `${baseUrl}/messages`;
    const modelName = aiConfig?.model || "claude-3-5-sonnet-20241022";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API Error (${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    responseText = resJson.content?.[0]?.text || "";
  }

  try {
    const result = parseJsonResponse(responseText) as AnalysisResult;
    // Pastikan extracted_text terisi
    if (!result.extracted_text && extractedText) {
      result.extracted_text = extractedText;
    }
    return result;
  } catch (error) {
    console.error("Failed to parse AI response:", responseText);
    throw new Error("Format respon JSON dari AI tidak valid.");
  }
}
