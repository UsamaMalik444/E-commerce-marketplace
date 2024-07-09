// @ts-nocheck
import { useState, useEffect } from "react";
import { ClockworkProvider, PAYER_PUBKEY } from "@clockwork-xyz/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import Pause from "./pause";
import Update from "./update";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

const Withdraw = (settingId: any, setting: any) => {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const connection = new Connection(
    "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7",
    "confirmed"
  );
  const provider = new anchor.AnchorProvider(
    connection,
    useWallet(),
    anchor.AnchorProvider.defaultOptions()
  );
  console.log("incoming settingId", settingId.settingId);
  const clockworkProvider = ClockworkProvider.fromAnchorProvider(provider);
  const [thread_address] = clockworkProvider.getThreadPDA(
    publicKey, // authority
    // new anchor.web3.PublicKey('GJ583UebPiedxYi5zQV4n3H1GkALuYpmb15kP8DDgF3X'),   // settingId
    settingId.settingId // settingId
  );

  async function send() {
    const ix = await clockworkProvider.threadDelete(publicKey, thread_address);

    const tx = new Transaction().add(ix);
    await provider.sendAndConfirm(tx);
  }

  async function getBalance() {
    // get the balance of the threadPubkey
    const balance = await connection.getBalance(thread_address);
    console.log("balance is", balance);
    setBalance(balance / LAMPORTS_PER_SOL);
  }

  useEffect(() => {
    if (thread_address) {
      console.log("thread address is", thread_address.toString());

      getBalance();
    }
  }, [thread_address]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {balance > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "1rem",
            margin: "1rem",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <strong>Current Balance: </strong>
            <p
              style={{
                width: "100%",
              }}
            >
              {balance}
            </p>
          </div>
          <Pause
            settingId={settingId.settingId}
            totalDays={settingId.cronJobTiming}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "1rem",
              justifyContent: "center",
            }}
          >
            <a
              href={`https://app.clockwork.xyz/threads/${thread_address}?cluster=custom&customUrl=${connection.rpcEndpoint}\n`}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "blue",
              }}
            >
              View on Clockwork
            </a>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "center",
              marginTop: "1rem",
            }}
          >
            {/* <Update
                            setting={setting}
                        /> */}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "center",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={() => {
                send();
              }}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Withdraw & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdraw;
