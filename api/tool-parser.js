function extractQwenToolCall(text) {
  // 1. Extract inside <tool_call>...</tool_call>
  const toolCallMatch = text.match(/<tool_call>([\s\S]*?)<\/tool_call>/);
  if (!toolCallMatch) return null;

  const block = toolCallMatch[1];

  // 2. Extract function name
  const fnMatch = block.match(/<function=([^>\n]+)[>\n]/);
  if (!fnMatch) return null;
  const functionName = fnMatch[1].trim();

  // 3. Extract all parameters
  const paramRegex = /<parameter=([^>]+)>\s*([\s\S]*?)\s*<\/parameter>/g;

  let params = {};
  let match;

  while ((match = paramRegex.exec(block)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    params[key] = value;
  }

  // 4. Return OpenAI-style tool call
  return {
    type: "function",
    function: {
      name: functionName,
      arguments: JSON.stringify(params) // escaped JSON as OpenAI expects
    }
  };
}

function processQwenToolCalls(message) {
    if (message.content) {
        const toolCall = extractQwenToolCall(message.content);
        if (toolCall) {
            if (!message.tool_calls) {
                message.tool_calls = [];
            }
            message.tool_calls.push(toolCall);
            const updatedContent = message.content.split("<tool_call>")[0];
            message.content = updatedContent.trim();
        }
    }  
}

export {
    processQwenToolCalls
};
