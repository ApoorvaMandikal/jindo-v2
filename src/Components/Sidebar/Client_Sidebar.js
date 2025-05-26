import React, { useState, useEffect } from "react";
import jindo_color2 from "./../../assets/Jindo_color2.png";
import close from "../../assets/close.png";
import { RiDeleteBin6Line } from "react-icons/ri";

const Client_Sidebar = ({
  isOpen,
  toggleSidebar,
  createNewChat,
  setScreen,
  selectedClient,
  setSelectedClient,
  setClients,
  clients
}) => {
  //const clients = ["Cindy_Johnson", "John_Doe","Alex_Johnson","David_Lee","Ethan_Davis","Jane_Smith","Priya_Patel","Sarah_Green","Olivia_Brown","Li_Chen","John_Don","Maria_Rodriguez"]; // later replace with dynamic list from backend or state
//  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/list-clients"
         //"https://demo.jindolabs.com/list-clients" 
        );
        const data = await res.json();
        if (data.clients) {
          setClients(data.clients);
        } else {
          console.warn("Failed to load clients", data);
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };

    fetchClients();
  }, []);

  return (
    <div
      className={`md:static md:translate-x-0 fixed top-0 left-0 h-screen w-64 bg-black text-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:w-1/5 md:h-full"
      }`}
    >
      <div className="p-4 flex flex-col space-y-4 max-h-screen">
        {/* Logo and close */}
        <div className="flex justify-between md:justify-center items-center">
          <button onClick={toggleSidebar} className="md:hidden">
            <img src={close} alt="Close Sidebar" className="w-6 h-auto" />
          </button>
          <img
            src={jindo_color2}
            alt="Jindo Logo"
            className="w-28 h-auto hidden md:block"
          />
        </div>

        <hr className="border-gray-600" />

        {/* Add New Client */}
        <button
          className="bg-jindo-blue text-white py-4 px-4 rounded-3xl mx-4 my-4 hover:bg-blue-700"
          onClick={() => {
            createNewChat(); // You can change this to `addNewClient()` later
            setScreen("home");
          }}
        >
          + New Client
        </button>

        {/* Client Tabs */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="space-y-2">
            {clients.map((name) => (
              <div
                key={name}
                className="flex justify-between items-center mx-2"
              >
                <button
                  onClick={() => setSelectedClient(name)}
                  className={`w-full text-left py-2 px-4 rounded-lg transition ${
                    selectedClient === name
                      ? "bg-white text-black font-semibold"
                      : "hover:bg-gray-800"
                  }`}
                >
                  {name.replace("_", " ")}
                </button>
                {/* Optional delete icon — implement when needed */}
                {/* <RiDeleteBin6Line onClick={() => handleDeleteClient(name)} className="text-red-400 cursor-pointer ml-2" /> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Client_Sidebar;
