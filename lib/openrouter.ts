const callAI = async (messages: { role: string, content: string }[]) => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      console.error("AI API Error", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (e) {
    console.error("AI Fetch Error", e);
    return null;
  }
};

export const breakdownTask = async (taskTitle: string, taskDescription?: string) => {
  const prompt = `Break down the task "${taskTitle}" ${taskDescription ? `(${taskDescription})` : ''} into 3-5 actionable subtasks. Return ONLY a valid JSON array of strings (e.g. ["Step 1", "Step 2"]). Do not wrap in markdown or code blocks.`;

  const content = await callAI([{ role: "user", content: prompt }]);

  if (!content) return [];

  try {
    // Clean potential markdown wrappers often returned by LLMs
    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse AI response", content);
    // Fallback: simple line split if JSON parsing fails
    return content.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.match(/^\d+\./))
      .map(line => line.replace(/^[-\d.]+\s*/, ''))
      .slice(0, 5);
  }
};


