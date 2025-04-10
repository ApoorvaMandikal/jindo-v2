import React from "react";

const Summary = ({
  liveTranscription,
  summary,
  generateSummary,
  loadingSummary,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div>
        <button
          onClick={() => generateSummary(liveTranscription)}
          disabled={loadingSummary || !liveTranscription}
        >
          <h2 className="text-lg font-bold mb-2">Summary</h2>
        </button>
      </div>
      <div className="overflow-y-auto">
        {loadingSummary ? (
          <p className="text-gray-700 whitespace-pre-wrap ">Generating...</p>
        ) : summary ? (
          <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
        ) : (
  <p className="text-gray-500">No summary generated yet.</p>
        )}
      </div>
    </div>
  );
};

export default Summary;
