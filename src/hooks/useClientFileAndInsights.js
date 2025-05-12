import { useEffect, useRef, useState } from "react";

export function useClientFileAndInsights(clientName) {
  const hasRun = useRef(false);
  const [clientFileText, setClientFileText] = useState("");
  const [insights, setInsights] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      try {
        const res = await fetch(
          `http://127.0.0.1:8000/load-client-file/${clientName}`
        );
        const data = await res.json();

        if (!data.file_text) {
          console.warn("Client file not loaded:", data);
          return;
        }

        console.log("✅ client file loaded:", data);
        const text = data.file_text;
        setClientFileText(text);

        const insightsRes = await fetch("http://127.0.0.1:8000/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const insightsData = await insightsRes.json();
        console.log("🧠 Insights response:", insightsData);

        if (insightsData.insights) {
          setInsights(insightsData.insights);
        } else {
          console.warn("⚠️ Insights not generated:", insightsData);
        }
      } catch (err) {
        console.error("Error fetching client file or insights:", err);
      }
    };

    fetchData();
  }, [clientName]);

  return { clientFileText, insights };
}
