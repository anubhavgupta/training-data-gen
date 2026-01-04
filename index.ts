import type { ClientOptions } from "openai";
import { configStore } from "./api/configStore.ts";
import type { IToolInputSchema } from "./tools/baseTools/tool.interface.ts";

type TrainingDataGenConfig = {
    systemMsg: string;
    trainingDataSchema: IToolInputSchema;
    dataSetTypes?: Array<string>;
    openAIClientOverrides?: ClientOptions;
};

async function getTrainingDataGen(config: TrainingDataGenConfig) {
    configStore.setDataSetTypes(config?.dataSetTypes ?? []);
    configStore.setOpenAIClientOverrides(config?.openAIClientOverrides ?? {});
    configStore.setTrainingDataSchema(config.trainingDataSchema);
    configStore.setSystemPrompt(config.systemMsg);
    const { PrepareTrainingData } = await import("./api/main.js");
    return PrepareTrainingData;
}

export {
    getTrainingDataGen
};