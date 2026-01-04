import type { ClientOptions } from "openai";
import type { IToolInputSchema } from "../tools/baseTools/tool.interface";

const store: Record<string, unknown> = {};

class ConfigStore {
    setSystemPrompt(str: string) {
        store.systemMsg = str;
    }

    setTrainingDataSchema(trainingDataSchema: IToolInputSchema) {
        store.trainingDataSchema = trainingDataSchema;
    }

    setOpenAIClientOverrides(openAIClientOverrides: ClientOptions) {
        store.openAIClientOverrides = openAIClientOverrides;
    }

    setDataSetTypes(dataSetTypes: Array<string>) {
        store.dataSetTypes = dataSetTypes;
    }
}

const configStore = new ConfigStore();

function getStore(){
    return store;
}

export {
    configStore,
    getStore
}