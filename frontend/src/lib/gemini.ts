export interface AIConfig {
  provider: "gemini" | "openai" | "anthropic";
  apiKey: string | null;
  proxyUrl: string | null;
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
  // 1. Extract text from PDF first using pdf-parse so it is always available
  let extractedText = "";
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const pdfData = await pdfParse(pdfBuffer);
    extractedText = pdfData.text || "";
  } catch (err) {
    console.error("Error parsing PDF text:", err);
  }

  // 2. Determine provider and config
  const provider = aiConfig?.provider || "gemini";
  const apiKey = aiConfig?.apiKey || process.env.GEMINI_API_KEY!;
  const proxyUrl = aiConfig?.proxyUrl || null;

  if (!apiKey) {
    throw new Error("API Key untuk AI belum dikonfigurasi di pengaturan.");
  }

  const prompt = `
    Analisis CV (Curriculum Vitae) terlampir untuk posisi "${jobTitle}".
    
    Konteks Tambahan (Email Pengirim):
    Subjek: ${emailSubject || "Tidak ada"}
    Isi Email: ${emailBody || "Tidak ada"}
    
    Syarat Wajib (SEMUA harus terpenuhi agar is_qualified = true):
    ${mandatoryCriteria.map((c) => `- ${c}`).join("\n")}
    
    Kriteria Opsional:
    ${optionalCriteria.map((c) => `- ${c}`).join("\n")}
    
    Passing Grade untuk skor opsional: ${passingGrade}
    
    Tugas Anda:
    1. Berikan skor (0-100) berdasarkan kecocokan kriteria.
    2. Tentukan status 'is_qualified'.
    3. Buat ringkasan singkat hasil (1 kalimat) untuk properti 'summary'.
    4. Ekstrak seluruh teks mentah dari CV ke 'extracted_text' (jika tidak ada di data input, buat ringkasan teks CV).
    5. Berikan alasan mendalam (reasoning) dalam Bahasa Indonesia.
    6. Untuk setiap syarat wajib, berikan 'note' singkat kenapa lulus/gagal.
    7. EKSTRAK NAMA LENGKAP DAN EMAIL kandidat yang tertera di dalam dokumen CV ke properti 'candidate_name' dan 'candidate_email'. Jika tidak ditemukan, kosongkan ("").
    
    Hasilkan output dalam format JSON berikut:
    {
      "candidate_name": "string",
      "candidate_email": "string",
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

  let responseText = "";

  if (provider === "gemini") {
    // Call Gemini REST API
    const baseUrl = proxyUrl || "https://generativelanguage.googleapis.com";
    const url = `${baseUrl}/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: pdfBuffer.toString("base64"),
                },
              },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
    }

    const resJson = await response.json();
    responseText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else if (provider === "openai") {
    // Call OpenAI API Format (Proxy/Direct)
    const baseUrl = proxyUrl || "https://api.openai.com/v1";
    const url = `${baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `${prompt}\n\nTEKS CV YANG DIEKSTRAK:\n${extractedText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${errText}`);
    }

    const resJson = await response.json();
    responseText = resJson.choices?.[0]?.message?.content || "";
  } else if (provider === "anthropic") {
    // Call Anthropic API Format (Proxy/Direct)
    const baseUrl = proxyUrl || "https://api.anthropic.com/v1";
    const url = `${baseUrl}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `${prompt}\n\nTEKS CV YANG DIEKSTRAK:\n${extractedText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API Error: ${response.status} - ${errText}`);
    }

    const resJson = await response.json();
    responseText = resJson.content?.[0]?.text || "";
  }

  try {
    const result = parseJsonResponse(responseText) as AnalysisResult;
    // Inject parsed text if AI missed it
    if (!result.extracted_text && extractedText) {
      result.extracted_text = extractedText;
    }
    return result;
  } catch (error) {
    console.error("Failed to parse AI response:", responseText);
    throw new Error("Format respon AI tidak valid.");
  }
}
