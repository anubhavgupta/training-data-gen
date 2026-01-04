import type { ITool, IToolResult, IToolArgs } from "./tool.interface.ts";
import { BaseTool } from "./tool.interface.ts";
import { readFile } from "node:fs/promises";
import { writeFileSync } from "node:fs";
import { trainingDataSchema } from "../../prompt.ts";
/**
 * Input Arguments
 */
type ITrainingDataItem = IToolArgs & {
    input: string;
    output: string;
    change_instructions: Array<string>;
    trainingDataIndex: number;
};

/**
 * Tool Definition
 */
class CreateTrainingData extends BaseTool<ITrainingDataItem> {
    async executeTool(input: ITrainingDataItem): Promise<IToolResult> {
        let oldData = JSON.parse(await readFile("training-data.json", { encoding: "utf8" })) as Array<ITrainingDataItem>;
        oldData = oldData.concat([input]);
        try {
            writeFileSync("training-data.json", JSON.stringify(oldData, null, 2), "utf-8");
            return {
                type: "CREATE",
                success: true,
                result: `Total ${input.trainingDataIndex + 1} Training Data submitted successfully.`
            };
        } catch (error) {
            let message = "";
            if (error instanceof Error) message = error.message;
            return {
                type: "CREATE",
                success: false,
                result: `Error adding training data. Reason: ${message}`
            };
        }
    }
}

/**
 * Tool Metadata
 */
const createTrainingDataTool: ITool<CreateTrainingData> = {
    name: "createTrainingData",
    description:
        `Adds a new training example to the training dataset.`,
    inputSchema: trainingDataSchema,
    implementation: CreateTrainingData
};


export default createTrainingDataTool;
