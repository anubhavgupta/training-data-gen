import type { ChatCompletionMessageParam } from "openai/resources";
import { getChatCompletion } from "./chatCompletion.js";


class MessageManager {
    messages: ChatCompletionMessageParam[];
    newFromIndex = 1;
    roles: {
        system: "system";
        tool: "tool";
        user: "user";
        assistant: "assistant";
        developer: "developer";
    };
    isToolsEnabled = true;

    constructor(mm?:MessageManager) {
        this.messages = [];
        this.roles = {
            system: "system",
            tool: "tool",
            user: "user",
            assistant: "assistant",
            developer: "developer"
        }
        
        if(mm) {
            this.newFromIndex = mm.messages.length;
            this.messages = [...mm.getMessages()];
        }
    }

    setToolsStatus(isEnabled: boolean) {
        this.isToolsEnabled = isEnabled;
    }

    add(role: keyof MessageManager["roles"], content: string | (() => string) | undefined | null, other?: Record<string, unknown>) {
        let message;
        if(role === this.roles.tool) {
            message ={
                role,
                content,
                tool_call_id: other?.tool_call_id as string,
                reasoning_content: other?.reasoning_content as string,
            };
        } else {
            message = {
                role,
                content,
                ...other
            };
        }
        if(!content) {
            delete message.content;
        }
        this.messages.push(message);
    }

    async summarize(messagesToRemoveFromLast?: number): Promise<void> {
        const summaryMessageFromAssistant = await this.getSummaryOfNewMessages(messagesToRemoveFromLast);
        this.messages = [
            ...this.messages.slice(0, this.newFromIndex),
            summaryMessageFromAssistant
        ];
    }

    async getSummaryOfNewMessages(messagesToRemoveFromLast?: number) : Promise<ChatCompletionMessageParam> {
        const newMessages = this.messages.slice(this.newFromIndex, messagesToRemoveFromLast ? -1 * messagesToRemoveFromLast : undefined);
        let conversation = "";
        for(const msg of newMessages) {
            conversation += `- ${msg.role}: ${msg.content}\n`;
        }
        const mm = new MessageManager();
        mm.add(mm.roles.system, 
`You would be given a conversation please respond with highlight of the work done in brief. Please also include any important information from the conversation.
Please keep it concise and to the point. The output should be a single paragraph.
`)
        mm.add(mm.roles.user, `Conversation:\n${conversation}\n`);
        const summary = await getChatCompletion({
            messages: mm.getMessages(),
            model: 'QWEN'
        })
        return summary;
    }

    getMessages() {
        return this.messages.map((msg)=>{
            let content = msg.content;
            if(typeof content === "function") {
                content = content();
            }
            if(content) {
                msg.content = content;
            }
            return {
                ...msg,
            }
        });
    }

    getMessagesForSingleRequest(){
        return [
            this.messages[0]
        ]
    }

    removeAllApartFromSystem() {
        this.messages.splice(1, this.messages.length);
    }

    getLastMessage() {
        return this.messages[this.messages.length - 1];
    }

    dump() {
        return JSON.stringify(this.messages, null, 4);
    }
}

export {
    MessageManager
};