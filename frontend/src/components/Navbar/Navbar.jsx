import React, { useContext, useState, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { getCartItemCount, token, setToken, food_list, url } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("bup_id");
    localStorage.removeItem("wallet");
    setToken("");
    navigate("/");
  };

  const scrollToSection = (sectionId, activeMenu) => {
    setMenu(activeMenu);
    navigate("/");
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleResultClick = (id) => {
    setSearchText("");
    setSearchResults([]);
    navigate("/");
    setTimeout(() => {
      document.getElementById(`food-${id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  };

  // Merge sort algorithm
  const mergeSort = (arr) => {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
  };

  const merge = (left, right) => {
    const result = [];
    while (left.length && right.length) {
      if (left[0].name.toLowerCase() < right[0].name.toLowerCase()) {
        result.push(left.shift());
      } else {
        result.push(right.shift());
      }
    }
    return [...result, ...left, ...right];
  };

  // Live search using useEffect
  useEffect(() => {
    if (searchText.trim() === "") {
      setSearchResults([]);
      return;
    }
    const sorted = mergeSort([...food_list]);
    const filtered = sorted.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 5));
  }, [searchText, food_list]);

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.vista_logo} alt="" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          home
        </Link>
        <a
          href="/#explore-menu"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("explore-menu", "menu");
          }}
          className={menu === "menu" ? "active" : ""}
        >
          menu
        </a>
        <a
          href="/#footer"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("footer", "contact-us");
          }}
          className={menu === "contact-us" ? "active" : ""}
        >
          contact us
        </a>
      </ul>

      <div className="navbar-right">
        <div className="navbar-search-container">
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search food..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <img
            src={assets.search_icon}
            alt="Search"
            className="navbar-search-btn"
            onClick={() => setSearchText(searchText)} // optional
          />

          {searchResults.length > 0 && (
            <div className="navbar-search-dropdown">
              {searchResults.map((item) => (
                <div
                  key={item._id}
                  className="navbar-search-item"
                  onClick={() => handleResultClick(item._id)}
                >
                  <img
                    src={
                      item.image?.startsWith("http")
                        ? item.image
                        : `${url}/uploads/${item.image}`
                    }
                    alt={item.name}
                  />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-cart-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className={getCartItemCount() === 0 ? "" : "dot"}></div>
        </div>

        {!token ? (
          <button onClick={() => setShowLogin(true)}>sign in</button>
        ) : (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} alt="" />
                <p>Orders</p>
              </li>
              <li onClick={() => navigate("/wallet")}>
                <img src={assets.bag_icon} alt="" />
                <p>Wallet</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
