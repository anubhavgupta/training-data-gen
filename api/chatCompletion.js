import { OpenAI } from 'openai'
import { getTools } from "../tools/registry.ts";
import { callToolsWithMessageManager, hasToolCalls } from "../tools/toolCaller.ts";
import { JSONTransformStream, StrExtractorStream } from "./streamHelpers.js";
import { processQwenToolCalls } from './tool-parser.js';
import { getStore } from "./configStore.ts";


const CLIENT_TYPES = {
    LOCAL: 'LOCAL',
    SERVER: 'SERVER'
};

const SELECTED_CLIENT_TYPE = CLIENT_TYPES.LOCAL;

const lmStudioClient = new OpenAI({
    baseURL: "http://localhost:8080/v1",
    apiKey: "lm-studio",
    dangerouslyAllowBrowser: false,
    stream: true,
    ...(getStore().openAIClientOverrides ?? {})
}); 


const clientConfig = {
    [CLIENT_TYPES.LOCAL]: {
        client: lmStudioClient,
        otherConfig: {
            reasoning_effort: "high",
        }
    }  
}[SELECTED_CLIENT_TYPE];

/**
 * Completion API
 * @param {OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming} options 
 * @returns { Promise<OpenAI.ChatCompletionResponse> }
 */
async function getChatCompletion(options) {
    const client = clientConfig.client;
    let response = client.chat.completions.stream({
        model: "Qwen3-Coder-30B-A3B-Instruct",
        messages: options.messages,
        reasoning_effort: "minimal",
        ...options,
    });
    
    logStream(response);
       
    const data = await response.finalChatCompletion();
    processQwenToolCalls(data.choices[0].message);
    patchContent(data.choices[0].message);
    return data.choices[0].message;
}


async function logStream(response) {
    let stream = response.toReadableStream();
    stream = stream
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new JSONTransformStream())
      .pipeThrough(new StrExtractorStream());
      

    for await (const part of stream) {
        process.stdout.write(`\x1b[33m${part}\x1b[0m`);
    }
}

function patchContent(message) {
    if(message.content !== undefined && message.content !== null) {
       if(message.content.indexOf("<tool_call") !== -1) {
          message.content = message.content.split("<tool_call>")[0];
       } else if(message.content.indexOf("<function=") !== -1) {
           message.content = message.content.split("<function=")[0];
       }
    }
    if(message.tool_calls!== undefined && message.tool_calls !== null) {
        message.tool_calls.forEach((toolCall)=>{
          delete toolCall['function'].parsed_arguments;
        });
    }
}

async function getMessageCompletion(messageManager, debug) {
  try {
    console.log('Getting completion...');
    const isToolsEnabled = messageManager.isToolsEnabled;
    const [openAITools, originalTools] = await (isToolsEnabled ? getTools() : []);
    let completion = await getChatCompletion(
        {
            model: "QWEN",
            messages: messageManager.getMessages(),
            tools: isToolsEnabled ? openAITools: undefined,
            tool_choice: "auto"
        }
    );
    if(hasToolCalls(completion)) {
      console.log('COMPLETION RESULT---', JSON.stringify(completion, null, 4));
      if(debug) await debug("Should I execute the tool ?");
      await callToolsWithMessageManager(originalTools, completion, messageManager);
    } else {
      messageManager.add(messageManager.roles.assistant, completion.content);
    }
    return completion;
  } catch (error) {
    debugger;
    console.error('Error:', error);
  }
}

export {
  getChatCompletion,
  getMessageCompletion
};
