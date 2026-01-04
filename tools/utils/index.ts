import type { ChatCompletionFunctionTool, FunctionParameters } from "openai/resources";
import type { IToolType } from "../baseTools/tool.interface.ts";

function convertTool(mcpTool: IToolType): ChatCompletionFunctionTool {
    return {
        type: "function",
        function: {
            name: `${mcpTool.name}`,
            description: mcpTool.description ?? mcpTool.name,
            parameters: mcpTool.inputSchema as unknown as FunctionParameters,
            strict: true
        }
    }
}

function convertAllTools(toolObj: Record<string, IToolType>) {
    return Object.values(toolObj).map((mcpTool) => convertTool(mcpTool));
}



export { convertTool, convertAllTools };
