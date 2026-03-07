const MODEL_CANDIDATES = ["gemini-2.0-flash", "gemini-1.5-flash-latest"];

const toSafeText = (value, fallback = "") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const extractJsonObject = (text) => {
  const cleaned = String(text || "")
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return "";
  return cleaned.slice(first, last + 1);
};

const getGeminiClient = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY");
    return null;
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error("Gemini SDK load failed:", error?.message || error);
    return null;
  }
};

export const generateGeminiText = async (prompt, fallbackText = "") => {
  const client = await getGeminiClient();
  if (!client) return fallbackText;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = toSafeText(result?.response?.text?.(), "");
      if (text) return text;
    } catch (error) {
      console.error(`Gemini model failed (${modelName}):`, error?.message || error);
    }
  }

  return fallbackText;
};

export const generateGeminiJson = async (prompt, fallbackObject) => {
  const fallbackText = JSON.stringify(fallbackObject);
  const raw = await generateGeminiText(prompt, fallbackText);
  const jsonText = extractJsonObject(raw);

  if (!jsonText) return fallbackObject;

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini JSON parse failed:", error?.message || error);
    return fallbackObject;
  }
};
