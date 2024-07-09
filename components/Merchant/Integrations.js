import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faFilter, faJar } from "@fortawesome/free-solid-svg-icons";
import styles from "../Merchant/styles/Integrations.module.css";
import { useRouter } from "next/router";
import {
  IoAddCircleOutline,
  IoAddOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";

export default function Integrations() {
  return (
    <div
      style={{
        padding: "20px",
      }}
    >
      <div className={styles.integ_cards}>
        <div className={styles.integ_card}>
          <div className={styles.top_flex}>
            <div className={styles.integ_logo}>
              <img src="/printful_logo.png" />
            </div>
            <IoInformationCircleOutline
              style={{
                fontSize: "24px",
                color: "#a6b3be",
                cursor: "pointer",
              }}
            />
          </div>

          <h4 className={styles.textColor}>Printful</h4>

          <p className={styles.textColor}>
            Design and sell custom products online with print-on-demand.
          </p>
          <a href="https://ikonshop.io/printful/dashboard">
            <button>
              <IoAddOutline />
              <span>Connect</span>
            </button>
          </a>
        </div>
        <div className={styles.integ_card}>
          <div className={styles.top_flex}>
            <div className={styles.integ_logo}>
              <img src="/shipstation_logo.png" />
            </div>
            <IoInformationCircleOutline
              style={{
                fontSize: "24px",
                color: "#a6b3be",
                cursor: "pointer",
              }}
            />
          </div>

          <h4 className={styles.textColor}>ShipStation</h4>

          <p className={styles.textColor}>
            Import, manage and ship your orders with ShipStation.
          </p>
          <a href="https://ikonshop.io/shipstation/dashboard">
            <button>
              <IoAddOutline />
              <span>Connect</span>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
