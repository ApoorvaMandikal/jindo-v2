import { useEffect, useState } from "react";

export function useClientData(selectedClient) {
  const [liveTranscription, setLiveTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [isAmbientListening, setIsAmbientListening] = useState(false);

  useEffect(() => {
    const savedTrans = JSON.parse(localStorage.getItem("transcriptions")) || {};
    const savedSum = JSON.parse(localStorage.getItem("summaries")) || {};

    // setLiveTranscription(savedTrans);
    // setSummaries(savedSum);

    if (!isAmbientListening) {
      setLiveTranscription(savedTrans[selectedClient] || "");
    }
    setSummary(savedSum[selectedClient] || "");
  }, [selectedClient]);

  // Persist transcription to localStorage
  useEffect(() => {
    if (selectedClient !== null) {
      const saved = JSON.parse(localStorage.getItem("transcriptions")) || {};
      const updated = { ...saved, [selectedClient]: liveTranscription || "" };
      localStorage.setItem("transcriptions", JSON.stringify(updated));
    }
  }, [liveTranscription, selectedClient]);

  // Persist summary to localStorage
  useEffect(() => {
    if (selectedClient !== null) {
      const saved = JSON.parse(localStorage.getItem("summaries")) || {};
      const updated = { ...saved, [selectedClient]: summary || "" };
      localStorage.setItem("summaries", JSON.stringify(updated));
    }
  }, [summary, selectedClient]);

  return {
    liveTranscription,
    setLiveTranscription,
    summary,
    setSummary,
    isAmbientListening,
    setIsAmbientListening,
  };
}
