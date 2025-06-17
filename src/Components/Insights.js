import React from "react";
import ReactMarkdown from "react-markdown";
import { useClientFileAndInsights } from "../hooks/useClientFileAndInsights";

const Insights = ({ selectedClient }) => {
  const { insights } = useClientFileAndInsights(selectedClient);
  return (
    <div className="flex flex-col h-full">
      <div>
        <h2 className="md:text-lg lg:text-2xl font-bold mb-2">Insights</h2>
      </div>
      <div className="overflow-y-auto lg:text-xl">
        {insights ? (
          <ReactMarkdown>{insights.join("\n\n")}</ReactMarkdown>
        ) : (
          <p>Loading insights...</p>
        )}
      </div>
    </div>
  );
};

export default Insights;
