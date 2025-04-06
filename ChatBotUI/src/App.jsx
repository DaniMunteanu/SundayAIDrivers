import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_KEY } from "./google_secret.jsx";
import NeurologistIcon from "./components/NeurologistIcon.jsx";
import DentistIcon from "./components/DentistIcon.jsx";
import DermatologistIcon from "./components/DermatologistIcon.jsx";
import PedriaticianIcon from "./components/PedriaticianIcon.jsx";
import PsychologistIcon from "./components/PsychologistIcon.jsx";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatBot, setShowChatBot] = useState(false);
  const [transcription, setTranscription] = useState("");
  const chatBodyRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const [mode, setMode] = useState("default");
  const [recognitionStopped, setRecognitionStopped] = useState(false);

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error("Geolocation is not supported by this browser"));
      }
    });
  };

  const getLocationPrompt = async () => {
    try {
      const location = await getUserLocation();
      return `The user's location is latitude: ${location.latitude}, longitude: ${location.longitude}.`;
    } catch (error) {
      console.error("Error getting location:", error);
      return "Location could not be retrieved.";
    }
  };

  const getInitialPrompt = (mode) => {
    switch (mode) {
      case "pediatrician":
        return "You are now in pediatrician mode. Respond only with helpful, concise, accurate medical information...";
      case "psychologist":
        return "You are now in psychologist mode. Respond only with helpful, concise, accurate medical information...";
      case "dermatologist":
        return "You are now in dermatologist mode. Respond only with helpful, concise, accurate medical information...";
      case "dentist":
        return "You are now in dentist mode. Respond only with helpful, concise, accurate medical information...";
      case "default":
        return "You are now in general practitioner mode. Respond only with helpful, concise, accurate medical information...";
    }
  };

  const generateBotResponse = async (history) => {
    const updateHistory = (responseText) => {
      setChatHistory(prev => [
        ...prev.filter(msg => msg.text !== "Thinking..."),
        { role: "model", text: responseText },
      ]);
    };

    const systemPrompt = {
      role: "user",
      parts: [
        { text: getInitialPrompt(mode) },
        { text: await getLocationPrompt() },
      ],
    };

    const formattedHistory = [
      systemPrompt,
      ...history.map(({ role, text }) => ({
        role,
        parts: [{ text }],
      })),
    ];

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
      const chat = await model.startChat({ history: formattedHistory });
      const result = await chat.sendMessage(history.at(-1).text);
      const response = await result.response;
      const responseText = await response.text();
      updateHistory(responseText);
    } catch (error) {
      console.error("Error generating response:", error);
      updateHistory("Sorry, something went wrong. Please try again.");
    }
  };

  const startRecording = () => {
    if (!SpeechRecognition) {
      console.error("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setRecognitionStopped(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      setRecognitionStopped(true);
    };

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript;
      setTranscription(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setRecognitionStopped(true);
    };

    recognition.start();
  };

  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  useEffect(() => {
    if (transcription && recognitionStopped) {
      setChatHistory((prev) => [
        ...prev,
        { role: "user", text: transcription },
      ]);

      setTimeout(() => {
        generateBotResponse([
          ...chatHistory,
          { role: "user", text: transcription },
        ]);
      }, 0);
    }
  }, [transcription, recognitionStopped]);

  return (
    <div id="app-container">
      <div id="title-container">
        <h2 id="app-title">AI Sunday Drivers</h2>
      </div>

      <div className="specialists-container">
        <ul className="mode-buttons">
          <li>
            <div className="header-info">
              <DermatologistIcon />
              <button onClick={() => setMode("dermatologist")}>Dermatologist</button>
            </div>
          </li>
          <li>
            <div className="header-info">
              <PedriaticianIcon />
              <button onClick={() => setMode("pediatrician")}>Pediatrician</button>
            </div>
          </li>
          <li>
            <div className="header-info">
              <PsychologistIcon />
              <button onClick={() => setMode("psychologist")}>Psychologist</button>
            </div>
          </li>
          <li>
            <div className="header-info">
              <DentistIcon />
              <button onClick={() => setMode("dentist")}>Dentist</button>
            </div>
          </li>
        </ul>
      </div>

      <div className={`bot-container ${showChatBot ? "show-chatbot" : ""}`}>
        <button
          onClick={() => {
            setShowChatBot((prev) => !prev);
            setMode("default");
          }}
          id="chatbot-toggler"
        >
          <span className="material-symbols-rounded">mode_comment</span>
          <span className="material-symbols-rounded">close</span>
        </button>

        <div className="chatbot-popup">
          <div className="chat-header">
            <div className="header-info">
              <ChatbotIcon />
              <h2 className="logo-text">Chatbot</h2>
            </div>
          </div>

          <div ref={chatBodyRef} className="chat-body">
            <div className="message bot-message">
              <ChatbotIcon />
              <p className="message-text">
                {mode === "pediatrician" && "Hello! I'm your personal Pediatrician. Ask me anything about child healthcare."}
                {mode === "default" && "Hello! I'm your General Practitioner. Ask me anything about healthcare."}
                {mode === "psychologist" && "Hello! I'm your personal Psychologist. Let's talk about mental health."}
                {mode === "dermatologist" && "Hello! I'm your personal Dermatologist. Let's talk about your skin health."}
                {mode === "dentist" && "Hello! I'm your personal Dentist. Let's talk about your dental health."}
              </p>
            </div>

            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}
          </div>

          <div className="chat-footer">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
            />

            {/* Voice input button with animation */}
            <button
              onClick={startRecording}
              disabled={isRecording}
              className="voice-button"
            >
              {isRecording ? (
                <span className="recording-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='1em' height='1em'><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9v3a5.006 5.006 0 0 1-5 5h-4a5.006 5.006 0 0 1-5-5V9m7 9v3m-3 0h6M11 3h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3"/></svg>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
