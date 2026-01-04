# Instructions

1. Install package: `npm install training-data-gen --save`.
2. Create a file `index.js` and import  `getTrainingDataGen`.
`import { getTrainingDataGen } from "training-data-gen";`
3. Use `getTrainingDataGen` to get the generator function. 
```JS
const generate = await getTrainingDataGen({
    systemMsg: `<instructions for generating training data>`,
    trainingDataSchema: <schema of the training data>,
});
```
4. Execute generate fn with different training data set usecases.
```JS
generate([
    `Generate a training data for X usecase`.
    `Generate a training data for Y usecase`.
]);
```

## Full Code

```JS
import { getTrainingDataGen } from "training-data-gen";

const generate = await getTrainingDataGen({
    systemMsg: `You are an expert AI training data generator. Your task is to create high-quality training examples for fine-tuning a small language model (0.6B parameters) to apply code changes based on specific instructions.

## Your job is to generate unique training example with these fields:
- "input": <<Instructions for -> detail of the input that would be provided by the user>>.
- "change_instructions": <<Instructions for -> how input would be augumented>>
- "output": <<Instructions for -> the final>>.

## Each change instruction should be:
<<..Details of the change instructions goes here..>>

## Response Format:
{
  "input": "<some example input>",
  "change_instructions": "<some example change instructions>",
  "output": "<some example output>"
}
`,
trainingDataSchema: {
    type: "object",
    properties: {
        // following is an example schema and can be changed based on the training usecase.
        input: {
            type: "string",
            description: "<details of the input content>"
        },
        change_instructions: {
            type: "array",
            items: {
                type: "string"
            },
            description: "<details of the change instructions>"
        },
        output: {
            type: "string",
            description: "<details of the output>"
        },
        trainingDataIndex: {
            type: "number",
            description: "The index of the training data item in the dataset. Index starts from 0."
        }
    },
    required: ["input", "change_instructions", "output", "trainingDataIndex"]
},
});

generate([
    `Generate a training data for X usecase`.
    `Generate a training data for Y usecase`.
    ...
]);
```

## License

This project is dual-licensed:

- **Non-Commercial Use**: Free under the PolyForm Noncommercial License.
- **Commercial Use**: Requires a paid commercial license.

If you want to use this project in a commercial product, SaaS,
or paid offering, please contact:

📧 anubhav200@gmail.com
