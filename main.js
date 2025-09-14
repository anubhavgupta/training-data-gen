import { getChatCompletion } from "./index.js";
import { writeFile, readFile } from "node:fs/promises";
import { systemMsg, userMsg, userMsg } from "./prompt.js";

// Example usage function
async function TestDataPrep() {
  try {
    const systemMsg = systemMsg;
    const userMsg = userMsg;

    console.log('Getting completion...');
    let completion = await getChatCompletion(systemMsg, userMsg);
    if (completion.includes("</think>")) {
      completion = completion.split("</think>")[1].trim(); // remove think tags
    }
    let newData = JSON.parse(completion); // validate JSON
    Array.isArray(newData) || (newData = [newData]);
    let oldData = await readFile("test.json", { encoding: "utf8" });
    oldData = JSON.parse(oldData);
    oldData = oldData.concat(newData);
    await writeFile("test.json", JSON.stringify(oldData, null, 2), { encoding: "utf8" });
    console.log('Final completion:', completion);
    return completion;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function run(){
  for(let i=0;i<1000;i++) {
    await TestDataPrep();
  }
}
run();
