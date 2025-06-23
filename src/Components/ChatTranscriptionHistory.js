import React from "react";
import jindo_color2 from "./../assets/Jindo_color2.png";
import chat from "../assets/chat.png";
import close from "../assets/close.png";
import { RiDeleteBin6Line } from "react-icons/ri";
import mic from "../assets/microphone-2.png";

const ChatTranscriptionHistory = ({
  chatHistory,
  currentChatId,
  setCurrentChatId,
  createNewChat,
  onDeleteChat,
  setScreen,
  selectedClient,
  setSelectedClient,
  clients,
  setClients,
  setActivePanel,
}) => {
  console.log(
    "Rendering chat entries:",
    Object.entries(chatHistory[selectedClient] || {})
  );
  return (
    <div className="text-black h-full overflow-y-auto">
      <div className="space-y-4">
        {Object.entries(chatHistory[selectedClient] || {})
          .map(([chatId, chat]) => ({
            chatId,
            ...chat,
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map(({ chatId, date, name, type }) => (
            <div
              key={chatId}
              className={`p-2 flex flex-row items-center space-x-2 cursor-pointer rounded-3xl ${
                chatId === currentChatId ? "bg-gray-100" : ""
              }`}
              onClick={() => {
                setCurrentChatId(chatId);
                setActivePanel(
                  type === "transcription" ? "transcription" : "chat"
                );
              }}
            >
              <div className="p-2 rounded-md">
                {type === "transcription" ? (
                  <img src={mic} alt="chat" className="h-auto" />
                ) : (
                  <img
                    src={chat}
                    alt="chat"
                    className="text-gray-700 w-4 h-4"
                  />
                )}
              </div>
              <div className="flex-1 basis-8/12">
                <p className="md:text-xs lg:text-sm font-medium">
                  {name || "New Chat"}
                </p>
              </div>
              <p className="text-sm text-black-400 w-12 text-right">
                {new Date(date).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                })}
              </p>
              <RiDeleteBin6Line
                className="ml-2 text-gray-500 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation(); 
                  onDeleteChat(chatId);
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ChatTranscriptionHistory;
