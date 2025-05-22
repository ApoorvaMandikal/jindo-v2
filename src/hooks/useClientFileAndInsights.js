import { useState, useEffect } from "react";

export function useClientFileAndInsights(selectedClient) {
  const [clientFileText, setClientFileText] = useState("");
  const [insights, setInsights] = useState("");

  useEffect(() => {
    if (!selectedClient) return;

    const cachedInsights = localStorage.getItem(`insights_${selectedClient}`);
    const cachedText = localStorage.getItem(`clientText_${selectedClient}`);

    if (cachedInsights && cachedText) {
      setClientFileText(cachedText);
      setInsights(cachedInsights);
      console.log("✅ Used cached insights and client text");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/load-client-file/${selectedClient}`
        );
        const data = await res.json();

        const text = data.file_text;
        if (!text) {
          console.warn("⚠️ No file text returned");
          return;
        }

        setClientFileText(text);
        localStorage.setItem(`clientText_${selectedClient}`, text);

        // Re-check if insights are already cached to avoid regeneration
        const cached = localStorage.getItem(`insights_${selectedClient}`);
        if (cached) {
          setInsights(cached);
          console.log("🧠 Used cached insights after fetching file");
          return;
        }

        const insightsRes = await fetch("http://127.0.0.1:8000/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const insightsData = await insightsRes.json();
        if (insightsData.insights) {
          setInsights(insightsData.insights);
          localStorage.setItem(
            `insights_${selectedClient}`,
            insightsData.insights
          );
          console.log("✅ Generated and cached insights");
        } else {
          console.warn("⚠️ No insights generated");
        }
      } catch (err) {
        console.error("❌ Error loading client file or insights:", err);
      }
    };

    fetchData();
  }, [selectedClient]);

  return { clientFileText, insights };
}
