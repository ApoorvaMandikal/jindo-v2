import React, { useState, useEffect } from "react";
import axios from "axios";
import Rolling from "./../assets/Rolling.svg";
import next from "./../assets/next.png";
import micIcon from "./../assets/micIcon.png";
import { MdEdit } from "react-icons/md";

const Chatbot = ({
  chatHistory,
  setChatHistory,
  currentChatId,
  setCurrentChatId,
  transcription,
  setTranscription,
  clientFileText
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);



  async function sendMessageToModel(conversation, clientFileText) {
    try {
      const messages = [
        {
          role: "system",
          content: [
            {
              type: "text",
              text:
                "You are an assistant in a wealth management company. Use the following client portfolio data as context:\n\n" +
                clientFileText,
            },
          ],
        },
        ...conversation.map((msg) => ({
          role: msg.role,
          content: [
            {
              type: "text",
              text: msg.content,
            },
          ],
        })),
      ];

      const response = await axios.post(
        "http://localhost:8000/chat", // ✅ Calls FastAPI backend
                {
          model: "gpt-4o", // Choose your model
          messages: messages,
          stream: false, // Standard API call (not streaming)
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data &&
        response.data.choices &&
        response.data.choices.length > 0
      ) {
        return response.data.choices[0].message.content;
      } else {
        console.error("Invalid response from GPT:", response.data);
        throw new Error("Invalid response structure from GPT.");
      }
    } catch (error) {
      console.error(
        "Error communicating with gpt-4o:",
        error?.response?.data || error.message
      );
      throw new Error("Error connecting to the assistant.");
    }
  }

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      date: new Date().toISOString(),
      messages: [],
      name: generateChatName(input || ""),
    };

    setChatHistory((prev) => {
      const updatedHistory = { ...prev, [newChatId]: newChat };
      localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
      localStorage.setItem("currentChatId", newChatId);
      return updatedHistory;
    });

    setCurrentChatId(newChatId);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!currentChatId) {
      const defaultChatId = Date.now().toString();
      const defaultChat = { date: new Date().toISOString(), messages: [] };

      setChatHistory((prev) => ({
        ...prev,
        [defaultChatId]: defaultChat,
      }));
      setCurrentChatId(defaultChatId);

      localStorage.setItem(
        "chatHistory",
        JSON.stringify({
          ...chatHistory,
          [defaultChatId]: defaultChat,
        })
      );
      localStorage.setItem("currentChatId", defaultChatId);
    }

    setLoading(true);
    setError("");

    const newMessage = { role: "user", content: input };

    if (chatHistory[currentChatId]?.messages.length === 0) {
      setChatHistory((prev) => {
        const updatedChat = {
          ...prev[currentChatId],
          name: generateChatName(input),
          messages: [...prev[currentChatId].messages, newMessage],
        };
        return { ...prev, [currentChatId]: updatedChat };
      });
    } else {
      setChatHistory((prev) => {
        const updatedChat = {
          ...prev[currentChatId],
          messages: [...(prev[currentChatId]?.messages || []), newMessage],
        };
        return { ...prev, [currentChatId]: updatedChat };
      });
    }

    try {
      const assistantReply = await sendMessageToModel(
        [...(chatHistory[currentChatId]?.messages || []), newMessage],
        clientFileText //
      );

      setChatHistory((prev) => {
        const updatedChat = {
          ...prev[currentChatId],
          messages: [
            ...(prev[currentChatId]?.messages || []),
            { role: "assistant", content: assistantReply },
          ],
        };
        const updatedHistory = { ...prev, [currentChatId]: updatedChat };
        localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const generateChatName = (message) => {
    if (!message) return "New Chat";
    const words = message.split(" ");
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    const truncated = words.slice(0, 6).join(" ");
    return truncated + (words.length > 6 ? "..." : "");
  };

  const startListening = () => {
    if (isEditing) return;
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    if (isListening) {
      if (recognitionInstance) {
        recognitionInstance.stop();
        setIsListening(false);
      }
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        alert(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.start();
      setRecognitionInstance(recognition);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <div className="relative flex flex-col h-full">
      {" "}
      <h2 className="text-lg font-bold mb-2">Ask Jindo</h2>
      <div
        className={`w-full flex-1 pr-2 space-y-4 overflow-y-auto pr-2 pb-16

                ${
                  chatHistory[currentChatId]?.messages?.length
                    ? "flex-1"
                    : "justify-center items-center"
                }
       
             `}
      >
        {" "}
        {(chatHistory[currentChatId]?.messages || []).map((message, idx) => (
          <div
            key={idx}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-jindo-blue text-white self-end"
                  : "bg-gray-200 text-gray-800 self-start"
              }`}
            >
              {(message.content || "").split("\n").map((line, idx) => (
                <p key={idx} className="mb-1">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && (
        <div className="text-red-600 text-sm text-center">
          <p>{error}</p>
        </div>
      )}
      {/* Input Section */}
      <div className="absolute bg-white pt-1 bottom-0 left-0 right-0 flex items-center justify-center">
        <div className="w-4/5 h-14">
          {/* <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Jindo AI using voice or text"
              className="w-full p-3 pr-10 border border-gray-300 rounded-3xl"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            /> */}
          <button
            onClick={startListening}
            className={`transform h-full p-2 ml-2 border border-black rounded-3xl flex items-center justify-center relative w-full ${
              isListening ? "bg-jindo-orange text-white" : ""
            }`}
            disabled={isEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
                setIsEditing(false);
              }
            }}
          >
            <img src={micIcon} alt="Mic" className="left-3 h-6 w-6" />
            {isListening ? (
              <span className="text-white text-center w-full">
                Listening...
              </span>
            ) : input || isEditing ? (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onClick={() => setIsEditing(true)}
                className="text-jindo-orange bg-transparent border-none focus:ring-0 w-full h-full"
                disabled={!isEditing}
              />
            ) : (
              <span className="text-jindo-orange font-bold text-center w-full">
                Tap to ask Jindo a question
              </span>
            )}
          </button>
        </div>

        <button
          onClick={sendMessage}
          disabled={loading}
          className="ml-2 p-3 text-white rounded-md"
        >
          {loading ? (
            <img src={Rolling} alt="Loading..." className="h-6 w-6" />
          ) : (
            <img src={next} alt="Submit" className="h-6 w-6" />
          )}
        </button>

        {input && !isEditing && (
          <button onClick={handleEditClick} className="ml-2 p-3 rounded-md">
            <MdEdit className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
