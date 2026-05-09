import React, { useCallback, useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const MyOrders = () => {
  const { url, token, userId } = useContext(StoreContext);
  const [data, setData] = useState([]);

  const fetchOrders = useCallback(async () => {
    if (!token || !userId) return;

    const response = await axios.post(
      url + "/api/order/userorders",
      { userId },
      { headers: { token } }
    );

    setData(response.data.data || []);
  }, [token, userId, url]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_SERVER_URL || url);

    socket.on("orderReady", () => {
      toast.success("Your food is ready!");
      fetchOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchOrders, token, url]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order) => (
          <div key={order._id} className="my-orders-order">
            <img src={assets.parcel_icon} alt="" />
            <p>
              {order.items.map((item, index) =>
                index === order.items.length - 1
                  ? `${item.name} x ${item.quantity}`
                  : `${item.name} x ${item.quantity}, `
              )}
            </p>
            <p>BDT {Number(order.amount).toFixed(2)}</p>
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
