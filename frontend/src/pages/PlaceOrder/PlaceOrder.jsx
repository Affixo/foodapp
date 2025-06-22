import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, userId } =
    useContext(StoreContext);

  const [walletBalance, setWalletBalance] = useState(0);
  //const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token]);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(
          `${url}/api/admin/wallet/user/${userId}`,
          {
            headers: { token },
          }
        );

        setWalletBalance(response.data.user.walletBalance);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchWalletBalance();
  }, [token, url, userId]);

  // const onChangeHandler = (event) => {
  //   const name = event.target.name;
  //   const value = event.target.value;
  //   setData((data) => ({ ...data, [name]: value }));
  // };

  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo.quantity = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    const orderData = {
      //address: data,
      items: orderItems,
      amount: getTotalCartAmount(),
    };

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { token },
      });

      if (response.data.success) {
        navigate("/");
      } else {
        alert("Error placing order");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Order failed");
    }
  };

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>৳{getTotalCartAmount()}</p>
          </div>

          <div className="cart-total-details">
            <b>Total</b>
            <b>৳{getTotalCartAmount()}</b>
          </div>

          <div className="cart-total-details wallet-info">
            <p>Wallet Balance</p>
            <p>৳{walletBalance.toFixed(2)}</p>
          </div>

          <button type="submit">Proceed To Payment</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
