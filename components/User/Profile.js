import React, { useState, useEffect, useMemo } from "react";
import styles from "./styles/Profile.module.css";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  GetWalletSettings,
  UpdateWalletSettings,
  UpsertWallet,
  RemoveUserEmail,
  UpdateWalletEmail,
} from "../../lib/api";
import {
  IoCamera,
  IoLogoGoogle,
  IoEye,
  IoTrashBinOutline,
} from "react-icons/io5";
import { verifyWithDiscord, verifyWithGoogle } from "../../hooks/verify";
import {
  useImageUpload,
  replaceImage,
  uploadImageByUrl,
  replaceImageByUrl,
} from "../../hooks/imageUpload";
import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { GraphQLClient } from "graphql-request";
import { useRouter } from "next/router";

const Profile = (userPubKey) => {
  const router = useRouter();
  // DASH STATES
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showConnectivity, setShowConnectivity] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPasswordAndSecurity, setShowPasswordAndSecurity] = useState(false);

  const [activeDash, setActiveDash] = useState("Edit Profile");

  const handleSignIn = async () => {
    const req = {
      email: email,
      owner: userPubKey.userPubKey,
    };
    await UpdateWalletEmail(req);
    await signIn();
    console.log("signed in");
  };
  // PROFILE DATA
  const [userName, setUserName] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [email, setEmail] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [pfpId, setPfpId] = useState(null);
  const [description, setDescription] = useState(null);
  const [socialLinks, setSocialLinks] = useState(null);
  const [verified, setVerified] = useState(false);

  const [loading, setLoading] = useState(true);
  const [imageToUpload, setImageToUpload] = useState(null);
  const [allNfts, setAllNfts] = useState([]);

  const [availableInterests, setAvailableInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);

  const req = useMemo(() => {
    return {
      userPubKey: userPubKey.userPubKey,
      email: email,
      name: userName,
      description: description,
      profileImage: profileImage,
      pfpId: pfpId,
      socialLinks: socialLinks,
      verified: verified,
      interests: selectedInterests,
    };
  }, [
    userPubKey,
    email,
    userName,
    description,
    socialLinks,
    profileImage,
    pfpId,
    verified,
    selectedInterests,
  ]);

  // NFT CHECK
  const checkForNfts = async () => {
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
          wallet: userPubKey.userPubKey,
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
          var temp_nft = {
            name: myNfts[i].name,
            tokenAddress: myNfts[i].tokenAddress,
            imageUrl: myNfts[i].imageUrl,
          };
          nfts.push(temp_nft);
        }

        setAllNfts(nfts);
        setLoading(false);
      } catch (error) {
        console.log("error", error);
      }
    })();
  };

  // PROFILE IMAGE UPLOAD

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    try {
      if (profileImage != null && profileImage != "") {
        const data = await replaceImage(file, pfpId);
        const new_url = JSON.parse(data).url;
        const new_id = JSON.parse(data).id;
        setProfileImage(new_url);
        setPfpId(new_id);
      } else {
        const data = await useImageUpload(file);
        const new_url = JSON.parse(data).url;
        const new_id = JSON.parse(data).id;
        setProfileImage(new_url);
        setPfpId(new_id);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleImageUploadByUrl = async (e) => {
    const url = e.imageUrl;
    const fileName = e.name;
    try {
      if (profileImage != null && profileImage != "") {
        await replaceImageByUrl(url, fileName, pfpId).then((res) => {
          const new_url = JSON.parse(res).url;
          const new_id = JSON.parse(res).id;
          setProfileImage(new_url);
          setPfpId(new_id);
          var newReq = {
            userPubKey: userPubKey.userPubKey,
            email: email,
            name: userName,
            description: description,
            profileImage: new_url,
            pfpId: new_id,
            socialLinks: socialLinks,
            verified: verified,
          };
          UpdateWalletSettings(newReq);
        });
      } else {
        await uploadImageByUrl(url, fileName).then((res) => {
          const new_url = JSON.parse(res).url;
          const new_id = JSON.parse(res).id;

          setPfpId(new_id);
          setProfileImage(new_url);
          var newReq = {
            userPubKey: userPubKey.userPubKey,
            email: email,
            name: userName,
            description: description,
            profileImage: new_url,
            pfpId: new_id,
            socialLinks: socialLinks,
            interests: selectedInterests,
            verified: verified,
          };
          UpdateWalletSettings(newReq);
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const renderConfirmModal = () => {
    // social links is a string, split into array at commas
    const socialLinksArray =
      socialLinks.length > 1 ? socialLinks.split(", ") : [];

    return (
      <div className={styles.confirm_modal}>
        <div className={styles.confirm_modal_container}>
          <div className={styles.confirm_modal_header}>
            <h4>Confirm Changes</h4>
          </div>
          <div className={styles.confirm_modal_body}>
            <div className={styles.confirm_modal_body_left}>
              <div className={styles.confirm_modal_body_left_image}>
                <img src={profileImage} />
              </div>
              <div className={styles.confirm_modal_body_left_name}>
                <p>{userName}</p>
              </div>
            </div>
            <div className={styles.confirm_modal_body_right}>
              <div className={styles.confirm_modal_body_right_description}>
                <h4>Description</h4>
                {/* description is in markdown format, inject as html */}
                <div
                  className={styles.description}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
                <div
                  style={{
                    // grid display
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gridGap: "2px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {/* { turn socialLinks into an array seperated by the comma then map it */}
                  {socialLinksArray.map((socialLink, index) => {
                    return (
                      <p
                        style={{
                          marginTop: "5px",
                          backgroundColor: "#F2F2F2",
                          width: "fit-content",
                          padding: "5px",
                          borderRadius: "5px",
                        }}
                      >
                        <a
                          href={
                            socialLink.includes("http")
                              ? socialLink
                              : `https://${socialLink}`
                          }
                          target="_blank"
                        >
                          {socialLink}
                        </a>
                      </p>
                    );
                  })}
                </div>

                <h4>Interests</h4>
                <div
                  style={{
                    // grid display
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gridGap: "2px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {req.interests.map((interest, index) => {
                    return (
                      <p
                        style={{
                          marginTop: "5px",
                          backgroundColor: "#F2F2F2",
                          width: "fit-content",
                          padding: "5px",
                          borderRadius: "5px",
                        }}
                      >
                        {interest.replace(/_/g, " ")}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.confirm_modal_footer}>
            <div className={styles.confirm_modal_footer_cancel}>
              <button
                className={styles.update_button}
                style={{ backgroundColor: "#ff7fa5", color: "white" }}
                onClick={() => setConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
            <div className={styles.confirm_modal_footer_confirm}>
              <button
                className={styles.update_button}
                style={{ marginTop: "5px" }}
                onClick={() => (
                  UpdateWalletSettings(req),
                  alert("Profile Updated!"),
                  setConfirmModal(false)
                )}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEditProfile = () => {
    return (
      <div className={styles.edit_profile_container}>
        {confirmModal ? (
          renderConfirmModal()
        ) : (
          <>
            <div className={styles.profile_header}>
              <h1>Edit Profile</h1>
            </div>
            <div className={styles.profile_body}>
              <div className={styles.profile_image_container}>
                <div className={styles.profile_image}>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-7px",
                      right: "0",
                      width: "35px",
                      height: "35px",
                      background: "#14D19E",
                      borderRadius: "50%",
                      zIndex: "20",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <IoCamera
                      style={{
                        fontSize: "20px",
                        textAlign: "center",
                        color: "#fff",
                      }}
                    />
                  </div>
                  <img
                    src={
                      profileImage != "" ? profileImage : "/user_phantom.png"
                    }
                    alt="Profile Image"
                    width={300}
                    height={300}
                  />
                  {/* <Image
                      src={
                        profileImage != "" ? profileImage : "/user_phantom.png"
                      }
                      alt="Profile Image"
                      width={300}
                      height={300}
                    /> */}
                </div>
              </div>
              <div
                className={styles.view_profile}
                onClick={() => router.push(`/profile/${userPubKey.userPubKey}`)}
              >
                <span>View Profile</span>
                <IoEye />
              </div>
              <div className={styles.column_field_upload}>
                <p>Profile Picture</p>
                <input
                  type="file"
                  name="file"
                  onChange={(e) => (
                    setImageToUpload(e.target.files[0]), handleImageUpload(e)
                  )}
                />
              </div>
              <div className={styles.column_field}>
                {/* map out allNfts as a carousel where when an image is selected the border color changes and sets that image as the profile picture to upload */}
                <p>All NFTs</p>
                <div className={styles.nft_carousel}>
                  {allNfts.map((nft, index) => (
                    <div key={index}>
                      {nft.imageUrl != "null" && (
                        <div
                          className={styles.nft_carousel_item}
                          onClick={() => {
                            setProfileImage(nft.imageUrl);
                            setPfpId(nft.tokenAddress);
                            handleImageUploadByUrl(nft);
                          }}
                        >
                          <img
                            src={nft.imageUrl}
                            alt="Profile Image"
                            width={100}
                            height={100}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.split_rows}>
                <div className={styles.column_field}>
                  <p>Name</p>
                  <input
                    type="text"
                    defaultValue={userName}
                    placeholder={userName ? userName : "Name"}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div className={styles.column_field}>
                  <p>
                    Email{" "}
                    <span>
                      {verified ? (
                        <span className={styles.column_field_verified}>
                          Verified
                          <span>
                            <IoTrashBinOutline
                              onClick={() => {
                                RemoveUserEmail(userPubKey.userPubKey);
                                setEmail("");
                                setVerified(false);
                              }}
                            />
                          </span>
                        </span>
                      ) : (
                        <span className={styles.column_field_unverified}>
                          Unverified
                        </span>
                      )}
                    </span>
                  </p>
                  <input
                    type="text"
                    disabled={verified}
                    defaultValue={email}
                    placeholder={email ? email : "Email"}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {!verified && (
                    <>
                      <div className={styles.verify_text}>
                        <p>Verify with:</p>
                        <div className={styles.verify_icons}>
                          <button
                            disabled={email == null || email == ""}
                            aria-controls="google"
                            onClick={() => handleSignIn()}
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                            }}
                          >
                            <span className={styles.verify_icon}>
                              <IoLogoGoogle />
                            </span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.column_field}>
                <p>About Me</p>
                <textarea
                  placeholder={
                    description
                      ? description
                      : "Write about yourself, skills, products you're working on."
                  }
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className={styles.column_field}>
                <p>Social Links</p>
                <textarea
                  placeholder={
                    socialLinks != null ? socialLinks : "Social links"
                  }
                  onChange={(e) => setSocialLinks(e.target.value)}
                />
              </div>
              <div className={styles.column_field}>
                <p>Interests</p>
                <span className={styles.column_field_span}>
                  (Select your interests)
                </span>
                {/* map through availableInterests and return the name for each as a tag, when hovered over display the description as a tooltip, when selected add it to the selectedInterests array */}
                <div className={styles.interests_container}>
                  {availableInterests.map((interest, index) => (
                    <div
                      key={index}
                      className={styles.interests_item}
                      onClick={() => {
                        if (
                          selectedInterests.includes(
                            interest.name
                              .toLowerCase()
                              .replace(/ /g, "_")
                              .replace(/-/g, "_")
                          )
                        ) {
                          setSelectedInterests(
                            selectedInterests.filter(
                              (item) =>
                                item !==
                                interest.name
                                  .toLowerCase()
                                  .replace(/ /g, "_")
                                  .replace(/-/g, "_")
                            )
                          );
                        } else {
                          setSelectedInterests([
                            ...selectedInterests,
                            interest.name
                              .toLowerCase()
                              .replace(/ /g, "_")
                              .replace(/-/g, "_"),
                          ]);
                        }
                      }}
                    >
                      <span
                        className={
                          selectedInterests.includes(
                            // interest.name all lowercase any spaces or dashes replaced with _
                            interest.name
                              .toLowerCase()
                              .replace(/ /g, "_")
                              .replace(/-/g, "_")
                          )
                            ? styles.interests_item_selected
                            : styles.interests_item_unselected
                        }
                      >
                        <span className={styles.interests_name}>
                          {interest.name}
                        </span>
                      </span>
                      {/* <p className={styles.interests_item_tooltip}>{interest.description}</p> */}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.profile_body_update}>
                <button
                  className={styles.update_button}
                  onClick={() => {
                    setConfirmModal(true);
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderConnectivity = () => {
    return (
      <div>
        <h1>Connectivity</h1>
      </div>
    );
  };

  const renderNotifications = () => {
    return (
      <div>
        <h1>Notifications</h1>
      </div>
    );
  };

  const renderPasswordAndSecurity = () => {
    return (
      <div>
        <h1>Password & Security</h1>
      </div>
    );
  };

  const renderCurrentMenu = () => {
    if (activeDash === "Edit Profile") {
      return renderEditProfile();
    }
    // else if (activeDash === "Connectivity") {
    //   return renderConnectivity();
    // } else if (activeDash === "Notifications") {
    //   return renderNotifications();
    // } else if (activeDash === "Password & Security") {
    //   return renderPasswordAndSecurity();
    // }
  };

  useEffect(() => {
    if (userPubKey.userPubKey != null) {
      checkForNfts();
    }
  }, [userPubKey.userPubKey]);

  useEffect(() => {
    setWalletAddress(userPubKey.userPubKey);
    const getWalletSettings = async () => {
      try {
        setLoading(true);
        const response = await GetWalletSettings(userPubKey);
        setEmail(response.email != null ? response.email : "");
        setUserName(response.name != null ? response.name : "");
        setProfileImage(
          response.profileImage != null ? response.profileImage.url : ""
        );
        setPfpId(response.profileImage != null ? response.profileImage.id : "");
        setDescription(
          response.description != null ? response.description : ""
        );
        setSocialLinks(
          response.socialLinks != null ? response.socialLinks : []
        );

        setSelectedInterests(
          response.interest != null ? response.interest : []
        );
        setVerified(response.verified);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    getWalletSettings();

    async function sortInterests() {
      // ping /api/interests to get all interests
      const response = await fetch("/api/interests");
      const data = await response.json();

      //each interest has an id name and description
      setAvailableInterests(data.interests);
    }
    sortInterests();
  }, []);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_KEY, {
      extensions: [new OAuthExtension()],
    });
    if (urlParams.get("discordVerify") === "true") {
      async function handleVerifyWithSocial() {
        const result = await magic.oauth.getRedirectResult();
        const profile = JSON.stringify(result.oauth.userInfo, undefined, 2);
        const email = result.oauth.userInfo.email;
        const isVerified = result.oauth.userInfo.emailVerified;
        setVerified(isVerified);
        const name =
          result.oauth.userInfo.sources[`https://discord.com/api/users/@me`]
            .username;
        setUserName(name);
        const data = JSON.stringify({
          email: email,
          name: name,
          owner: userPubKey.userPubKey,
          verified: isVerified,
        });

        UpsertWallet(data);
      }
      handleVerifyWithSocial();
    }
    if (urlParams.get("googleVerify") === "true") {
      async function handleVerifyWithSocial() {
        const result = await magic.oauth.getRedirectResult();
        const profile = JSON.stringify(result.oauth.userInfo, undefined, 2);
        const email = result.oauth.userInfo.email;
        const isVerified = true;
        setVerified(isVerified);
        const name = result.oauth.userInfo.name;
        setUserName(name);
        const data = JSON.stringify({
          email: email,
          name: name,
          owner: userPubKey.userPubKey,
          verified: isVerified,
        });

        UpsertWallet(data);
      }
      handleVerifyWithSocial();
    }
  }, []);

  return (
    <div className={styles.profile_container}>
      {/* container with profile dash on left and current menu on right */}
      {/* dash will contain the following options: Edit Profile, Connectivity, Notifications, Password & Security */}
      {/* when selected, that option becomes the current menu on right */}
      {/* active Dash will have <IoArrowForwardOutline /> next to it */}

      {/* <div className={styles.profile_header_dash}> */}
      {/* <div className={styles.profile_header_dash_item}>
          <IoPencilSharp className={styles.profile_header_dash_item_icon} />
          <p
            onClick={() => (
              setShowEditProfile(true), setActiveDash("Edit Profile")
            )}
          >
            Edit Profile
          </p>
          {activeDash === "Edit Profile" && (
            <IoArrowForwardOutline
              className={styles.profile_header_dash_item_icon}
            />
          )}
        </div> */}
      {/* <div className={styles.profile_header_dash_item}>
          <IoLinkOutline className={styles.profile_header_dash_item_icon} />
          <p
            onClick={() => (
              setShowConnectivity(true), setActiveDash("Connectivity")
            )}
          >
            Connectivity
          </p>
          {activeDash === "Connectivity" && (
            <IoArrowForwardOutline
              className={styles.profile_header_dash_item_icon}
            />
          )}
        </div> */}
      {/* <div className={styles.profile_header_dash_item}>
          <IoNotificationsSharp
            className={styles.profile_header_dash_item_icon}
          />
          <p
            onClick={() => (
              setShowNotifications(true), setActiveDash("Notifications")
            )}
          >
            Notifications
          </p>
          {activeDash === "Notifications" && (
            <IoArrowForwardOutline
              className={styles.profile_header_dash_item_icon}
            />
          )}
        </div> */}
      {/* <div className={styles.profile_header_dash_item}>
          <IoShieldCheckmarkSharp
            className={styles.profile_header_dash_item_icon}
          />
          <p
            onClick={() => (
              setShowPasswordAndSecurity(true),
              setActiveDash("Password & Security")
            )}
          >
            Password & Security
          </p>
          {activeDash === "Password & Security" && (
            <IoArrowForwardOutline
              className={styles.profile_header_dash_item_icon}
            />
          )}
        </div> */}
      {/* </div> */}

      <div className={styles.profile_body}>
        {!loading && renderCurrentMenu()}
      </div>
    </div>
  );
};

export default Profile;
