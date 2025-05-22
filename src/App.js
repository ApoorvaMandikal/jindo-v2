import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Chatbot from "./Components/Chatbot";
import Transcription from "./Components/Transcription";
import Summary from "./Components/Summary";
import AmbientListener from "./Components/AmbientListener";
import RealtimeTranscription from "./Components/RealtimeTranscription";
import Insights from "./Components/Insights";
import { useClientFileAndInsights } from "./hooks/useClientFileAndInsights";
import Client_Sidebar from "./Components/Sidebar/Client_Sidebar";
import { useClientData } from "./hooks/useClientData";

const App = ({ isGuest, setIsGuest }) => {
  // const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState({});
  const [currentChatId, setCurrentChatId] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSecondScreen, setShowSecondScreen] = useState(false);
  //  const [isAmbientListening, setIsAmbientListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcription, setTranscription] = useState("");
  //  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(false);
  //  const [liveTranscription, setLiveTranscription] = useState("");
  const [screen, setScreen] = useState("home");
  const [selectedClient, setSelectedClient] = useState("");
  const { clientFileText, insights } = useClientFileAndInsights(selectedClient);
  // const [transcriptions, setTranscriptions] = useState({});
  // const [summaries, setSummaries] = useState({});
  const {
    liveTranscription,
    setLiveTranscription,
    summary,
    setSummary,
    isAmbientListening,
    setIsAmbientListening,
  } = useClientData(selectedClient);

  //Ambient Listening
  // useEffect(() => {
  //   let timer = null;

  //   if (!isPaused) {
  //     timer = setInterval(() => {
  //       setElapsedTime((prev) => prev + 1);
  //     }, 1000);
  //   }

  //   return () => clearInterval(timer);
  // }, [isPaused]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Function to generate summary using the model
  const generateSummary = async (text) => {
    if (!text.trim()) return;
    setLoadingSummary(true);
    try {
      const response = await axios.post(
        // "https://api.openai.com/v1/chat/completions",
        "http://localhost:8000/summary",
        //"https://54.80.147.140/summary",
        //"https://demo.jindolabs.com/summary",
        {
          // model: "gpt-4o", // Choose your model
          // prompt: `Summarize this conversation: ${text}`,
          // stream: false,

          text,
        },

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error generating summary:", error.message);
      setSummary("Error generating summary. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleButtonClick = () => {
    setShowSecondScreen(true);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
      localStorage.setItem("currentChatId", currentChatId);
    }
  }, [chatHistory, currentChatId, initialized]);

  useEffect(() => {
    const savedChatHistory =
      JSON.parse(localStorage.getItem("chatHistory")) || {};
    const savedCurrentChatId = localStorage.getItem("currentChatId");

    if (Object.keys(savedChatHistory).length && savedCurrentChatId) {
      setChatHistory(savedChatHistory);
      setCurrentChatId(savedCurrentChatId);
    } else {
      const defaultChatId = Date.now().toString();
      const defaultChat = { date: new Date().toISOString(), messages: [] };
      const defaultHistory = { [defaultChatId]: defaultChat };

      setChatHistory(defaultHistory);
      setCurrentChatId(defaultChatId);
      localStorage.setItem("chatHistory", JSON.stringify(defaultHistory));
      localStorage.setItem("currentChatId", defaultChatId);
    }
    setInitialized(true);
  }, []);

  // useEffect(() => {
  //   const savedTrans = JSON.parse(localStorage.getItem("transcriptions")) || {};
  //   const savedSum = JSON.parse(localStorage.getItem("summaries")) || {};

  //   setLiveTranscription(savedTrans);
  //   setSummaries(savedSum);

  //   if (!isAmbientListening) {
  //     setLiveTranscription(savedTrans[selectedClient] || "");
  //   }
  //   setSummary(savedSum[selectedClient] || "");
  // }, [selectedClient]);

  // useEffect(() => {
  //   if (selectedClient && liveTranscription) {
  //     setTranscriptions((prev) => {
  //       const updated = { ...prev, [selectedClient]: liveTranscription };
  //       localStorage.setItem("transcriptions", JSON.stringify(updated));
  //       return updated;
  //     });
  //   }
  // }, [liveTranscription, selectedClient]);

  // useEffect(() => {
  //   if (selectedClient && summary !== undefined) {
  //     const updated = { ...summaries, [selectedClient]: summary };
  //     setSummaries(updated);
  //     localStorage.setItem("summaries", JSON.stringify(updated));
  //   }
  // }, [summary]);

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

  const generateChatName = (message) => {
    if (!message) return "New Chat";
    const words = message.split(" ");
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    const truncated = words.slice(0, 6).join(" ");
    return truncated + (words.length > 6 ? "..." : "");
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const deleteChat = (chatID) => {
    const updatedHistory = { ...chatHistory };
    delete updatedHistory[chatID];

    localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));

    if (currentChatId === chatID) {
      const remainingChats = Object.keys(updatedHistory);
      setCurrentChatId(remainingChats.length ? remainingChats[0] : null);
    }

    setChatHistory(updatedHistory);
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <Client_Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        createNewChat={createNewChat}
        onDeleteChat={deleteChat}
        setScreen={setScreen}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <Header
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isGuest={isGuest}
          setIsGuest={setIsGuest}
        />
        {/* Timer and Pause Button
        <div className="flex items-center gap-2 justify-end p-6 absolute">
          <div className="text-lg font-bold">
            Elapsed Time: {formatTime(elapsedTime)}
          </div>
          <button
            onClick={() => {
              setIsPaused((prev) => !prev);
              if (!isPaused) {
                // Pause the recording and send for transcription
                if (mediaRecorder) {
                  mediaRecorder.stop(); // Stop recording
                  sendToWhisper(); // Send the recorded audio to Whisper
                }
              } else {
                // Resume ambient listening
                startRecording();
              }
            }}
            className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div> */}

        {/* Main Screen */}
        <div className="flex-1 bg-white py-2 px-6 md:h-5/6">
          {screen == "home" ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <button
                className="bg-orange-500 text-white py-3 px-6 rounded-full mb-4"
                onClick={() => setScreen("chat")}
              >
                Start Jindo Ambient AI
              </button>
              <p className="text-gray-500 max-w-md">
                Jindo transcribes and summarizes your daily conversations. It
                can also answer your questions using data from your recordings,
                email, and the internet. Just say “Hi Jindo” and ask away!
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-auto gap-4 md:h-full">
              {/* Ambient Listener Section */}
              <div className="md:absolute self-center md:top-4 md:left-4 hidden">
                <AmbientListener
                  isAmbientListening={isAmbientListening}
                  setIsAmbientListening={setIsAmbientListening}
                  setTranscription={setTranscription}
                  setLoading={setLoading}
                />
              </div>
              {/* <div className="md:absolute self-center top-4 md:left-36 lg:left-72">
                <RealtimeTranscription
                  isAmbientListening={isAmbientListening}
                  setIsAmbientListening={setIsAmbientListening}
                  setLiveTranscription={setLiveTranscription}
                  setLoading={setLoading}
                />
              </div> */}

              <div className="flex-1 grid grid-rows-[auto_auto] md:grid-rows-3 grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-5/6 w-full overflow-auto">
                {/* Chatbot Section */}
                <div className="p-4 border rounded-lg bg-white shadow col-span-1 col-start-1 row-start-1 md:row-start-2 md:col-start-2 md:row-span-2 flex flex-col h-72 md:h-full overflow-y-auto">
                  <Chatbot
                    chatHistory={chatHistory}
                    setChatHistory={setChatHistory}
                    currentChatId={currentChatId}
                    setCurrentChatId={setCurrentChatId}
                    transcription={transcription}
                    setTranscription={setTranscription}
                    clientFileText={clientFileText}
                    selectedClient={selectedClient}
                  />
                </div>
                {/* Summary Section */}
                <div className="p-4 border rounded-lg bg-white shadow col-span-1 row-start-2 md:row-start-1 col-start-1 md:col-start-2 row-span-1 h-40 md:h-auto overflow-auto">
                  <Summary
                    liveTranscription={liveTranscription}
                    summary={summary}
                    generateSummary={generateSummary}
                    loadingSummary={loadingSummary}
                    selectedClient={selectedClient}
                  />
                </div>
                {/* Transcript Section */}
                <div className="p-4 border rounded-lg bg-white shadow md:col-start-1 col-span-1 row-span-1 md:row-span-2 row-start-3 md:row-start-2 h-40 md:h-auto overflow-auto">
                  <Transcription
                    transcription={transcription}
                    loading={loading}
                    liveTranscription={liveTranscription}
                    selectedClient={selectedClient}
                    setSummary={setSummary}
                    setLiveTranscription={setLiveTranscription}
                    setSelectedClient={setSelectedClient}
                    setLoading={setLoading}
                    isAmbientListening={isAmbientListening}
                    setIsAmbientListening={setIsAmbientListening}
                  />
                </div>
                {/*Insights Section */}
                <div className="p-4 border rounded-lg bg-white shadow row-start-4 md:row-start-1 col-span-1 row-span-1 h-40 md:h-auto overflow-auto">
                  <Insights
                    insights={insights}
                    selectedClient={selectedClient}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
