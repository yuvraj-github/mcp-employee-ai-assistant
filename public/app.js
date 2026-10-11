const form = document.getElementById("chatForm");
const input = document.getElementById("question");
const messages = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");

function addMessage(text, sender) {
  const div = document.createElement("div");

  div.className = `message ${sender}`;

  if (sender === "assistant") {
    // Parse Markdown safely without inserting raw HTML
    div.innerHTML = DOMPurify.sanitize(marked.parse(text));
  } else {
    div.textContent = text;
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  return div;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = input.value.trim();

  if (!question) return;

  addMessage(question, "user");

  input.value = "";
  sendBtn.disabled = true;

  const loading = addMessage("Thinking...", "assistant");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    loading.remove();
    addMessage(data.answer, "assistant");

  } catch (error) {
    loading.remove();
    addMessage(`Error: ${error.message}`, "assistant");

  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});