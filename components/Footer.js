import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faInstagram } from "@fortawesome/free-solid-svg-icons";
import { Container } from "react-bootstrap";
import { IoLogoDiscord, IoLogoTwitter } from "react-icons/io5";

// import Head from "next/head";

export default function HeaderComponent() {
  const router = useRouter();
  const TWITTER_HANDLE = "ikonsOfSol";
  const TWITTER_LINK = "https://twitter.com/";
  const IG_LINK = "https://instagram.com/";
  const currentPath = router.pathname;

  // // Dark Mode img
  const [isDarkMode, setIsDarkMode] = useState();

  useEffect(() => {
    if (typeof window !== "undefined") {
      let theme = localStorage.getItem("ikonshop-theme");
      if (theme === "dark") {
        setIsDarkMode(true);
      } else {
        setIsDarkMode(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (typeof window !== "undefined") {
        let theme = localStorage.getItem("ikonshop-theme");
        if (theme === "dark") {
          setIsDarkMode(true);
        } else {
          setIsDarkMode(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  return (
    <div className="footer_container">
      {/* <span className="twitter-logo"><a href={`${TWITTER_LINK}${TWITTER_HANDLE}`} target="_blank" rel="noreferrer"><i className="fab fa-twitter"></i></a></span>
        <span className="twitter-logo"><a href="/faq/how-to">FAQ</a></span>
        <span className="twitter-logo"><a href={`${IG_LINK}${TWITTER_HANDLE}`}></a></span> */}
      <Container>
        <div className="footer_row">
          <div>
            {isDarkMode ? (
              <img
                src="/Ikonshop_WhiteText_Lgo.svg"
                style={{ cursor: "pointer", maxWidth: "100px" }}
              />
            ) : (
              <img
                src="/logowhite.svg"
                style={{ cursor: "pointer", maxWidth: "100px" }}
              />
            )}
          </div>

          <div className="footer_links">
            {/* <p>Support</p>
            <p>About</p>
            <p>Company</p>
            <p>Movement</p> */}
            <a href="https://twitter.com/IkonShopApp">
              <IoLogoTwitter />
            </a>
            <a href="https://discord.gg/ikons">
              <IoLogoDiscord />
            </a>
          </div>
          <div className="footer_row2">
            <div>
              <p className="footer_copyright">
                2023 IkonShop , All Rights Reserved
              </p>
            </div>

            <div className="footer_links2">
              <a href="/terms">
                <p>Terms and Conditions</p>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
