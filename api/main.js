import { getStore } from "./configStore.ts";
import { getAgenticLoop, getLoopStopper } from "../agentic-loop/index.ts";
import { MessageManager } from "./MessageManager.ts";

const mm = new MessageManager();
mm.add(mm.roles.system, getStore().systemMsg);

// Example usage function
async function PrepareTrainingData(userAsk = getStore().dataSetTypes, i = 0) {
  try {
    if(i > userAsk.length - 1) {
      console.log('Finish...');
      return;
    } 

    console.log('For dataSetType: ', i+1);

    const agenticLoop = getAgenticLoop();
    const loopStopper = getLoopStopper();

    mm.removeAllApartFromSystem();
    mm.add(mm.roles.user, userAsk[i]);
    console.log(mm.dump());

    await agenticLoop(mm, loopStopper);
    PrepareTrainingData(userAsk, i+1);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

export {
  PrepareTrainingData
}