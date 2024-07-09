import React, { useEffect, useState } from "react";
import styles from "../../styles/Product.module.css";
import Buy from "../Buy.js";
// import SingleProductViewer from './SingleProductViewer.js';
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faShop,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Product({ product }) {
  const { id, name, price, description, imageUrl, owner } = product;
  // create const from last four digits of owner
  const ownerLastFour = owner.slice(-4);
  const [singleProductView, setSingleProductView] = useState(false);
  const [allProductView, setAllProductView] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState(true);
  const { publicKey } = useWallet();

  const [currentCartInStorage, setCurrentCartInStorage] = useState([]);

  // create a state that shows "product added to cart" that we can display when addToCart is clicked
  const [productAdded, setProductAdded] = useState({
    productAdded: false,
    productID: null,
  });

  const addToCart = (product) => {
    if (product.quantity < 1) {
      alert("This product is sold out");
      return;
    }
    setProductAdded({ productAdded: true, productID: product.id });
    console.log("product", product);

    const product_to_add = {
      id: product.id,
      name: product.name,
      price: product.price,
      // grab the collection id from the url and add it to the product object
      collection: product.collections[0].id,
      owner: product.owner,
      quantity: 1,
      maxAmount: product.quantity,
      token: product.token,
      productImages:
        product.productImages.length > 0
          ? product.productImages
          : [
              {
                id: product.id,
                url: product.imageUrl,
              },
            ],
      paymentOptions:
        product.paymentOptions.length > 0
          ? product.paymentOptions
          : [product.token],
      reqUserEmail: product.reqUserEmail ? product.reqUserEmail : false,
      reqUserAddress: product.reqUserAddress ? product.reqUserAddress : false,
      reqUserPhone: product.reqUserPhone ? product.reqUserPhone : false,
      reqUserTwitter: product.reqUserTwitter ? product.reqUserTwitter : false,
      reqUserDiscord: product.reqUserDiscord ? product.reqUserDiscord : false,
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
    if (product.id) {
      allProducts.push(product);
    }
    setProductSearch(false);
  }, [product]);

  useEffect(() => {
    productAdded
      ? setTimeout(
          () => setProductAdded({ productID: null, productAdded: false }),
          2000
        )
      : null;
  }, [productAdded]);

  // map through all products and render them
  const renderAllProducts = () => (
    <div>
      {allProducts.map((product, index) => (
        // Individual Product Container

        <div key={index} className={styles.product_card}>
          {/* Product Image */}
          <div className={styles.product_card_content}>
            <div className={styles.product_image_container}>
              <a href={`/product/${product.id}`}>
                <img
                  className={styles.product_image}
                  src={
                    product.productImages.length > 0
                      ? product.productImages[0].url
                      : product.imageUrl
                  }
                  alt={name}
                />
              </a>
            </div>
            {/* {product.quantity > 0 ? (
              <div
                style={{
                  color: "green",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                🟢 In Stock
              </div>
            ) : (
              <div
                style={{
                  color: "red",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                ❗️Sold Out
              </div>
            )} */}
            <div key={id} className={styles.product_details}>
              {/* Product Name and Description */}
              <div className={styles.product_text}>
                <div className={styles.product_title}>{product.name}</div>
                {/* Price */}
                {/* if product.type is tipjar then render tipJarAmount form */}
                <div className={styles.product_price}>
                  {product.price} {product.token.toUpperCase()}
                </div>
                {/* <div className={styles.product_description}>{product.description}</div> */}
              </div>

              <div className={styles.view_details_wrap}>
                <a
                  href={`/product/${product.id}`}
                  className={styles.view_details}
                >
                  View details
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    style={{ marginLeft: 10, transform: "rotate(-45deg)" }}
                  />
                </a>
              </div>

              <div
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
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* if singleProductView is true then hide all products*/}
      {singleProductView && !allProductView
        ? renderSingleProduct(product)
        : null}
      {!singleProductView && allProductView && !productSearch
        ? renderAllProducts()
        : null}
    </>
  );
}
