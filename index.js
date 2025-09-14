const axios = require('axios');

/**
 * Sends a message to the OpenAI chat compatible API and returns the completion
 * @param {string} systemMessage - The system message to set the context
 * @param {string} userMessage - The user's message
 * @param {string} apiUrl - The API endpoint URL (default: http://localhost:8080)
 * @returns {Promise<string>} The completion message from the API
 */
async function getChatCompletion(systemMessage, userMessage, apiUrl = 'http://localhost:8080') {
  try {
    // Prepare the request payload in OpenAI format
    const payload = {
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      seed: parseInt(Math.random() * 100000),
      // Enable streaming for the API call
      stream: true
    };

    // Send POST request to the API with streaming enabled
    const response = await axios.post(`${apiUrl}/v1/chat/completions`, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'stream'  // Important for handling streaming responses
    });

    let fullResponse = '';

    // Handle streaming response
    response.data.on('data', (chunk) => {
      const chunkStr = chunk.toString();
      
      // Process the chunk - handle multiple JSON objects if needed
      // The stream typically sends data in the format: "data: {json}\n\n"
      if (chunkStr.startsWith('data: ')) {
        const dataStr = chunkStr.substring(6);  // Remove "data: " prefix
        
        // Handle potential multiple JSON objects in one chunk
        const lines = dataStr.split('\n\n');
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            const jsonData = JSON.parse(line);
            
            // Check if this is a valid response with content
            if (jsonData.choices && jsonData.choices.length > 0) {
              const delta = jsonData.choices[0].delta;
              
              // If there's content in the delta, log it
              if (delta && delta.content) {
                process.stdout.write(delta.content);  // Log streaming text
                fullResponse += delta.content;  // Accumulate for final response
              }
            }
          } catch (e) {
            // If parsing fails, it might be a control message or malformed data
            // We'll skip these and continue processing
          }
        }
      }
    });

    // Wait for the stream to finish
    await new Promise((resolve, reject) => {
      response.data.on('end', () => {
        console.log();  // Add a newline after streaming
        setTimeout(resolve, 500);
      });
      
      response.data.on('error', (err) => {
        reject(err);
      });
    });

    return fullResponse;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      throw new Error(`API Error: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Network Error: No response from API');
    } else {
      // Something else happened
      throw new Error(`Error: ${error.message}`);
    }
  }
}


// Export the function for use in other modules
module.exports = { getChatCompletion };