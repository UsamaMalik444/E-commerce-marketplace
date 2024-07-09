import { useState, useEffect, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import styles from "../../styles/Printful.module.css";
import Link from "next/link";
import Image from "next/image";
import { getCollectionOwner, updateCollectionPrintfulKey } from "../../lib/api";
import { IoLogoTwitter, IoStorefrontOutline } from "react-icons/io5";

const PrintfulDashboard = () => {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [userPublicKey, setUserPublicKey] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Store Info
  const [isOwner, setIsOwner] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [verified, setVerified] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [newCollectionInfo, setNewCollectionInfo] = useState({
    id: "null",
    printfulKey: "null",
  });

  const renderNotMerchant = () => {
    return (
      <div className={styles.not_merchant}>
        <h1>Not a merchant?</h1>
        <p>
          If you are not a merchant, you can still create a collection and sell
          your products on IkonShop.
          <br />
          <br />
          Register
          <Link href="/register/merchant">
            <a
              target="_blank"
              style={{ color: "blue", textDecoration: "underline" }}
            >
              {" "}
              here{" "}
            </a>
          </Link>
          to get started.
        </p>
      </div>
    );
  };
  // this will be a series of modal windows that will walk the user through the process of creating a printful api key
  const renderModal = () => {
    switch (currentStep) {
      case 0: {
        return (
          <div className={styles.step_modal}>
            <h1>Step 1</h1>
            <p>
              Go to
              <Link style={{ color: "blue" }} href="https://www.printful.com/">
                <a target="_blank"> printful.com </a>
              </Link>
              and create an account or login
            </p>
            <Image
              src="https://media.graphassets.com/gz146WiHRbqP6uVHpVVu"
              className={styles.image}
              height={400}
              width={800}
            />
            <div className={styles.button_container}>
              <button
                className={styles.next_button}
                onClick={() => setCurrentStep(1)}
              >
                Next
              </button>
            </div>
          </div>
        );
      }
      case 1: {
        return (
          <div className={styles.step_modal}>
            <h1>Step 2</h1>
            <p>
              Do you already have a <strong>Manual Store</strong> in Printful?
            </p>
            <Link href="https://www.printful.com/dashboard/store">
              <a target="_blank">Check here.</a>
            </Link>
            <div className={styles.yes_button_container}>
              <button
                className={styles.yes_button}
                onClick={() => setCurrentStep(4)}
              >
                Yes
              </button>
              <button
                className={styles.no_button}
                onClick={() => setCurrentStep(2)}
              >
                No
              </button>
            </div>
            <div className={styles.button_container}>
              <button
                className={styles.back_button}
                onClick={() => setCurrentStep(0)}
              >
                Back
              </button>
            </div>
          </div>
        );
      }
      case 2: {
        return (
          <div className={styles.step_modal}>
            <h1>Step 3</h1>
            <p>
              Select the 'Manual order platform / API' option and provide a name
              for your store.
            </p>
            <Image
              src="https://media.graphassets.com/PN5qrsSQ7qjcMOO9jMjA"
              className={styles.image}
              height={300}
              width={500}
            />
            <span>
              this name is what will be displayed on the printful packing slips
              included in your orders
            </span>
            <div className={styles.button_container}>
              <button
                className={styles.back_button}
                onClick={() => setCurrentStep(1)}
              >
                Back
              </button>
              <button
                className={styles.next_button}
                onClick={() => setCurrentStep(3)}
              >
                Next
              </button>
            </div>
          </div>
        );
      }
      case 3: {
        return (
          <div className={styles.step_modal}>
            <h1>Step 4</h1>
            <p>
              Now you have a store! If you already have products in your store,
              you can skip this step, otherwise check out the printful video to
              learn how to add products to your store.
            </p>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/aTuGdRlpJHc"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
            <div className={styles.button_container}>
              <button
                className={styles.back_button}
                onClick={() => setCurrentStep(2)}
              >
                Back
              </button>
              <button
                className={styles.next_button}
                onClick={() => setCurrentStep(4)}
              >
                Next
              </button>
            </div>
          </div>
        );
      }
      case 4: {
        return (
          <div className={styles.step_modal}>
            <h1>Step 5</h1>
            <p>
              Now that we have a Printful Store and products ready to be printed
              and shipped.
              <br />
              <br />
              Let's get the API key so we can display/sell the products on
              IkonShop.
              <br />
              <br />
              Head over to Printful's Developer Portal
              <a
                href="https://developers.printful.com/"
                target="_blank"
                style={{ color: "blue" }}
              >
                {" "}
                here.{" "}
              </a>
              <br />
              <br />
              Then, select <strong>Create a token</strong> on the{" "}
              <strong>Private Token</strong> option.
            </p>
            <Image
              src="https://media.graphassets.com/KUjB9X1pQaCYL6Bt49ts?_gl=1*1uhzia0*_ga*MjA2NTY0MDczNS4xNjc0NzY4Mjk3*_ga_G6FYGSYGZ4*MTY4MjA5MTE3MS4xNzQuMC4xNjgyMDkxMTcxLjYwLjAuMA.."
              className={styles.image}
              height={400}
              width={500}
            />
            <div className={styles.button_container}>
              <button
                className={styles.back_button}
                onClick={() => setCurrentStep(3)}
              >
                Back
              </button>
              <button
                className={styles.next_button}
                onClick={() => setCurrentStep(5)}
              >
                Next
              </button>
            </div>
          </div>
        );
      }
      case 5: {
        return (
          <div className={styles.step_modal}>
            <h1>Step 6</h1>
            <p>
              Fill out the necessary details, making sure to select the proper
              store and all scopes.
            </p>
            <Image
              src="https://media.graphassets.com/CXHaP6xjTSCjodXUEvNQ?_gl=1*1bbgaf5*_ga*MjA2NTY0MDczNS4xNjc0NzY4Mjk3*_ga_G6FYGSYGZ4*MTY4MjA5MTE3MS4xNzQuMC4xNjgyMDkxMTcxLjYwLjAuMA.."
              className={styles.image}
              height={400}
              width={500}
            />
            <div>
              <button
                className={styles.back_button}
                onClick={() => setCurrentStep(4)}
              >
                Back
              </button>
              <button
                className={styles.next_button}
                onClick={() => setCurrentStep(6)}
              >
                Next
              </button>
            </div>
          </div>
        );
      }
      case 6: {
        return (
          <div className={styles.step_modal}>
            <h1>Step 7</h1>
            <p>
              Printful does not store your key, so copy/save it somewhere or
              just create a new one if you forget it.
              <br />
              <br />
            </p>
            <Image
              src="https://media.graphassets.com/5edoXIbWQYybtSsrdvRG?_gl=1*1bbgaf5*_ga*MjA2NTY0MDczNS4xNjc0NzY4Mjk3*_ga_G6FYGSYGZ4*MTY4MjA5MTE3MS4xNzQuMC4xNjgyMDkxMTcxLjYwLjAuMA.."
              className={styles.image}
              height={200}
              width={700}
            />
            <br />
            <p>
              Now, let's link it to your store.
              <br />
              <br />
              Input your Printful API key below and click the 'Connect' button.
            </p>
            <input
              type="text"
              placeholder="API Key"
              onChange={(e) =>
                setNewCollectionInfo({
                  ...newCollectionInfo,
                  printfulKey: e.target.value,
                })
              }
            />
            <button
              className={styles.yes_button}
              onClick={() => {
                updateCollectionPrintfulKey(newCollectionInfo).then((data) => {
                  setConnecting(true);
                  setTimeout(() => {
                    setCurrentStep(7);
                  }, 2000);
                });
              }}
            >
              {!connecting ? "Connect" : "Loading..."}
            </button>
            <div className={styles.button_container}>
              <button
                className={styles.back_button}
                onClick={() => setCurrentStep(5)}
              >
                Back
              </button>
            </div>
          </div>
        );
      }
      case 7: {
        return (
          <div className={styles.step_modal}>
            <h1>Step 8</h1>
            <p>
              You're all set!
              <br />
              <br />
              You can now sell your Printful products on IkonShop.
              <br />
              <br />
              Let's check it out!
            </p>

            {storeInfo.slug != null &&
            storeInfo.slug != undefined &&
            storeInfo.slug != "" ? (
              <Link href={`/store/${storeInfo.slug}`}>
                <button className={styles.yes_button}>
                  <IoStorefrontOutline /> Go to your store
                </button>
              </Link>
            ) : (
              <Link href={`/dashboard?merchantSettings=true`}>
                <button className={styles.yes_button}>
                  <IoStorefrontOutline /> Set up your store URL
                </button>
              </Link>
            )}
            {/* button to send tweet saying I just linked my print on demand store to IkonShop, check it out! */}
            <button
              onClick={() => {
                window.open(
                  `https://twitter.com/intent/tweet?text=I%20just%20linked%20my%20print%20on%20demand%20store%20to%20IkonShop,%20check%20it%20out!&url=https://ikonshop.com/store/${storeInfo.slug}&hashtags=ikonshop,printful,printondemand`
                );
              }}
              className={styles.yes_button}
            >
              <IoLogoTwitter /> Tweet it out!
            </button>
            <div className={styles.button_container}>
              <button
                className={styles.back_button}
                onClick={() => setCurrentStep(6)}
              >
                Back
              </button>
              <button
                className={styles.next_button}
                onClick={() => setCurrentStep(8)}
              >
                Next
              </button>
            </div>
          </div>
        );
      }
      default: {
        return (
          <div className={styles.step_modal}>
            <h1>Step 1</h1>
            <p>Go to printful.com and create an account</p>

            <div className={styles.button_container}>
              <button
                className={styles.next_button}
                onClick={() => setCurrentStep(1)}
              >
                Next
              </button>
            </div>
          </div>
        );
      }
    }
  };

  useEffect(() => {
    if (publicKey) {
      setUserPublicKey(publicKey.toString());
    }
  }, [publicKey]);

  useEffect(() => {
    if (userPublicKey) {
      (async () => {
        const store_info = await getCollectionOwner(userPublicKey);
        console.log(store_info);
        if (store_info.collections.length == 0) {
          setIsOwner(false);
          setLoading(false);
          return;
        }

        setStoreInfo(store_info.collections[0]);
        setVerified(store_info.collections[0].verified);
        setNewCollectionInfo(store_info.collections[0]);
        if (store_info.wallets[0].apiKey != null) {
          setApiKey(store_info.wallets[0].apiKey.key);
        }
        setIsOwner(true);
        setLoading(false);
      })();
    }
  }, [userPublicKey]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
        flexDirection: "column",
      }}
    >
      {userPublicKey && isOwner && !loading && <div>{renderModal()}</div>}
      {userPublicKey && !isOwner && renderNotMerchant()}
      {!userPublicKey && <h1>Not Connected</h1>}
    </div>
  );
};

export default PrintfulDashboard;
