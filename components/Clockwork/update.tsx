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
import { BigNumber } from "bignumber.js";
import { BN } from "@project-serum/anchor";
import {
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
  createTransferInstruction,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  mintTo,
  transfer,
} from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import ClockWorkDashboard from "./main";
const STATUS = {
  Initial: "Initial",
  Submitted: "Submitted",
  Paid: "Paid",
};
const Update = (_setting: any) => {
  const { setting } = _setting;
  console.log("setting", setting);
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(true);
  const orderID = useMemo(() => Keypair.generate().publicKey, []);

  const [updateAmount, setUpdateAmount] = useState("");
  const token = setting.token;

  const [owner, setOwner] = useState("");

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
  const threadId = setting.id + publicKey.toString().slice(-4);
  console.log("threadId", threadId);
  const [thread_address] = clockworkProvider.getThreadPDA(
    publicKey, // authority
    threadId // settingIds
  );
  console.log("thread string", thread_address.toString());

  const processTransaction = async () => {
    setLoading(true);
    const order = {
      thread_address: thread_address.toString(),
      amount: updateAmount,
      buyer: publicKey.toString(),
      orderID: orderID.toString(),
    };

    try {
      console.log("sending transaction");
      const blockhash = await connection.getLatestBlockhash();

      const tx = new Transaction({
        recentBlockhash: blockhash.blockhash,
        feePayer: publicKey,
      });
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        // Lamports are the smallest unit of SOL, like Gwei with Ethereum
        lamports: parseFloat(updateAmount) * LAMPORTS_PER_SOL,
        toPubkey: thread_address,
      });

      // const transferTwo = SystemProgram.transfer({
      //   fromPubkey: buyerPublicKey,
      //   lamports: (bigAmount.multipliedBy(LAMPORTS_PER_SOL).toNumber() * .2),
      //   toPubkey: secondPublicKey,
      // })

      transferInstruction.keys.push({
        pubkey: new PublicKey(orderID),
        isSigner: false,
        isWritable: false,
      });

      // tx.add(transferInstruction, transferTwo);
      tx.add(transferInstruction);
      console.log("tx", tx);
      const txHash = await sendTransaction(tx, connection);
      console.log("txHash", txHash);
      // console.log("orderID", orderID);

      console.log(
        `Transaction sent: https://solana.fm/tx/${txHash}?cluster=mainnet`
      );
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      setOwner(publicKey.toString());
    }
  }, [publicKey]);

  return (
    <div>
      {/* <button onClick={() => updateThread}>Update</button> */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          processTransaction();
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
          <label htmlFor="price">Add Funds to Subscription?</label>
          <input
            id="updateAmount"
            type="text"
            value={updateAmount}
            onChange={(e) => setUpdateAmount(e.target.value)}
          />
        </div>

        <button
          type="submit"
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
          Send Funds
        </button>
      </form>
    </div>
  );
};

export default Update;
