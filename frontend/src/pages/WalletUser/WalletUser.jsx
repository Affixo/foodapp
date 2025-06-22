import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import "./WalletUser.css";

const WalletUser = () => {
  const { token, url, userId } = useContext(StoreContext);
  const [walletData, setWalletData] = useState({
    balance: 0,
    lastUpdated: "",
    transactions: [],
  });

  useEffect(() => {
    const fetchWalletData = async () => {
      console.log("Fetching wallet with:", { token, url, userId });
      if (!userId) {
        console.warn("BUP ID is undefined. Skipping wallet fetch.");
        return;
      }

      try {
        const response = await axios.get(
          `${url}/api/admin/wallet/user/${userId}`,
          {
            headers: { token },
          }
        );

        console.log("Wallet data:", response.data);

        setWalletData({
          balance: response.data.user.walletBalance,
          lastUpdated: new Date().toLocaleDateString(),
          transactions: response.data.transactions || [],
        });
      } catch (error) {
        console.error("Error fetching wallet:", error);
      }
    };

    fetchWalletData();
  }, [token, url, userId]);

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <div className="wallet-title">💰 My Wallet</div>
        <div className="wallet-subtitle">
          Track your account balance and transactions
        </div>
      </div>

      <div className="wallet-balance">
        <div className="balance-label">Available Balance</div>
        <div className="balance-amount">৳{walletData.balance.toFixed(2)}</div>
        <div className="last-updated">
          Last updated: {walletData.lastUpdated}
        </div>
      </div>

      <div className="transaction-section">
        <div className="section-title">Recent Transactions</div>
        <div className="transaction-list">
          {walletData.transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <div className="empty-text">No transactions yet</div>
              <div className="empty-subtext">
                Your transaction history will appear here
              </div>
            </div>
          ) : (
            walletData.transactions.map((txn) => (
              <div key={txn._id} className="transaction-item">
                <div className="transaction-info">
                  <div
                    className={`transaction-icon ${
                      txn.isCredit ? "credit-icon" : "debit-icon"
                    }`}
                  >
                    {txn.isCredit ? "+" : "-"}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-type">{txn.type}</div>
                    <div className="transaction-date">
                      {new Date(txn.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div
                  className={`transaction-amount ${
                    txn.isCredit ? "credit" : "debit"
                  }`}
                >
                  {txn.isCredit ? "+" : "-"}৳{txn.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletUser;
