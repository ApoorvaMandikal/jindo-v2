import React from "react";
import jindo_color2 from "./../assets/Jindo_color2.png";
import chatIcon from "../assets/chatIcon.png";
import close from "../assets/close.png";
import { RiDeleteBin6Line } from "react-icons/ri";

const categorizeChatsByClient = (chatHistory, selectedClient) => {
  const categories = {
    today: [],
    yesterday: [],
    past7Days: [],
    past30Days: [],
  };

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  const startOf7DaysAgo = new Date(startOfToday);
  startOf7DaysAgo.setDate(startOfToday.getDate() - 7);

  const startOf30DaysAgo = new Date(startOfToday);
  startOf30DaysAgo.setDate(startOfToday.getDate() - 30);

  const clientChats = chatHistory[selectedClient] || {};

  Object.entries(clientChats).forEach(([chatId, chat]) => {
    const chatDate = new Date(chat.date);

    const chatEntry = { chatId, ...chat };

    if (chatDate >= startOfToday) {
      categories.today.push(chatEntry);
    } else if (chatDate >= startOfYesterday) {
      categories.yesterday.push(chatEntry);
    } else if (chatDate >= startOf7DaysAgo) {
      categories.past7Days.push(chatEntry);
    } else if (chatDate >= startOf30DaysAgo) {
      categories.past30Days.push(chatEntry);
    }
  });

  Object.keys(categories).forEach((key) => {
    categories[key].sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  return categories;
};

const Sidebar = ({
  isOpen,
  toggleSidebar,
  chatHistory,
  currentChatId,
  setCurrentChatId,
  createNewChat,
  onDeleteChat,
  setScreen,
  selectedClient,
}) => {
const categorizedChats = categorizeChatsByClient(chatHistory, selectedClient);

  return (
    <div
      className="text-black max-h-84 overflow-y-auto"
    >
      {/* <div className="p-4 flex flex-col space-y-4 overflow-y-auto max-h-screen">
        <div className="flex justify-between md:justify-center items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-800 text-2xl md:hidden"
          >
            <img src={close} alt="Close Sidebar" className="w-6 h-auto" />
          </button>
          <img
            src={jindo_color2}
            alt="Jindo Logo"
            className="w-28 h-auto hidden md:block"
          />
        </div>
        <hr className="border-gray-600"></hr> */}

        {/* <button
          className="bg-jindo-blue text-white py-4 px-4 rounded-3xl mx-4 my-8"
          onClick={() => {
            createNewChat();
            setScreen("home");
          }}
        >
          + New Conversation
        </button> */}

        {/* Grouped Chats */}
        <div className="space-y-4">
          {/* Today */}
          {categorizedChats.today.length > 0 && (
            <>
              <p className="text-black-400">TODAY</p>
              {categorizedChats.today.map(({ chatId, date, name }) => (
                <div
                  key={chatId}
                  className={`p-2 flex flex-row items-center space-x-2 p-2 cursor-pointer rounded-3xl ${
                    chatId === currentChatId ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setCurrentChatId(chatId)}
                >
                  {/* <div className="p-2 rounded-md">
                    <img src={chatIcon} alt="chat" className="h-auto" />
                  </div> */}
                  <div className=" flex-1 basis-8/12">
                    <p>
                      {name || "New Chat"}
                      {/* {new Date(date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} */}
                    </p>
                  </div>
                  <RiDeleteBin6Line
                    className="flex-end"
                    onClick={() => onDeleteChat(chatId)}
                  />
                </div>
              ))}
            </>
          )}

          {/* Yesterday */}
          {categorizedChats.yesterday.length > 0 && (
            <>
              <p className="text-gray-400">YESTERDAY</p>
              {categorizedChats.yesterday.map(({ chatId, date, name }) => (
                <div
                  key={chatId}
                  className={`p-2 flex items-center space-x-2 cursor-pointer rounded-3xl ${
                    chatId === currentChatId ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setCurrentChatId(chatId)}
                >
                  <div className="p-2 rounded-md">
                    <img src={chatIcon} alt="chat" className="h-auto" />
                  </div>
                  <div className="flex-1 basis-8/12">
                    <p>
                      {name || "New Chat"}
                      {/* {new Date(date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} */}
                    </p>
                  </div>
                  <RiDeleteBin6Line onClick={() => onDeleteChat(chatId)} />
                </div>
              ))}
            </>
          )}

          {/* Past 7 Days */}
          {categorizedChats.past7Days.length > 0 && (
            <>
              <p className="text-gray-400">PREVIOUS 7 DAYS</p>
              {categorizedChats.past7Days.map(({ chatId, date, name }) => (
                <div
                  key={chatId}
                  className={`p-2 flex items-center space-x-2 cursor-pointer rounded-3xl ${
                    chatId === currentChatId ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setCurrentChatId(chatId)}
                >
                  <div className="p-2 rounded-md">
                    <img src={chatIcon} alt="chat" className="h-auto" />
                  </div>
                  <div className=" flex-1 basis-8/12">
                    <p>
                      {name || "New Chat"}
                      {/* {new Date(date).toLocaleDateString()} */}
                    </p>
                  </div>
                  <RiDeleteBin6Line onClick={() => onDeleteChat(chatId)} />
                </div>
              ))}
            </>
          )}

          {/* Past 30 Days */}
          {categorizedChats.past30Days.length > 0 && (
            <>
              <p className="text-gray-400">PREVIOUS 30 DAYS</p>
              {categorizedChats.past30Days.map(({ chatId, date, name }) => (
                <div
                  key={chatId}
                  className={`p-2 flex items-center space-x-2 cursor-pointer rounded-3xl ${
                    chatId === currentChatId ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setCurrentChatId(chatId)}
                >
                  <div className="p-2 rounded-md">
                    <img src={chatIcon} alt="chat" className="h-auto" />
                  </div>
                  <div className="flex-1 basis-8/12">
                    <p>
                      {name || "New Chat"}
                      {/* {new Date(date).toLocaleDateString()} */}
                    </p>
                  </div>
                  <RiDeleteBin6Line onClick={() => onDeleteChat(chatId)} />
                </div>
              ))}
            </>
          )}
        </div>
    </div>
  );
};

export default Sidebar;
