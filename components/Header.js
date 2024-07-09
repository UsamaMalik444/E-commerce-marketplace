import React, { useEffect, useState } from "react";
// import { Magic } from "magic-sdk";
// import { SolanaExtension } from "@magic-ext/solana";
import { Magic } from "magic-sdk";
import { SolanaExtension } from "@magic-ext/solana";
import {
  CheckForWallet,
  CreateWallet,
  getCollectionOwner,
  CheckForCollectionByOwner,
  UpdateWallet,
} from "../lib/api";
import { isMerchant, isUser, addUser } from "../hooks/checkAllowance";
import Link from "next/link";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import { checkMagicLogin } from "../hooks/checkMagicLogin";
import "bootstrap/dist/css/bootstrap.min.css";
import { LogoDiscord, LogoTwitter } from "react-ionicons";
import dynamic from "next/dynamic";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import LoginMagic from "./MagicWallet/login";
import QuickActions from "./MagicWallet/quickActions";
import {
  IoLogInOutline,
  IoLogOutOutline,
  IoWalletOutline,
  IoCloseOutline,
  IoPerson,
  IoStorefront,
  IoMailOutline,
  IoChevronBack,
  IoCart,
  IoPersonCircle,
  IoChevronDown,
  IoPersonOutline,
} from "react-icons/io5";
// import LoginMagic from "./MagicWallet/login";
// import LogoutMagic from "./MagicWallet/logout";
// import QuickActions from "./MagicWallet/quickActions";
import { getBalance, getUsdcBalance } from "../hooks/getBalance";
import Cart from "./Checkout/Cart";
import * as web3 from "@solana/web3.js";
import styles from "../styles/Header.module.css";
import DarkModeToggle from "./DarkModeToggle";
import tokens from "../constants/tokens";
import Divider from "@mui/material/Divider";

const connection = new web3.Connection(
  "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7",
  "confirmed"
);

// import Head from "next/head";

export default function HeaderComponent() {
  const { publicKey, connected, disconnect } = useWallet();
  const router = useRouter();
  const currentPath = router.pathname;
  const [showMenu, setShowMenu] = useState(false);
  const [showStoreSymbol, setShowStoreSymbol] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [loginOptionSelected, setLoginOptionSelected] = useState("");
  const [userPublicKey, setUserPublicKey] = useState("");
  const [merchant, setMerchant] = useState(null);
  const [user, setUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentWallet, setCurrentWallet] = useState([]);
  const [cartNotifications, setCartNotifications] = useState([]);

  // BROWSER WALLET
  const WalletMultiButton = dynamic(
    async () =>
      (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
  );
  // MAGIC WALLET
  const [showMagicLogin, setShowMagicLogin] = useState(false);
  const [magicMetadata, setMagicMetadata] = useState(null);
  const [magicUser, setMagicUser] = useState(false);
  const [email, setEmail] = useState(null);
  const [magicPublicKey, setMagicPublicKey] = useState(null);
  const [magicBalance, setMagicBalance] = useState(0);
  const [magicUsdcBalance, setMagicUsdcBalance] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [click, setClick] = React.useState(false);

  const [walletSolBalance, setWalletSolBalance] = useState("");
  const [walletUsdcBalance, setWalletUsdcBalance] = useState("");
  const [showWalletBalance, setShowWalletBalance] = useState(false);

  const handleClick = () => setClick(!click);
  const Close = () => setClick(false);

  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleOptionSelect = (option) => {
    // Handle the selected option here
    console.log("Selected option:", option);
  };

  // // Dark Mode img
  const [isDarkMode, setIsDarkMode] = useState();

  useEffect(() => {
    if (typeof window !== "undefined") {
      let theme = localStorage.getItem("ikonshop-theme");
      if (theme === "dark") {
        setIsDarkMode(true);
      } else {
        setIsDarkMode(false);
      }
      let notification = localStorage.getItem("cart");
      let parseNotification = JSON.parse(notification);
      if (parseNotification) {
        setCartNotifications(parseNotification.length);
      }
      // setCartNotifications(parseNotification.length);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      let notification = localStorage.getItem("cart");
      let parseNotification = JSON.parse(notification);
      if (parseNotification) {
        setCartNotifications(parseNotification.length);
      }
      // setCartNotifications(parseNotification.length);
    };

    window.addEventListener("storageEvent", handleStorageChange);

    return () => {
      window.removeEventListener("storageEvent", handleStorageChange);
    };
  }, []);
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  //     let theme = localStorage.getItem("ikonshop-theme");

  //     const handleChange = (e) => {
  //       console.log(e.matches, "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
  //       setIsDarkMode(e.matches);
  //     };

  //     mediaQuery.addEventListener("change", handleChange);

  //     return () => {
  //       mediaQuery.removeEventListener("change", handleChange);
  //     };
  //   }
  // }, []);

  // const imageSrc = isDarkMode ? "/newlogo.png" : "/ikonshop-logowhite.png";

  //wallet check
  const connection = new web3.Connection(
    "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7",
    "confirmed"
  );
  const rpcUrl =
    "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7";

  const handleLogout = async () => {
    if (publicKey) {
      await disconnect();
      setUserPublicKey("");
      setMerchant(false);
    }
    if (magicUser) {
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_KEY, {
        extensions: {
          solana: new SolanaExtension({
            rpcUrl,
          }),
        },
      });
      await magic.user.logout();
      localStorage.setItem("userMagicMetadata", null);
      window.dispatchEvent(new CustomEvent("magic-logged-out"));
      setMagicPublicKey("");
      setMagicUser(false);
    }
  };
  const renderQuickActions = () => {
    return (
      <div className={styles.quickActions}>
        <QuickActions
          magicMetadata={magicMetadata}
          magicPublicKey={magicPublicKey}
          magicBalance={magicBalance}
          magicUsdcBalance={magicUsdcBalance}
        />
      </div>
    );
  };

  const renderHeaderMenu = () => {
    return (
      <div className={styles.menuContainer}>
        {/* <div
          onClick={() => (
            setShowMenu(false),
            setShowLoginOptions(false),
            setLoginOptionSelected("")
          )}
          className={styles.menuOverlay}
        ></div> */}

        {/* if currentpath is /dashboard then renderDashToggle */}
        {!magicUser && userPublicKey && (
          <div
            style={{ minWidth: "98px" }}
            onClick={() => setShowWalletBalance(!showWalletBalance)}
            // className="nav-links"
          >
            {/* <IoWalletOutline /> */}
            <div
              // hidden={!showWalletBalance}
              // style should be small modal pop up in middle of screen
              className={styles.walletBalance}
            >
              <div className={styles.walletBalanceItem}>
                <img
                  // find token where symbol === SOL
                  src={tokens.find((token) => token.symbol === "SOL").logo}
                  alt="sol"
                  style={{ width: "16px", height: "16px" }}
                />
                <span>
                  {walletSolBalance ? walletSolBalance.toFixed(2) : "---"}
                </span>
              </div>
              <div className={styles.walletBalanceItem}>
                <img
                  src={tokens.find((token) => token.symbol === "USDC").logo}
                  alt="usdc"
                  style={{ width: "16px", height: "16px" }}
                />
                <span>
                  {walletUsdcBalance ? walletUsdcBalance.toFixed(2) : "---"}
                </span>
              </div>
            </div>
          </div>
        )}
        {userPublicKey && currentPath === "/dashboard" && renderDashToggle()}
        {userPublicKey && !merchant && currentPath != "/dashboard" && (
          <Link href="/dashboard">
            <a
              // onClick={() => (
              //   setShowMenu(false),
              //   setShowLoginOptions(false),
              //   setShowQuickActions(false)
              // )}
              className="nav-links"
            >
              <span>Dashboard</span>
            </a>
          </Link>
        )}
        {userPublicKey && merchant && currentPath != "/dashboard" && (
          <Link href="/dashboard">
            <a
              // onClick={() => (
              //   setShowMenu(false),
              //   setShowLoginOptions(false),
              //   setShowQuickActions(false)
              // )}
              className="nav-links"
            >
              <span>Dashboard</span>
            </a>
          </Link>
        )}

        {/* LOGIN LINK */}
        {!userPublicKey && (
          <>
            <Link href="/features">
              <a
                style={{ marginTop: "7px", fontWeight: "500" }}
                className="nav-links"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>FEATURES</span>
              </a>
            </Link>
            <div
              style={{ width: "160px" }}
              onClick={() => (
                setShowLoginOptions(true), setShowQuickActions(false)
              )}
            >
              <IoLogInOutline className={styles.icon} />
              <span className={styles.connectApp}>Connect to App</span>
            </div>
          </>
        )}
        {/* {!merchant && userPublicKey && (
          <div
            onClick={() => (
              router.push("/register"),
              setShowLoginOptions(false),
              setShowQuickActions(false)
            )}
            className="nav-links"
          >
            <span>Register as Merchant</span>
          </div>
        )} */}
        {/* MAGIC QUICK ACTION LINK */}
        {magicUser && (
          <div
            onClick={() => (
              setShowQuickActions(!showQuickActions),
              setShowLoginOptions(false),
              setShowMenu(false)
            )}
            className="nav-links"
          >
            <span>Wallet</span>
          </div>
        )}

        {/* LOGGED IN  */}
        {userPublicKey != "" && (
          <div className="profile_link_container">
            <div
              onClick={() => (toggleDropdown(), setShowQuickActions(false))}
              className="nav-links profile_link"
            >
              <IoPersonCircle className={styles.icon} />
              <span className={styles.walletAddress}>
                {userPublicKey.slice(0, 4)}...
                {userPublicKey.slice(-4)}{" "}
              </span>
              <IoChevronDown className={styles.icon} />
              {showDropdown && (
                <ul className="dropdown_menu">
                  <li>
                    <a href={`https://ikonshop.io/profile/${userPublicKey}`}>
                      <IoPersonOutline />
                      <span>Profile</span>
                    </a>
                  </li>
                  <li onClick={handleLogout}>
                    <IoLogOutOutline />
                    <span>Logout</span>
                  </li>
                </ul>
              )}
            </div>

            <div className="profile_link_mobile">
              <div>
                <IoPersonCircle />
                <span>
                  {userPublicKey.slice(0, 4)}...
                  {userPublicKey.slice(-4)}{" "}
                </span>
              </div>
              <ul style={{ paddingLeft: "0rem" }}>
                <li>
                  <a href={`https://ikonshop.io/profile/${userPublicKey}`}>
                    <IoPersonOutline />
                    <span>Profile</span>
                  </a>
                </li>
                <li onClick={handleLogout}>
                  <IoLogOutOutline />
                  <span>Logout</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* SOCIALS */}
        {/* <div className={styles.socialItem}>
          <a href="https://discord.com/invite/ikons">
            <IoLogoDiscord className={styles.socialIcon} />
          </a>
          <a href="https://twitter.com/ikonshopapp">
            {" "}
            <IoLogoTwitter className={styles.socialIcon} />
          </a>
        </div> */}
        <div className={styles.socialItem} style={{ position: "relative" }}>
          {cartNotifications > 0 && (
            <div
              style={{
                position: "absolute",
                backgroundColor: "red",
                color: "white",
                borderRadius: "50%",
                width: 15,
                height: 15,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 10,
                right: "-6px",
                padding: "5px",
                top: "-5px",
              }}
            >
              {cartNotifications}
            </div>
          )}
          <IoCart
            onClick={() => setCartOpen(!cartOpen)}
            className={styles.socialIcon}
          />
        </div>
        <DarkModeToggle setIsDarkMode={setIsDarkMode} />
        {/* <button onClick={switchTheme}>Change</button> */}
      </div>
    );
  };

  const renderEmailLogin = () => {
    return (
      <div className={styles.loginOptions_select}>
        Email:
        <LoginMagic />
        <div
          onClick={() => setLoginOptionSelected("")}
          className={styles.loginOption_ind_flex}
        >
          <IoChevronBack />
          <span>Back</span>
        </div>
      </div>
    );
  };

  const renderWalletLogin = () => {
    return (
      <div className={styles.loginOptions_select}>
        Browser Wallet:
        <WalletMultiButton
          style={{
            borderRadius: "50px",
            background: "#130b46",
            width: "240px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Manrope",
          }}
        />
        <div
          onClick={() => setLoginOptionSelected("")}
          className={styles.loginOption_ind_flex}
        >
          <IoChevronBack />
          <span>Back</span>
        </div>
      </div>
    );
  };

  const renderLoginOptionsSelect = () => {
    return (
      <div className={styles.loginOptions_select}>
        <h3>Connect with:</h3>

        <div
          className={styles.loginOption1}
          onClick={() => setLoginOptionSelected("email")}
        >
          <IoMailOutline />
          <span>Email</span>
        </div>
        <div
          className={styles.loginOption2}
          onClick={() => setLoginOptionSelected("wallet")}
        >
          <IoWalletOutline />
          <span>Browser Wallet</span>
        </div>
      </div>
    );
  };

  const renderLoginOptions = () => {
    return (
      <div className={styles.loginOptions}>
        <div className={styles.loginOptions_container}>
          {loginOptionSelected === "email" && renderEmailLogin()}
          {loginOptionSelected === "wallet" && renderWalletLogin()}
          {loginOptionSelected === "" && renderLoginOptionsSelect()}
          <button
            className={styles.closeButton}
            onClick={() => (
              setShowLoginOptions(false), setLoginOptionSelected("")
            )}
          >
            <IoCloseOutline />
          </button>
        </div>
      </div>
    );
  };

  const renderDashToggle = () => {
    return (
      <>
        {!loading && (
          <div className={styles.toggleItem}>
            <div
              id="container"
              onClick={() =>
                showStoreSymbol
                  ? window.dispatchEvent(new Event("toggle-user"))
                  : window.dispatchEvent(new Event("toggle-merchant"))
              }
            >
              {!showStoreSymbol ? (
                <div id="target" className="moon">
                  <IoPerson className="moon_tog" />
                </div>
              ) : (
                <div id="target" className="sun">
                  <IoStorefront className="sunny_tog" />
                </div>
              )}
            </div>
            <span className={styles.headerToggle}>
              {showStoreSymbol ? "Switch to User" : "Switch to Merchant"}
            </span>
          </div>
        )}
      </>
    );
  };

  async function gatherMagicData() {
    try {
      const data = localStorage.getItem("userMagicMetadata");
      const parsedData = await JSON.parse(data);

      const magicKey = new web3.PublicKey(parsedData.publicAddress);
      await getBalance(magicKey).then(() => {
        setMagicBalance(magicBalance);
      });
      await getUsdcBalance(magicKey).then(() => {
        setMagicUsdcBalance(magicUsdcBalance);
      });
      setMagicMetadata(parsedData);
      setUserPublicKey(magicKey.toString());
      setMagicUser(true);
      // TODO: Delete
      console.log('check wallet')
      //
      const getData = async () => {
        console.log('check wallet')
        await CheckForWallet(magicKey.toString()).then((walletData) => {
          console.log(walletData);
          if (walletData === null) {
            const newWallet = CreateWallet(
              magicKey.toString(),
              parsedData.email
            );
          }
        });
        await CheckForCollectionByOwner(magicKey.toString()).then(
          (collectionData) => {
            if (collectionData) {
              setMerchant(true);
            } else {
              setMerchant(false);
            }
          }
        );
      };
      getData();
    } catch (e) {
      console.log("error: ", e);
    }
  }

  useEffect(() => {
    if (publicKey && magicUser) {
      alert("Two wallets detected, please log out of one.");
    }
    if (!publicKey && magicUser) {
      setUserPublicKey(magicMetadata.publicAddress);
      setShowLoginOptions(false);
    }
    if (!publicKey && !magicUser) {
      setUserPublicKey("");
    }
    if (publicKey) {
      setUserPublicKey(publicKey.toString()), setShowLoginOptions(false);
    }
  }, [publicKey]);

  useEffect(() => {
    // toggle for 'showStoreSymbol' in navbar
    window.addEventListener("toggle-user", () => {
      setShowStoreSymbol(false);
      localStorage.setItem("tgUser", "true");
    });
    window.addEventListener("toggle-merchant", () => {
      setShowStoreSymbol(true);
      localStorage.setItem("tgUser", "false");
    });
    window.addEventListener("cart_close", () => {
      setCartOpen(false);
    });
    window.addEventListener("cart_open", () => {
      setCartOpen(true);
    });
  }, []);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const tgUser = localStorage.getItem("tgUser");
    if (urlParams.get("merchant") === "true") {
      setShowStoreSymbol(true);
      localStorage.setItem("tgUser", "false");
    }
    if (urlParams.get("user") === "true") {
      setShowStoreSymbol(false);
      localStorage.setItem("tgUser", "true");
    }
    if (tgUser === "true") {
      setShowStoreSymbol(false);
    }
    if (tgUser === "false") {
      setShowStoreSymbol(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("magic-logged-in", () => {
      // TODO: Delete
      console.log('Magic logged in:')
      //
      if (!userPublicKey) {
        gatherMagicData();
        setMagicUser(true);
      }
    });
    window.addEventListener("magic-logged-out", () => {
      setMagicMetadata("");
      setMagicPublicKey("");
      setUserPublicKey("");
      setMagicUser(false);
      if (publicKey) {
        setUserPublicKey(publicKey.toString());
      }
    });
    window.addEventListener("closeQuickActions", () => {
      setShowQuickActions(false);
    });
    checkMagicLogin();
    // console.log(
    //   "Hey Anon, look great today! Thanks for checking out the site. If you have any questions, feel free to reach out to us on Twitter @ikonsOfSol. If you're looking for the dev behind this madness, you can find me @_matt_xyz on Twitter. "
    // )
  }, []);

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
      await isUser(userPublicKey).then(async (data) => {
        if (data === true) {
          setUser(true);
          setLoading(false);
        } else {
          console.log("not a user");
          setUser(false);
          // user registration
 
          const createUser = await CreateWallet(userPublicKey);
          console.log(createUser);
          
          setLoading(false);
        }
      });
    }
    if (userPublicKey) {
      // TODO: Delete
      console.log(`useEffect: checkAllowance :=> ${userPublicKey}`);
      // --
      checkAllowance();
      
      getBalance(userPublicKey).then((balance) =>
        console.log("balance: ", setWalletSolBalance(balance))
      );
      getUsdcBalance(userPublicKey).then((balance) =>
        setWalletUsdcBalance(balance)
      );
    }
  }, [userPublicKey]);

  useEffect(() => {
    const previousPath = localStorage.getItem("currentPath");
    if (previousPath) {
      localStorage.setItem("previousPath", previousPath);
    }
    localStorage.setItem("currentPath", currentPath);
  }, [currentPath]);

  return (
    <div>
      <div className={click ? "main-container" : ""} onClick={() => Close()} />
      <nav className="navbar" onClick={(e) => e.stopPropagation()}>
        <div className="nav-container">
          <div className="nav-logo">
            {isDarkMode ? (
              <div style={{ display: "flex" }}>
                <img
                  src="/logodark.svg"
                  alt="logo"
                  className={styles.bigLogo}
                  onClick={() => router.push("/")}
                />
                <img className={styles.betaLogo} src="/Beta.svg" />
              </div>
            ) : (
              <div style={{ display: "flex" }}>
                <img
                  style={{ width: "160px" }}
                  src="/logowhite.svg"
                  alt="logo"
                  className={styles.bigLogo}
                  onClick={() => router.push("/")}
                />
                <img className={styles.betaLogo} src="/Beta.svg" />
              </div>
            )}
            {/* <picture>
              <source
                srcset="/logo_dark.gif"
                media="(prefers-color-scheme: dark)"
                className={styles.bigLogo}
                onClick={() => router.push("/")}
              />
              <img
                src="/logo_light.gif"
                alt="logo"
                className={styles.bigLogo}
                onClick={() => router.push("/")}
              />
            </picture> */}
          </div>
          {/* <div
            className={styles.hamburger}
            onClick={() => setShowMenu(!showMenu)}
          >
            <IoMenuOutline size={30} />
          </div> */}
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item" onClick={() => Close()}>
              {renderHeaderMenu()}
            </li>
            <li className="nav-item" onClick={() => Close()}>
              {showLoginOptions && renderLoginOptions()}
            </li>
            <li className="nav-item" onClick={() => Close()}>
              {showQuickActions && renderQuickActions()}
            </li>
          </ul>
          <div className="nav-icon" onClick={handleClick}>
            <i className={click ? "fa fa-times" : "fa fa-bars"}></i>
          </div>
        </div>
      </nav>
      {cartOpen && <Cart />}
    </div>
  );
}
