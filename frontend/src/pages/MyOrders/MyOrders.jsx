import React, { useEffect, useState, useContext } from "react";
import "./MyOrders.css";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // Adjust if hosted

const MyOrders = () => {
  const { url, token, userId } = useContext(StoreContext);
  const [data, setData] = useState([]);

  const fetchOrders = async () => {
    const response = await axios.post(
      url + "/api/order/userorders",
      { userId },
      { headers: { token } }
    );
    setData(response.data.data);
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }

    // 🔔 Listen for real-time event
    socket.on("orderReady", ({ orderId }) => {
      const isUserOrder = data.some((order) => order._id === orderId);
      if (isUserOrder) {
        toast.success("Your food is ready! 🍽️");
        fetchOrders(); // Refresh status
      }
    });

    // 🔐 Cleanup
    return () => socket.off("orderReady");
  }, [token, data]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order, index) => (
          <div key={index} className="my-orders-order">
            <img src={assets.parcel_icon} alt="" />
            <p>
              {order.items.map((item, index) =>
                index === order.items.length - 1
                  ? `${item.name} x ${item.quantity}`
                  : `${item.name} x ${item.quantity}, `
              )}
            </p>
            <p>৳{order.amount}.00</p>
            <p>Items: {order.items.length}</p>
            <p>
              <span>&#x25cf;</span> <b>{order.status}</b>
            </p>
            <button onClick={fetchOrders}>Track Order</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
