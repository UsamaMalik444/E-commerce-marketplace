import React, { useState, useEffect } from "react";
import styles from "../Merchant/styles/StoreSettings.module.css";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, GetAccountInfoConfig } from "@solana/web3.js";
import { signIn, signOut, useSession } from "next-auth/react";
import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import Link from "next/link";
import {
  getCollectionOwner,
  updateCollectionInfo,
  updateCollectionVerified,
  GetStoreInfo,
  updateCollectionBanner,
  GenerateAPIKey,
  removeCollectionEmail,
  updateCollectionEmail,
} from "../../lib/api";
import {
  IoGlobeOutline,
  IoLogoDiscord,
  IoLogoInstagram,
  IoLogoTwitter,
  IoMailOutline,
  IoLogoWebComponent,
  IoCheckmarkDoneSharp,
  IoOpenOutline,
  IoLogoGoogle,
  IoEyeOffOutline,
  IoCopy,
  IoCloseOutline,
  IoCopyOutline,
  IoEyeOutline,
  IoInformationCircleOutline,
  IoTrashBinOutline,
} from "react-icons/io5";
import {
  verifyMerchantWithDiscord,
  verifyMerchantWithGoogle,
  returnVerifyResult,
} from "../../hooks/verify";
import { useImageUpload, replaceImage } from "../../hooks/imageUpload";
import * as web3 from "@solana/web3.js";

const StoreSettings = () => {
  const connection = new Connection(
    "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7",
    "confirmed"
  );

  const { publicKey } = useWallet();
  const [isIkonHolder, setIsIkonHolder] = useState(false);
  const [userPublicKey, setUserPublicKey] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [currentWallet, setCurrentWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [activeStoreSymbol, setActiveStoreSymbol] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [storeSelectionNeeded, setStoreSelectionNeeded] = useState(true);
  const [storeProducts, setStoreProducts] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [isMultiStoreOwner, setIsMultiStoreOwner] = useState(false);
  const [multiStoreArray, setMultiStoreArray] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(false);
  const [verified, setVerified] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [hideKey, setHideKey] = useState(true);
  const [hidePrintfulKey, setHidePrintfulKey] = useState(true);
  const [photoFileArray, setPhotoFileArray] = useState([]);
  const [sellerPolicyModal, setSellerPolicyModal] = useState(false);
  const [newCollectionInfo, setNewCollectionInfo] = useState({
    id: "null",
    projectName: "null",
    description: "null",
    banner: "null",
    bannerImageId: "null",
    website: "null",
    twitterHandle: "null",
    instagramHandle: "null",
    discordServer: "null",
    email: "null",
    verified: false,
    printfulKey: "null",
    slug: "null",
    showcase: false,
  });

  // NFT CHECK
  const checkForNfts = async () => {
    // var nfts = [];
    const ikonCollectionAddress =
      "EgVDqrPZAiNCQdf7zC2Lj8CVTv25YSwQRF2k8aTmGEnM";
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
        console.log("myNfts", myNfts);
        for (let i = 0; i < myNfts.length; i++) {
          // var temp_nft = {
          //   name: myNfts[i].name,
          //   tokenAddress: myNfts[i].tokenAddress,
          //   imageUrl: myNfts[i].imageUrl,
          // };
          // nfts.push(temp_nft);
          if (myNfts[i].collectionAddress === ikonCollectionAddress) {
            console.log("is ikon holder");
            setIsIkonHolder(true);
            break;
          }
        }

        // setAllNfts(nfts);
        // setLoading(false);
      } catch (error) {
        console.log("error", error);
      }
    })();
  };

  const handleSignIn = async () => {
    const req = {
      collection: storeInfo.id,
      email: newCollectionInfo.email,
    };
    await updateCollectionEmail(req);
    await signIn();
    console.log("signed in");
  };
  const handleVerifyMerchantWithDiscord = async () => {
    const response = await verifyMerchantWithDiscord();
    console.log("response from social login", response);
  };

  const handleVerifyMerchantWithGoogle = async () => {
    const response = await verifyMerchantWithGoogle();
    console.log("response from social login", response);
  };

  const handleGenerateAPIKey = async () => {
    const response = await GenerateAPIKey(userPublicKey);
    console.log("response from generate api key", response);
    setApiKey(response);
  };

  const handleEmailDeleteClick = async () => {
    const req = {
      id: storeInfo.id,
      email: "",
    };
    const response = await removeCollectionEmail(req);
    console.log("response from remove email", response);
    setNewCollectionInfo({
      ...newCollectionInfo,
      email: "",
      verified: false,
    });
  };

  const renderApiKey = () => {
    return (
      <>
        {hideKey ? (
          <div>
            <div onClick={() => setHideKey(false)}>
              <p>
                ******** <IoEyeOffOutline />
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div>
              <p>
                {apiKey.slice(0, 4)}..{apiKey.slice(-4)}{" "}
                <IoEyeOffOutline onClick={() => setHideKey(true)} />{" "}
                <IoCopyOutline
                  onClick={() => window.navigator.clipboard.writeText(apiKey)}
                  style={{
                    cursor: "pointer",
                  }}
                />
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderApiKeyDisplay = () => {
    return (
      <div className={styles.api_item}>
        <h6>API Key</h6>
        {verified ? (
          <>
            {apiKey ? (
              renderApiKey()
            ) : (
              <a
                className={styles.generate_btn}
                onClick={() => handleGenerateAPIKey()}
              >
                Generate API Key
              </a>
            )}
          </>
        ) : (
          <span className={styles.api_span}>Must Verify Account</span>
        )}
      </div>
    );
  };

  const renderPrintfulApiKeyDisplay = () => {
    return (
      <div className={styles.api_item}>
        <h6>Printful API Key</h6>
        {!verified ? (
          <>
            {apiKey ? (
              renderApiKey()
            ) : (
              <button
                className={styles.generate_btn}
                onClick={() => handleGenerateAPIKey()}
              >
                Generate API Key
              </button>
            )}
          </>
        ) : (
          <span className={styles.api_span}>Must Verify Account</span>
        )}
      </div>
    );
  };

  const renderBannerImageUpload = () => {
    async function onChange(file) {
      setBannerUploading(true);
      console.log("file", file[0]);
      if (
        newCollectionInfo.bannerImageId === null ||
        newCollectionInfo.bannerImageId === undefined ||
        newCollectionInfo.bannerImageId === ""
      ) {
        const data = await useImageUpload(file[0]);
        console.log("data", data);
        const parsed_data = JSON.parse(data);
        console.log("parsed_data", parsed_data);
        setNewCollectionInfo({
          ...newCollectionInfo,
          banner: parsed_data.url,
          bannerImageId: parsed_data.id,
        });
        const req = {
          id: newCollectionInfo.id,
          banner: parsed_data.id,
        };
        const update_banner = await updateCollectionBanner(req);
        console.log("update_banner", update_banner);
        setBannerUploading(false);
      } else {
        const data = await replaceImage(
          file[0],
          newCollectionInfo.bannerImageId
        );
        console.log("data", data);
        const parsed_data = JSON.parse(data);
        console.log("parsed_data", parsed_data);
        setNewCollectionInfo({
          ...newCollectionInfo,
          banner: parsed_data.url,
          bannerImageId: parsed_data.id,
        });
        const req = {
          id: newCollectionInfo.id,
          banner: parsed_data.id,
        };
        const update_banner = await updateCollectionBanner(req);
        console.log("update_banner", update_banner);
        setBannerUploading(false);
      }
    }

    return (
      <div className={styles.upload_container}>
        <div className={styles.upload_input}>
          <label className={styles.upload_title}>
            Banner Image
            <span className={styles.uploading_span}>
              {bannerUploading ? "Uploading" : null}
            </span>
          </label>
          <span style={{ fontSize: "10px", fontWeight: "bold" }}>
            Recommended Size : 900x450
          </span>

          <input
            className={styles.upload_name}
            type="file"
            accept="image/jpeg, image/png, image/jpg, image/gif, image/svg"
            // style the button
            // style={{color: 'black', backgroundColor: 'white', border: '1px solid black', borderRadius: '5px', padding: '5px', width: '100px', height: '30px', fontSize: '10px', cursor: 'pointer'}}
            onChange={(e) => {
              console.log("e.target.files", e.target.files),
                onChange(e.target.files);
            }}
          />
        </div>
      </div>
    );
  };

  const renderStoreSettings = () => {
    if (storeInfo && !loading) {
      return (
        <div className={styles.settings_container}>
          <h3>{storeInfo.projectName}</h3>
          <div className={styles.banner_img}>
            <button
              // if button is hovered over trigger previewBanner state change
              onMouseEnter={() => setPreviewBanner(true)}
              onMouseLeave={() => setPreviewBanner(false)}
            >
              Preview
            </button>
            <div className={styles.banner_img_overlay}></div>
            <img
              className={
                !previewBanner
                  ? styles.banner_img_blur
                  : styles.banner_img_no_blur
              }
              src={newCollectionInfo.banner}
            />
          </div>

          <div className={styles.url_item}>
            <h6>
              Store URL
              <span
                style={{
                  color: storeInfo.slug === null ? "red" : "green",
                  marginLeft: "10px",
                  fontStyle: "italic",
                  fontSize: "12px",
                }}
              >
                {storeInfo.slug === null ? (
                  "No URL Assigned"
                ) : (
                  <a
                    href={`https://ikonshop.io/store/${storeInfo.slug}`}
                    target="_blank"
                  >
                    <IoOpenOutline />
                  </a>
                )}
              </span>
            </h6>
            <div className={styles.url_item_container}>
              <span className={styles.placeholderURL}>
                https://ikonshop.io/store/
              </span>
              <input
                className={styles.url_item_con}
                type="text"
                placeholder={
                  storeInfo.slug != null ? storeInfo.slug : "NO_NAME_ASSIGNED"
                }
                defaultValue={storeInfo.slug != null ? storeInfo.slug : ""}
                onChange={(e) =>
                  setNewCollectionInfo({
                    ...newCollectionInfo,
                    slug: e.target.value,
                  })
                }
              />
            </div>
            {isIkonHolder && (
              <div className={styles.url_item_con}>
                Showcase Store?{" "}
                <input
                  type="checkbox"
                  checked={newCollectionInfo.showcase}
                  disabled={verified ? false : true}
                  onChange={(e) =>
                    setNewCollectionInfo({
                      ...newCollectionInfo,
                      showcase: e.target.checked,
                    })
                  }
                />
              </div>
            )}
          </div>

          <div className={styles.settings_info_container}>
            <div className={styles.settings_column}>
              {renderBannerImageUpload()}
              <div className={styles.info_item_split}>
                <div className={styles.info_item}>
                  <h6>Project Name</h6>
                  <input
                    type="text"
                    defaultValue={storeInfo.projectName}
                    onChange={(e) =>
                      setNewCollectionInfo({
                        ...newCollectionInfo,
                        projectName: e.target.value,
                      })
                    }
                  />
                </div>
                {/* <div className={styles.info_item}>
                <h6>Banner </h6>
                <input
                  
                  type="text"
                  placeholder={storeInfo.banner}
                  onChange={(e) =>
                    setNewCollectionInfo({
                      ...newCollectionInfo,
                      banner: e.target.value,
                    })
                  }
                />
              </div> */}

                <div className={styles.info_item}>
                  <div className={styles.info_item_verify}>
                    <h6>Email</h6>
                    <span className={styles.info_item_span}>
                      {verified ? (
                        <span className={styles.column_field_verified}>
                          Verified
                          <span>
                            <IoTrashBinOutline
                              onClick={() => {
                                handleEmailDeleteClick();
                              }}
                            />
                          </span>
                        </span>
                      ) : (
                        <>
                          {" "}
                          <span
                            style={{
                              fontSize: "14px",
                            }}
                          >
                            Verify with:
                          </span>
                          <div className={styles.verify_icons}>
                            <button
                              disabled={
                                newCollectionInfo.email === "" ||
                                newCollectionInfo.email === null ||
                                newCollectionInfo.email === "null"
                                  ? true
                                  : false
                              }
                              onClick={() => handleSignIn()}
                              className={styles.google_logo}
                            >
                              <IoLogoGoogle />
                            </button>
                          </div>
                        </>
                      )}
                    </span>
                  </div>
                  <input
                    type="text"
                    defaultValue={storeInfo.email}
                    onChange={(e) =>
                      setNewCollectionInfo({
                        ...newCollectionInfo,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className={styles.info_item_split}>
                <div className={styles.info_item}>
                  <IoGlobeOutline
                    className={styles.SSicons}
                    height="20px"
                    width="20px"
                  />
                  <input
                    type="text"
                    defaultValue={storeInfo.website}
                    onChange={(e) =>
                      setNewCollectionInfo({
                        ...newCollectionInfo,
                        website: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.info_item}>
                  <IoLogoTwitter
                    className={styles.SSicons}
                    height="20px"
                    width="20px"
                  />
                  <input
                    type="text"
                    defaultValue={storeInfo.twitterHandle}
                    onChange={(e) =>
                      setNewCollectionInfo({
                        ...newCollectionInfo,
                        twitterHandle: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className={styles.info_item_split}>
                <div className={styles.info_item}>
                  <IoLogoInstagram
                    className={styles.SSicons}
                    height="20px"
                    width="20px"
                  />
                  <input
                    type="text"
                    defaultValue={storeInfo.instagramHandle}
                    onChange={(e) =>
                      setNewCollectionInfo({
                        ...newCollectionInfo,
                        instagramHandle: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.info_item}>
                  <IoLogoDiscord
                    className={styles.SSicons}
                    height="20px"
                    width="20px"
                  />
                  <input
                    type="text"
                    defaultValue={storeInfo.discordServer}
                    onChange={(e) =>
                      setNewCollectionInfo({
                        ...newCollectionInfo,
                        discordServer: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className={styles.info_item}>
                <h6>Description</h6>
                <textarea
                  className={styles.long_input}
                  type="text"
                  // placeholder={storeInfo.description}
                  defaultValue={storeInfo.description}
                  onChange={(e) =>
                    setNewCollectionInfo({
                      ...newCollectionInfo,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.info_item}>
                <h6>Seller Policy</h6>
                <textarea
                  className={styles.long_input}
                  type="text"
                  defaultValue={storeInfo.sellerPolicy}
                  onChange={(e) =>
                    setNewCollectionInfo({
                      ...newCollectionInfo,
                      sellerPolicy: e.target.value,
                    })
                  }
                />
              </div>

              {renderApiKeyDisplay()}

              {/* <div className={styles.info_item}>
                <h6>
                  Printful Key
                  <span
                    style={{
                      color: "#130b46",
                      fontWeight: "bold",
                      cursor: "pointer",
                      marginLeft: "5px",
                    }}
                  >
                    {storeInfo.printfulKey != null &&
                    storeInfo.printfulKey != "" ? (
                      <>
                        {hidePrintfulKey ? (
                          <IoEyeOutline
                            style={{ marginLeft: "5px" }}
                            onMouseDown={() =>
                              setHidePrintfulKey(!hidePrintfulKey)
                            }
                          />
                        ) : (
                          <IoEyeOffOutline
                            style={{ marginLeft: "5px" }}
                            onMouseDown={() =>
                              setHidePrintfulKey(!hidePrintfulKey)
                            }
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <Link href="https://www.printful.com/" target="_blank">
                          <a
                            target="_blank"
                            style={{
                              color: "#FEC75C",
                              marginLeft: "5px",
                              // display: "flex",
                              // alignItems: "center",
                              // gap: "10px",
                            }}
                          >
                            <IoInformationCircleOutline
                              style={{
                                color: "#FEC75C",
                              }}
                            />
                            <span
                              style={{
                                color: "#FEC75C",
                                marginLeft: "7px",
                              }}
                            >
                              Sign up
                            </span>
                          </a>
                        </Link>
                      </>
                    )}
                  </span>
                </h6>
                <input
                  type="text"
                  placeholder={
                    storeInfo.printfulKey != null && storeInfo.printfulKey != "" ? (
                    !hidePrintfulKey ? (
                      storeInfo.printfulKey.slice(0, 4) +
                      "..." +
                      storeInfo.printfulKey.slice(-4)
                    ) : (
                      '************'
                    )
                    ) : (
                      'No Key'
                    )}
                    defaultValue={
                      storeInfo.printfulKey != null && storeInfo.printfulKey != "" ? (
                        !hidePrintfulKey ? (
                          storeInfo.printfulKey.slice(0, 4) +
                          "..." +
                          storeInfo.printfulKey.slice(-4)
                        ) : (
                          '************'
                        )
                        ) : (
                          'No Key'
                        )
                    }
                    onChange={(e) =>
                      setNewCollectionInfo({
                        ...newCollectionInfo,
                        printfulKey: e.target.value,
                      })
                    }
                />
              </div> */}
            </div>
          </div>

          <button
            className={styles.update_button}
            onClick={() => setConfirmationModal(true)}
          >
            Update Store Info
          </button>

          <div className={styles.fees_popup}>
            <IoInformationCircleOutline
              style={{
                color: "#edab05",
                fontSize: "20px",
              }}
            />
            <span>1% transaction fees on all purchases. </span>
          </div>
        </div>
      );
    } else {
      // Please select a store to edit
      return (
        <div className={styles.settings_container}>
          <h3>
            Uh oh error, <br />
            have you registerd as a Merchant?
          </h3>
        </div>
      );
    }
  };

  // render a confirmation modal that asks if you want to update the store settings and displays the new settings
  const renderConfirmationModal = () => {
    return (
      <div className={styles.settings_container}>
        <h3>Confirm Update</h3>
        <div>
          <img
            src={newCollectionInfo.banner}
            alt={newCollectionInfo.projectName}
            style={{
              width: "200px",
              borderRadius: "20px",
            }}
          />

          <h4>{newCollectionInfo.projectName}</h4>
          <p>{newCollectionInfo.description}</p>
          {isIkonHolder && (
            <p>Showcase: {newCollectionInfo.showcase ? "✅" : "❌"}</p>
          )}
          <p>https://ikonshop.io/store/{newCollectionInfo.slug}</p>
          {!sellerPolicyModal ? (
            <>
              <strong>Seller Policy: </strong>

              <span
                className={styles.policy_modal_span}
                onClick={() => setSellerPolicyModal(true)}
              >
                (click to expand)
              </span>
            </>
          ) : (
            <span className={styles.policy_modal}>
              {newCollectionInfo.sellerPolicy != null &&
              newCollectionInfo.sellerPolicy != "" &&
              newCollectionInfo.sellerPolicy != "null" ? (
                <div className={styles.seller_policy_modal}>
                  <div className={styles.seller_policy_modal_header}>
                    <strong>Seller Policy</strong>
                  </div>
                  <span
                    className={styles.close_span}
                    onClick={() => setSellerPolicyModal(false)}
                  >
                    <IoCloseOutline />
                  </span>
                  {newCollectionInfo.sellerPolicy}
                </div>
              ) : (
                "No Seller Policy"
              )}
            </span>
          )}
          <div className={styles.social_links}>
            {newCollectionInfo.email != null &&
              newCollectionInfo.email != "" &&
              newCollectionInfo.email != "null" && (
                <div>
                  <IoMailOutline color={"#130B46"} height="30px" width="30px" />
                  {newCollectionInfo.email != null &&
                  newCollectionInfo.email != "" &&
                  newCollectionInfo.email != "null"
                    ? newCollectionInfo.email
                    : "No Email"}
                </div>
              )}
            {newCollectionInfo.website != null &&
              newCollectionInfo.website != "" &&
              newCollectionInfo.website != "null" && (
                <div>
                  <IoGlobeOutline
                    color={"#130B46"}
                    height="30px"
                    width="30px"
                  />
                  <a href={newCollectionInfo.website} target="_blank">
                    {newCollectionInfo.website != null &&
                    newCollectionInfo.website != "" &&
                    newCollectionInfo.website != "null"
                      ? newCollectionInfo.website
                      : "No Website"}
                  </a>{" "}
                </div>
              )}
            {newCollectionInfo.twitterHandle != null &&
              newCollectionInfo.twitterHandle != "" &&
              newCollectionInfo.twitterHandle != "null" && (
                <div>
                  <IoLogoTwitter color={"#130B46"} height="30px" width="30px" />
                  <a href={newCollectionInfo.twitterHandle} target="_blank">
                    {newCollectionInfo.twitterHandle != null &&
                    newCollectionInfo.twitterHandle != "" &&
                    newCollectionInfo.twitterHandle != "null"
                      ? newCollectionInfo.twitterHandle
                      : "No Twitter"}
                  </a>{" "}
                </div>
              )}
            {newCollectionInfo.instagramHandle != null &&
              newCollectionInfo.instagramHandle != "" &&
              newCollectionInfo.instagramHandle != "null" && (
                <div>
                  <IoLogoInstagram
                    color={"#130B46"}
                    height="30px"
                    width="30px"
                  />
                  <a href={newCollectionInfo.instagramHandle} target="_blank">
                    {newCollectionInfo.instagramHandle != null &&
                    newCollectionInfo.instagramHandle != "" &&
                    newCollectionInfo.instagramHandle != "null"
                      ? newCollectionInfo.instagramHandle
                      : "No Instagram"}
                  </a>{" "}
                </div>
              )}
            {newCollectionInfo.discordServer != null &&
              newCollectionInfo.discordServer != "" &&
              newCollectionInfo.discordServer != "null" && (
                <div>
                  <IoLogoDiscord color={"#130B46"} height="30px" width="30px" />
                  <a href={newCollectionInfo.discordServer} target="_blank">
                    {newCollectionInfo.discordServer != null &&
                    newCollectionInfo.discordServer != "" &&
                    newCollectionInfo.discordServer != "null"
                      ? newCollectionInfo.discordServer
                      : "No Discord"}
                  </a>{" "}
                </div>
              )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <button
            className={styles.update_button}
            onClick={() => (
              setLoading(true),
              updateCollectionInfo(newCollectionInfo).then((data) => {
                console.log("data", data);
                if (data != undefined) {
                  const newStoreInfo = {
                    id: data.publishCollection.id,
                    projectName: data.publishCollection.projectName,
                    description: data.publishCollection.description,
                    banner: data.publishCollection.banner,
                    website: data.publishCollection.website,
                    twitterHandle: data.publishCollection.twitterHandle,
                    instagramHandle: data.publishCollection.instagramHandle,
                    discordServer: data.publishCollection.discordServer,
                    email: data.publishCollection.email,
                    verified: data.publishCollection.verified,
                    // printfulKey: data.publishCollection.printfulKey,
                    slug: data.publishCollection.slug,
                    sellerPolicy: data.publishCollection.sellerPolicy,
                  };
                  setStoreInfo(newStoreInfo);
                }
                setLoading(false);
                setConfirmationModal(false);
              })
            )}
          >
            Update
          </button>
          <button
            className={styles.cancel_button}
            onClick={() => setConfirmationModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const checkMagicLogin = async () => {
    if (localStorage.getItem("userMagicMetadata")) {
      const userMagicMetadata = JSON.parse(
        localStorage.getItem("userMagicMetadata")
      );
      setUserEmail(userMagicMetadata.email);
      const magicPubKey = new web3.PublicKey(userMagicMetadata.publicAddress);
      setCurrentWallet(magicPubKey.toString());
      setUserPublicKey(magicPubKey.toString());

      setLoading(false);
    }
  };

  //add window event listener for if the user changes active_store in the local storage
  useEffect(() => {
    setLoading(true);
    const new_active_store = JSON.parse(localStorage.getItem("active_store"));
    setActiveStoreSymbol(new_active_store);
    console.log("new active store", new_active_store);
    //get the store info
    if (userPublicKey) {
      (async () => {
        const store_info = await getCollectionOwner(userPublicKey);
        console.log(store_info);
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
    window.addEventListener("active_store_changed", () => {
      setLoading(true);
      const new_active_store = localStorage.getItem("active_store");

      setActiveStoreSymbol(new_active_store);
      (async () => {
        const store_info = await getCollectionOwner(userPublicKey);
        console.log(store_info);
        setStoreInfo(store_info);
        setNewCollectionInfo(store_info);
        setNewCollectionInfo({
          banner: store_info.bannerImage.url,
          bannerImageId: store_info.bannerImage.id,
        });
        setIsOwner(true);
        setLoading(false);
      })();
    });
  }, [userPublicKey]);

  //add window event listener for if the user changes active_store in the local storage
  //   useEffect(() => {
  //     window.addEventListener("active_store_changed", () => {
  //       console.log("active store changed");
  //       setLoading(true);
  //       const new_active_store = localStorage.getItem("active_store");
  //       console.log("new active store", new_active_store);
  //       setActiveStoreSymbol(new_active_store);
  //       (async () => {
  //         const store_info = await GetStoreInfo();

  //                 setStoreInfo(store_info);
  //                 setNewCollectionInfo(store_info);
  //                 setIsOwner(true);
  //                 setLoading(false);
  //             })();
  //         });
  //         setLoading(false);
  //         console.log('loading: ' + loading)
  //         console.log('is owner: ' + isOwner)

  //     }, []);

  useEffect(() => {
    if (publicKey) {
      setUserPublicKey(publicKey);
      setCurrentWallet(publicKey);
    }
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey) {
      checkMagicLogin();
    }
    window.addEventListener("magic-logged-in", () => {
      checkMagicLogin();
    });
    window.addEventListener("magic-logged-out", () => {
      setUserEmail(null);
      setUserPublicKey(null);
      setCurrentWallet(null);
      localStorage.removeItem("userMagicMetadata");
    });
  }, []);

  useEffect(() => {
    if (userPublicKey) {
      checkForNfts();
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_KEY, {
        extensions: [new OAuthExtension()],
      });
      if (urlParams.get("discordVerify") === "true") {
        console.log("userSettings=true");

        async function handleVerifyWithSocial() {
          const store_info = await getCollectionOwner(userPublicKey);
          console.log("store info", store_info);
          const verify_check = await returnVerifyResult();
          console.log("verify check", verify_check);
          const result = await magic.oauth.getRedirectResult();
          const profile = JSON.stringify(result.oauth.userInfo, undefined, 2);
          console.log("profile", profile);
          const email = result.oauth.userInfo.email;
          const isVerified = result.oauth.userInfo.emailVerified;
          setVerified(isVerified);
          const name =
            result.oauth.userInfo.sources[`https://discord.com/api/users/@me`]
              .username;
          // setUserName(name);
          const data = {
            ...newCollectionInfo,
            id: store_info.collections[0].id,
            banner: store_info.collections[0].banner,
            description: store_info.collections[0].description,
            verified: isVerified,
            email: email,
          };
          const update = await updateCollectionInfo(data);
          console.log("update", update);
        }
        handleVerifyWithSocial();
      }
      if (urlParams.get("googleVerify") === "true") {
        console.log("userSettings=true");
        async function handleVerifyWithSocial() {
          const store_info = await getCollectionOwner(userPublicKey);
          console.log("store info", store_info);
          const verify_check = await returnVerifyResult();
          console.log("verify check", verify_check.oauth.userInfo);
          const profile_data = verify_check.oauth.userInfo;

          const id_to_update = store_info.collections[0].id;
          console.log("id to update", id_to_update);
          const email = profile_data.email;
          const isVerified = true;
          setVerified(isVerified);

          const req = {
            id: id_to_update,
            verified: true,
          };
          const update = await updateCollectionVerified(req);
          console.log("update", update);
          setUserEmail(email);
        }
        handleVerifyWithSocial();
      }
    }
  }, [userPublicKey]);

  return (
    <div>
      {userPublicKey && isOwner && !loading && !confirmationModal
        ? renderStoreSettings()
        : null}
      {confirmationModal ? renderConfirmationModal() : null}
    </div>
  );
};

export default StoreSettings;
