import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const AI_URL = "http://localhost:3001/ai/complete";

export default function AIAssistant({ onGenerate }: { onGenerate: (text: string) => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        alert("Failed to generate AI text. Check connection.");
        return;
      }

      const data = await res.json();
      onGenerate(data.text ?? "");
      setPrompt("");
    } catch {
      alert("Failed to generate AI text. Check connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" data-testid="help_me_write" onClick={() => setOpen((o) => !o)}>
        ★ Help me write
      </button>
      {open && (
        <>
          <input
            type="text"
            value={prompt}
            placeholder="Ask the AI…"
            data-testid="help_me_write_prompt"
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            type="button"
            data-testid="help_me_write_submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </>
      )}
    </>
  );
}