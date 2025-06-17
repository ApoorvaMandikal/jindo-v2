import React, { useEffect, useRef } from "react";
import Rolling from "./../assets/Rolling.svg";
import { MdOutlineRefresh } from "react-icons/md";
import RealtimeTranscription from "./RealtimeTranscription";

const Transcription = ({
  transcription,
  loading,
  liveTranscription,
  selectedClient,
  setLiveTranscription,
  setSummary,
  setSelectedClient,
  setLoading,
  isAmbientListening,
  setIsAmbientListening,
  currentChatId,
  setChatHistory,
  chatHistory,
  currentTranscriptionId,
}) => {
  const transcriptionEndRef = useRef(null);

  const selectedEntry = chatHistory?.[selectedClient]?.[currentChatId] || null;

  const isLiveTranscription =
    selectedEntry?.type === "transcription" && !loading;

  const displayedText =
    isLiveTranscription && selectedEntry?.content
      ? selectedEntry.content
      : !isAmbientListening && !liveTranscription
      ? "Waiting to listen..."
      : liveTranscription || "Listening...";

  const saveTranscription = (text, clientName, transcriptionId) => {
    const history = JSON.parse(localStorage.getItem("chatHistory")) || {};
    const clientHistory = history[clientName] || {};

    const existingEntry = clientHistory[transcriptionId];

    const updatedEntry = existingEntry
      ? {
          ...existingEntry,
          content: (existingEntry.content || "") + "\n" + text,
          date: new Date().toISOString(), // optionally update the timestamp
        }
      : {
          type: "transcription",
          name: text.split(" ").slice(0, 6).join(" ") + "...",
          date: new Date().toISOString(),
          content: text,
        };

    const updatedClientData = {
      ...clientHistory,
      [transcriptionId]: updatedEntry,
    };

    const updated = {
      ...history,
      [clientName]: updatedClientData,
    };

    localStorage.setItem("chatHistory", JSON.stringify(updated));
  };

  // Save only once when transcription completes
  useEffect(() => {
    if (liveTranscription && selectedClient && currentTranscriptionId) {
      saveTranscription(
        liveTranscription,
        selectedClient,
        currentTranscriptionId
      );
    }
  }, [liveTranscription]);

  useEffect(() => {
    if (transcriptionEndRef.current) {
      transcriptionEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveTranscription, currentChatId]);

  const refreshStorage = () => {
    const transcriptions =
      JSON.parse(localStorage.getItem("chatHistory")) || {};
    if (transcriptions[selectedClient]) {
      delete transcriptions[selectedClient];
      localStorage.setItem("chatHistory", JSON.stringify(transcriptions));
    }

    const summaries = JSON.parse(localStorage.getItem("summaries")) || {};
    if (summaries[selectedClient]) {
      delete summaries[selectedClient];
      localStorage.setItem("summaries", JSON.stringify(summaries));
    }

    setLiveTranscription("");
    setSummary("");
  };
  return (
    <div className="flex flex-col h-full">
      {" "}
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-lg font-bold mb-2">Transcription</h2>
        <RealtimeTranscription
          isAmbientListening={isAmbientListening}
          setIsAmbientListening={setIsAmbientListening}
          setLiveTranscription={setLiveTranscription}
          setLoading={setLoading}
          selectedClient={selectedClient}
          currentTranscriptionId={currentTranscriptionId}
        />
        <button onClick={refreshStorage} className="">
          <MdOutlineRefresh className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex">
            <img src={Rolling} alt="Loading..." className="h-6 w-6" />
            <span className="ml-2 text-gray-500">loading...</span>
          </div>
        ) : (
          <>
            <p className="text-gray-700 whitespace-pre-wrap">{displayedText}</p>
            <div ref={transcriptionEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default Transcription;
