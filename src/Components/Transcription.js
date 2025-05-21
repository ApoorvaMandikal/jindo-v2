import React, { useEffect, useRef } from "react";
import Rolling from "./../assets/Rolling.svg";

const Transcription = ({ transcription, loading, liveTranscription }) => {
  const transcriptionEndRef = useRef(null);

  useEffect(() => {
    if (transcriptionEndRef.current) {
      transcriptionEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveTranscription]);
  return (
    <div className="flex flex-col h-full">
      {" "}
      <div>
        <h2 className="text-lg font-bold mb-2">Transcription</h2>
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
