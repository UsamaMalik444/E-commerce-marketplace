import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { Button as Btn, Form, Input, Message } from "semantic-ui-react";
import styles from "../../styles/CreateProduct.module.css";
import { useFileUpload } from "../../hooks/fileUpload";
import {
  addProduct,
  fetchCollectionIdByOwner,
  updateProductWithPhotos,
  updateProductWithFiles,
} from "../../lib/api";
import { useWallet } from "@solana/wallet-adapter-react";
import Loading from "../../components/Loading";
import tokens from "../../constants/tokens";
import { Magic } from "magic-sdk";
import { SolanaExtension } from "@magic-ext/solana";
import { useImageUpload, replaceImage } from "../../hooks/imageUpload";
import * as web3 from "@solana/web3.js";
// import { useQuill } from "react-quilljs";
// import "quill/dist/quill.snow.css";

import dynamic from "next/dynamic"; // Import dynamic from 'next/dynamic' to load the component dynamically
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";

const CreateDigitalProduct = () => {
  const router = useRouter();
  const { publicKey } = useWallet();
  const [creatingDigitalProduct, setCreatingDigitalProduct] = useState(false);
  const [userPublicKey, setUserPublicKey] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  // const { quill, quillRef } = useQuill();
  const [showTokenSelection, setShowTokenSelection] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [value, setValue] = useState();

  const placeholder = "Product description";
  // const productOwner = publicKey.toString();

  const rpcUrl =
    "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7";
  const connection = new web3.Connection(rpcUrl);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    collection: "ALL_PROD",
    owner: "",
    token: "usdc",
    paymentOptions: ["usdc"],
    hide: false,
    image_url:
      "https://cdn.shopify.com/s/files/1/0648/6274/8930/files/dos2.png",
    description: "no description",
    quantity: 100,
    reqUserEmail: false,
    reqDiscord: false,
    reqTwitter: false,
    reqUserShipping: false,
    reqColor: false,
    reqNote: false,
    type: "product",
  });

  const product_to_submit = useMemo(
    () => ({
      ...newProduct,
      owner: userPublicKey.toString(),
    }),
    [
      userPublicKey,
      newProduct.name,
      newProduct.price,
      newProduct.collection,
      newProduct.token,
      newProduct.paymentOptions,
      newProduct.hide,
      newProduct.image_url,
      newProduct.description,
      newProduct.quantity,
      newProduct.reqUserEmail,
      newProduct.reqDiscord,
      newProduct.reqTwitter,
      newProduct.reqUserShipping,
      newProduct.reqColor,
      newProduct.reqNote,
      newProduct.type,
    ]
  );

  useEffect(() => {
    console.log("new product", newProduct);
  }, [newProduct]);

  const [photoFileArray, setPhotoFileArray] = useState([]);
  const [uploading, setUploading] = useState(false);

  const renderCreatingProductLoading = () => {
    return (
      <div className={styles.loading_container}>
        <Loading />
      </div>
    );
  };

  const renderFileUpload = () => {
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setFile(file);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setFileLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const data = await useFileUpload(file, publicKey.toString());
        console.log(data);
        const id = await JSON.parse(data).id;
        console.log(id);
        setFileURL(id);
        setSuccess(true);
      } catch (error) {
        setError(error);
      } finally {
        setFileLoading(false);
      }
    };

    return (
      <Form
        style={{
          maxWidth: 500,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <Form.Field>
          <label>Upload File</label>
          <input type="file" onChange={handleFileChange} />
        </Form.Field>
        <Btn className={styles.button} type="submit">
          Submit
        </Btn>
        {fileLoading && <p>Uploading file...</p>}
        {error && (
          <Message
            negative
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              textAlign: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <strong>There was an error</strong>
            <p>{error.message}</p>
          </Message>
        )}
        {success && (
          <Message
            positive
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              textAlign: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <strong>Success</strong>
            <p>File uploaded successfully</p>
          </Message>
        )}
      </Form>
    );
  };

  const createProduct = async () => {
    var id_to_update = "";
    async function uploadFiles() {
      try {
        console.log("uploading files", ...photoFileArray);
        var idArray = [];
        for (let i = 0; i < photoFileArray.length; i++) {
          const file = photoFileArray[i];
          console.log("file", file);
          const response = await useImageUpload(file);
          const id = await JSON.parse(response).id;
          console.log("response", id);
          idArray.push(id);
        }
        console.log("id 2 update", id_to_update);
        console.log("productIdForPhotos", idArray);
        await updateProductWithPhotos(id_to_update, idArray);
        await updateProductWithFiles(id_to_update, fileURL);
        console.log("updated files");
        // setCreatingProduct(false);
        window.dispatchEvent(new Event("merchant_show_products"));
      } catch (error) {
        console.log(error.message);
        alert("Error creating product" + error);
      }
    }
    try {
      product_to_submit.description = value;
      const response = await addProduct(product_to_submit);
      console.log("Response from api", response);
      const new_id = response.publishProduct.id;
      var id_to_update = new_id;
      uploadFiles();
    } catch (error) {
      console.log(error.message);
      alert("Error creating product" + error);
    }
  };
  const confirmCreateProduct = () => {
    // display a modal to confirm the product details in the middle of the screen, if yes then addProduct(product_to_submit) if no then return
    return (
      <div className={styles.confirm_modal}>
        <div className={styles.confirm_modal_container}>
          <h1>Are you sure you want to create this product?</h1>
          <div className={styles.confirm_modal_row}>
            <button
              className={styles.confirm_modal_button}
              onClick={() => {
                setShowConfirmModal(false);
                createProduct();
                setUploading(true);
              }}
            >
              Yes
            </button>
            <button
              className={styles.confirm_modal_button}
              onClick={() => {
                setShowConfirmModal(false);
                return;
              }}
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLoading = () => <Loading />;
  const renderTokenSelection = () => {
    // create a token list from the tokens import, it's an array of objects with token symbol and token logo
    return (
      <div className={styles.token_selection_container}>
        <div className={styles.token_selection}>
          <div className={styles.token_selection_title}>
            Select Accepted Tokens
            <span
              className={styles.token_selection_close}
              onClick={() => setShowTokenSelection(false)}
            >
              X
            </span>
          </div>
          <div className={styles.token_selection_row}>
            {tokens.map((token, index) => (
              // if the token is in the acceptedTokens array, check the checkbox
              <div
                className={
                  newProduct.paymentOptions.includes(token.symbol.toLowerCase())
                    ? styles.token_selection_item_selected
                    : styles.token_selection_item
                }
                key={index}
                onClick={() => {
                  // if the token is in the acceptedTokens array, remove it
                  if (
                    newProduct.paymentOptions.includes(
                      token.symbol.toLowerCase()
                    ) &&
                    token.symbol !== "USDC"
                  ) {
                    const newAcceptedTokens = newProduct.paymentOptions.filter(
                      (item) => item !== token.symbol.toLowerCase()
                    );
                    console.log("newAcceptedTokens", newAcceptedTokens);
                    setNewProduct({
                      ...newProduct,
                      paymentOptions: newAcceptedTokens,
                    });
                  } else if (
                    !newProduct.paymentOptions.includes(
                      token.symbol.toLowerCase()
                    ) &&
                    token.symbol !== "USDC"
                  ) {
                    // if the token is not in the acceptedTokens array, add it
                    const newAcceptedTokens = [
                      ...newProduct.paymentOptions,
                      token.symbol.toLowerCase(),
                    ];
                    setNewProduct({
                      ...newProduct,
                      paymentOptions: newAcceptedTokens,
                    });
                  }
                }}
              >
                <div className={styles.token_selection_item_logo}>
                  <img
                    className={styles.token_selection_img}
                    src={token.logo}
                    alt={token.symbol}
                  />
                </div>
                <span className={styles.token_selection_item_symbol}>
                  {token.symbol}
                </span>
              </div>
            ))}
          </div>

          {/* alternative close btn */}
          <button
            onClick={() => setShowTokenSelection(false)}
            className={styles.token_selection_close_btn}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // this will be a function that will render the form to upload multiple photos and return an array of the ids
  const renderProductPhotosUpload = () => {
    var photoIds = [];
    const output = document.querySelector("output");
    const input = document.querySelector("input");
    let imagesArray = [];

    function onChange(file) {
      const files = [...file];
      console.log("files", files);
      for (let i = 0; i < files.length; i++) {
        imagesArray.push(files[i]);
        setPhotoFileArray(imagesArray);
      }
      displayImages();
    }
    function displayImages() {
      imagesArray.forEach((image, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.width = 100;
          img.height = 100;
          img.style.margin = "10px";
          img.onclick = function () {
            deleteImage(index);
          };
          output.appendChild(img);
        };
        reader.readAsDataURL(image);
      });
      const reader = new FileReader();
      reader.onload = function (e) {
        output.src = e.target.result;
      };
    }
    function deleteImage(index) {
      imagesArray.splice(index, 1);
      setPhotoFileArray(imagesArray);
      displayImages();
    }

    return (
      // <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginLeft: '10%'}}>
      <div className={styles.upload_container}>
        {/* <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}> */}
        <div className={styles.upload_input}>
          {/* <label style={{color:'black'}}>Product Images</label> */}
          <label className={styles.upload_title}>Product Images</label>

          {/* <span style={{color: 'grey', fontSize: '8px', fontStyle: 'italic' }}>first image will display on card</span> */}
          <span className={styles.upload_span}>
            (first image will display on card)
          </span>

          <input
            className={styles.upload_name}
            type="file"
            multiple="multiple"
            accept="image/jpeg, image/png, image/jpg, image/gif, image/bmp, image/tiff, image/webp, image/svg+xml, image/x-icon"
            // style the button
            // style={{color: 'black', backgroundColor: 'white', border: '1px solid black', borderRadius: '5px', padding: '5px', width: '100px', height: '30px', fontSize: '10px', cursor: 'pointer'}}
            onChange={(e) => {
              console.log("e.target.files", e.target.files),
                onChange(e.target.files);
            }}
          />
        </div>
        <div className={styles.upload_input}></div>
        {/* <output style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}></output> */}
        <output className={styles.upload_output}></output>
      </div>
    );
  };

  const renderForm = () => (
    <>
      <div className={styles.text_input}>
        <div className={styles.upload_row}>{renderProductPhotosUpload()}</div>
        <div className={styles.upload_row}>
          <div className={styles.upload_input}>
            <label className={styles.upload_title}>Product File</label>
            <span className={styles.upload_span}>
              (file will be uploaded to Hygraph)
            </span>
            {renderFileUpload()}
          </div>
        </div>

        <div className={styles.flex_row}>
          <TextField
            className=" bg-white rounded w-100"
            id="filled-basic"
            label="Product Name"
            variant="filled"
            type="text"
            onChange={(e) => {
              setNewProduct({ ...newProduct, name: e.target.value });
            }}
          />
          {/* <input
            className={styles.input_name}
            type="text"
            placeholder="Product Name"
            onChange={(e) => {
              setNewProduct({ ...newProduct, name: e.target.value });
            }}
          /> */}
        </div>

        <div className={styles.flex_row}>
          {/* <select
            className={styles.input}
            onChange={(e) => {
              console.log("product token", newProduct);
              setNewProduct({
                ...newProduct,
                token: e.target.value,
                owner: userPublicKey.toString(),
              });
            }}
          >
            <option value="">Token</option>
            <option value="usdc">USDC</option>
            <option value="sol">SOL</option>
            <option value="groar">GROAR</option>
            <option value="forge">FORGE</option>
            <option value="dust">DUST</option>
            <option value="creck">CRECK</option>
            <option value="pesky">PESKY</option>
            <option value="gmt">GMT</option>
            <option value="gore">GORE</option>
          </select> */}

          <div className={styles.col_half}>
            <TextField
              // className={styles.input_name}
              className="bg-white rounded w-100 my-2"
              id="filled-basic"
              label="USDC Price"
              variant="filled"
              type="text"
              onChange={(e) => {
                setNewProduct({ ...newProduct, price: e.target.value });
              }}
            />
            {/* <input
              className={styles.input_name}
              type="text"
              placeholder="USDC Price"
              onChange={(e) => {
                setNewProduct({ ...newProduct, price: e.target.value });
              }}
            /> */}
          </div>

          {/* button to click to setShowTicketSelection to true */}
          <div className={styles.col_half}>
            <Button
              // className={styles.show_tokens_button}
              style={{ fontSize: "13px", background: "#F0F0F0" }}
              className=" mt-2 "
              variant="outlined"
              onClick={() => setShowTokenSelection(true)}
            >
              Select Accepted Tokens
            </Button>
            {/* <button
              className={styles.show_tokens_button}
              onClick={() => setShowTokenSelection(true)}
            >
              Select Accepted Tokens
            </button> */}
          </div>

          <TextField
            // className={styles.input}
            className="bg-white rounded w-50  my-2"
            id="filled-basic"
            label="# Available"
            variant="filled"
            type="number"
            // placeholder="# Available"
            onChange={(e) => {
              setNewProduct({
                ...newProduct,
                quantity: e.target.value,
              });
            }}
          />
          {/* <input
            className={styles.input}
            type="number"
            placeholder="# Available"
            onChange={(e) => {
              setNewProduct({
                ...newProduct,
                quantity: e.target.value,
              });
            }}
          /> */}

          <div
            className={styles.input}
            style={{ background: "#F0F0F0", padding: "4px 5px" }}
          >
            <FormControl>
              <RadioGroup
                row
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="Live"
                name="radio-buttons-group"
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      hide: false,
                    });
                  }}
                  label="Live"
                />
                <FormControlLabel
                  value="true1"
                  control={<Radio />}
                  label="Draft"
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      hide: true,
                    });
                  }}
                />
              </RadioGroup>
            </FormControl>
            {/* <label style={{ marginLeft: "24%" }} />
            <input
              type="radio"
              name="status"
              onChange={(e) => {
                setNewProduct({
                  ...newProduct,
                  hide: false,
                });
              }}
            />{" "}
            Live
            <label style={{ marginLeft: "5%" }} />
            <input
              type="radio"
              name="status"
              onChange={(e) => {
                setNewProduct({
                  ...newProduct,
                  hide: true,
                });
              }}
            />{" "}
            Draft
            <br /> */}
          </div>
        </div>

        <ReactQuill
          theme="snow"
          value={value}
          onChange={setValue}
          style={{
            height: "250px",
            background: "#F0F0F0",
            borderRadius: "15px",
          }}
        />
        {/* <div className={styles.description_area}>
          <div
            ref={quillRef}
            style={{ height: "200px", width: "100%" }}
            value={newProduct.description}
          />
        </div> */}
        <div>
          <div className={styles.flex_row}>
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
                  label="Require Email"
                  labelPlacement="start"
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
                  label="Require Discord"
                  labelPlacement="start"
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
                  label="Require Twitter"
                  labelPlacement="start"
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
                        console.log(newProduct);
                      }}
                    />
                  }
                  label="Require Shipping Info"
                  labelPlacement="start"
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
                          reqColor: e.target.checked,
                        });
                        console.log(newProduct);
                      }}
                    />
                  }
                  label="Require Color Selection"
                  labelPlacement="start"
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
                          reqNote: e.target.checked,
                        });
                        console.log(newProduct);
                      }}
                    />
                  }
                  label="User Note"
                  labelPlacement="start"
                />
              </FormGroup>
            </FormControl>
            {/* Checkbox for requiring user email */}
            {/* <div className={styles.checkbox_text}>Require Email</div>
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
            <div className={styles.checkbox_text}>Require Discord</div>
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
            <div className={styles.checkbox_text}>Require Twitter</div>
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
            <div className={styles.checkbox_text}>Require Shipping Info</div>
            <div className={styles.checkbox_container}>
              <input
                type="checkbox"
                onChange={(e) => {
                  setNewProduct({
                    ...newProduct,
                    reqUserShipping: e.target.checked,
                  });
                  console.log(newProduct);
                }}
              />
            </div>
            <div className={styles.checkbox_text}>Require Color Selection</div>
            <div className={styles.checkbox_container}>
              <input
                type="checkbox"
                onChange={(e) => {
                  setNewProduct({
                    ...newProduct,
                    reqColor: e.target.checked,
                  });
                  console.log(newProduct);
                }}
              />
            </div>
            <div className={styles.checkbox_text}>User Note</div>
            <div className={styles.checkbox_container}>
              <input
                type="checkbox"
                onChange={(e) => {
                  setNewProduct({
                    ...newProduct,
                    reqNote: e.target.checked,
                  });
                  console.log(newProduct);
                }}
              />
            </div> */}
          </div>

          <button
            className={styles.button}
            onClick={() => {
              console.log("new product", product_to_submit);
              setShowConfirmModal(true);
            }}
            disabled={uploading}
          >
            Create Product
          </button>
        </div>
      </div>
    </>
  );

  useEffect(() => {
    if (publicKey) {
      setUserPublicKey(publicKey);
      fetchCollectionIdByOwner(publicKey.toString()).then((collectionId) => {
        setNewProduct({
          ...newProduct,
          collection: collectionId,
        });
      });
      setLoading(false);
    }
  }, [publicKey]);

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
        setIsLoggedIn(true);
        magic.user.isLoggedIn().then(async (magicIsLoggedIn) => {
          setIsLoggedIn(magicIsLoggedIn);
          if (magicIsLoggedIn) {
            magic.user.getMetadata().then((user) => {
              const pubKey = new web3.PublicKey(user.publicAddress);
              setUserPublicKey(pubKey);
              fetchCollectionIdByOwner(pubKey.toString()).then(
                (collectionId) => {
                  setNewProduct({
                    ...newProduct,
                    collection: collectionId,
                  });
                }
              );
            });
          }
        });
      }
    }
    checkUser();
    setLoading(false);
  }, []);

  // useEffect(() => {
  //   var product = newProduct;

  //   if (quill) {
  //     quill.on("text-change", (delta, oldDelta, source, placeholder) => {
  //       let content = quill.root.innerHTML;

  //       // Find all anchor tags in the content
  //       const anchorTags = content.match(/<a\b[^>]*>(.*?)<\/a>/gi);

  //       // Process each anchor tag
  //       if (anchorTags) {
  //         for (let i = 0; i < anchorTags.length; i++) {
  //           const anchorTag = anchorTags[i];
  //           const urlRegex = /href="(.*?)"/i;
  //           const urlMatch = anchorTag.match(urlRegex);

  //           if (urlMatch) {
  //             let url = urlMatch[1];
  //             if (!url.startsWith("http://") && !url.startsWith("https://")) {
  //               url = "http://" + url;
  //               const updatedAnchorTag = anchorTag.replace(
  //                 urlRegex,
  //                 `href="${url}"`
  //               );
  //               content = content.replace(anchorTag, updatedAnchorTag);
  //             }
  //           }
  //         }
  //       }

  //       if (content.length > 0) {
  //         setNewProduct({
  //           ...product,
  //           description: content,
  //         });
  //       }
  //     });
  //   }
  // }, [quill, newProduct]);

  return (
    <>
      {loading && isLoggedIn ? renderLoading() : null}
      {!loading && !creatingProduct && renderForm()}
      {showTokenSelection && renderTokenSelection()}
      {showConfirmModal && confirmCreateProduct()}
      {creatingProduct && renderCreatingProductLoading()}
    </>
  );
};

export default CreateDigitalProduct;
