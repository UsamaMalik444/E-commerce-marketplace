import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../User/styles/CreateLink.module.css";
import { addLink } from "../../lib/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { getCollectionOwner } from "../../lib/api";
import Loading from "../../components/Loading";
import CurrentLinks from "../../components/User/CurrentLinks";
import * as web3 from "@solana/web3.js";
import { GetWalletProfile } from "../../lib/api";

import {
  IoArrowForward,
  IoArrowBack,
  IoCopyOutline,
  IoCheckmark,
  IoChevronBackOutline,
} from "react-icons/io5";

import dynamic from "next/dynamic"; // Import dynamic from 'next/dynamic' to load the component dynamically
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Button from "@mui/material/Button";

const CreateLink = () => {
  const router = useRouter();
  const { publicKey } = useWallet();
  const [userPublicKey, setUserPublicKey] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [payLink, setPayLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [value, setValue] = useState();
  const [profileImageUrl, setProfileImageUrl] = useState();

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    collection: "LINK",
    owner: userPublicKey,
    token: "sol",
    // image_url:
    //   "https://cdn.shopify.com/s/files/1/0648/6274/8930/files/dos2.png",
    image_url: "https://plainbackground.com/download.php?imagename=bbbbb7.png",
    description: "",
    quantity: 0,
    reqUserEmail: false,
    reqUserShipping: false,
    reqTwitter: false,
    reqDiscord: false,
    reqNote: false,
    type: "link",
    note: "this is a pay link",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleCopy = (e) => {
    console.log(e);
    //copy to clipboard
    window.navigator.clipboard.writeText(e);
    setCopied(true);
  };

  

  // const shortenLink = async (link) => {
  //   const response = await fetch(
  //     `https://urlmee.com/api?api=${apiToken}&url=${link}&alias=CustomAlias`
  //   );
  //   const data = await response.json();
  //   console.log('this is the short link data ', data);
  //   console.log('this is the short link', data.short_url);
  // };

  const createProduct = async () => {
    try {
      const product = { ...newProduct };
      //setting up the description at the end
      product.description = value;
      if (profileImageUrl) {
        product.image_url = profileImageUrl;
      }
      const response = await addLink(product);
      const productId = response.publishProduct.id;
      setPayLink(productId);
      setShowLink(true);
    } catch (error) {
      console.log(error);
    }
  };

  const renderLink = () => {
    if (showLink) {
      return (
        <div className={styles.linkContainer}>
          <div className={styles.link}>
            <div className={styles.link_img}>
              <div className={styles.link_img_overlay}></div>
              <img
                src={
                  newProduct.type === "link"
                    ? "/paylink_bg.png"
                    : "/tipjar_bg.png"
                }
              />
            </div>
            <h5>
              Your {newProduct.type === "link" ? "PayRequest" : "Tip Jar"} has
              been created!
            </h5>
            <p>
              Your {newProduct.type === "link" ? "PayRequest" : "Tip Jar"} was
              successfully created and is live.
            </p>
            <div className={styles.share_link}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <span style={{ fontWeight: "bold", color: "#727272" }}>
                  Share link
                </span>
                <a
                  className={styles.link_text}
                  onClick={() => {
                    router.push(`/product/${payLink}`);
                  }}
                >
                  {`ikonshop.io/product/${payLink.slice(0, 7)}...`}
                </a>
              </div>
              {copied ? <IoCheckmark className={styles.copyIconCheck} /> : null}
              {!copied && (
                <IoCopyOutline
                  className={styles.copyIcon}
                  onClick={() =>
                    handleCopy(`https://www.ikonshop.io/product/${payLink}`)
                  }
                />
              )}
            </div>

            <div className={styles.link_buttons}>
              <button
                className={styles.preview_button}
                onClick={() => {
                  router.push(`/product/${payLink}`);
                }}
              >
                Preview Link
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderLoading = () => <Loading />;

  const renderChooseForm = () => (
    <>
      <div className={styles.payreq_container}>
        <div className={styles.payhubTextColor}>
          <ul style={{ fontSize: "22px" }}>
            <li>
              PayLinks are a simple, yet powerful tool to accept payments
              online. It simplifies transactions by generating unique payment
              links.
            </li>
            <li>PayRequest, is a fixed payment amount in crypto.</li>
            <li>
              TipJar, is an open ended PayLink and gives people the power to tip
              any amount they want, in any token.
            </li>
          </ul>
        </div>
        <div className={styles.btn_pair}>
          <Button
            variant="contained"
            className={styles.paylink_green}
            onClick={() => {
              setNewProduct({
                ...newProduct,
                type: "link",
                quantity: 0,
                price: "0",
              });
              setShowForm(true);
            }}
          >
            <div className={styles.paylink_green_text}>
              <h3>Pay Request</h3>
              <IoArrowForward
                style={{
                  position: "relative",
                  top: "2.5px",
                  fontSize: "24px",
                  color: "#494671",
                }}
              />
            </div>
          </Button>

          {/* <div
            className={styles.paylink_green}
            onClick={() => {
              setNewProduct({
                ...newProduct,
                type: "link",
                quantity: 0,
                price: "0",
              });
              setShowForm(true);
            }}
          >
            <div className={styles.paylink_green_text}>
              <h3>Pay Request</h3>
            </div>
            <IoArrowForward
              style={{
                position: "absolute",
                right: "30px",
                fontSize: "24px",
                color: "#494671",
              }}
            />
          </div> */}
          <Button
            className={styles.tipjar_pink}
            onClick={() => {
              setNewProduct({
                ...newProduct,
                type: "tipjar",
                quantity: 10000,
                price: "1",
              });

              setShowForm(true);
            }}
          >
            <div className={styles.tipjar_pink_text}>
              <h3>Tip Jar</h3>
              {/* <p>Wanna receive tips/gifts from your frens or anyone?</p> */}
              <IoArrowForward
                style={{
                  position: "relative",
                  top: "2.5px",
                  fontSize: "24px",
                  color: "#494671",
                }}
              />
            </div>
          </Button>
          {/* <div
            className={styles.tipjar_pink}
            onClick={() => {
              setNewProduct({
                ...newProduct,
                type: "tipjar",
                quantity: 10000,
                price: "1",
              });

              setShowForm(true);
            }}
          >
            <div className={styles.tipjar_pink_text}>
              <h3>Tip Jar</h3>
              <p>Wanna receive tips/gifts from your frens or anyone?</p>
            </div>
            <IoArrowForward
              style={{
                position: "absolute",
                right: "30px",
                fontSize: "24px",
                color: "#5c3a6b",
              }}
            />
          </div> */}
        </div>
        {/* <div className={styles.payreq_btns}>
          <button
            className={styles.paylink_green_btn}
            onClick={() => {
              setNewProduct({
                ...newProduct,
                type: "link",
                quantity: 0,
                price: "0",
              });
              setShowForm(true);
            }}
          >
            <span>Create PayRequest</span>
            <IoArrowForward
              style={{
                marginLeft: "10px",
              }}
            />
          </button>

          <button
            className={styles.tipjar_pink_btn}
            onClick={() => {
              setNewProduct({
                ...newProduct,
                type: "tipjar",
                quantity: 10000,
                price: "1",
              });

              setShowForm(true);
            }}
          >
            <span>Create a TipJar</span>
            <IoArrowForward
              style={{
                marginLeft: "10px",
              }}
            />
          </button>
        </div> */}
      </div>
      {/* <button
        className={styles.back_button}
        onClick={() => {
          setShowCurrentLinks(!showCurrentLinks);
        }}
        style={{
          marginTop: "20px",
          marginLeft: "20px",
        }}
      >
        {showCurrentLinks ? "Hide Links" : "View Current Links"}
      </button> */}
      <div className={styles.render_links}>
        <CurrentLinks />
      </div>
    </>
  );

  const renderForm = () => (
    <div className={styles.parent_form_container}>
      {/* back button to setShowForm false */}
      <div className={styles.back_button_container}>
        <button
          className={styles.back_button}
          onClick={() => {
            setShowForm(false);
          }}
        >
          <IoChevronBackOutline />
          <span>Back</span>
        </button>
      </div>
      <div className={styles.background_blur}>
        <div className={styles.create_product_container}>
          <div className={styles.create_product_form}>
            <div className={styles.form_container}>
              <div className={styles.form_header}>
                <img
                  src={
                    newProduct.type === "tipjar"
                      ? "/tipjar_head_bg.png"
                      : "/paylink_head_bg.png"
                  }
                />
                <h1 className={styles.form_header_text}>
                  Create a{" "}
                  {newProduct.type === "tipjar" ? "Tip Jar" : "Pay Request"}
                </h1>
              </div>
              <div className={styles.container_div}>
                <div className={styles.container_child}>
                  <div
                    style={{
                      padding: "10px 8px 20px 8px",
                    }}
                  >
                    <img
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      src={profileImageUrl}
                    />
                  </div>
                  {/* <div className={styles.form_header}>
                    <img
                      src={
                        newProduct.type === "tipjar"
                          ? "/tipjar_head_bg.png"
                          : "/paylink_head_bg.png"
                      }
                    />
                    <h1 className={styles.form_header_text}>
                      Create a{" "}
                      {newProduct.type === "tipjar" ? "Tip Jar" : "Pay Request"}
                    </h1>
                  </div> */}
                </div>
                <div className={styles.container_child}>
                  {/* <div className={styles.flex_row}>
                  <input
                    className={styles.input}
                    type="url"
                    placeholder="Image URL ex: https://i.imgur.com/rVD8bjt.png"
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, image_url: e.target.value });
                    }}
                  />
                </div> */}
                  {/* <textarea
                  className={styles.text_area}
                  placeholder="Description"
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    });
                  }}
                /> */}
                  <div
                    className={styles.flex_row}
                    style={{ paddingTop: "15px" }}
                  >
                    <TextField
                      className=" bg-white rounded  w-100 "
                      id="filled-basic"
                      label="Name"
                      variant="filled"
                      type="text"
                      onChange={(e) => {
                        setNewProduct({
                          ...newProduct,
                          name: e.target.value,
                          owner: userPublicKey.toString(),
                        });
                      }}
                    />
                    {/* <input
                    className={styles.input_name}
                    type="text"
                    placeholder="Name"
                    onChange={(e) => {
                      setNewProduct({
                        ...newProduct,
                        name: e.target.value,
                        owner: userPublicKey.toString(),
                      });
                    }}
                  /> */}
                  </div>
                  <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={setValue}
                    style={{
                      height: "200px",
                      borderRadius: "5px",
                      background: "#E6F0EC",
                      marginTop: "15px",
                    }}
                  />

                  <div className={styles.flex_row}>
                    {newProduct.type === "link" && (
                      // <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
                      //   <InputLabel id="demo-simple-select-standard-label">
                      //     {newProduct.type === "tipjar"
                      //       ? "Tipper Chooses Token"
                      //       : "Token"}
                      //   </InputLabel>
                      //   <Select
                      //     display={newProduct.type === "tipjar" ? "none" : "flex"}
                      //     disabled={newProduct.type === "tipjar" ? true : false}
                      //     labelId="demo-simple-select-standard-label"
                      //     id="demo-simple-select-standard"
                      //     onChange={(e) => {
                      //       setNewProduct({
                      //         ...newProduct,
                      //         token: e.target.value,
                      //         owner: userPublicKey.toString(),
                      //       });
                      //     }}
                      //   >
                      //     <MenuItem value="usdc">USDC</MenuItem>
                      //     <MenuItem value="sol">SOL</MenuItem>
                      //     <MenuItem value="groar">GROAR</MenuItem>
                      //     <MenuItem value="dust">DUST</MenuItem>
                      //     <MenuItem value="forge">FORGE</MenuItem>
                      //     <MenuItem value="creck">CRECK</MenuItem>
                      //     <MenuItem value="pesky">PESKY</MenuItem>
                      //     <MenuItem value="gmt">GMT</MenuItem>
                      //     <MenuItem value="gore">GORE</MenuItem>
                      //     <MenuItem value="rain">RAIN</MenuItem>
                      //   </Select>
                      // </FormControl>
                      <Select
                        placeholder={
                          newProduct.type === "tipjar"
                            ? "Tipper Chooses Token"
                            : "Token"
                        }
                        display={newProduct.type === "tipjar" ? "none" : "flex"}
                        className={newProduct.type != "tipjar" && styles.input}
                        disabled={newProduct.type === "tipjar" ? true : false}
                        onChange={(e, newvalue) => {
                          setNewProduct({
                            ...newProduct,
                            token: newvalue,
                            owner: userPublicKey.toString(),
                          });
                          console.log(newProduct);
                        }}
                      >
                        <Option
                          value="usdc"
                          style={{ backgroundImage: "/usdc.png" }}
                        >
                          USDC
                        </Option>
                        <Option value="sol">SOL</Option>
                        <Option value="groar">GROAR</Option>
                        <Option value="dust">DUST</Option>
                        <Option value="forge">FORGE</Option>
                        <Option value="creck">CRECK</Option>
                        <Option value="pesky">PESKY</Option>
                        <Option value="gmt">GMT</Option>
                        <Option value="gore">GORE</Option>
                        <Option value="rain">RAIN</Option>
                      </Select>
                    )}
                    <div className={styles.col_half}>
                      {newProduct.type === "link" && (
                        <TextField
                          className="bg-white rounded w-100 my-2"
                          id="filled-basic"
                          label="Price"
                          variant="filled"
                          type="text"
                          onChange={(e) => {
                            setNewProduct({
                              ...newProduct,
                              price: e.target.value,
                            });
                          }}
                        />
                        // <input
                        //   className={styles.input_name}
                        // if newProduct.type is tipjar, then disable input
                        // disabled={false}
                        // if newProduct.type is tipjar, then set price to 0
                        //   type="text"
                        //   placeholder="Price"
                        //   onChange={(e) => {
                        //     setNewProduct({
                        //       ...newProduct,
                        //       price: e.target.value,
                        //     });
                        //   }}
                        // />
                      )}
                    </div>

                    {newProduct.type === "link" && (
                      <TextField
                        className="bg-white rounded w-50  my-2"
                        id="filled-basic"
                        label="Qty"
                        variant="filled"
                        type="number"
                        disabled={newProduct.type === "tipjar" ? true : false}
                        value={
                          newProduct.type === "tipjar"
                            ? 10000
                            : newProduct.quantity
                        }
                        onChange={(e) => {
                          setNewProduct({
                            ...newProduct,
                            quantity: e.target.value,
                          });
                        }}
                      />

                      // <input
                      //   className={styles.input}
                      //   type="number"
                      //   if newProduct.type is tipjar, then do not display input

                      //   disabled={newProduct.type === "tipjar" ? true : false}
                      //   value={
                      //     newProduct.type === "tipjar" ? 10000 : newProduct.quantity
                      //   }
                      //   onChange={(e) => {
                      //     setNewProduct({
                      //       ...newProduct,
                      //       quantity: e.target.value,
                      //     });
                      //     console.log(newProduct);
                      //   }}
                      //   placeholder="Qty"
                      // />
                    )}
                  </div>

                  {newProduct.type === "link" && (
                    <div style={{ paddingTop: "40px" }}>
                      {/* Checkbox for requiring user email */}
                      <FormControl component="fieldset">
                        <FormGroup aria-label="position" row>
                          <FormControlLabel
                            className={styles.checkbox_text}
                            value="start"
                            control={
                              <Checkbox
                                style={{
                                  color: "#8AFFCB",
                                }}
                                onChange={(e) => {
                                  setNewProduct({
                                    ...newProduct,
                                    reqUserEmail: e.target.checked,
                                  });
                                }}
                              />
                            }
                            label="Do you require their Email?"
                            labelPlacement="end"
                          />
                          <FormControlLabel
                            className={styles.checkbox_text}
                            value="start"
                            control={
                              <Checkbox
                                style={{
                                  color: "#8AFFCB",
                                }}
                                onChange={(e) => {
                                  setNewProduct({
                                    ...newProduct,
                                    reqUserShipping: e.target.checked,
                                  });
                                }}
                              />
                            }
                            label=" Do you require their Shipping info?"
                            labelPlacement="end"
                          />
                          <FormControlLabel
                            className={styles.checkbox_text}
                            value="start"
                            control={
                              <Checkbox
                                style={{
                                  color: "#8AFFCB",
                                }}
                                onChange={(e) => {
                                  setNewProduct({
                                    ...newProduct,
                                    reqDiscord: e.target.checked,
                                  });
                                }}
                              />
                            }
                            label="Do you require their Discord ID?"
                            labelPlacement="end"
                          />
                          <FormControlLabel
                            className={styles.checkbox_text}
                            value="start"
                            control={
                              <Checkbox
                                style={{
                                  color: "#8AFFCB",
                                }}
                                onChange={(e) => {
                                  setNewProduct({
                                    ...newProduct,
                                    reqTwitter: e.target.checked,
                                  });
                                }}
                              />
                            }
                            label="Do you require their Twitter Handle?"
                            labelPlacement="end"
                          />
                        </FormGroup>
                      </FormControl>
                      {/* <div className={styles.reqemail_reqshipping}>
                      <div className={styles.checkbox_container}>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            setNewProduct({
                              ...newProduct,
                              reqUserEmail: e.target.checked,
                            });
                          }}
                        />
                      </div>
                      <div className={styles.checkbox_text}>
                        Do you require their Email?
                      </div>
                    </div> */}
                      {/* <div className={styles.reqemail_reqshipping}>
                      <div className={styles.checkbox_container}>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            setNewProduct({
                              ...newProduct,
                              reqUserShipping: e.target.checked,
                            });
                          }}
                        />
                      </div>
                      <div className={styles.checkbox_text}>
                        Do you require their Shipping info?
                      </div>
                    </div> */}
                      {/* <div className={styles.reqemail_reqshipping}>
                      <div className={styles.checkbox_container}>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            setNewProduct({
                              ...newProduct,
                              reqDiscord: e.target.checked,
                            });
                          }}
                        />
                      </div>
                      <div className={styles.checkbox_text}>
                        Do you require their Discord ID?
                      </div>
                    </div> */}
                      {/* <div className={styles.reqemail_reqshipping}>
                      <div className={styles.checkbox_container}>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            setNewProduct({
                              ...newProduct,
                              reqTwitter: e.target.checked,
                            });
                          }}
                        />
                      </div>
                      <div className={styles.checkbox_text}>
                        Do you require their Twitter Handle?
                      </div>
                    </div> */}
                    </div>
                  )}

                  <button
                    className={styles.button}
                    onClick={() => {
                      setNewProduct({
                        ...newProduct,
                        owner: userPublicKey.toString(),
                      });

                      if (newProduct.price == "" || newProduct.price == "0") {
                        if (
                          confirm(
                            "Are you sure you want to set your price to 0?"
                          ) == false
                        ) {
                          return;

                          return;
                        }
                      }
                      if (newProduct.token == "") {
                        alert("Please select a token");
                        return;
                      }
                      if (newProduct.quantity == 0) {
                        alert("Please select a quantity");
                        return;
                      }
                      if (newProduct.name == "") {
                        alert("Please enter a name");
                        return;
                      }
                      if (value == "") {
                        alert("Please enter a description");

                        return;
                      } else {
                        createProduct();
                      }
                    }}
                  >
                    Create Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setCopied(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (publicKey) {
      setLoading(false);
    }
  }, [publicKey]);

  const getProfileImage = async (publicKey) => {
    let profile = await GetWalletProfile(publicKey);
    setProfileImageUrl(profile.wallet?.profileImage?.url);
  };

  useEffect(() => {
    if (!publicKey) {
      if (localStorage.getItem("userMagicMetadata")) {
        const publicAddress = JSON.parse(
          localStorage.getItem("userMagicMetadata")
        ).publicAddress;
        const publicKey = new web3.PublicKey(publicAddress);
        setUserPublicKey(publicKey.toString());
        console.log("public key from local storage", publicKey.toString());
        getProfileImage(publicKey.toString());
      }
    } else {
      setUserPublicKey(publicKey.toString());
      getProfileImage(publicKey.toString());
    }
  }, [publicKey]);

  return (
    <>
      {loading ? renderLoading() : null}
      {!loading && !showLink && !showForm ? renderChooseForm() : null}
      {!loading && !showLink && showForm ? renderForm() : null}

      {/* {!loading && !showLink && !showForm && showCurrentLinks && (
        
      )} */}

      {showLink ? renderLink() : null}
    </>
  );
};

export default CreateLink;
