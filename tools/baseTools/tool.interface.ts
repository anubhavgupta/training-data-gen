/**
 * Tool Input Schema for LLM Tool Calling.
 */

type Types = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null';
interface IToolInputSchema {
    type: Types | Types[];
    description?: string;
    enum?: string[];
    items?: IToolInputSchema; // For array types
    properties?: { [key: string]: IToolInputSchema }; // For object types
    required?: string[]; // For object types
}

/**
 * Tool Metadata
 */
interface ITool<ToolImplementation extends BaseTool<IToolArgs>> { 
    name: string;
    description: string;
    inputSchema: IToolInputSchema;
    implementation: { new(...args: unknown[]): ToolImplementation }; 
}

/**
 * Tool call arguments
 */
type IToolArgs = Record<string, unknown>;

/**
 * Tool execution result
 */
type IToolResult = Promise<{
    type: "READ" | "CREATE" | "DELETE" | "UPDATE" | "EXECUTE";
    success: boolean;
    result: string;
}>;

/**
 * Tool Definition
 * *Important*: Each tool does only one thing at a time and does it very well.
 */
abstract class BaseTool<Args extends IToolArgs> {
    abstract executeTool(input: Args): Promise<IToolResult>;
}

type IToolType = ITool<BaseTool<IToolArgs>>;
type IToolMap = Record<string, IToolType>;

export type {
    ITool,
    IToolMap,
    IToolType,
    IToolInputSchema,
    IToolArgs,
    IToolResult,
}

export {
    BaseTool 
} 