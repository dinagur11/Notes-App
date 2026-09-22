const tools = [
  {
    type: 'function',
    function: {
      name: 'filter_notes',
      description: 'Search the notes collection by substring match on content. Returns up to 10 matches.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
  },
];

const MAX_ROUND_TRIPS = 3;

export async function runAgent({ prompt }: { prompt: string }): Promise<{ text: string }> {
  const messages: any[] = [{ role: 'user', content: prompt }];

  for (let i = 0; i < MAX_ROUND_TRIPS; i++) {
    const r = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:3b',
        messages,
        tools,
        stream: false,
         keep_alive: '30m',
      }),
    });

    const { message } = await r.json();

    // If the LLM didn't call a tool, it's done thinking! Return the text.
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return { text: message.content ?? '' };
    }

    // Otherwise, push the LLM's tool request to the messages array
    messages.push(message);

    // Dispatch the tool calls
    for (const call of message.tool_calls ?? []) {
      const args = typeof call.function.arguments === 'string'
        ? JSON.parse(call.function.arguments)
        : call.function.arguments;

      const PORT = process.env.PORT || 3001;
      const filterRes = await fetch(`http://localhost:${PORT}/notes/filter?query=${encodeURIComponent(args.query)}`);
      messages.push({ role: 'tool', content: await filterRes.text() });
    }
  }

  const err = new Error('Agent exceeded round-trip cap') as Error & { status?: number };
  err.status = 504;
  throw err;
}