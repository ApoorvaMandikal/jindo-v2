import React from "react";
import jindo_color2 from "../assets/Jindo_color2.png";
import hamburger from "../assets/hamburger.png";
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
}) => {
  const navigate = useNavigate();
  const logout = () => {
    authentication.signOut();
  };

  return (
    <div className="w-full flex items-center justify-between md:justify-between p-4 bg-white shadow-md">
      <div className={`text-left py-2 px-4 rounded-lg transition text-lg font-medium`}>
        {selectedClient.replace("_", " ")}
      </div>
      <div className="flex flex-col">
        
          <p><strong>Age:</strong> {age ?? "N/A"}</p>
          <p><strong>Location:</strong> {location || "N/A"}</p>
          <p><strong>Client Since:</strong> {duration || "N/A"}</p>
        
      </div>
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
