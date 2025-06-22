import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setuserId, setWallet } = useContext(StoreContext);

  const [currState, setCurrState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    bup_id: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    let endpoint =
      currState === "Login" ? "/api/user/login" : "/api/user/register";

    try {
      const response = await axios.post(url + endpoint, data);
      const { token, user, message, success } = response.data;

      if (success) {
        if (token && user) {
          setToken(token);
          setuserId(user.bup_id);
          setWallet(user.wallet);
          localStorage.setItem("token", token);
          localStorage.setItem("bup_id", user.bup_id);
          localStorage.setItem("wallet", JSON.stringify(user.wallet));
          toast.success(
            currState === "Login"
              ? "Login successful!"
              : "Account created successfully!"
          );
          setShowLogin(false);
        } else {
          toast.error("Missing token or user data from server.");
        }
      } else {
        // Handle error message based on currState and message
        if (currState === "Login") {
          if (message.toLowerCase().includes("email")) {
            toast.error("Invalid email address.");
          } else if (message.toLowerCase().includes("password")) {
            toast.error("Incorrect password.");
          } else {
            toast.error(message);
          }
        } else {
          if (message.toLowerCase().includes("bup id")) {
            toast.error("BUP ID already exists.");
          } else if (message.toLowerCase().includes("email")) {
            toast.error("Email already registered.");
          } else {
            toast.error(message);
          }
        }
      }
    } catch (error) {
      // This is for network or unexpected errors
      toast.error("Something went wrong. Please try again later.");
      console.error(error);
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt="close"
          />
        </div>
        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <>
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Your name"
                required
              />
              <input
                name="bup_id"
                onChange={onChangeHandler}
                value={data.bup_id}
                type="text"
                placeholder="BUP ID (11 digits)"
                required
                pattern="\d{11}"
                title="BUP ID must be exactly 11 digits"
              />
            </>
          )}
          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Your email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="Password"
            required
          />
        </div>
        <button type="submit">
          {currState === "Sign Up" ? "Create account" : "Login"}
        </button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
        {currState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
