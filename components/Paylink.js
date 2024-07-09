import React, { useEffect, useState, useRef } from "react";
import styles from "../styles/Paylink.module.css";
import Link from "next/link";
import Buy from "../components/Buy";
import Send from "../components/MagicWallet/send";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import SendElusiv from "./Elusiv/send";
// import ElusivSetup from "./Elusiv/userSetUp";
// import ElusivPopup from "./Elusiv/popup";
import { Magic } from "magic-sdk";
import { SolanaExtension } from "@magic-ext/solana";
import * as web3 from "@solana/web3.js";
import axios from "axios";
import { useGetNftsByOwner, useGetSplTokensByOwner } from "../hooks/hellomoon";
import { truncateStringByFront } from "../lib/text/truncate";
import { API_KEY, BASE_URI } from "../constants/env";
import { confirmTransactions } from "../lib/solana/txn";
import base58 from "bs58";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";

// added by Pavlo
import {
  fetchItem,
  addOrder,
  addLinkOrder,
  deleteProductFromBuyer,
  getBuyerOrders,
  updateProductCounts,
  getSingleProductBySku,
} from "../lib/api";

const tokenMapping = {
  USDC: {
    name: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  },
  SOL: {
    name: "SOL",
    mint: "So11111111111111111111111111111111111111112",
  },
  DUST: {
    name: "DUST",
    mint: "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ",
  },
  FORGE: {
    name: "FORGE",
    mint: "FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds",
  },
  CRECK: {
    name: "$CRECK",
    mint: "Ao94rg8D6oK2TAq3nm8YEQxfS73vZ2GWYw2AKaUihDEY",
  },
  PESKY: {
    name: "PESKY",
    mint: "nooot44pqeM88dcU8XpbexrmHjK7PapV2qEVnQ9LJ14",
  },
  GMT: {
    name: "GMT",
    mint: "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx",
  },
  RAIN: {
    name: "RAIN",
    mint: "rainH85N1vCoerCi4cQ3w6mCf7oYUdrsTFtFzpaRwjL",
  },
};

function ensureNumber(value) {
  if (typeof value === "number") {
    return value;
  } else if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  return false;
}

function abbreviateNumber(num) {
  if (num < 1) return num.toFixed(3);

  const units = ["", "k", "M", "B", "T"];
  let index = 0;

  while (Math.abs(num) >= 1000 && index < units.length - 1) {
    num /= 1000;
    index++;
  }

  return num.toFixed(1) + units[index];
}

const SplTokenTipContainer = ({
  id,
  owner,
  elusiv,
  symbol,
  product: productDetails,
  description,
  imageUrl,
  name,
  collection,
  noteToOwner,
}) => {
  const { type, token, price, quantity } = productDetails.product;

  const { connection } = useConnection();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdownNft, setShowDropdownNft] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(quantity);

  // convert currentDateTime into ISO format
  const currentDateTimeISO = new Date().toISOString();

  const numberOptions = [];
  for (let i = 1; i <= quantity; i++) {
    numberOptions.push(
      <Option key={i} value={i}>
        {i}
      </Option>
    );
  }

  const handleChangeQuantity = (event, newValue) => {
    setSelectedNumber(newValue);
  };

  const dropdownRef = useRef(null);
  const dropDownRefNft = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  const handleClickOutsideNft = (event) => {
    if (
      dropDownRefNft.current &&
      !dropDownRefNft.current.contains(event.target)
    ) {
      setShowDropdownNft(false);
    }
  };

  // Effect to add/remove event listeners
  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("click", handleClickOutsideNft);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.addEventListener("click", handleClickOutsideNft);
    };
  }, []);

  const [splTokenDetails, setSplTokenDetails] = useState({
    name: "",
    mint: "",
  });

  const [nftDetails, setNftDetails] = useState([]);

  const [tipInput, setTipInput] = useState("");
  const handleChange = (event) => {
    setTipInput(event.target.value);
  };

  const { publicKey, signAllTransactions } = useWallet();
  const { data: splTokensByOwner } = useGetSplTokensByOwner({
    tokenOwner: publicKey || "",
  });

  const { data: nftsByOwner } = useGetNftsByOwner({
    tokenOwner: publicKey || "",
  });

  const handleTipCombination = async () => {
    let transactionResponse = null;
    if (type === "tipjar") {
      transactionResponse = await axios.post(
        `${BASE_URI}ikons/shop/tip/combine`,
        {
          tokenMint: splTokenDetails.mint,
          tokenAmount: tipInput,
          nftMint: nftDetails.map((nft) => nft.mint),
          tokenOwner: publicKey.toBase58(),
          productOwner: productDetails.product.owner,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
    } else if (type === "link") {
      transactionResponse = await axios.post(
        `${BASE_URI}ikons/shop/tip/combine`,
        {
          tokenMint: tokenMapping[token.toUpperCase()].mint,
          tokenAmount: String(parseFloat(price) * parseFloat(selectedNumber)),
          tokenOwner: publicKey.toBase58(),
          nftMint: [],
          productOwner: productDetails.product.owner,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
    }

    const serializedTransactions = transactionResponse.data.txns;
    console.log(transactionResponse);
    const deserializedTxns = serializedTransactions.map(
      (serializedTransaction) => {
        return web3.VersionedTransaction.deserialize(
          base58.decode(serializedTransaction)
        );
      }
    );

    const txns = await signAllTransactions(deserializedTxns);

    const serializedTxns = txns.map((txn) => {
      return txn.serialize();
    });

    const rpcConnection = new web3.Connection(
      "https://rpc.hellomoon.io/938342e7-af02-4304-95c1-b40b63733a59",
      "confirmed"
    );

    const sigs = await confirmTransactions(serializedTxns, rpcConnection);
    console.log(sigs);

    const order = {
      id: id,
      buyer: publicKey ? publicKey.toString() : "",
      orderID: sigs[0],
      // if product is a tip jar set the price to tip amount and set the token type to the tip jar token type
      product: productDetails.product,
      price: type === "tipjar" ? String(parseFloat(tipInput)) : String(parseFloat(price) * parseFloat(selectedNumber)),
      token: type === "tipjar" ? splTokenDetails.name.toLowerCase() : token,
      owner: owner,
      symbol: symbol,
      // email: email,
      // twitter: twitter,
      // discord: discord,
      // shippingInfo: shippingInfo,
      purchaseDate: currentDateTimeISO,
      note: noteToOwner,
      // colorOption: colorOption,
      // collection: collection,
      // ownerEmail: ownerEmail,
    };
    console.log(order);
    addLinkOrder(order);
  };

  return (
    <div className={`w-full d-flex flex-column ${styles.inner_col}`}>
      <div className={`flex flex-col gap-3 ${styles.inner_col_1}`}>
        <div
          className={`flex items-center  ${
            type === "link" ? "justify-between" : ""
          }`}
        >
          <span className="font-[900]" style={{ paddingLeft: "45px" }}>
            {type === "link" ? "Token :" : ""}
          </span>
          <div className="flex flex-col gap-2">
            {type === "tipjar" ? (
              <div
                ref={dropdownRef}
                className="relative flex "
                style={{ paddingLeft: "25px" }}
              >
                <Button
                  style={{
                    width: "145px",
                    border: "2px solid black",
                    borderRadius: "16px",
                  }}
                  variant="outlined"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="font-semibold rounded-md border-1 border-solid border-black-100 py-[5px] cursor-pointer flex items-center justify-center"
                >
                  {splTokenDetails.name ? splTokenDetails.name : "Select Token"}
                </Button>
                <div
                  className={`${
                    showDropdown ? "block" : "hidden"
                  } overflow-y-auto	max-h-[200px] absolute z-10 bg-black-100 top-[40px] text-white [&>span]:px-4 [&>span]:cursor-pointer  [&>span]:py-[5px] flex flex-col rounded-md`}
                >
                  {splTokensByOwner &&
                    splTokensByOwner.data?.map((token) => {
                      return (
                        <div
                          onClick={() => {
                            console.log(token.name);
                            console.log(token.mint);
                            setSplTokenDetails({
                              name: token.name,
                              mint: token.mint,
                            });
                            setShowDropdown(false);
                          }}
                          className="flex flex-row items-center justify-between p-2 cursor-pointer hover:bg-gray-100"
                        >
                          <span>{truncateStringByFront(token.name, 16)}</span>
                          <span>{abbreviateNumber(token.amount)}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <>{token.toUpperCase()}</>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex flex-row items-center  w-full ${
              type === "link" ? "justify-between" : ""
            }`}
          >
            <span className="font-[900]" style={{ paddingLeft: "45px" }}>
              {type === "link" ? "Quantity to Purchase:" : ""}
            </span>
            {type === "tipjar" && (
              <Input
                placeholder="Amount"
                className={` font-semibold  text-green-100 ${styles.inputField} p-1 px-2 `}
                type="Enter Token Tip Here"
                value={tipInput}
                onChange={handleChange}
              />
            )}
            {type === "link" && (
              <>
                <Select
                  // value={selectedNumber}
                  defaultValue={1}
                  style={{ width: "80px" }}
                  onChange={handleChangeQuantity}
                >
                  {numberOptions}
                </Select>
              </>
            )}
          </div>
        </div>
        {type === "link" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row items-center justify-between w-full">
              <span className="font-[900]" style={{ paddingLeft: "45px" }}>
                Price:
              </span>
              <>{price}</>
            </div>
          </div>
        )}
        {type === "tipjar" && (
          <div>
            <div className="flex flex-col items-center gap-4">
              <div
                className={`flex flex-row items-center  w-full
              ${type === "link" ? "justify-between" : ""}
              `}
              >
                <span
                  className="font-[900]"
                  style={{ paddingLeft: "45px" }}
                ></span>
                <div className="flex flex-col gap-2">
                  <div
                    ref={dropDownRefNft}
                    className="relative flex"
                    style={{ justifyContent: "flex-end" }}
                  >
                    {/* <button
                  onClick={() => setShowDropdownNft((prev) => !prev)}
                  className="font-semibold rounded-md border-1 border-solid border-black-100 w-[150px] py-[5px] cursor-pointer flex items-center justify-center"
                >
                  Select Nft
                </button> */}

                    {/* <FormControl variant="filled">
                      <InputLabel id="demo-simple-select-label">
                        Select NFT as tip
                      </InputLabel>
                      <Select
                        className={`${styles.tokenSelect}`}
                        style={{
                          border: "2px solid black",
                          borderRadius: "2px",
                          width: "211px",
                        }}
                        value={nftDetails?.name}
                        onClick={() => setShowDropdownNft((prev) => !prev)}
                      ></Select>
                    </FormControl> */}
                    <Select
                      className={`${styles.tokenSelect}`}
                      placeholder="Select NFT as tip"
                      color="neutral"
                      variant="outlined"
                      value={nftDetails?.name}
                      onClick={() => setShowDropdownNft((prev) => !prev)}
                    >
                      {nftsByOwner &&
                        nftsByOwner.data?.map((nft) => {
                          return (
                            <Option
                              onClick={() => {
                                setNftDetails((prev) => {
                                  if (prev.length >= 2) {
                                    alert(
                                      "cannot tip more than 2 NFTs at a time."
                                    );
                                    return prev;
                                  }

                                  prev.push({
                                    name: nft.metadataJson.name,
                                    mint: nft.nftMint,
                                  });
                                  return prev;
                                });
                                setShowDropdownNft(false);
                              }}
                              className="hover:bg-gray-100"
                            >
                              {truncateStringByFront(
                                nft.metadataJson.name ||
                                  nft.metadataJson.symbol ||
                                  nft.nftMint,
                                25
                              )}
                            </Option>
                          );
                        })}
                    </Select>

                    {/* <div
                      className={`${
                        showDropdownNft ? "block" : "hidden"
                      } overflow-y-auto	max-h-[200px] absolute z-10 bg-black-100 top-[40px] text-white [&>span]:px-4 [&>span]:cursor-pointer [&>span]:w-[250px] [&>span]:py-[5px] flex flex-col rounded-md`}
                    >
                      {nftsByOwner &&
                        nftsByOwner.data?.map((nft) => {
                          console.log("sssssssssssss", nft);
                          return (
                            <span
                              onClick={() => {
                                setNftDetails((prev) => {
                                  if (prev.length >= 2) {
                                    alert(
                                      "cannot tip more than 2 NFTs at a time."
                                    );
                                    return prev;
                                  }

                                  prev.push({
                                    name: nft.metadataJson.name,
                                    mint: nft.nftMint,
                                  });
                                  return prev;
                                });
                                setShowDropdownNft(false);
                              }}
                              className="hover:bg-gray-100"
                            >
                              {truncateStringByFront(
                                nft.metadataJson.name ||
                                  nft.metadataJson.symbol ||
                                  nft.nftMint,
                                25
                              )}
                            </span>
                          );
                        })}
                    </div> */}
                  </div>
                </div>
              </div>
              <div style={{ width: "300px" }}>
                {nftDetails &&
                  nftDetails.map((nft) => {
                    return (
                      <div className="flex flex-row justify-between p-2">
                        <span>{nft.name}</span>
                        <span
                          onClick={() => {
                            setNftDetails((prev) => {
                              prev = prev.filter(
                                (item) => item.mint !== nft.mint
                              );
                              return prev;
                            });
                            0;
                          }}
                          className="cursor-pointer"
                        >
                          X
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        className={`flex items-center justify-center w-full ${styles.process_btn} `}
        style={{ marginTop: type === "link" ? "130px" : "" }}
      >
        <button
          onClick={() => handleTipCombination()}
          className="flex justify-content-center px-4 font-semibold rounded-md border-1 border-solid border-black-100 py-[5px]  hover:opacity-80"
        >
          <img
            src={
              type === "tipjar"
                ? "/ButtonImg/Tip.png"
                : "/ButtonImg/PayWith.png"
            }
            className="w-full"
          />
        </button>
      </div>
    </div>
  );
};

export default function PaylinkComponent(product) {
  const { id, name, price, description, owner, token, type, imageUrl } =
    product.product;

  const [loading, setLoading] = useState(true);
  const [tipAmount, setTipAmount] = useState("");
  const [tokenType, setTokenType] = useState("");
  const [userPublicKey, setUserPublicKey] = useState("");
  const [magicUser, setMagicUser] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showElusiv, setShowElusiv] = useState(false);

  // const [elusivBalance, setElusivBalance] = useState(0);
  const { publicKey } = useWallet();
  const rpcUrl =
    "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7";

  const renderTokenTypeInput = () => {
    return (
      <div className={styles.split}>
        <label className={styles.product_details_price}>Token Type</label>

        <select
          className="w-full px-3 py-2 leading-tight text-gray-700 border rounded appearance-none focus:outline-none focus:shadow-outline"
          id="tokenType"
          onChange={(e) => setTokenType(e.target.value)}
          style={{
            width: "180px",
          }}
        >
          {tokenType === "" && <option value="">Select</option>}
          <option value="sol">SOL</option>
          <option value="usdc">USDC</option>
          <option value="groar">GROAR</option>
          <option value="dust">DUST</option>
          <option value="creck">CRECK</option>
          <option value="pesky">PESKY</option>
          <option value="gmt">GMT</option>
          <option value="gore">GORE</option>
        </select>
      </div>
    );
  };

  // useEffect(() => {
  //   //check local storage for elusivBalance and set it
  //   const elusivBalance = localStorage.getItem("elusivBalance");
  //   console.log('elusivBalance', elusivBalance)
  //   if (elusivBalance) {
  //     setElusivBalance(elusivBalance);
  //   }
  // }, []);

  useEffect(() => {
    const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_KEY, {
      extensions: {
        solana: new SolanaExtension({
          rpcUrl,
        }),
      },
    });
    async function checkUser() {
      const loggedIn = await magic.user.isLoggedIn();
      console.log("loggedIn", loggedIn);
      if (loggedIn) {
        setMagicUser(true);
        magic.user.getMetadata().then((user) => {
          const pubKey = new web3.PublicKey(user.publicAddress);
          setUserPublicKey(pubKey);
          setUserEmail(user.email);
        });
      }
      setLoading(false);
    }
    checkUser();
  }, []);
  useEffect(() => {
    if (publicKey) {
      setUserPublicKey(publicKey.toString());
    } else {
      //check local storage for userMagicMetadata get the public address and convert it to publicKey and set it
      const userMagicMetadata = localStorage.getItem("userMagicMetadata");
      if (userMagicMetadata) {
        const userMagicMetadataObj = JSON.parse(userMagicMetadata);
        const userPublicAddress = userMagicMetadataObj.publicAddress;
        const userPublicKeyObj = new web3.PublicKey(userPublicAddress);
        console.log("userPublicKeyObj", userPublicKeyObj.toString());
        setUserPublicKey(userPublicKeyObj.toString());
      }
    }
  }, [publicKey]);

  return (
    <>
      <div
        className={styles.paylink_page}
        onClick={() => {
          showElusiv
            ? (setShowElusiv(false),
              (document.getElementById("elusiv").checked = false))
            : null;
        }}
      >
        <div className={styles.pay_container1}>
          <div className={`   ${styles.upper_col}`}>
            <div
              className={styles.grid_item1}
              style={{
                padding: "10px 8px 10px 8px",
                // height: "200px",
              }}
            >
              <div className={styles.split}>
                <p>Owner: </p>
                <p>
                  <strong>
                    <Link href={`/profile/${owner}`}>
                      <a target="_blank">
                        {owner.slice(0, 4) + "..." + owner.slice(-4)}
                      </a>
                    </Link>
                  </strong>
                </p>
              </div>
              <div className={styles.img_div}>
                <img
                  style={{
                    // width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                    display: "inline-block",
                  }}
                  src={imageUrl}
                />
              </div>
            </div>
            <hr className="mb-2" />
            <div className={` ${styles.img} ${styles.img1}`}>
              <div
                className={styles.textdiv}
                // style={{
                //   textAlign: "center",
                //   paddingTop: "60px",
                // }}
              >
                <p className={styles.paylink_name}>{name}</p>

                <div
                  className={styles.paylink_desc}
                  dangerouslySetInnerHTML={{ __html: description }}
                >
                  {/* {description.replace(/<\/?p>/g, "")} */}
                </div>
              </div>
              {/* <img
              src={
                type === "tipjar"
                  ? "/tipjar_head_bg.png"
                  : "/paylink_head_bg.png"
              }
            /> */}
            </div>
          </div>

          <div className={styles.shipping_details_flex}>
            <div
              className={styles.pay_content}
              style={{ margin: type === "link" ? "0px 20px" : "" }}
            >
              {/* <p className={styles.pay_title}>{name}</p>
              <p className={styles.pay_copy}>
                <div
                  style={{
                    width: "320px",
                    height: "auto",
                    maxHeight: "150px",
                    wordWrap: "break-word",
                    overflowY: "auto",
                  }}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </p> */}
              {/* <div className={styles.split}>
                <p>Owner: </p>
                <p>
                  <strong>
                    <Link href={`/profile/${owner}`}>
                      <a target="_blank">
                        {owner.slice(0, 4) + "..." + owner.slice(-4)}
                      </a>
                    </Link>
                  </strong>
                </p>
              </div> */}
              <div className={styles.price_pricebtn}>
                <SplTokenTipContainer
                  id={id}
                  owner={owner}
                  elusiv={false}
                  product={product}
                />
                {/* {type === "tipjar" ? renderTokenTypeInput() : null}
                {type != "tipjar" && (
                  <div className={styles.split}>
                    <p>Amount:</p>
                    <p
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      {price} {token.toUpperCase()}
                    </p>
                  </div>
                )}
                <div className={styles.split}>
                  {type == "tipjar" && (
                    <div className={styles.product_details_price}>
                      Enter {tokenType.toUpperCase()} Tip
                    </div>
                  )}
                  {type == "tipjar" && (
                    <input
                      className="w-full px-3 py-2 leading-tight text-gray-700 border rounded appearance-none focus:outline-none focus:shadow-outline"
                      type="text"
                      onChange={(e) => setTipAmount(e.target.value)}
                      style={{
                        width: "125px",
                      }}
                    />
                  )}
                </div> */}

                {type === "tipjar" && tipAmount ? (
                  <div className={styles.product_details_price}>
                    Tip Amount: {tipAmount} {tokenType.toUpperCase()}
                  </div>
                ) : null}
                {publicKey && showElusiv && tipAmount && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      border: "1px solid #000",
                      borderRadius: "5px",
                      width: "fit-content",
                      height: "fit-content",
                      padding: "25px",
                      backgroundColor: "#fff",
                      boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
                      zIndex: 9999,
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        cursor: "pointer",
                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                      onClick={() => (
                        setShowElusiv(false),
                        (document.getElementById("elusiv").checked = false)
                      )}
                    >
                      X
                    </span>
                    {/* <ElusivPopup
                        recipient={owner}
                        sendAmount={tipAmount}
                      /> */}
                  </div>
                )}
                <div className={styles.product_details_price}>
                  {/* {publicKey && tipAmount && (
                    <Buy
                      className={styles.pay_btn}
                      id={id}
                      price={tipAmount}
                      token={tokenType}
                      owner={owner}
                      elusiv={false}
                      product={product.product}
                    />
                  )}
                  {publicKey && type != "tipjar" ? (
                    <Buy
                      className={styles.pay_btn}
                      id={id}
                      price={price}
                      token={token}
                      owner={owner}
                      elusiv={false}
                      product={product.product}
                    />
                  ) : null}
                  {magicUser && userPublicKey && parseFloat(tipAmount) > 0 && (
                    <Send
                      buyer={userPublicKey}
                      recipient={owner}
                      price={tipAmount}
                      token={tokenType}
                      elusiv={false}
                      product={product.product}
                    />
                  )}
                  {magicUser && userPublicKey && type != "tipjar" && (
                    <Send
                      buyer={userPublicKey}
                      recipient={owner}
                      price={price}
                      token={token}
                      elusiv={false}
                      product={product.product}
                    />
                  )} */}
                  {/* {publicKey && showElusiv && tipAmount && elusivBalance < tipAmount && (
                    <p style={{
                      fontSize: "12px",
                      color: "red",
                      marginTop: "5px",
                      marginBottom: "5px",
                      fontWeight: "bold"
                    }}>Insufficient Elusiv Balance</p>
                  )}

                  {publicKey && showElusiv && !tipAmount && elusivBalance < price && (
                    <p style={{
                      fontSize: "12px",
                      color: "red",
                      marginTop: "5px",
                      marginBottom: "5px",
                      fontWeight: "bold"
                    }}>Insufficient Elusiv Balance</p>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
