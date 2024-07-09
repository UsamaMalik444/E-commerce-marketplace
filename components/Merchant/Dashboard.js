import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { config } from "@fortawesome/fontawesome-svg-core";
import { useWallet } from "@solana/wallet-adapter-react";
import { GetTotalUsers } from "../../lib/api";
import { checkMagicLogin } from "../../hooks/checkMagicLogin";
import styles from "../../styles/Merchant.module.css";
import Loading from "../Loading";
// MERCHANT COMPONENTS
import Create from "./Create";
import Orders from "./Orders";
import Products from "./Products";
import InvoiceOpen from "./Invoices/InvoiceOpen";
import PayRequests from "./PayRequests";
import StoreSettings from "./StoreSettings";
import Overview from "./Overview";
import Integrations from "./Integrations";

// import StoreData from "../../components/Merchant/StoreData";
import Subscriptions from "../../components/Merchant/Subscriptions/Subscriptions";
import { isMerchant } from "../../hooks/checkAllowance";
import {
  IoArrowBackOutline,
  IoInformationCircleOutline,
  IoLayersOutline,
  IoSettingsOutline,
  IoArrowForward,
  IoFileTrayFullOutline,
  IoBarChartOutline,
  IoRocketOutline,
  IoExtensionPuzzleOutline,
} from "react-icons/io5";
import { Magic } from "magic-sdk";
import { SolanaExtension } from "@magic-ext/solana";
import * as web3 from "@solana/web3.js";
import CheckingForWallet from "../LoadingWalletCheck";

config.autoAddCss = false;
const rpcUrl =
  "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7";

function MerchantDashboard() {
  const [loading, setLoading] = useState(true);
  const [checkingForWallet, setCheckingForWallet] = useState(true);
  const [userPublicKey, setUserPublicKey] = useState();

  const [activeMenu, setActiveMenu] = useState();
  const [totalUsers, setTotalUsers] = useState(0);
  const router = useRouter();
  const { publicKey } = useWallet();

  // MERCHANT DASHBOARD CONSTANTS
  const [showMerchantDash, setShowMerchantDash] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubHub, setShowSubHub] = useState(false);
  const [showPayRequests, setShowPayRequests] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [merchant, setMerchant] = useState(false);
  const [nftsOwned, setNftsOwned] = useState(0);

  const renderLoading = () => <Loading />;

  const checkForNfts = async (userPublicKey) => {
    var nfts = [];

    const axios = require("axios");
    (async () => {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const data = {
        jsonrpc: "2.0",
        id: 1,
        method: "qn_fetchNFTs",
        params: {
          wallet: userPublicKey,
          omitFields: ["provenance", "traits"],
          page: 1,
          perPage: 10,
        },
      };
      try {
        const response = await axios.post(
          "https://evocative-white-sheet.solana-mainnet.quiknode.pro/ca9325b56fe041e07278205c75ebaf769f65ea54/",
          data,
          config
        );
        const myNfts = response.data.result.assets;
        const ikonCollectionAddress =
          "EgVDqrPZAiNCQdf7zC2Lj8CVTv25YSwQRF2k8aTmGEnM";
        console.log("myNFTS", myNfts);
        for (var i = 0; i < myNfts.length; i++) {
          if (myNfts[i].collectionAddress === ikonCollectionAddress) {
            nfts.push(myNfts[i]);
          }
        }

        console.log("nfts in wallet", nfts);
        // console.log('wallet has ', number_of_nfts)
        // setNftsOwned(number_of_nfts)
        setNftsOwned(nfts.length);
        return;
      } catch (error) {
        console.log("error", error);
      }
    })();
  };

  const renderDisplay = () => (
    <div className={styles.merchant_container}>
      <Overview publicKey={userPublicKey} />
    </div>
  );

  const renderInvoices = () => (
    <div className={styles.merchant_container}>
      <InvoiceOpen owner={userPublicKey} />
    </div>
  );

  // MERCHANT DASHBOARD
  const renderMerchantDashboard = () => {
    return (
      <>
        <div className={styles.merchant_dashboard}>
          <button
            id="overview"
            disabled={!userPublicKey}
            className={
              activeMenu == "overview"
                ? "active_dash dash-button"
                : "dash-button"
            }
            onClick={() => (
              setShowInventory(false),
              setShowOrders(false),
              setShowCreate(false),
              setShowSettings(false),
              setShowSubHub(false),
              setShowPayRequests(false),
              setShowIntegrations(false),
              setActiveMenu("overview")
            )}
          >
            <IoBarChartOutline className={styles.side_icon} />
            <span id={styles.full_screen}>Overview</span>
          </button>

          <button
            id="products"
            disabled={!userPublicKey}
            className={
              activeMenu == "products"
                ? "active_dash dash-button"
                : "dash-button"
            }
            onClick={() => (
              setShowOrders(false),
              setShowCreate(false),
              setShowInventory(true),
              setShowSettings(false),
              setShowSubHub(false),
              setShowPayRequests(false),
              setShowIntegrations(false),
              setActiveMenu("products")
            )}
          >
            <IoLayersOutline className={styles.side_icon} />
            <span id={styles.full_screen}>Products</span>
          </button>
          {/* {nftsOwned > 0 &&
            <button
              id="products"
              disabled={!userPublicKey}
              className={
                activeMenu == "products"
                  ? "active_dash dash-button"
                  : "dash-button"
              }
              onClick={() => (
                setShowOrders(false),
                setShowCreate(false),
                setShowInventory(false),
                setShowSettings(false),
                setShowSubHub(false),
                setShowPayRequests(false),
                setShowIntegrations(false),
                setShowSubHub(true),
                setActiveMenu("subscriptions")
              )}
            >
              <IoLayersOutline className={styles.side_icon} />
              <span id={styles.full_screen}>SubHub</span>
            </button>
          } */}
          <button
            id="orders"
            disabled={!userPublicKey}
            className={
              activeMenu == "orders" ? "active_dash dash-button" : "dash-button"
            }
            onClick={() => (
              setShowInventory(false),
              setShowCreate(false),
              setShowOrders(true),
              setShowSettings(false),
              setShowSubHub(false),
              setShowPayRequests(false),
              setShowIntegrations(false),
              setActiveMenu("orders")
            )}
          >
            <IoFileTrayFullOutline className={styles.side_icon} />
            <span id={styles.full_screen}>Orders</span>
          </button>
          <button
            id="integrations"
            disabled={!userPublicKey}
            className={
              activeMenu == "integrations"
                ? "active_dash dash-button"
                : "dash-button"
            }
            onClick={() => (
              setShowOrders(false),
              setShowCreate(false),
              setShowInventory(false),
              setShowSettings(false),
              setShowSubHub(false),
              setShowPayRequests(false),
              setShowIntegrations(true),
              setActiveMenu("integrations")
            )}
          >
            <IoExtensionPuzzleOutline className={styles.side_icon} />
            <span id={styles.full_screen}>Integrations</span>
          </button>
          <button
            id="settings"
            disabled={!userPublicKey}
            className={
              activeMenu == "settings"
                ? "active_dash dash-button"
                : "dash-button"
            }
            onClick={() => (
              setShowOrders(false),
              setShowCreate(false),
              setShowInventory(false),
              setShowSettings(true),
              setShowSubHub(false),
              setShowPayRequests(false),
              setShowIntegrations(false),
              setActiveMenu("settings")
            )}
          >
            <IoSettingsOutline className={styles.side_icon} />
            <span id={styles.full_screen}>Settings</span>
          </button>
          {/* <button className="dash-button" onClick={() => router.push("/")}>
            <IoArrowBackOutline className={styles.side_icon} />
            <span id={styles.full_screen}>Back to Home</span>
          </button> */}
          {/* <div className={styles.ikonshop_users}>
            <ul>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
            <p>
              <strong>{totalUsers}</strong> merchants/users on IkonShop.
            </p>
          </div> */}
        </div>
        <hr style={{ border: "1px solid #e6e6e6" }} />
      </>
    );
  };

  const renderAllPayRequests = () => {
    return (
      <>
        <div className={styles.create_component}>
          <PayRequests publicKey={userPublicKey} />
        </div>
      </>
    );
  };

  const renderSubHubComponent = () => {
    return (
      <>
        <div className={styles.create_component}>
          <Subscriptions />
        </div>
      </>
    );
  };

  const renderCreateComponent = () => {
    return (
      <>
        <div className={styles.create_component}>
          <Create />
        </div>
      </>
    );
  };

  const renderOrdersComponent = () => {
    return (
      <>
        <div className={styles.create_component}>
          <Orders />
        </div>
      </>
    );
  };

  const renderInventoryComponent = () => {
    return (
      <>
        <div className={styles.create_component}>
          <Products />
        </div>
      </>
    );
  };

  const renderIntegrationsComponent = () => {
    return (
      <>
        <div className={styles.create_component}>
          <Integrations />
        </div>
      </>
    );
  };

  const renderSettingsComponent = () => {
    return (
      <>
        <div className={styles.create_component}>
          <StoreSettings />
        </div>
      </>
    );
  };

  const renderNotConnected = () => {
    return (
      <>
        <div>
          <div className={styles.connect_wallet}>
            <IoInformationCircleOutline className={styles.info_icon} />
            <div className={styles.connect_wallet_text}>
              <h4>Wallet not connected</h4>
              <p>Connect Your Wallet to Get Started</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderNotMerchant = () => {
    return (
      <>
        <div>
          <div className={styles.connect_wallet}>
            <IoInformationCircleOutline className={styles.info_icon} />
            <div className={styles.connect_wallet_text}>
              <h4>You are not a Merchant.</h4>
              <Link href="/register">
                <h4 style={{ cursor: "pointer", textDecoration: "underline" }}>
                  <IoRocketOutline className={styles.icon} />{" "}
                  <span>Click here to register.</span>
                </h4>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  };

  useEffect(() => {
    if (publicKey) {
      setUserPublicKey(publicKey.toString());
      //add window event listener for view_all_orders that sets showOrders to true
      window.addEventListener("view_all_orders", () => {
        console.log("view all orders triggered");
        setShowOrders(true);
      });
    }
  }, [publicKey]);

  useEffect(() => {
    // add event listener for productCreated
    window.addEventListener("productCreated", () => {
      try {
        setShowCreate(false);
        setShowInventory(true);
      } catch (err) {
        console.log(err);
      }
    });
    // SETTINGS CHECK
    const urlParams = new URLSearchParams(window.location.search);
    const settings = urlParams.get("merchantSettings");
    const merchProducts = urlParams.get("merchantProducts");
    if (urlParams.get("googleVerify") || urlParams.get("discordVerify")) {
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_KEY, {
        extensions: {
          solana: new SolanaExtension({
            rpcUrl,
          }),
        },
      });
      console.log("logging out for verify");
      async function logout() {
        await magic.user.logout();
      }
      logout();
    }
    if (settings === "true") {
      setShowSettings(true);
    }
    if (merchProducts === "true") {
      setShowCreate(false);
      setShowInventory(true);
    }
    if (!publicKey && !userPublicKey) {
      setLoading(false);
    }

    // SERVER CONSTANTS
    if (totalUsers === 0) {
      async function getUsers() {
        const data = await GetTotalUsers();
        console.log("users", data);
        setTotalUsers(data);
      }
      getUsers();
    }

    // EVENT LISTENERS
    window.addEventListener("magic-logged-in", () => {
      try {
        // if urlParams does not contain googleVerify or discordVerify then execute
        if (!urlParams.get("googleVerify") && !urlParams.get("discordVerify")) {
          const data = localStorage.getItem("userMagicMetadata");
          const user = JSON.parse(data);
          const pubKey = new web3.PublicKey(user.publicAddress);
          console.log("pubkey", pubKey.toString());
          setUserPublicKey(pubKey.toString());
        }
      } catch (e) {
        console.log(e);
      }
    });
    window.addEventListener("magic-logged-out", () => {
      try {
        setMagicUser(false);
        if (!publicKey) {
          setUserPublicKey(null);
        }
        localStorage.removeItem("userMagicMetadata");
      } catch (e) {
        console.log(e);
      }
    });
  }, [publicKey, userPublicKey]);

  useEffect(() => {
    async function checkAllowance() {
      await isMerchant(userPublicKey).then((data) => {
        if (data === true) {
          setMerchant(true);
          setLoading(false);
        } else {
          console.log("not a merchant");
          setMerchant(false);
          setLoading(false);
        }
      });
      console.log("****************************");
      await checkForNfts(userPublicKey);
    }
    if (userPublicKey) {
      checkAllowance();
    }
  }, [userPublicKey]);

  // use effect to add window event listeners
  useEffect(() => {
    window.addEventListener("merchant_show_overview", () => {
      setShowInventory(false),
        setShowOrders(false),
        setShowCreate(false),
        setShowSettings(false),
        setShowPayRequests(false);
      setShowIntegrations(false);
    });
    window.addEventListener("merchant_show_orders", () => {
      setShowOrders(true);
      setShowInventory(false),
        setShowCreate(false),
        setShowSettings(false),
        setShowSubHub(false),
        setShowPayRequests(false);
      setShowIntegrations(false);
    });
    window.addEventListener("merchant_show_inventory", () => {
      setShowInventory(true);
      setShowOrders(false),
        setShowCreate(false),
        setShowSettings(false),
        setShowSubHub(false),
        setShowPayRequests(false);
      setShowIntegrations(false);
    });
    window.addEventListener("merchant_show_create", () => {
      setShowInventory(false),
        setShowOrders(false),
        setShowCreate(true),
        setShowSubHub(false),
        setShowPayRequests(false);
      setShowIntegrations(false);
    });
    window.addEventListener("merchant_show_settings", () => {
      setShowSettings(true),
        setShowInventory(false),
        setShowOrders(false),
        setShowCreate(false),
        setShowSubHub(false),
        setShowPayRequests(false);
      setShowIntegrations(false);
    });
    window.addEventListener("merchant_show_integrations", () => {
      setShowSettings(false),
        setShowInventory(false),
        setShowOrders(false),
        setShowCreate(false),
        setShowSubHub(false),
        setShowPayRequests(false);
      setShowIntegrations(true);
    });
    window.addEventListener("merchant_show_products", () => {
      setShowInventory(true),
        setShowOrders(false),
        setShowCreate(false),
        setShowSettings(false),
        setShowSubHub(false),
        setShowPayRequests(false);
      setShowIntegrations(false);
    });
  }, []);

  useEffect(() => {
    // in 2 seconds set checkingForWallet to false
    const timer = setTimeout(() => {
      if (!checkingForWallet && !userPublicKey && !publicKey) {
        checkMagicLogin();
      }
      setCheckingForWallet(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [checkingForWallet]);

  return (
    <div
      className={!checkingForWallet ? styles.parent_container : null}
      // if checkingForWallet is true then set the display to column
      style={
        checkingForWallet ? { display: "flex", flexDirection: "column" } : null
      }
    >
      {/* <DashboardHeader /> */}
      {showMerchantDash && !checkingForWallet ? (
        renderMerchantDashboard()
      ) : (
        <CheckingForWallet
          style={{
            width: "100%",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
      <div className={styles.main_container}>
        {userPublicKey && !checkingForWallet && loading
          ? renderLoading()
          : null}
        {!userPublicKey && !publicKey && !loading && checkingForWallet && (
          <CheckingForWallet />
        )}
        {!userPublicKey && !checkingForWallet && !loading
          ? renderNotConnected()
          : null}
        {userPublicKey && !checkingForWallet && loading
          ? renderLoading()
          : null}

        {userPublicKey &&
        merchant &&
        !checkingForWallet &&
        !loading &&
        !showCreate &&
        !showOrders &&
        !showSubHub &&
        !showInventory &&
        !showIntegrations &&
        !showSettings
          ? renderDisplay()
          : null}
        {merchant && userPublicKey && showPayRequests && renderAllPayRequests()}
        {merchant && userPublicKey && showCreate && renderCreateComponent()}
        {merchant && userPublicKey && showOrders && renderOrdersComponent()}
        {merchant &&
          userPublicKey &&
          showSubHub &&
          nftsOwned > 0 &&
          renderSubHubComponent()}
        {merchant &&
          userPublicKey &&
          showInventory &&
          renderInventoryComponent()}
        {merchant &&
          userPublicKey &&
          showIntegrations &&
          renderIntegrationsComponent()}
        {merchant && userPublicKey && showSettings && renderSettingsComponent()}
        {!merchant && userPublicKey && !loading ? renderNotMerchant() : null}
      </div>
    </div>
  );
}
export default MerchantDashboard;
