// @ts-nocheck
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createClockworkSettings } from "../../lib/Clockwork/api";
import { set } from "@project-serum/anchor/dist/cjs/utils/features";

const CreateClockwork = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [token, setToken] = useState("sol");
  const [cronJobTiming, setCronJobTiming] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("8");
  const [wording, setWording] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [owner, setOwner] = useState("");
  const { publicKey } = useWallet();

  const [loading, setLoading] = useState(false);

  const [complete, setComplete] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const renderPageOne = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {!loading && !complete && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <h3>Create Subscription</h3>
            <form>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                <label htmlFor="description">Description</label>
                {/* this input should be for multi-line text  */}
                <input
                  id="description"
                  type="text"
                  value={description}
                  style={{
                    height: "100px",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    overflow: "hidden",
                    resize: "none",
                  }}
                  onChange={(e) => setDescription(e.target.value)}
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
                <label htmlFor="price">
                  Price <strong>(SOL)</strong>
                </label>
                <input
                  id="price"
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
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
                {/* <label htmlFor="token">Token</label>
                        <input
                            id="token"
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                        /> */}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <label htmlFor="length">When should this renew?</label>
                <select
                  id="length"
                  value={wording}
                  // setCronJobTiming needs to have quotations at the beginning and end
                  onChange={(e) => setWording(e.target.value)}
                >
                  <option value="">Select interval</option>
                  <option value="Test">Test</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <button
                onClick={() => setCurrentPage(2)}
                style={{
                  marginRight: "20px",
                  borderRadius: "5px",
                  padding: "10px",
                  backgroundColor: "#9CBBBE",
                  color: "white",
                }}
              >
                Continue
              </button>
            </form>
          </div>
        )}
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
          width: "60vw",
          gap: "20px",
        }}
      >
        <form>
          <strong>
            This subscription will charge the user {price} {token} {wording}.
            <br />
            The subscription will attempt to auto renew, but the user has to
            have funds in the subscription account.
            <br />
            The user can pause and resume the subscription at any time.
            <br />
            {cronJobTiming}
          </strong>
          {/* )} */}
        </form>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => setCurrentPage(1)}
            style={{
              marginRight: "20px",
              borderRadius: "5px",
              padding: "10px",
              backgroundColor: "#9CBBBE",
              color: "white",
            }}
          >
            Back
          </button>
          <button
            onClick={async (e) => {
              e.preventDefault();
              setLoading(true);
              await createClockworkSettings({
                title,
                description,
                price,
                token,
                cronJobTiming,
                totalDays,
                owner,
                wording,
              });
              setLoading(false);
              setComplete(true);
            }}
            style={{
              marginRight: "20px",
              borderRadius: "5px",
              padding: "10px",
              backgroundColor: "#9CBBBE",
              color: "white",
            }}
          >
            Create Clockwork Settings
          </button>
        </div>
      </div>
    );
  };
  useEffect(() => {
    if (publicKey) {
      setOwner(publicKey.toString());
    }
  }, [publicKey]);

  useEffect(() => {
    switch (cronJobTiming) {
      case "0 8 */1 * *":
        setWording("every day");
        setTotalDays("1");
        break;
      case "0 8 * * */7":
        setWording("every week");
        setTotalDays("7");
        break;
      case "0 8 * */1 *":
        setWording("every month");
        setTotalDays("30");
        break;
      case "0 8 * */12 *":
        setWording("every year");
        setTotalDays("365");
        break;
      default:
        setWording("");
        break;
    }
  }, [cronJobTiming]);

  useEffect(() => {
    function generateMonthlyCronJob() {
      const currentDate = new Date();

      // Extract current date/time components
      const minutes = currentDate.getMinutes() + 5;
      const hours = currentDate.getHours();
      const dayOfMonth = currentDate.getDate();

      // Generate cron job string
      const cronJobString = `${minutes} ${hours} ${dayOfMonth} 1 *`;
      console.log("cronJobString", cronJobString);
      return cronJobString;
    }

    function generateWeeklyCronJob() {
      const currentDate = new Date();

      // Extract current date/time components
      const minutes = currentDate.getMinutes() + 5;
      const hours = currentDate.getHours();
      const dayOfWeek = currentDate.getDay();

      // Generate cron job string
      const cronJobString = `${minutes} ${hours} * * ${dayOfWeek}`;
      console.log("cronJobString", cronJobString);
      return cronJobString;
    }

    function generateDailyCronJob() {
      const currentDate = new Date();

      // Extract current date/time components
      const minutes = currentDate.getMinutes() + 5;
      const hours = currentDate.getHours();

      // Generate cron job string
      const cronJobString = `${minutes} ${hours} * * *`;
      console.log("cronJobString", cronJobString);
      return cronJobString;
    }

    function generateYearlyCronJob() {
      const currentDate = new Date();

      // Extract current date/time components
      const minutes = currentDate.getMinutes() + 5;
      const hours = currentDate.getHours();
      const dayOfMonth = currentDate.getDate();
      const month = currentDate.getMonth();

      // Generate cron job string
      const cronJobString = `${minutes} ${hours} ${dayOfMonth} ${month} *`;
      console.log("cronJobString", cronJobString);
      return cronJobString;
    }
    if (wording === "every day") {
      setCronJobTiming(generateDailyCronJob());
    }
    if (wording === "every week") {
      setCronJobTiming(generateWeeklyCronJob());
    }
    if (wording === "every month") {
      setCronJobTiming(generateMonthlyCronJob());
    }
    if (wording === "every year") {
      setCronJobTiming(generateYearlyCronJob());
    }
  }, [wording]);

  useEffect(() => {
    if (complete) {
      setTitle("");
      setDescription("");
      setPrice("");
      setToken("");
      setCronJobTiming("");
      setTimeOfDay("");
      setTotalDays("");
      setOwner("");
      setTimeout(() => {
        setComplete(false);
      }, 2000);
    }
  }, [complete]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "fit-content",
        border: "1px solid black",
        borderRadius: "10px",
        padding: "20px",
        backgroundColor: "#fbe7c6d0",
      }}
    >
      {currentPage === 1 && renderPageOne()}
      {currentPage === 2 && renderPageTwo()}
      {complete && <p>Complete!</p>}
    </div>
  );
};

export default CreateClockwork;
