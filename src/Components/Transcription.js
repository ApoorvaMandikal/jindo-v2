import React, { useEffect, useRef } from "react";
import Rolling from "./../assets/Rolling.svg";
import { MdOutlineRefresh } from "react-icons/md";

const Transcription = ({
  transcription,
  loading,
  liveTranscription,
  selectedClient,
  setLiveTranscription,
  setSummary,
  setSelectedClient,
}) => {
  const transcriptionEndRef = useRef(null);

  useEffect(() => {
    if (transcriptionEndRef.current) {
      transcriptionEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveTranscription]);

  const refreshStorage = () => {
    const transcriptions =
      JSON.parse(localStorage.getItem("transcriptions")) || {};

    if (selectedClient in transcriptions) {
      console.log(
        `🗑️ Deleting transcription for ${selectedClient}:`,
        transcriptions[selectedClient]
      );
      delete transcriptions[selectedClient];
      localStorage.setItem("transcriptions", JSON.stringify(transcriptions));
    } else {
      console.log(`⚠️ No transcription found for ${selectedClient}`);
    }

    const summaries = JSON.parse(localStorage.getItem("summaries")) || {};
    if (selectedClient in summaries) {
      console.log(
        `🗑️ Deleting summary for ${selectedClient}:`,
        summaries[selectedClient]
      );
      delete summaries[selectedClient];
      localStorage.setItem("summaries", JSON.stringify(summaries));
    } else {
      console.log(`⚠️ No summary found for ${selectedClient}`);
    }
    setLiveTranscription("");
    setSummary("");
    
    
  };
  return (
    <div className="flex flex-col h-full">
      {" "}
      <div className="flex flex-row justify-between">
        <h2 className="text-lg font-bold mb-2">Transcription</h2>
        <button onClick={refreshStorage} className="">
          <MdOutlineRefresh className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex">
            <img src={Rolling} alt="Loading..." className="h-6 w-6" />
            <span className="ml-2 text-gray-500">Transcribing...</span>
          </div>
        ) : (
          <>
            <p className="text-gray-700 whitespace-pre-wrap">
              {liveTranscription || "Listening..."}
            </p>
            <div ref={transcriptionEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default Transcription;
