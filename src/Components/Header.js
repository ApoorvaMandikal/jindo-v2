import React from "react";
import jindo_color2 from "../assets/Jindo_color2.png";
import hamburger from "../assets/hamburger.png";
import edit from "../assets/edit.png";
import microphone from "../assets/microphone-2.png";
import { useNavigate, Link } from "react-router-dom";
import { authentication, signOut } from "../firebaseConfig";

const Header = ({
  toggleSidebar,
  isGuest,
  setIsGuest,
  selectedClient,
  age,
  duration,
  location,
  setActivePanel,
  createNewChat,
}) => {
  const navigate = useNavigate();
  const logout = () => {
    authentication.signOut();
  };

  return (
    <div className="w-full flex items-center justify-between md:justify-between md:h-24 p-4 bg-gray-100 shadow-md">
      <div
        className={`text-left py-2 px-4 rounded-lg transition md:text-xl lg:text-2xl font-medium`}
      >
        {selectedClient.replace("_", " ")}
      </div>
      <div className="flex flex-col md:text-xs lg:text-sm w-1/6">
        <p>Age: {age ?? "N/A"}</p>
        <p>Location: {location || "N/A"}</p>
        <p>Client Since: {duration || "N/A"}</p>
      </div>
      <button
        onClick={() => {
          createNewChat(); 
          setActivePanel("chat"); 
        }}
        className="flex px-4 py-2 bg-white border rounded hover:bg-gray-100 shadow lg:w-1/6 md:text-xs lg:text-sm"
      >
        <img src={edit} alt="Sidebar" className="md:w-8 lg:w-10 h-auto px-2" />
        New chat
      </button>
      <button
        onClick={() => setActivePanel("transcription")}
        className="flex px-4 py-2 bg-white border rounded hover:bg-gray-100 shadow md:text-xs lg:text-sm"
      >
        <img
          src={microphone}
          alt="Sidebar"
          className="md:w-8 lg:w-10 h-auto px-2"
        />{" "}
        New recording with client
      </button>

      <button
        onClick={toggleSidebar}
        className="text-gray-800 text-2xl md:hidden"
      >
        <img src={hamburger} alt="Sidebar" className="w-12 h-auto" />
      </button>
      <img
        src={jindo_color2}
        alt="Jindo Logo"
        className="w-32 h-auto md:hidden"
      />
      {isGuest ? (
        <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </Link>
      ) : (
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded justify-end"
        >
          {" "}
          Logout{" "}
        </button>
      )}
    </div>
  );
};

export default Header;
