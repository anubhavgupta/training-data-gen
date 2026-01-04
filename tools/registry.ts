import type { ChatCompletionFunctionTool } from "openai/resources";
import type { IToolType, IToolMap } from "./baseTools/tool.interface.ts";
import { convertAllTools } from "./utils/index.ts";
import toolsList from "./registeredTools.json" with { type: "json" };


let tools: IToolMap = {};

async function registerTool(filePath: string) { 
    // Import the tool module dynamically
    const module = await import(filePath) as { default: IToolType };
    const tool = module.default;
    tools[tool.name] = tool;
    console.log(`Registered tool: ${tool.name}`);
    return tool;
}

// register built-in tools
const builtInTools = toolsList.map(tool => `./baseTools/${tool}`);
const builtInToolPromises = Promise.all(builtInTools.map(registerTool));

async function reloadTools(customToolList?: string[]): Promise<unknown> {
    await builtInToolPromises;
    console.log('################ Unloading all tools ##########');
    tools = {};
    customToolList = customToolList ?? toolsList;
    const builtInTools = customToolList.map(tool => `./baseTools/${tool}`);
    return Promise.all(builtInTools.map(registerTool));
} 

async function getTools(): Promise<[ChatCompletionFunctionTool[], IToolMap]> {
    await builtInToolPromises;
    return [convertAllTools(tools), tools];
}

export { registerTool, getTools, reloadTools };