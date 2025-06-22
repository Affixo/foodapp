import React from "react";
import "./Header.css";
const Header = () => {
  return (
    <div className="header">
      <div className="header-contents">
        <h1>Vista Food App</h1>
        <h2>Skip the line and Order your food here!</h2>
        <p>
          Tired of waiting in the line for food where the lunch break time is
          only 30 minutes? Order from the web-app to get your food ready and
          recieve right upfront!
        </p>
        <button>View Menu</button>
      </div>
    </div>
  );
};

export default Header;
