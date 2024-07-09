// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import Pause from "./pause";
import {
  createClockworkSettings,
  getAllClockworkSettings,
  createClockworkOrder,
  getAllClockworkSettingsInDatabase,
  getAllPurchasedClockworkOrders,
} from "../../lib/Clockwork/api";
import { useWallet } from "@solana/wallet-adapter-react";
import Withdraw from "./withdraw";
import BigNumber from "bignumber.js";
import Update from "./update";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  PublicKey,
  Transaction,
  clusterApiUrl,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createTransferInstruction,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  getMint,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { ClockworkProvider, PAYER_PUBKEY } from "@clockwork-xyz/sdk";
import * as web3 from "@solana/web3.js";
import base58 from "bs58";

//thread pause, thread resume, thread withdraw, thread update

const PurchasedClockworkOrders = () => {
  const { publicKey, sendTransaction } = useWallet();
  const orderID = useMemo(() => Keypair.generate().publicKey, []);
  const [threadSource, setThreadSource] = useState(null);

  const [showAllSettings, setShowAllSettings] = useState(false);
  const [showPurchasedSettings, setShowPurchasedSettings] = useState(false);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mint, setMint] = useState(null);
  const [allClockworkSettings, setAllClockworkSettings] = useState([]);
  const [threadAddress, setThreadAddress] = useState("");
  const [cronTimeString, setCronTimeString] = useState("");
  const [selectedSettings, setSelectedSettings] = useState(null);
  const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=bb0cb5ed-9c3e-421b-a379-2dc684ad0e9f",
    "confirmed"
  );
  const shopSecretKey = process.env.NEXT_PUBLIC_SHOP_SECRET_KEY;
  const shopKeypair = web3.Keypair.fromSecretKey(base58.decode(shopSecretKey));

  const fund_source = shopKeypair;
  // Prepare clockworkProvider
  const provider = new anchor.AnchorProvider(
    connection,
    useWallet(),
    anchor.AnchorProvider.defaultOptions()
  );
  const clockworkProvider = ClockworkProvider.fromAnchorProvider(provider);
  // const fund_source = Keypair.fromSecretKey(base58.decode(process.env.NEXT_PUBLIC_SHOP_SECRET_KEY));

  console.log("fund source", fund_source.publicKey.toString());

  // SPL TOKEN ADDRESS
  const usdcAddress = new PublicKey(
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  );
  const dustAddress = new PublicKey(
    "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ"
  );
  const gmtAddress = new PublicKey(
    "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx"
  );
  const goreAddress = new PublicKey(
    "6wJYjYRtEMVsGXKzTuhLmWt6hfHX8qCa6VXn4E4nGoyj"
  );
  const peskyAddress = new PublicKey(
    "nooot44pqeM88dcU8XpbexrmHjK7PapV2qEVnQ9LJ14"
  );
  const creckAddress = new PublicKey(
    "Ao94rg8D6oK2TAq3nm8YEQxfS73vZ2GWYw2AKaUihDEY"
  );
  const groarAddress = new PublicKey(
    "GroARooBMki2hcpLP6QxEAgwyNgW1zwiJf8x1TfTVkPa"
  );
  const forgeAddress = new PublicKey(
    "FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds"
  );
  const rainAddress = new PublicKey(
    "rainH85N1vCoerCi4cQ3w6mCf7oYUdrsTFtFzpaRwjL"
  );
  const foxyAddress = new PublicKey(
    "FoXyMu5xwXre7zEoSvzViRk3nGawHUp9kUh97y2NDhcq"
  );
  const solAddress = new PublicKey(
    "So11111111111111111111111111111111111111112"
  );

  const order = useMemo(
    () => ({
      orderID: orderID,
      owner: publicKey,
      settings: selectedSettings,
      provider: provider,
    }),
    [orderID, publicKey, threadSource, threadAddress, cronTimeString]
  );

  function generateMonthlyCronJob() {
    const currentDate = new Date();
    const utcDate = new Date(
      currentDate.getTime() + currentDate.getTimezoneOffset() * 60000
    );
    const calculate_minutes = utcDate.getMinutes() + 5;
    const minutes =
      calculate_minutes > 59 ? calculate_minutes - 60 : calculate_minutes;
    const hours =
      calculate_minutes > 59 ? utcDate.getHours() + 1 : utcDate.getHours();
    const dayOfMonth = utcDate.getDate();

    // Generate cron job string
    const cronJobString = `${minutes} ${hours} */30 * * *`;
    console.log("cronJobString", cronJobString);
    return cronJobString;
  }

  function generateWeeklyCronJob() {
    const currentDate = new Date();
    const utcDate = new Date(
      currentDate.getTime() + currentDate.getTimezoneOffset() * 60000
    );
    const calculate_minutes = utcDate.getMinutes() + 5;
    const minutes =
      calculate_minutes > 59 ? calculate_minutes - 60 : calculate_minutes;
    const hours =
      calculate_minutes > 59 ? utcDate.getHours() + 1 : utcDate.getHours();
    const dayOfWeek = utcDate.getDay();

    // Generate cron job string
    const cronJobString = `${minutes} ${hours} */7 * * *`;
    console.log("cronJobString", cronJobString);
    return cronJobString;
  }

  function generateDailyCronJob() {
    const currentDate = new Date();
    // convert the currentDate to UTC time
    const utcDate = new Date(
      currentDate.getTime() + currentDate.getTimezoneOffset() * 60000
    );
    const calculate_minutes = utcDate.getMinutes() + 5;
    const minutes =
      calculate_minutes > 59 ? calculate_minutes - 60 : calculate_minutes;
    const hours =
      calculate_minutes > 59 ? utcDate.getHours() + 1 : utcDate.getHours();
    // Generate cron job string
    const cronJobString = `${minutes} ${hours} */1 * * *`;
    console.log("cronJobString", cronJobString);
    return cronJobString;
  }

  function generateYearlyCronJob() {
    const currentDate = new Date();

    // Extract current date/time components
    // add 5 minutes to the current time to ensure the cron job runs once the transaction is confirmed
    // if the minutes + 5 is greater than 59, roll it over to the next hour
    const calculate_minutes = currentDate.getMinutes() + 5;
    const minutes =
      calculate_minutes > 59 ? calculate_minutes - 60 : calculate_minutes;
    const hours =
      calculate_minutes > 59
        ? currentDate.getHours() + 1
        : currentDate.getHours();
    const dayOfMonth = currentDate.getDate();
    const month = currentDate.getMonth();

    // Generate cron job string
    const cronJobString = `${minutes} ${hours} ${dayOfMonth} ${month} * *`;
    console.log("cronJobString", cronJobString);
    return cronJobString;
  }

  const processTransaction = async (setting) => {
    function getData() {
      console.log("setting", setting);
      const wording = setting.cronJobTiming;
      let trigger_string = null;
      if (wording === "Daily") {
        trigger_string = generateDailyCronJob();
      }
      if (wording === "Weekly") {
        trigger_string = generateWeeklyCronJob();
      }
      if (wording === "Monthly") {
        trigger_string = generateMonthlyCronJob();
      }
      if (wording === "Yearly") {
        trigger_string = generateYearlyCronJob();
      }
      if (wording === "Test") {
        trigger_string = "*/1 * * * * *";
      }
      console.log("trigger_string", trigger_string);

      return trigger_string;
    }

    try {
      setLoading(true);

      let trigger_string = getData();

      console.log("Creating thread...", setting);
      console.log("cron time string", cronTimeString);
      var network = WalletAdapterNetwork.Mainnet;
      const endpoint = clusterApiUrl(network);
      const blockhash = await connection.getLatestBlockhash("finalized");

      const threadId = setting.id + publicKey.toString().slice(-4);
      const [threadAddress_a] = clockworkProvider.getThreadPDA(
        publicKey, // authority
        threadId
      );
      const token = "sol";

      const order_to_submit = {
        threadId: threadAddress_a.toString(),
        owner: setting.owner.owner,
        subscriber: publicKey.toString(),
        clockwork: setting.id,
      };

      let mint = null;

      // switch case for token
      switch (token.toUpperCase()) {
        case "GMT":
          mint = gmtAddress;
          break;
        case "GORE":
          mint = goreAddress;
          break;
        case "PESKY":
          mint = peskyAddress;
          break;
        case "CRECK":
          mint = creckAddress;
          break;
        case "GROAR":
          mint = groarAddress;
          break;
        case "FORGE":
          mint = forgeAddress;
          break;
        case "RAIN":
          mint = rainAddress;
          break;
        case "FOXY":
          mint = foxyAddress;
          break;
        case "SOL":
          mint = solAddress;
          break;
        case "USDC":
          mint = usdcAddress;
          break;
        default:
          mint = solAddress;
      }

      console.log("token", token.toUpperCase());
      console.log("mint", mint.toString());
      const source = threadAddress_a;
      console.log("source", source.toString());

      const recipient = new web3.PublicKey(setting.owner.owner);
      const recipientAta = await getAssociatedTokenAddress(recipient, mint);

      console.log("recipient", recipientAta.toString());

      let payer_ata = publicKey;
      let pda_ata = source;
      if (token.toUpperCase() != "SOL") {
        payer_ata = await getAssociatedTokenAddress(publicKey, mint);

        pda_ata = (
          await getOrCreateAssociatedTokenAccount(
            connection,
            fund_source,
            mint,
            source,
            true // we set this to true as our source is the thread PDA
          )
        ).address;
      }

      const amount = setting.price * LAMPORTS_PER_SOL;

      // 1️⃣  Create a transfer instruction.

      console.log("amount", amount);

      const targetIx = SystemProgram.transfer({
        fromPubkey: PAYER_PUBKEY,
        toPubkey: recipient,
        lamports: setting.price * LAMPORTS_PER_SOL,
      });

      console.log(
        `🥶transfer ${
          amount / LAMPORTS_PER_SOL
        } ${mint.toString()} from ${source.toString()} to ${recipient.toString()}`
      );
      // // 1️⃣  Prepare an instruction to be automated.
      // const transferIx = SystemProgram.transfer({
      //     fromPubkey: PAYER_PUBKEY,
      //     toPubkey: recipient,
      //     lamports: setting.price * LAMPORTS_PER_SOL,
      // });

      // 2️⃣  Define a trigger condition. (every 10 seconds)
      console.log("setting cron job as", trigger_string);
      const trigger = {
        cron: {
          schedule: `0 ${trigger_string}`,
          // schedule: "*/10 * * * * *",
          // "*/19 12 * * */1"

          skippable: true,
        },
      };

      // 3️⃣ Create the thread.

      const ix = await clockworkProvider.threadCreate(
        publicKey, // authority
        threadId, // id
        [targetIx], // instructions
        trigger, // trigger
        0.09 * LAMPORTS_PER_SOL + setting.price * LAMPORTS_PER_SOL // amount to fund the thread with
      );
      const tx = new Transaction().add(ix);

      // await sendTransaction and catch any error it returns
      const sig = await clockworkProvider.anchorProvider.sendAndConfirm(tx);
      console.log(`Thread created: ${sig}`);
      createClockworkOrder(order_to_submit);
    } catch (error) {
      console.log("error", error);
      // setStatus(STATUS.Error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!publicKey) return;
    async function fetchClockworkSettings() {
      // const response = await getAllClockworkSettings({
      //     owner: publicKey.toString(),
      // })
      const response = await getAllPurchasedClockworkOrders({
        owner: publicKey.toString(),
      });
      console.log(response);
      setAllClockworkSettings(response);
    }
    fetchClockworkSettings();
    setLoading(false);
  }, [publicKey]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        width: "450px",
        border: "1px solid #eaeaea",
        marginTop: "20px",
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: "#fbe7c6d0",
      }}
    >
      <strong>All Settings</strong>
      {!loading &&
        allClockworkSettings.map((setting, index) => {
          console.log("setting", setting);
          const threadId = setting.id + publicKey.toString().slice(-4);
          const [threadAddress_a] = clockworkProvider.getThreadPDA(
            publicKey, // authority
            threadId
          );
          // console.log('thread address ********', threadAddress_a.toString())

          return (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                width: "100%",
                border: "1px solid #eaeaea",
                marginTop: "20px",
                padding: "20px",
                borderRadius: "10px",
                backgroundColor: "#a0e7e5a5",
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
                <p
                  style={{
                    width: "100%",
                  }}
                >
                  {setting.clockwork ? setting.clockwork.title : null}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <strong>Description:</strong>
                <p
                  style={{
                    width: "100%",
                  }}
                >
                  {setting.clockwork ? setting.clockwork.description : null}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <strong>Price and Length:</strong>
                <p
                  style={{
                    width: "100%",
                  }}
                >
                  {setting.clockwork ? setting.clockwork.price : null}{" "}
                  {setting.clockwork ? setting.clockwork.token : null}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                {setting.clockwork ? (
                  <button
                    onClick={() => processTransaction(setting)}
                    style={{
                      marginRight: "20px",
                      borderRadius: "5px",
                      padding: "10px",
                      backgroundColor: "#9CBBBE",
                      color: "white",
                    }}
                  >
                    Purchase Subscription
                  </button>
                ) : null}

                {/* {publicKey.toString() === setting.owner.owner && setting.id != "" && ( */}
                <>
                  <Withdraw
                    settingId={setting.id + publicKey.toString().slice(-4)}
                    totalDays={setting.totalDays}
                    cronJobTiming={setting.cronJobTiming}
                    setting={setting}
                  />
                </>
                {/*  )} */}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default PurchasedClockworkOrders;
