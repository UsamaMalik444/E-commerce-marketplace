// @ts-nocheck
import { useState, useEffect } from "react";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { ClockworkProvider, PAYER_PUBKEY } from "@clockwork-xyz/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import DatePicker from "react-datepicker";
import ClockworkSettingsList from "./listings";
import CreateClockwork from "./create";
import "react-datepicker/dist/react-datepicker.css";
import * as web3 from "@solana/web3.js";
import PurchasedClockworkOrders from "./purchased";

const ClockWorkDashboard = () => {
  const [showPurchased, setShowPurchased] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showListings, setShowListings] = useState(false);
  const [complete, setComplete] = useState(false);
  const [threadAddress, setThreadAddress] = useState("");
  const connection = new Connection(
    "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7",
    "confirmed"
  );
  // Prepare clockworkProvider
  const provider = new anchor.AnchorProvider(
    connection,
    useWallet(),
    anchor.AnchorProvider.defaultOptions()
  );
  const clockworkProvider = ClockworkProvider.fromAnchorProvider(provider);
  // const payer = Keypair.fromSecretKey(
  //     Buffer.from(JSON.parse(require("fs").readFileSync(
  //         require("os").homedir() + "/.config/solana/id.json",
  //         "utf-8"
  //     )))
  // );
  const [loading, setLoading] = useState(false);
  const [txRecipient, setTxRecipient] = useState("");
  const [interval, setInterval] = useState(0); // number of times during scheduleTiming period
  const [scheduleTiming, setScheduleTiming] = useState("");
  const [cronTimeString, setCronTimeString] = useState(""); // cron time string [0 0 * * *
  const [transferAmount, setTransferAmount] = useState(0);
  const [fundAmount, setFundAmount] = useState(0);
  const [allowanceAmount, setAllowanceAmount] = useState(0.012);
  const [rentAmount, setRentAmount] = useState(0.001);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [totalNumberOfDays, setTotalNumberOfDays] = useState("");
  const { publicKey, signTransaction } = useWallet();

  const [pageDisplay, setPageDisplay] = useState("1");

  async function calculateCost() {
    setComplete(false);
    setLoading(true);
    let length_of_time = "";
    const total_days =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    setTotalNumberOfDays(total_days.toString());
    if (scheduleTiming === "daily") {
      if (interval === 1) {
        length_of_time = "0 8 * * *";
      } else if (interval === 2) {
        length_of_time = "0 8 * * */2";
      } else if (interval === 3) {
        length_of_time = "0 8 * * */3";
      } else if (interval === 4) {
        length_of_time = "0 8 * * */4";
      }
    } else if (scheduleTiming === "weekly") {
      if (interval === 1) {
        length_of_time = "0 8 * * 0";
      } else if (interval === 2) {
        length_of_time = "0 8 * * 1,4";
      } else if (interval === 3) {
        length_of_time = "0 8 * * 1,3,5";
      } else if (interval === 4) {
        length_of_time = "0 8 * * 0,2,4,6";
      }
    } else if (scheduleTiming === "monthly") {
      if (interval === 1) {
        length_of_time = "0 8 1 * *";
      } else if (interval === 2) {
        length_of_time = "0 8 1,15 * *";
      } else if (interval === 3) {
        length_of_time = "0 8 1,10,20 * *";
      } else if (interval === 4) {
        length_of_time = "0 8 1,8,15,22 * *";
      }
    } else if (scheduleTiming === "yearly") {
      if (interval === 1) {
        length_of_time = "0 8 1 1 *";
      } else if (interval === 2) {
        length_of_time = "0 8 1 1,6 *";
      } else if (interval === 3) {
        length_of_time = "0 8 1 1,4,7 *";
      } else if (interval === 4) {
        length_of_time = "0 8 1 1,3,6,9 *";
      }
    }

    let total_payments = 0;

    if (scheduleTiming === "daily") {
      total_payments = total_days * interval;
    } else if (scheduleTiming === "weekly") {
      total_payments = (total_days / 7) * interval;
    } else if (scheduleTiming === "monthly") {
      total_payments = (total_days / 30) * interval;
    } else if (scheduleTiming === "yearly") {
      total_payments = (total_days / 365) * interval;
    }

    const total_cost = total_payments * transferAmount;
    setCronTimeString(length_of_time);
    setFundAmount(total_cost + allowanceAmount);

    setLoading(false);
  }

  // payer is the connected wallet
  async function createThread() {
    const threadId = "ikonshop" + publicKey.toString().slice(0, 4);
    const [threadAddress_a] = clockworkProvider.getThreadPDA(
      publicKey, // authority
      threadId
    );

    setThreadAddress(threadAddress_a.toString());
    const recipient = new web3.PublicKey(txRecipient);

    // 1️⃣  Prepare an instruction to be automated.
    const transferIx = SystemProgram.transfer({
      fromPubkey: PAYER_PUBKEY,
      toPubkey: recipient,
      lamports: transferAmount * LAMPORTS_PER_SOL,
    });

    // 2️⃣  Define a trigger condition. (every 10 seconds)
    const trigger = {
      cron: {
        schedule: cronTimeString,
        skippable: true,
      },
    };

    // 3️⃣ Create the thread.
    const ix = await clockworkProvider.threadCreate(
      publicKey, // authority
      threadId, // id
      [transferIx], // instructions
      trigger, // trigger
      fundAmount * LAMPORTS_PER_SOL // amount to fund the thread with
    );
    const tx = new Transaction().add(ix);
    const signature = await clockworkProvider.anchorProvider.sendAndConfirm(tx);
    setComplete(true);
    console.log(
      `🗺️  explorer: https://app.clockwork.xyz/threads/${threadAddress}?cluster=custom&customUrl=${connection.rpcEndpoint}\n`
    );

    // Check balance of recipient address
    await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
    let balance = (await connection.getBalance(recipient)) / LAMPORTS_PER_SOL;
    console.log(`✅ recipient balance: ${balance} SOL\n`);
    // expect(balance).to.eq(1);

    await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
    balance = (await connection.getBalance(recipient)) / LAMPORTS_PER_SOL;
    console.log(`✅ recipient balance: ${balance} SOL\n`);
    // expect(balance).to.eq(2);
  }

  const renderScheduleOptions = () => {
    // render schedule options for daily, weekly, monthly, yearly
    // convert those schedule options to cron format

    const availableScheduleOptions = ["daily", "weekly", "monthly", "yearly"];

    const handleCronFormat = (scheduleOption) => {
      setScheduleTiming(scheduleOption);
    };
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
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
          <label>Interval</label>
          {/* dropdown of numbers 1-4 */}
          <select
            style={{
              width: "186.5px",
            }}
            onChange={(e) => setInterval(parseInt(e.target.value))}
          >
            <option value="">Select your interval</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <label>Time Unit</label>
          <select
            style={{
              width: "186.5px",
            }}
            onChange={(e) => handleCronFormat(e.target.value)}
          >
            <option value="">Select your schedule</option>
            {availableScheduleOptions.map((scheduleOption) => {
              return <option value={scheduleOption}>{scheduleOption}</option>;
            })}
          </select>
        </div>
      </div>
    );
  };

  const renderPageOne = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <strong>New Payment</strong>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <label>To</label>
          <input
            style={{
              width: "450px",
            }}
            value={txRecipient}
            type="text"
            placeholder={txRecipient === "" ? "recipient address" : txRecipient}
            onChange={(e) => setTxRecipient(e.target.value)}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
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
            <label>Mint</label>
            <input type="text" placeholder="SOL" />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <label>Amount</label>
            <input
              type="text"
              placeholder="transfer amount"
              onChange={(e) => setTransferAmount(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <label>Memo</label>
          <input style={{ width: "450px" }} type="text" placeholder="memo" />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
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
            <label>Start at</label>
            {/* TODO: PUT IN DATE PICKER */}
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <label>End at</label>
            {/* TODO: PUT IN DATE PICKER */}
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
            />
          </div>
        </div>
        {renderScheduleOptions()}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginTop: "20px",
          }}
        >
          <button
            style={{
              width: "40%",
            }}
          >
            Cancel
          </button>
          <button
            style={{
              width: "40%",
            }}
            onClick={() => (calculateCost(), setPageDisplay("2"))}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  const renderPageTwo = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          width: "450px",
        }}
      >
        <strong>Confirm Payment</strong>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
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
            <strong>Recipient:</strong>
            <p
              style={{
                width: "100%",
              }}
            >
              {txRecipient}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
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
              <strong>Start Date</strong>
              <p
                style={{
                  width: "100%",
                }}
              >
                {
                  // format date to mm/dd/yyyy
                  startDate.getMonth() +
                    1 +
                    "/" +
                    startDate.getDate() +
                    "/" +
                    startDate.getFullYear()
                }
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
              <strong>Total # of Days</strong>
              <p
                style={{
                  width: "100%",
                }}
              >
                {parseInt(totalNumberOfDays)}
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
              <strong>End Date</strong>
              <p
                style={{
                  width: "100%",
                }}
              >
                {
                  // format date to mm/dd/yyyy
                  endDate.getMonth() +
                    1 +
                    "/" +
                    endDate.getDate() +
                    "/" +
                    endDate.getFullYear()
                }
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
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
              <strong>Interval</strong>
              <p
                style={{
                  width: "100%",
                }}
              >
                {interval}
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
              <strong>Schedule Timing:</strong>
              <p
                style={{
                  width: "100%",
                }}
              >
                {scheduleTiming}
              </p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "200px",
                }}
              >
                <strong>Transfer Amount:</strong>
                <p
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {transferAmount}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "200px",
                }}
              >
                <strong>Total # of Payments:</strong>
                <p
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {parseInt(totalNumberOfDays) * interval}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <strong>Gas + Rent: {allowanceAmount + rentAmount} </strong>
          {/* round down to nearest int */}
          <strong>Total: {fundAmount + allowanceAmount + rentAmount} </strong>
        </p>

        <p
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <strong>All txn's execute at 8:00am</strong>
          <strong>Thread ID: ikonshop{publicKey.toString().slice(0, 4)}</strong>
          {complete && (
            <a
              href={`https://app.clockwork.xyz/threads/${threadAddress}?cluster=custom&customUrl=${connection.rpcEndpoint}\n`}
              target="_blank"
            >
              Watch Here
            </a>
          )}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <button
            style={{
              width: "40%",
            }}
            onClick={() => setPageDisplay("1")}
          >
            Back
          </button>
          <button
            style={{
              minWidth: "40%",
              whiteSpace: "nowrap",
            }}
            onClick={createThread}
          >
            Start
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // make the background the subscription_bg.png
        // use cover to make it fit the screen
        backgroundImage: "url(/subscription_bg.png)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "fit-content",
          padding: "20px",
          backgroundColor: "#313d3da0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <h3
            style={{
              color: "#F76933",
              fontFamily: "Manrope",
            }}
          >
            Smart Contract Backed Subscriptions
          </h3>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <button
            onClick={() => (
              setShowCreate(!showCreate),
              setShowListings(false),
              setShowPurchased(false)
            )}
            style={{
              marginRight: "20px",
              borderRadius: "5px",
              padding: "10px",
              backgroundColor: "#9CBBBE",
              color: "white",
            }}
          >
            Create Subscription
          </button>
          <button
            style={{
              marginRight: "20px",
              borderRadius: "5px",
              padding: "10px",
              backgroundColor: "#9CBBBE",
              color: "white",
            }}
            onClick={() => (
              setShowListings(!showListings),
              setShowCreate(false),
              setShowPurchased(false)
            )}
          >
            View All Subscriptions
          </button>

          <button
            style={{
              marginRight: "20px",
              borderRadius: "5px",
              padding: "10px",
              backgroundColor: "#9CBBBE",
              color: "white",
            }}
            onClick={() => (
              setShowListings(false),
              setShowCreate(false),
              setShowPurchased(true)
            )}
          >
            View Purchased Subscriptions
          </button>
        </div>
      </div>

      {/* {showCreate && pageDisplay === "1" && renderPageOne()}
            {showCreate && pageDisplay === "2" && !loading && renderPageTwo() } */}
      {showCreate && <CreateClockwork />}
      {showListings && <ClockworkSettingsList />}
      {showPurchased && <PurchasedClockworkOrders />}
    </div>
  );
};

export default ClockWorkDashboard;
