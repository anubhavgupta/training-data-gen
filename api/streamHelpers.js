
class JSONTransformStream extends TransformStream {
  constructor(){
    super({
      start(){},
      async transform(chunk, ctrl) {
        const data = await chunk;
        if(data === null) {
          ctrl.terminate();
        } else {
          ctrl.enqueue(JSON.parse(data));
        }
      },
      flush(ctrl) {},
    });
  }
}


class StrExtractorStream extends TransformStream {
  constructor() {
    let content = "";
    let reasoning_content = "";
    let tool_calls = [];
    super({
      start(){},
      async transform(chunk, ctrl) {
        const response = await chunk;
        //console.log("Anubhav --->", response, JSON.stringify(response, null, 4));
        if(!response.choices.length) {
          this.log(`--- Stream ended ---; `, ctrl);
          //ctrl.close();
        } else if(!response.choices[0].finish_reason) {
          if(response.choices[0].delta.content !== undefined) {
            if(content === "") {
              this.log("\nContent: ", ctrl);
            }
            content += response.choices[0].delta.content;
            this.log(response.choices[0].delta.content, ctrl);
          }
          if(response.choices[0].delta.reasoning_content !== undefined) {
            if(reasoning_content === "") {
              this.log("\nReasoning: ", ctrl);
            }
            reasoning_content += response.choices[0].delta.reasoning_content;
            this.log(response.choices[0].delta.reasoning_content, ctrl);
          } else if(response.choices[0].delta.tool_calls) {
            response.choices[0].delta.tool_calls.forEach((toolCl)=>{
              if(!tool_calls[toolCl.index]) {
                tool_calls[toolCl.index] = toolCl;
                this.log(`\nName: ${toolCl["function"].name}\nArguments: ${toolCl["function"].arguments}\n`, ctrl);
              } else {
                this.log(toolCl["function"].arguments, ctrl);
                tool_calls[toolCl.index] = {
                  ...tool_calls[toolCl.index],
                  "function": {
                    ...tool_calls[toolCl.index]["function"],
                    arguments: tool_calls[toolCl.index]["function"].arguments + toolCl["function"].arguments
                  }
                };
              }
            });
            
            //this.log(response.choices[0].delta)
          }     
        } else if(response.choices[0].finish_reason) {
          this.log(`\nFinish Reason: ${response.choices[0].finish_reason}`, ctrl);
        }
      },
      log(str, ctrl) {
        if(str !== undefined && str !== null) {
          ctrl.enqueue(str);
          //;
        }
      },
      flush(ctrl){
        ctrl.terminate();
      },
    });
  }
}



async function streamToConsole(stream, tag) {
    for await (let i of stream) {
      console.log(tag, "-->", i );
    }
}
  
async function streamToNode(stream, getNode) {
    for await (let i of stream) {
        getNode().innerText = i;
    }   
}

async function streamToCustom(stream, onContent) {
    for await (let i of stream) {
        onContent(i);
    }   
}

async function streamToHTML(stream, getNode) {
    for await (let i of stream) {
        getNode().innerHTML = i;
    }   
}

export {
    streamToConsole,
    streamToHTML,
    streamToCustom,
    streamToNode,
    JSONTransformStream,
    StrExtractorStream
}