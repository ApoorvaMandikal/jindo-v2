import { useEffect, useState, useRef } from "react";

export function useClientData(selectedClient) {
  const [liveTranscription, setLiveTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [isAmbientListening, setIsAmbientListening] = useState(false);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!selectedClient) return;

    const savedTrans = JSON.parse(localStorage.getItem("transcriptions")) || {};
    const savedSum = JSON.parse(localStorage.getItem("summaries")) || {};

    const clientTrans = savedTrans[selectedClient] || "";
    const clientSum = savedSum[selectedClient] || "";

    if (!isAmbientListening && savedTrans[selectedClient]) {
      setLiveTranscription(savedTrans[selectedClient]);
    }

    setSummary(clientSum);

    hasLoaded.current = true;
  }, [selectedClient]);

  useEffect(() => {
    if (!selectedClient || !hasLoaded.current) return;
    const saved = JSON.parse(localStorage.getItem("transcriptions")) || {};
    const updated = { ...saved, [selectedClient]: liveTranscription || "" };
    localStorage.setItem("transcriptions", JSON.stringify(updated));
  }, [liveTranscription, selectedClient]);

  useEffect(() => {
    if (!selectedClient || !hasLoaded.current) return;
    const saved = JSON.parse(localStorage.getItem("summaries")) || {};
    const updated = { ...saved, [selectedClient]: summary || "" };
    localStorage.setItem("summaries", JSON.stringify(updated));
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
