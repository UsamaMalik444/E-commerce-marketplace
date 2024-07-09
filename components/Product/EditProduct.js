import React, { useState, useEffect } from "react";
import styles from "./styles/EditProduct.module.css";
import Loading from "../Loading";
import tokens from "../../constants/tokens";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {
  EditProductInDB,
  updateProductWithPhotos,
  getSingleProductBySku,
} from "../../lib/api";
import {
  useImageUpload,
  replaceImage,
  deleteImage,
} from "../../hooks/imageUpload";
import { useQuill } from "react-quilljs";
import { IoChevronDown, IoCloseCircleOutline } from "react-icons/io5";

const EditProduct = ({ obj }) => {
  const [photoFileArray, setPhotoFileArray] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const { quill, quillRef } = useQuill();
  const [showSelectedTokens, setShowTokenSelection] = useState(false);
  const [acceptedTokens, setAcceptedTokens] = useState([]);
  const [product, setProduct] = useState({
    id: "",
    owner: "",
    collection: "",
    name: "",
    description: "",
    price: "",
    productImages: [],
    imageUrl: "",
    quantity: 0,
    token: "",
    hide: "",
    reqUserEmail: false,
    reqUserShipping: false,
    reqNote: false,
    reqColor: false,
    reqDiscord: false,
    reqTwitter: false,
    paymentOptions: [],
  });

  const handleProductEdit = async () => {
    var id_to_update = "";
    async function uploadFiles() {
      try {
        // delete old images
        for (let i = 0; i < product.productImages.length; i++) {
          const image = product.productImages[i];
          console.log("deleting image", image.id);
          await deleteImage(image.id);
        }
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
        console.log("productIdForPhotos", idArray);
        const update = await updateProductWithPhotos(id_to_update, idArray);
        console.log("update", update);
        const new_data = await getSingleProductBySku(id_to_update);
        console.log("new_data", new_data);
        setProduct(new_data.product);
        setPhotoFileArray([]);
        setLoading(false);
      } catch (error) {
        console.log(error.message);
        alert("Error creating product" + error);
        setLoading(false);
      }
    }
    try {
      setLoading(true);
      console.log("product", product);
      const response = await EditProductInDB(product);
      console.log("response", response);
      id_to_update = response.publishProduct.id;
      console.log("id_to_update", id_to_update);
      if (photoFileArray.length > 0) {
        await uploadFiles();
        window.dispatchEvent(new Event("merchant_show_products"));
      } else {
        setLoading(false);
        // dispatch event to update products
        console.log("dispatching event");
        window.dispatchEvent(new Event("merchant_show_products"));
      }
    } catch (error) {
      console.log(error.message);
      alert("Error creating product" + error);
    }
  };

  const handleImageChange = (e) => {
    const { name } = e.target;
    // reserve image at index 0 for the main image
    if (name === "next") {
      if (currentImage === product.productImages.length - 1) {
        setCurrentImage(0);
      } else {
        setCurrentImage(currentImage + 1);
      }
    } else {
      if (currentImage === 0) {
        setCurrentImage(product.productImages.length - 1);
      } else {
        setCurrentImage(currentImage - 1);
      }
    }
  };

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
      console.log("imagesArray", imagesArray);
      // display just the image in the output element
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
      <div>
        <div className={styles.column_field_upload}>
          <label className={styles.token_label}>Product Images</label>
          {/* <span style={{ color: "grey", fontSize: "8px", fontStyle: "italic" }}>
            first image will display on card
          </span> */}
          <input
            type="file"
            className={styles.column_field_upload_input}
            multiple="multiple"
            accept="image/jpeg, image/png, image/jpg"
            onChange={(e) => {
              console.log("e.target.files", e.target.files),
                onChange(e.target.files);
            }}
          />
        </div>
        {photoFileArray.length > 0 && (
          <span
            style={{
              marginBottom: "10px",
              alignSelf: "center",
              color: "red",
              fontSize: "8px",
              fontWeight: "600",
            }}
          >
            Images will take a few minutes to register when updating.
          </span>
        )}
        <output
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "center",
          }}
        ></output>
      </div>
    );
  };

  const renderTokenSelection = () => {
    // create a token list from the tokens import, it's an array of objects with token symbol and token logo
    return (
      <div className={styles.token_selection_container_overlay}>
        <div className={styles.token_selection_container}>
          <div className={styles.token_selection}>
            <div className={styles.token_selection_title}>
              Select Accepted Tokens
              <span
                className={styles.token_selection_close}
                onClick={() => setShowTokenSelection(false)}
              >
                <IoCloseCircleOutline />
              </span>
            </div>
            <div className={styles.token_selection_row}>
              {tokens.map((token, index) => (
                // if the token is in the acceptedTokens array, check the checkbox
                <div
                  className={
                    product.paymentOptions.includes(token.symbol.toLowerCase())
                      ? styles.token_selection_item_selected
                      : styles.token_selection_item
                  }
                  key={index}
                  onClick={() => {
                    // if the token is in the acceptedTokens array, remove it
                    if (
                      product.paymentOptions.includes(
                        token.symbol.toLowerCase()
                      )
                    ) {
                      const newAcceptedTokens = product.paymentOptions.filter(
                        (item) => item !== token.symbol.toLowerCase()
                      );
                      setProduct({
                        ...product,
                        paymentOptions: newAcceptedTokens,
                      });
                    } else {
                      // if the token is not in the acceptedTokens array, add it
                      const newAcceptedTokens = [
                        ...product.paymentOptions,
                        token.symbol.toLowerCase(),
                      ];
                      setProduct({
                        ...product,
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
      </div>
    );
  };

  // useEffect(() => {
  //   if (quill) {
  //     quill.on("text-change", (delta, oldDelta, source, placeholder) => {
  //       // console.log('Text change!');
  //       let str = quill.getText(); // Get text only
  //       console.log(str, "stringgg");
  //       if (str.length > 0) {
  //         setProduct({
  //           ...product,
  //           description: quill.root.innerHTML,
  //         });
  //       }
  //       // console.log(quill.getContents()); // Get delta contents
  //       // console.log(quill.root.innerHTML); // Get innerHTML using quill
  //       // console.log(quillRef.current.firstChild.innerHTML); // Get innerHTML using quillRef
  //     });
  //   }
  // }, [quill]);

  useEffect(() => {
    if (quill) {
      quill.on("text-change", (delta, oldDelta, source, placeholder) => {
        let content = quill.root.innerHTML;

        // Find all anchor tags in the content
        const anchorTags = content.match(/<a\b[^>]*>(.*?)<\/a>/gi);

        // Process each anchor tag
        if (anchorTags) {
          for (let i = 0; i < anchorTags.length; i++) {
            const anchorTag = anchorTags[i];
            const urlRegex = /href="(.*?)"/i;
            const urlMatch = anchorTag.match(urlRegex);

            if (urlMatch) {
              let url = urlMatch[1];
              if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "http://" + url;
                const updatedAnchorTag = anchorTag.replace(
                  /href="(.*?)"/i,
                  `href="${url}"`
                );
                content = content.replace(anchorTag, updatedAnchorTag);
              }
            }
          }
        }

        setProduct({
          ...product,
          description: content,
        });
      });

      // // Process existing links in the initial content
      // let initialContent = quill.root.innerHTML;

      // // Find all anchor tags in the initial content
      // const initialAnchorTags = initialContent.match(/<a\b[^>]*>(.*?)<\/a>/gi);

      // // Process each initial anchor tag
      // if (initialAnchorTags) {
      //   for (let i = 0; i < initialAnchorTags.length; i++) {
      //     const initialAnchorTag = initialAnchorTags[i];
      //     const urlRegex = /href="(.*?)"/i;
      //     const urlMatch = initialAnchorTag.match(urlRegex);

      //     if (urlMatch) {
      //       let url = urlMatch[1];
      //       if (!url.startsWith("http://") && !url.startsWith("https://")) {
      //         url = "http://" + url;
      //         const updatedInitialAnchorTag = initialAnchorTag.replace(
      //           /href="(.*?)"/i,
      //           `href="${url}"`
      //         );
      //         initialContent = initialContent.replace(
      //           initialAnchorTag,
      //           updatedInitialAnchorTag
      //         );
      //       }
      //     }
      //   }
      // }

      // setProduct({
      //   ...product,
      //   description: initialContent,
      // });
    }
  }, [quill]);

  useEffect(() => {
    setProduct({
      id: obj.id,
      owner: obj.owner,
      collection: obj.collections[0].symbol,
      name: obj.name,
      description: obj.description,
      paymentOptions: obj.paymentOptions,
      price: obj.price,
      productImages: obj.productImages,
      imageUrl: obj.imageUrl,
      quantity: obj.quantity,
      token: obj.token,
      hide: obj.hide,
      reqUserEmail: obj.reqUserEmail,
      reqUserShipping: obj.reqUserShipping,
      reqNote: obj.reqNote,
      reqColor: obj.reqColor,
      reqDiscord: obj.reqDiscord,
      reqTwitter: obj.reqTwitter,
    });
  }, [obj]);

  return (
    <>
      {!loading ? (
        <div className={styles.edit_product_modal}>
          <div className={styles.edit_product_form}>
            <div className={styles.edit_product_input}>
              {product.productImages.length < 1 && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{
                    borderRadius: "20px",
                    marginBottom: "30px",
                  }}
                />
              )}
              {product.productImages.length > 0 && (
                <div className={styles.prod_img_carousel}>
                  {product.productImages.length > 1 && (
                    <FontAwesomeIcon
                      onClick={handleImageChange}
                      name="prev"
                      icon={faArrowLeft}
                      style={{
                        color: "white",
                        fontSize: "1.5rem",
                        backgroundColor: "black",
                        borderRadius: "50%",
                        padding: "0.5rem",
                        border: "none",
                        userSelect: "none",
                        //make the background transparent
                      }}
                    />
                  )}

                  {product.productImages.map((image, index) => {
                    return (
                      <div
                        key={index}
                        className={styles.productImage}
                        style={{
                          display: index === currentImage ? "flex" : "none",
                          // display: "flex",
                          alignContent: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img src={image.url} alt={product.name} />
                      </div>
                    );
                  })}
                  {product.productImages.length > 1 && (
                    <FontAwesomeIcon
                      onClick={handleImageChange}
                      name="next"
                      icon={faArrowRight}
                      style={{
                        color: "white",
                        fontSize: "1.5rem",
                        backgroundColor: "black",
                        borderRadius: "50%",
                        padding: "0.5rem",
                        border: "none",
                        userSelect: "none",
                        //make the background transparent
                      }}
                    />
                  )}
                </div>
              )}
              {renderProductPhotosUpload()}
              <div className={styles.token_row}>
                <p className={styles.token_label}>
                  Default Token: <span>USDC</span>
                </p>
                <button
                  className={styles.show_tokens_button}
                  onClick={() => setShowTokenSelection(true)}
                >
                  <span>Edit Accepted Tokens</span>
                  <IoChevronDown />
                </button>
              </div>

              {showSelectedTokens && renderTokenSelection()}
              {/* </div> */}

              {/* <label className={styles.token_label}>Product Description</label> */}
              {/* inserthtml with current product.description */}
              <div>
                <label className={styles.token_label}>Product Title</label>
                <input
                  className={styles.short_input}
                  type="text"
                  value={product.name}
                  onChange={(e) =>
                    setProduct({ ...product, name: e.target.value })
                  }
                />
              </div>
              <div>
                <strong className={styles.token_label}>
                  Current Description:
                </strong>
                {/* product.description is in html format */}
                <div
                  className={styles.token_label}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              <div>
                <strong className={styles.token_label}>
                  Edit Description:
                </strong>
                <div className={styles.description_area}>
                  <div
                    ref={quillRef}
                    placeholder={product.description}
                    // style={{ height: "200px", width: "100%" }}
                    className={styles.quillEdit}
                  />
                </div>
              </div>

              <div>
                <label className={styles.token_label}>Product Price</label>
                <input
                  className={styles.short_input}
                  type="text"
                  value={product.price}
                  onChange={(e) =>
                    setProduct({ ...product, price: e.target.value })
                  }
                />
              </div>

              {/* <label>Product Image</label> */}
              {/* <input
              className={styles.short_input}
              type="text"
              value={product.imageUrl}
              onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
            /> */}

              <div>
                <label className={styles.token_label}>Product Quantity</label>
                <input
                  className={styles.short_input}
                  type="number"
                  value={product.quantity}
                  onChange={(e) =>
                    setProduct({ ...product, quantity: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={styles.product_status}>Product Status</label>
                <div className={styles.edit_status}>
                  <input
                    type="radio"
                    name="status"
                    checked={product.hide === false ? true : false}
                    onChange={(e) => {
                      setProduct({
                        ...product,
                        hide: false,
                      });
                    }}
                  />{" "}
                  <span>Live</span>
                  <input
                    type="radio"
                    name="status"
                    checked={product.hide === true ? true : false}
                    onChange={(e) => {
                      setProduct({
                        ...product,
                        hide: true,
                      });
                    }}
                  />{" "}
                  <span>Draft</span>
                  <br />
                </div>
              </div>
              <div className={styles.checkbox_container}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <label className={styles.checkboxLabel}>Email</label>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={product.reqUserEmail}
                    onChange={(e) =>
                      setProduct({ ...product, reqUserEmail: e.target.checked })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <label className={styles.checkboxLabel}>Discord</label>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={product.reqDiscord}
                    onChange={(e) =>
                      setProduct({ ...product, reqDiscord: e.target.checked })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <label className={styles.checkboxLabel}>Twitter</label>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={product.reqTwitter}
                    onChange={(e) =>
                      setProduct({ ...product, reqTwitter: e.target.checked })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <label className={styles.checkboxLabel}>Shipping</label>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={product.reqUserShipping}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        reqUserShipping: e.target.checked,
                      })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <label className={styles.checkboxLabel}>Note</label>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={product.reqNote}
                    onChange={(e) =>
                      setProduct({ ...product, reqNote: e.target.checked })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <label className={styles.checkboxLabel}>Color</label>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={product.reqColor}
                    onChange={(e) =>
                      setProduct({ ...product, reqColor: e.target.checked })
                    }
                  />
                </div>
              </div>
            </div>
            <button
              className={styles.submit_product_button}
              onClick={() => handleProductEdit()}
            >
              Submit Changes
            </button>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default EditProduct;
