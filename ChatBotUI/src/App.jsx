import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_KEY } from "./google_secret.jsx";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatBot, setShowChatBot] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {
    // Helper function to update chat history
    const updateHistory = (responseText) => {
      setChatHistory(prev => [
        ...prev.filter(msg => msg.text !== "Thinking..."),
        { role: "model", text: responseText },
      ]);
    };

    // Format chat history for Gemini API
    const formattedHistory = history.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
      // Start a new chat and send user input
      const chat = await model.startChat({ history: formattedHistory });
      const result = await chat.sendMessage(history.at(-1).text); // Send the latest message

      // Process the response
      const response = await result.response;
      const responseText = await response.text();

      // Clean and update chat history with the bot's response
      updateHistory(responseText);

      console.log(responseText);
    } catch (error) {
      console.error("Error generating response:", error);
    }
  };

  // Autoscroll the chat updates
  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  return (
    <div id="app-container">
      <div id="title-container">
        <h2 id="app-title">AI Sunday Drivers</h2>
      </div>
      <div className={`bot-container ${showChatBot ? "show-chatbot" : ""}`}>
        <button onClick={() => setShowChatBot((prev) => !prev)} id="chatbot-toggler">
          <span className="material-symbols-rounded">mode_comment</span>
          <span className="material-symbols-rounded">close</span>
        </button>

        <div className="chatbot-popup">
          {/* Header */}
          <div className="chat-header">
            <div className="header-info">
              <ChatbotIcon />
              <h2 className="logo-text">Chatbot</h2>
            </div>
            <button 
              className="material-symbols-rounded">keyboard_arrow_down
            </button>
          </div>

          {/* Body */}
          <div ref={chatBodyRef} className="chat-body">
            <div className="message bot-message">
              <ChatbotIcon />
              <p className="message-text">boi</p>
            </div>

          {/* Render the chat history dynamically */}
            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat}/>
            ))}
            
          </div>

          {/* Footer */}
          <div className="chat-footer">
            {/* generateBotResponse */}
              <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse}/>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;