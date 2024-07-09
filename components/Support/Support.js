import React, { useState, useEffect } from "react";
import {
  getCollectionOrders,
  GetSingleOrderDetails,
  getPrintfulOrdersByOwner,
} from "../../lib/api";
import { useWallet } from "@solana/wallet-adapter-react";
import styles from "./styles/Support.module.css";

const supportModal = () => {
  return (
    <>
      <div className={styles.support_modal_bg}>
        <div className={styles.support_modal}>
          <div className={styles.support_col1}>
            <div className={styles.support_welcome}>
              <div>
                <p>
                  Hello <span>HLMp3..epl,</span>
                </p>
                <img src="/wave2.png" />
              </div>
              <p className={styles.small_head_p}>How can we help?</p>
            </div>

            <div className={styles.support_form}>
              <div>
                {/* <label className={styles.token_label}>Issue</label> */}
                <textarea
                  type="text"
                  value=""
                  placeholder="Briefly describe the issue?"
                />
              </div>
              <div>
                {/* <label className={styles.token_label}>Resolution</label> */}
                <textarea
                  type="text"
                  value=""
                  placeholder="Resolution needed"
                />
              </div>

              <select>
                <option value="">Priority</option>

                <option value="usdc">High</option>
                <option value="sol">Medium</option>
                <option value="dust">Low</option>
              </select>

              <button>Open Ticket</button>
            </div>
          </div>
          <div className={styles.support_col2}>
            <div className={styles.border_upload}>
              <img src="/upload_img.png" />
              <p>Attach screenshot/image</p>
              <button>Choose file</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default supportModal;
