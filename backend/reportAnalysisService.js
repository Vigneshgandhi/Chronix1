const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "treyleo16/gpt-5-6-terra:latest";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    isViolation: { type: "boolean" },
    category: { type: "string", enum: ["harassment", "threats", "spam", "abuse", "inappropriate_content", "impersonation", "other"] },
    severity: { type: "string", enum: ["low", "medium", "high"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    reason: { type: "string" },
    recommendedAction: { type: "string", enum: ["remove", "keep", "manual_review"] },
  },
  required: ["isViolation", "category", "severity", "confidence", "reason", "recommendedAction"],
};

function validateResult(value) {
  if (!value || typeof value !== "object") return null;
  if (typeof value.isViolation !== "boolean" || !schema.properties.category.enum.includes(value.category) || !schema.properties.severity.enum.includes(value.severity) || !schema.properties.recommendedAction.enum.includes(value.recommendedAction) || typeof value.confidence !== "number" || value.confidence < 0 || value.confidence > 1 || typeof value.reason !== "string") return null;
  return { isViolation: value.isViolation, category: value.category, severity: value.severity, confidence: value.confidence, reason: value.reason.slice(0, 1000), recommendedAction: value.recommendedAction };
}

function outputText(payload) {
  return typeof payload?.message?.content === "string" ? payload.message.content : "";
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const fenced = String(text || "").match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    return fenced ? JSON.parse(fenced[1]) : null;
  }
}

function normalizeResult(value, reportedCategory) {
  if (!value || typeof value !== "object") return null;
  const isViolation = typeof value.isViolation === "boolean"
    ? value.isViolation
    : typeof value.is_violation === "boolean"
    ? value.is_violation
    : typeof value.is_spam === "boolean"
    ? value.is_spam
    : typeof value.violation === "boolean"
    ? value.violation
    : null;
  if (isViolation === null) return null;

  let confidence = value.confidence ?? value.confidence_score ?? value.score;
  confidence = Number(confidence);
  if (confidence > 1 && confidence <= 100) confidence /= 100;

  const category = schema.properties.category.enum.includes(value.category)
    ? value.category
    : schema.properties.category.enum.includes(reportedCategory)
    ? reportedCategory
    : value.is_spam === true || String(value.spam_type || "").trim()
    ? "spam"
    : "other";
  const severity = schema.properties.severity.enum.includes(value.severity)
    ? value.severity
    : value.is_spam || isViolation
    ? "medium"
    : "low";
  const reason = typeof value.reason === "string"
    ? value.reason
    : Array.isArray(value.reasons)
    ? value.reasons.join(" ")
    : String(value.explanation || value.reasoning || "");
  const action = value.recommendedAction || value.recommended_action || value.action;
  const recommendedAction = schema.properties.recommendedAction.enum.includes(action)
    ? action
    : isViolation
    ? "manual_review"
    : "keep";

  return validateResult({ isViolation, category, severity, confidence, reason, recommendedAction });
}

async function analyzeReport({ content, category, reason } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: "json",
        messages: [
          { role: "system", content: "You are Chronix's advisory moderation reviewer. Analyze only the explicitly reported content. Return one JSON object with exactly these fields: isViolation (boolean), category (harassment, threats, spam, abuse, inappropriate_content, impersonation, or other), severity (low, medium, or high), confidence (number from 0 to 1), reason (string), recommendedAction (remove, keep, or manual_review). Do not return markdown or extra fields." },
          { role: "user", content: JSON.stringify({ content: String(content || "").slice(0, 12000), reportedCategory: category || "other", reportReason: reason || "" }) },
        ],
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.warn(`[Moderation] Ollama request failed with status ${response.status}.`);
      return { status: "analysis_unavailable", code: `ollama_${response.status}`, message: "AI review is temporarily unavailable; manual review is required." };
    }
    const result = normalizeResult(parseJson(outputText(payload)), category || "other");
    return result ? { status: "analysis_available", ...result } : { status: "analysis_unavailable", code: "invalid_ai_response", message: "AI review returned an invalid result; manual review is required." };
  } catch (error) {
    const code = error?.name === "AbortError" ? "timeout" : "network_error";
    console.warn(`[Moderation] AI review ${code}.`);
    return { status: "analysis_unavailable", code, message: "AI review is temporarily unavailable; manual review is required." };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { analyzeReport };
