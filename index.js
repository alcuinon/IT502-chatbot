// Simple client-side chatbot demo. Replace `getBotReply` with real API calls as needed.
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const status = document.getElementById("status");

// initial welcome
addBotMessage(
  "Hi — I'm your chatbot"
);

// event handlers
sendBtn.addEventListener("click", onSend);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    onSend();
  }
});

async function onSend() {
  const text = inputEl.value.trim();
  if (!text) return;
  addUserMessage(text);
  inputEl.value = "";
  status.textContent = "Typing...";
  await simulateBotReply(text);
}

function addMessage(text, who = "bot") {
  const wrap = document.createElement("div");
  wrap.className = "msg " + (who === "bot" ? "bot" : "user");
  wrap.innerHTML = `<div class="content">${text}</div><div class="meta">${new Date().toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )}</div>`;
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addUserMessage(text) {
  addMessage(text, "user");
}
function addBotMessage(text) {
  addMessage(text, "bot");
  status.textContent = "Ready";
}

// simulate typing with animated dots, then show reply
async function simulateBotReply(userText) {
  const typing = document.createElement("div");
  typing.className = "msg bot";
  typing.innerHTML = `<div class="content typing"><span class="dots"><span></span><span></span><span></span></span> Thinking...</div>`;
  messagesEl.appendChild(typing);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  const reply = await getBotReply(userText);
  typing.remove();
  addBotMessage(reply);
}

async function getBotReply(text) {
  const t = text.toLowerCase();
  // const ai_response_message = text;
  const ai_response_message = await sendOpenAIRequest(t);
  return ai_response_message;
}

let _config = {
  openAI_api: "https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy",
  openAI_model: "gpt-4o-mini",
  ai_instruction: `you are chatbot that gives a joke.
    output should be in html format, 
    no markdown format, answer directly.`, //Prompt Engineering
  response_id: "",
};

// //if user ask an unrelated stuff then response accordingly.

async function sendOpenAIRequest(text) {
  let requestBody = {
    model: _config.openAI_model,
    input: text,
    instructions: _config.ai_instruction,
    previous_response_id: _config.response_id,
  }; //paper forms to send someone (openai)
  if (_config.response_id.length == 0) {
    requestBody = {
      model: _config.openAI_model,
      input: text,
      instructions: _config.ai_instruction,
    };
  }
  try {
    const response = await fetch(_config.openAI_api, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      //addBotMessage(`HTTP error! Status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    let output = data.output[0].content[0].text;
    _config.response_id = data.id;

    return output;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

//async/await ,, mo create og separate threads,, imagine 
/*
         ---[]-----[]---> single brain //lag //upgrade

         ---------------> single brain
            ---> new brain
            ---> new brain
*/