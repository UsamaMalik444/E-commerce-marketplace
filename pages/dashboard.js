import React, { useState, useEffect } from "react";
import MerchantDashboard from "../components/Merchant/Dashboard";
import UserDashboard from "../components/User/Dashboard";
import { checkMagicLogin } from "../hooks/checkMagicLogin";

const DashboardPage = () => {
  const [activeDash, setActiveDash] = useState("user");

  useEffect(() => {
    async function checkLogin() {
      checkMagicLogin();
    }
    checkLogin();
    window.addEventListener("toggle-merchant", () => {
      setActiveDash("merchant");
      localStorage.setItem("tgUser", "false");
    });
    window.addEventListener("toggle-user", () => {
      setActiveDash("user");
      localStorage.setItem("tgUser", "true");
    });
  }, []);

  useEffect(() => {
    // console.log('window.location.pathname', window.location.search)
    const queryString = window.location.search;
    const tgUser = localStorage.getItem("tgUser");
    const urlParams = new URLSearchParams(queryString);
    console.log("urlParams", urlParams.get("showUserOrders"));
    if (tgUser === "true") {
      // console.log('tgUser=true')
      setActiveDash("user");
    }
    if (tgUser === "false") {
      // console.log('merchantSettings=true')
      setActiveDash("merchant");
    }
    if (urlParams.get("merchantProducts") === "true") {
      setActiveDash("merchant");
    }
    if (urlParams.get("merchant") === "true") {
      setActiveDash("merchant");
    }
    if (urlParams.get("user") === "true") {
      setActiveDash("user");
    }
  }, []);

  return (
    <div
      // make min height 100vh
      className="flex flex-col min-h-screen"
    >
      {activeDash === "user" ? <UserDashboard /> : <MerchantDashboard />}
    </div>
  );
};

export default DashboardPage;
