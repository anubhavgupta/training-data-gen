import { MessageManager } from "../api/MessageManager.ts";
import type { IToolArgs, IToolMap } from "./baseTools/tool.interface.ts";
import type { ChatCompletionMessage, ChatCompletionMessageFunctionToolCall } from "openai/resources";

async function makeToolCall(tools: IToolMap, fnCall: { arguments: Record<string, unknown>; id: string; name: string; }) {
    console.log("TOOL to be called: ", fnCall.name, "---", fnCall.arguments);

    const toolInstance = new tools[fnCall.name].implementation();
    const result = await toolInstance.executeTool(fnCall.arguments as unknown as IToolArgs);
    console.log(`TOOL call result ${fnCall.name}: ${result.type} ${result.success} ${result.result}`);
    return {
        id: fnCall.id,
        content: result.result
    };
}

async function callTools(tools: IToolMap, callForTools: ChatCompletionMessageFunctionToolCall[]) {
    const fnsToCall = callForTools
        .map((toolCall) => {
            return {
                ...toolCall.function,
                arguments: JSON.parse(toolCall.function.arguments),
                id: toolCall.id
            }
        });
    const results = [];
    for (let i = 0; i < fnsToCall.length; i++) {
        results.push(await makeToolCall(tools, fnsToCall[i]));
    }
    return results;
}

async function callToolsWithMessageManager(tools: IToolMap, reponseMessage: ChatCompletionMessage, messageManager: MessageManager) {
    const { content, tool_calls, reasoning_content } = reponseMessage;
    messageManager.add(messageManager.roles.assistant, content as string, { tool_calls });
    const toolResults = await callTools(tools, tool_calls as ChatCompletionMessageFunctionToolCall[]);
    toolResults.map((toolCallResult) => {
        messageManager.add(messageManager.roles.tool, toolCallResult.content, {
            tool_call_id: toolCallResult.id,
            reasoning_content,
        });
    })
    return toolResults;
}


function hasToolCalls(responseMessage: ChatCompletionMessage) {
    if (!responseMessage) {
        debugger;
    }
    return !!(responseMessage.tool_calls && responseMessage.tool_calls.length);
}

export { callTools, callToolsWithMessageManager, hasToolCalls }