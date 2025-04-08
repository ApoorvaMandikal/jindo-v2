import React from "react";

const Summary = ({
  liveTranscription,
  summary,
  generateSummary,
  loadingSummary,
}) => {
  return (
    <div className="p-4 border rounded-lg bg-white shadow col-span-1 row-start-2 md:row-start-1 col-start-1 md:col-start-2 row-span-1 overflow-auto">     
     <button
        onClick={() => generateSummary(liveTranscription)}
        disabled={loadingSummary || !liveTranscription }
      >
        <h2 className="text-lg font-bold mb-2">Summary</h2>
      </button>

      {loadingSummary ? (
  <p className="text-gray-700 whitespace-pre-wrap">Generating...</p>
) : summary ? (
  <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
) : (
  <p className="text-gray-500">No summary generated yet.</p>
)}

    </div>
  );
};

export default Summary;
