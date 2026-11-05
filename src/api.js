const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
const RAG_API_BASE_URL =
  "https://python-basic-learning-project-chatbot-ai.onrender.com/api/v1";

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

async function postJSON(path, body, baseUrl = API_BASE_URL) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  let data;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.detail || data?.message || data?.error;
    throw new Error(message || `Request failed (${response.status}).`);
  }

  return data;
}

export function registerAccount({ email, password, name }) {
  return postJSON("/auth/register", { email, password, name });
}

export function loginAccount({ email, password }) {
  return postJSON("/auth/login", { email, password });
}

export function sendChatMessage(message) {
  return postJSON("/gemini/chat", { message });
}

export function askEducationQuestion(question) {
  return postJSON(
    "/rag/ask-with-fallback",
    { question },
    RAG_API_BASE_URL,
  );
}
