import { MessageManager } from "../api/MessageManager.ts";
import { hasToolCalls } from "../tools/toolCaller.ts";
import { getMessageCompletion } from "../api/chatCompletion.js";
import readline from "readline";

function getLoopStopper() {
    return {
        shouldStop: false,
        abort: function () {
            this.shouldStop = true;
        },
        reset: function () {
            this.shouldStop = false;
        }
    };
}


function getAgenticLoop(debug = false, identifier: string = "DefaultLoop") {
    let rl: any, prompt: any;
    if (debug) {
        rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        prompt = (query: string) => new Promise((resolve) => rl.question(query, resolve));
    }

    async function debugConfirm(msg: string = "Should I continue? (Press Enter to continue)") {
        if (debug) await prompt(msg);
    }

    async function AgenticLoop(messageManager: MessageManager, loopStopper: ReturnType<typeof getLoopStopper> = getLoopStopper(), isOld = false) {
        try {
            console.log(`================Running ${isOld ? "OLD" : "NEW"} LOOP FOR: ${identifier}=================`);

            const result = await getMessageCompletion(messageManager, debugConfirm);
            console.log(`================STATE TILL NOW: ${identifier}=================`, messageManager.dump());

            /** 
             * this is actually *had* tool calls. 
             * Essentially have already executred the tools calls if there were any, here we are
             * check if there were tools call, then we would need to again run the loop as 
             * the LLM needs to read the tool results and tell the final response.
             * 
             * if there are no tool calls, then the LLM has given the final response and we can exit.
             * */
            if (hasToolCalls(result)) {
                if (loopStopper.shouldStop) {
                    loopStopper.reset();
                    console.log(`=================FORCE FINISH: ${identifier}=================`);
                    return;
                }
                await debugConfirm();

                await AgenticLoop(messageManager, loopStopper, true);
                return;
            }
            console.log(`=================FINISH: ${identifier}=================`);
        } catch (error) {
            // TODO: handle context limit breach error.
            console.error('Error in Agentic Loop:', error);
        }
    }
    return AgenticLoop;
}


export {
    getAgenticLoop,
    getLoopStopper
}
