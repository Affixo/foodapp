import React, { useState, useMemo } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Minus,
  DollarSign,
  User,
  Wallet,
  History,
} from "lucide-react";
import "./WalletAdminPanel.css";

const WalletAdminPanel = () => {
  const [searchId, setSearchId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [txSearch, setTxSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formatCurrency = useMemo(() => {
    return (amount) =>
      new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        minimumFractionDigits: 2,
      }).format(amount);
  }, []);

  const handleSearch = async () => {
    setError("");
    setSelectedUser(null);

    const trimmedId = searchId.trim();

    if (!/^\d{11}$/.test(trimmedId)) {
      setError("BUP ID must be exactly 11 digits");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:4000/api/admin/wallet/user/${trimmedId}`
      );
      console.log("Selected User:", res.data.user);
      setSelectedUser(res.data.user);
      setTransactions(res.data.transactions);
    } catch (err) {
      setError(
        err.response?.data?.message || "User not found or server error."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceUpdate = async (operation) => {
    if (!selectedUser || !selectedUser._id) return;

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:4000/api/admin/wallet/update",
        {
          userId: selectedUser._id,
          amount: amt,
          operation,
          adminNote,
        }
      );

      const { updatedUser, newTransaction } = res.data;

      // Ensure consistent shape of selectedUser
      setSelectedUser({
        _id: updatedUser._id,
        bupId: updatedUser.bup_id,
        name: updatedUser.name,
        email: updatedUser.email,
        walletBalance: updatedUser.wallet.balance,
        lastTransaction: newTransaction.timestamp,
      });

      // Add new transaction to the top
      setTransactions((prev) => [newTransaction, ...prev]);

      // Clear input fields
      setAmount("");
      setAdminNote("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions?.filter(
    (tx) =>
      tx.userId?.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.userName?.toLowerCase().includes(txSearch.toLowerCase())
  );

  return (
    <div className="wap-container">
      <div className="wap-inner">
        <div className="wap-header">
          <div className="wap-header-content">
            <Wallet className="wap-icon-large blue-icon" />
            <h1 className="wap-title">Wallet Management</h1>
          </div>

          <div className="wap-search-row">
            <div className="wap-search-input-container">
              <label className="wap-label">Search User by BUP ID</label>
              <div className="wap-input-wrapper">
                <Search className="wap-icon-small gray-icon" />
                <input
                  type="text"
                  placeholder="Enter BUP ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="wap-input"
                />
              </div>
              {error && <p className="wap-error">{error}</p>}
            </div>
            <button
              onClick={handleSearch}
              className="wap-btn-primary"
              disabled={loading}
            >
              <Search className="wap-icon-tiny" />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        <div className="wap-grid">
          <div className="wap-card">
            <h2 className="wap-subtitle">
              <User className="wap-icon-small" />
              User Details & Balance Management
            </h2>

            {selectedUser ? (
              <>
                <div className="wap-user-info">
                  <div className="wap-user-grid">
                    <div>
                      <span className="wap-label">BUP ID:</span>
                      <p>{selectedUser.bup_id}</p>
                    </div>
                    <div>
                      <span className="wap-label">Name:</span>
                      <p>{selectedUser.name}</p>
                    </div>
                    <div>
                      <span className="wap-label">Email:</span>
                      <p>{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="wap-label">Last Transaction:</span>
                      <p>{selectedUser.lastTransaction}</p>
                    </div>
                  </div>
                  <div className="wap-balance-box">
                    <div className="wap-balance-header">
                      <DollarSign className="wap-icon-small green-icon" />
                      <span className="wap-label">Current Balance:</span>
                    </div>
                    <p className="wap-balance-amount">
                      {formatCurrency(selectedUser.walletBalance)}
                    </p>
                  </div>
                </div>

                <div className="wap-update-controls">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="wap-input"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="text"
                    placeholder="Admin note (optional)"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="wap-input"
                  />
                  <div className="wap-btn-group">
                    <button
                      onClick={() => handleBalanceUpdate("increase")}
                      className="wap-btn-success"
                      disabled={!amount || parseFloat(amount) <= 0 || loading}
                    >
                      <Plus className="wap-icon-tiny" />
                      Add Money
                    </button>
                    <button
                      onClick={() => handleBalanceUpdate("decrease")}
                      className="wap-btn-danger"
                      disabled={!amount || parseFloat(amount) <= 0 || loading}
                    >
                      <Minus className="wap-icon-tiny" />
                      Deduct Money
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="wap-empty-state">
                <User className="wap-icon-large gray-icon" />
                <p>Search for a user to manage their wallet</p>
              </div>
            )}
          </div>

          <div className="wap-card wap-transaction-history">
            <h2 className="wap-subtitle">
              <History className="wap-icon-small" />
              Transaction History
            </h2>

            <div className="wap-search-transaction">
              <input
                type="text"
                placeholder="Search transactions by User ID or Name"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="wap-input"
              />
            </div>

            {filteredTransactions?.length === 0 ? (
              <p className="wap-no-data">No matching transactions found.</p>
            ) : (
              <table className="wap-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>User</th>
                    <th>Operation</th>
                    <th>Amount</th>
                    <th>Previous Balance</th>
                    <th>New Balance</th>
                    <th>Admin Note</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions?.map((tx) => (
                    <tr key={tx._id}>
                      <td>{tx.timestamp}</td>
                      <td>
                        {tx.userName} ({tx.userId})
                      </td>
                      <td className="wap-capitalize">{tx.operation}</td>
                      <td
                        className={`wap-font-semibold ${
                          tx.operation === "increase"
                            ? "wap-text-green"
                            : "wap-text-red"
                        }`}
                      >
                        {formatCurrency(tx.amount)}
                      </td>
                      <td>{formatCurrency(tx.previousBalance)}</td>
                      <td>{formatCurrency(tx.newBalance)}</td>
                      <td>{tx.adminNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletAdminPanel;
