import React, { useEffect, useState } from "react";
import styles from "../../styles/Product.module.css";
import Buy from "../Buy.js";
// import SingleProductViewer from './SingleProductViewer.js';
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useWallet } from "@solana/wallet-adapter-react";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

import {
  checkForKey,
  getProducts,
  getVariants,
  hideProduct,
} from "../../hooks/printful";

export default function PrintfulProduct({ collectionId, owner, product }) {
  const [details, setDetails] = useState(null);
  const { id, name, thumbnail_url } = product;
  const [productAdded, setProductAdded] = useState({
    productAdded: false,
    productID: null,
  });
  // console.log('owner', owner);
  const [currentCartInStorage, setCurrentCartInStorage] = useState([]);

  const addToCart = (product) => {
    if (product.quantity < 1) {
      alert("This product is sold out");
      return;
    }
    setProductAdded({ productAdded: true, productID: product.id });
    console.log("product", details.sync_variants[0]);

    const product_to_add = {
      id: product.id,
      name: product.name,
      price: details.sync_variants[0].retail_price,
      // grab the collection id from the url and add it to the product object
      collection: collectionId,
      owner: product.owner,
      quantity: 1,
      maxAmount: product.quantity,
      token: product.token,
      productImages: product.thumbnail_url,
      // product.productImages.length > 0
      //   ? product.productImages
      //   : [
      //       {
      //         id: product.id,
      //         url: product.imageUrl,
      //       },
      //     ],
      // paymentOptions:
      //   product.paymentOptions.length > 0
      //     ? product.paymentOptions
      //     : [product.token],
      // reqUserEmail: product.reqUserEmail ? product.reqUserEmail : false,
      // reqUserAddress: product.reqUserAddress ? product.reqUserAddress : false,
      // reqUserPhone: product.reqUserPhone ? product.reqUserPhone : false,
      // reqUserTwitter: product.reqUserTwitter ? product.reqUserTwitter : false,
      // reqUserDiscord: product.reqUserDiscord ? product.reqUserDiscord : false,
    };
    const cart = JSON.parse(localStorage.getItem("cart"));
    console.log("cart", cart);
    if (cart) {
      // check to see if product is already in cart, if so update quantity
      const productInCart = cart.find((item) => item.id === product_to_add.id);
      if (productInCart) {
        // console.log("productInCart", productInCart);
        const newCart = cart.map((item) => {
          if (item.id === product_to_add.id) {
            return { ...item, quantity: item.quantity + 1 };
          } else {
            return item;
          }
        });
        localStorage.setItem("cart", JSON.stringify(newCart));
        window.dispatchEvent(new Event("storageEvent"));
        setCurrentCartInStorage(newCart);
      } else {
        const newCart = [...cart, product_to_add];
        localStorage.setItem("cart", JSON.stringify(newCart));

        window.dispatchEvent(new Event("storageEvent"));
        setCurrentCartInStorage(newCart);
      }
    } else {
      const newCart = [product_to_add];
      localStorage.setItem("cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("storageEvent"));
      setCurrentCartInStorage(newCart);
    }
    // refresh cart
    const cartRefresh = JSON.parse(localStorage.getItem("cart"));
  };
  useEffect(() => {
    async function getProductDetails(collectionId, id) {
      const d = await getVariants(collectionId, id);
      setDetails(d);
    }
    getProductDetails(collectionId, id);
  }, []);
  useEffect(() => {
    productAdded
      ? setTimeout(
          () => setProductAdded({ productID: null, productAdded: false }),
          2000
        )
      : null;
  }, [productAdded]);
  return (
    <div key={id} className={styles.product_card}>
      {/* Product Image */}
      <div className={styles.product_card_content}>
        <div className={styles.product_image_container}>
          <a
            className={styles.view_details}
            href={`/product/p/&&c=${collectionId}&&id=${product.id}`}
          >
            <img
              className={styles.product_image}
              src={thumbnail_url}
              alt={name}
            />
          </a>
        </div>

        <div key={id} className={styles.product_details}>
          {/* Product Name and Description */}
          <div className={styles.product_text}>
            <div className={styles.product_title}>{product.name}</div>
            {/* Price */}
            <div className={styles.product_price}>
              {details && `${details.sync_variants[0].retail_price} USDC`}
            </div>
          </div>
          {/* Product Owner's last 4 account #'s*/}
          <div className={styles.purchased}>
            {/* <p className={styles.product_purchased}>Owner:</p>

                <p className={styles.purchased_amount}>
                </p> */}
          </div>
          {/* <div className={styles.product_owner}>Owner: {owner.slice(-5)}</div> */}
          {/* <div className={styles.purchased}>
                <p className={styles.product_purchased}>Amount Sold:</p>

                <p className={styles.purchased_amount}>
                  {product.purchasedCount}
                </p>
              </div> */}
          {/* <button
                className={styles.cart_button}
                onClick={() => {
                  addToCart(product);
                  console.log("added to cart");
                }}
              >
                Add to Cart
              </button> */}

          {/* Getting CORS blocked on PUT route */}
          {/* <button
                className={styles.cart_button}
                onClick={() => {
                  // hide product using collection id and product id
                  hideProduct(collectionId, product.id)
                  console.log("hidden product");
                }}
              >
                Hide Product from store
              </button> */}

          <div className={styles.view_details_wrap}>
            <Link
              className={styles.view_details}
              href={`/product/p/&&c=${collectionId}&&id=${product.id}`}
            >
              <a>View details</a>
            </Link>
            <FontAwesomeIcon
              icon={faArrowRight}
              style={{ marginLeft: 10, transform: "rotate(-45deg)" }}
            />
          </div>
          {/* <div
            className={styles.view_details_wrap}
            disabled={product.quantity < 1}
            onClick={() => {
              addToCart(product);
              // console.log("added to cart");
            }}
          >
            <button
              className={styles.quick_add}
              disabled={product.quantity < 1}
              // onClick={() => {
              //   addToCart(product);
              //   // console.log("added to cart");
              // }}
            >
              {productAdded.productID === product.id &&
              productAdded.productAdded ? (
                <div>Added to Cart</div>
              ) : (
                <div>
                  Quick Add
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    style={{ marginLeft: 10 }}
                  />
                </div>
              )}
            </button>
          </div> */}
          {/* <div className={styles.view_details_wrap}>
                <button
                  className={styles.view_details}
                  onClick={() => {
                    addToCart(product)
                    // console.log("added to cart");
                  }}
                >
                  Add to Cart
                </button>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  style={{ marginLeft: 10, transform: "rotate(-45deg)" }}
                />
              </div> */}
        </div>
      </div>
    </div>
  );
}
