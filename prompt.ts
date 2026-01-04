import type { IToolInputSchema } from "./tools/baseTools/tool.interface.ts";
import type { ClientOptions } from "openai";

const systemMsg = `You are an expert AI training data generator. Your task is to create high-quality training examples for fine-tuning a small language model (0.6B parameters) to apply code changes based on specific instructions.

## Your job is to generate unique training example with these fields:
- "input": The escaped original code file content.
- "change_instructions": An array of 3-7 highly specific, actionable instructions that describe EXACTLY what needs to be changed
- "output": The escaped modified code after applying all changes.

## Each change instruction should be:
1. Extremely specific about what to find and modify
2. Use clear, unambiguous language like "Locate the function signature 'function calculateTotal(items) {' and modify it to 'function calculateTotal(items, taxRate = 0.08) {'"
3. Reference recognizable code patterns rather than line numbers or character positions
4. Describe both what to find AND what to replace/insert
5. Be actionable - the model should be able to execute these instructions without ambiguity
6. The instructions shouldn't ask to implement some functionality or feature.

## Response Format:
{
  "input": "function calculateTotal(items) {\n    let total = 0;\n        for (let i = 0; i < items.length; i++) {\n            total += items[i].price;\n        }\n    return total;\n}",
  "change_instructions": [
    "Locate the function signature 'function calculateTotal(items) {' and modify it to 'function calculateTotal(items, taxRate = 0.08) {'",
    "After the line 'let total = 0;', add validation: 'if (taxRate < 0 || taxRate > 1) { throw new Error(\"Tax rate must be between 0 and 1\"); }'",
    "Find the for loop that says 'for (let i = 0; i < items.length; i++)' and change it to 'for (let j = 0; j < items.length; j++)'",
    "In the for loop body, before 'total += items[i].price;', add validation: 'if (items[j].price < 0) { throw new Error(\"Item prices cannot be negative\"); }'",
    "Find the return statement and change 'return total;' to 'return total * (1 + taxRate);'"
  ],
  "output": "function calculateTotal(items, taxRate = 0.08) {\n    let total = 0;\n    if (taxRate < 0 || taxRate > 1) { \n      throw new Error(\"Tax rate must be between 0 and 1\"); \n    }\n    for (let j = 0; j < items.length; j++) {\n        if (items[j].price < 0) { \n          throw new Error(\"Item prices cannot be negative\"); \n        }\n        total += items[j].price;\n    }\n    return total * (1 + taxRate);\n}"
}
`

const trainingDataSchema: IToolInputSchema = {
  type: "object",
  properties: {
      input: {
          type: "string",
          description: "The original JS/CSS/HTML/TXT file content."
      },
      change_instructions: {
          type: "array",
          items: {
              type: "string"
          },
          description: "An array of 3-7 highly specific, actionable instructions that describe EXACTLY what needs to be changed"
      },
      output: {
          type: "string",
          description: "The modified content after applying all changes."
      },
      trainingDataIndex: {
          type: "number",
          description: "The index of the training data item in the dataset. Index starts from 0."
      }
  },
  required: ["input", "change_instructions", "output", "trainingDataIndex"]
};

const N = 5;
const dataSetTypes = [
  `Generate ${N} training data for long (200 lines) JS`,
] ;

const openAIClientOverrides: ClientOptions = {
  baseURL: "http://localhost:8080/v1",
  apiKey: "lm-studio",
};

export {
  systemMsg,
  trainingDataSchema,
  dataSetTypes,
  openAIClientOverrides
};
