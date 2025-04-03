import React from "react";
import Rolling from "./../assets/Rolling.svg";

const Transcription = ({ transcription, loading, liveTranscription }) => {
  return (
    <div className="p-4 border rounded-lg bg-white shadow row-span-3 overflow-auto">
      <h2 className="text-lg font-bold mb-2">Transcription</h2>
      {loading ? (
        <div className="flex">
          <img src={Rolling} alt="Loading..." className="h-6 w-6" />
          <span className="ml-2 text-gray-500">Transcribing...</span>
        </div>
      ) : (
        <p className="text-gray-700 whitespace-pre-wrap">
          {liveTranscription || "Listening.."}
        </p>
      )}
    </div>
  );
};

export default Transcription;
