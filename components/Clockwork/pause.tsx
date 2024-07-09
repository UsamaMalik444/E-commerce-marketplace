// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { ClockworkProvider, PAYER_PUBKEY } from "@clockwork-xyz/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import * as anchor from "@coral-xyz/anchor";

const Pause = (_setting: any) => {
  console.log("setting", _setting);
  const { publicKey } = useWallet();
  const [thread_data, setThreadData] = useState<any>();
  // const ix = await provider.threadPause(wallet.publicKey, threadPubkey);
  // const ix = await provider.threadResume(wallet.publicKey, threadPubkey);
  // https://www.npmjs.com/package/@clockwork-xyz/sdk
  const connection = new Connection(
    "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7",
    "confirmed"
  );
  const provider = new anchor.AnchorProvider(
    connection,
    useWallet(),
    anchor.AnchorProvider.defaultOptions()
  );
  const clockworkProvider = ClockworkProvider.fromAnchorProvider(provider);

  const [thread_address] = clockworkProvider.getThreadPDA(
    publicKey, // authority
    _setting.settingId // settingId
  );

  async function fetchData() {
    const threadAccount = await clockworkProvider.getThreadAccount(
      thread_address
    );
    const timestamp = (threadAccount.createdAt.unixTimestamp as BN).toNumber();
    console.log("threadAccount", threadAccount);
    console.log("created at", new Date(timestamp * 1000).toLocaleString());
    setThreadData(threadAccount);
  }

  async function pause() {
    const ix = await clockworkProvider.threadPause(publicKey, thread_address);
    const tx = new Transaction().add(ix);
    const signature = await provider.sendAndConfirm(tx);

    console.log("signature", signature);
  }

  async function resume() {
    const ix = await clockworkProvider.threadResume(publicKey, thread_address);
    const tx = new Transaction().add(ix);
    const signature = await provider.sendAndConfirm(tx);

    console.log("signature", signature);
  }

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <strong>Purchase Date</strong>
      <p
        style={{
          width: "100%",
        }}
      >
        {
          /* {thread_data?.createdAt.unixTimeStamp} */
          // format the unix timestamp
          new Date(
            (thread_data?.createdAt.unixTimestamp as BN).toNumber() * 1000
          ).toLocaleString()
        }
      </p>
      <strong>Renews:</strong>
      <p
        style={{
          width: "100%",
        }}
      >
        {_setting.totalDays}
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <strong>Status:</strong>
        <span
          style={{
            backgroundColor: thread_data?.paused ? "red" : "green",
            borderRadius: "50%",
            height: "10px",
            width: "10px",
            marginLeft: "10px",
            marginTop: "7px",
          }}
        ></span>
        <strong>{thread_data?.paused ? "Paused" : "Active"}</strong>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <button
          onClick={() => pause()}
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
          Pause
        </button>

        <button
          onClick={() => resume()}
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
          Resume
        </button>
      </div>
    </div>
  );
};

export default Pause;
