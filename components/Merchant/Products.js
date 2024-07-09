import React, { useState, useEffect } from "react";
// import SingleProductOrderView from "../../components/SingleProductOrderView";
import {
  getCollectionOwner,
  deleteSingleProduct,
  getSingleProductOrders,
  CheckForCollectionByOwner,
} from "../../lib/api";
import styles from "../../styles/Product.module.css";
import Header from "../../components/Header";
import Create from "../../components/Merchant/Create";
import { useWallet } from "@solana/wallet-adapter-react";
import Loading from "../../components/Loading";
import { useRouter } from "next/router";
import {
  ArrowForward,
  SearchOutline,
  OptionsOutline,
  TrashBin,
} from "react-ionicons";
import {
  IoArrowBack,
  IoChevronBackOutline,
  IoCloseCircleOutline,
  IoCopy,
  IoEye,
  IoTrashBin,
} from "react-icons/io5";
import * as web3 from "@solana/web3.js";

import EditProduct from "../../components/Product/EditProduct";

function myProducts() {
  const { publicKey } = useWallet();
  const [userPublicKey, setUserPublicKey] = useState();
  const [userEmail, setUserEmail] = useState();
  const [currentWallet, setCurrentWallet] = useState();
  const router = useRouter();
  const [liveOwnerProducts, setLiveOwnerProducts] = useState([]);
  const [draftOwnerProducts, setDraftOwnerProducts] = useState([]);
  const [lowCountProducts, setLowCountProducts] = useState([]);
  const [singleProductOrderView, setSingleProductOrderView] = useState(false);
  const [ordersToView, setOrdersToView] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noProducts, setNoProducts] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [productToEdit, setProductToEdit] = useState();
  const [productToDelete, setProductToDelete] = useState();

  const [showLiveProducts, setShowLiveProducts] = useState(true);

  async function getOrders(product) {
    const orders = await getSingleProductOrders(product.id);
    orders.map((order) => ordersToView.push(order));

    // console.log(ordersToView);
    setSingleProductOrderView(true);
  }
  // // Dark Mode img
  const [isDarkMode, setIsDarkMode] = useState();

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (typeof window !== "undefined") {
        let theme = localStorage.getItem("ikonshop-theme");
        if (theme === "dark") {
          setIsDarkMode(true);
        } else {
          setIsDarkMode(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const mode = isDarkMode ? "#fff" : "black";

  const mode1 = isDarkMode ? "#fff" : "#212529";

  const mode2 = isDarkMode ? "#fff" : "#595959";

  const [show, setShow] = useState(false);

  const renderDeleteModal = () => {
    console.log(productToDelete, "productToDelete");
    return (
      <div className={styles.modal_bg}>
        <div className={styles.modal_}>
          <IoCloseCircleOutline
            style={{ fontSize: "100px", color: "#FF5E4A" }}
          />
          <h4>Are you sure?</h4>
          <p>
            Do you really want to delete this product? This process cannot be
            undone.
          </p>
          <div className={styles.modal_buttons}>
            <button
              onClick={() => setShow(!show)}
              className={styles.modal_sec_button}
            >
              Cancel
            </button>
            {productToDelete.hide === false ? (
              <button
                onClick={() => {
                  setShow(!show);
                  deleteSingleProduct(productToDelete.id);
                  const index = liveOwnerProducts.indexOf(productToDelete);
                  if (index > -1) {
                    liveOwnerProducts.splice(index, 1);
                  }
                  setLiveOwnerProducts([...liveOwnerProducts]);
                }}
                className={styles.modal_pry_button}
              >
                Delete Live Product
              </button>
            ) : (
              <button
                onClick={() => {
                  setShow(!show);
                  deleteSingleProduct(productToDelete.id);
                  const index = draftOwnerProducts.indexOf(productToDelete);
                  if (index > -1) {
                    draftOwnerProducts.splice(index, 1);
                  }
                  setDraftOwnerProducts([...draftOwnerProducts]);
                }}
                className={styles.modal_pry_button}
              >
                Delete Draft
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProducts = () => (
    <>
      <div className={styles.owner_product_containter}>
        {show && renderDeleteModal()}
        <div className={styles.searchBarSection}>
          <div className={styles.search_filter}>
            {/* <div className={styles.inputSection}>
              <input type="text" name="Search" placeholder="Search products" />
              <SearchOutline className={styles.searchIcon} />
            </div> */}
            {/* <input
              type="radio"
              name="tabset"
              id="tab1"
              aria-controls="ALL"
              checked
            />
            <label
              className={styles.switchText}
              onClick={() => setShowLiveProducts(null)}
              for="tab1"
            >
              ALL
            </label> */}
            <input
              type="radio"
              name="tabset"
              id="tab1"
              aria-controls="Live"
              checked
            />
            <label
              className={styles.switchText}
              onClick={() => setShowLiveProducts(true)}
              for="tab1"
            >
              Live
            </label>

            <input
              type="radio"
              name="tabset"
              className="tab2"
              id="tab2"
              aria-controls="Draft"
            />
            <label
              className={styles.switchText}
              onClick={() => setShowLiveProducts(false)}
              for="tab2"
            >
              Draft
            </label>
          </div>

          <div className={styles.add_btn}>
            <button
              className={styles.primary_cta}
              onClick={() => setShowCreate(true)}
            >
              Add New Product
            </button>
          </div>
        </div>
        <div className="products-container">
          {showLiveProducts &&
            liveOwnerProducts.map((product, index) => (
              <div key={index} className={styles.product_card}>
                {/* Product Image */}
                <div className={styles.product_card_content}>
                  {/* <div

                    className={styles.view_buyers}
                    onClick={() => getOrders(product)}
                  >
                    <p>View Buyers</p>
                    <ArrowForward
                      style={{
                        color: "#fff",
                        marginTop: "-2px",
                        transform: "rotate(-45deg)",
                        fontSize: "12px",
                      }}
                    />
                  </div> */}
                  <div className={styles.product_image_container}>
                    <img
                      className={styles.product_image}
                      src={
                        product.productImages.length === 0
                          ? product.imageUrl
                          : product.productImages[0].url
                      }
                      alt={product.name}
                    />
                  </div>

                  <div className={styles.product_details}>
                    {/* Product Name and Description */}
                    <div className={styles.product_text}>
                      <p
                        className={styles.product_title}
                        style={{ color: "var(--cart-text)" }}
                      >
                        {product.name}
                      </p>
                      {/* Price */}
                      <div className={styles.product_price}>
                        {product.price} {product.token}
                      </div>
                    </div>

                    <div className={styles.remaining}>
                      <p
                        className={styles.product_remaining}
                        style={{ color: "var(--cart-text)" }}
                      >
                        Remaining:
                      </p>

                      <p
                        className={styles.remaining_amount}
                        style={{ color: "var(--cart-text)" }}
                      >
                        {product.quantity}
                      </p>
                    </div>
                    <div className={styles.purchased}>
                      <p
                        className={styles.product_purchased}
                        style={{ color: "var(--cart-text)" }}
                      >
                        Purchased:
                      </p>

                      <p
                        className={styles.purchased_amount}
                        style={{ color: "var(--cart-text)" }}
                      >
                        {product.purchasedCount}
                      </p>
                    </div>
                    <div
                      className={styles.status}
                      style={{ color: "var(--cart-text)" }}
                    >
                      <p>Status:</p>

                      <p
                        className={styles.status_value}
                        style={{ color: "var(--cart-text)" }}
                      >
                        {product.hide == false ? "Live" : "Draft"}
                      </p>
                    </div>
                    <div className={styles.product_card_ctas}>
                      <p
                        className={styles.edit_button}
                        onClick={() => (
                          setShowEdit(true),
                          console.log("product to edit", product),
                          setProductToEdit(product)
                        )}
                      >
                        Edit Product
                      </p>

                      <div className={styles.product_card_icons}>
                        <IoCopy
                          onClick={() =>
                            window.navigator.clipboard.writeText(
                              `https://ikonshop.io/product/${product.id}`
                            )
                          }
                          style={{
                            fontSize: "20px",
                            color: "var(--cart-text)",
                          }}
                        />
                        <a
                          key={index}
                          onClick={() => router.push(`/product/${product.id}`)}
                        >
                          <IoEye
                            style={{
                              marginLeft: "15px",
                              fontSize: "20px",
                              color: "var(--cart-text)",
                            }}
                          />
                        </a>

                        <IoTrashBin
                          style={{
                            marginLeft: "15px",
                            fontSize: "20px",
                            color: "var(--cart-text)",
                          }}
                          onClick={() => {
                            setShow(true);
                            setProductToDelete(product);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {!showLiveProducts &&
            draftOwnerProducts.map((product, index) => (
              <div key={index} className={styles.product_card}>
                {/* Product Image */}
                <div className={styles.product_card_content}>
                  {/* <div
                    className={styles.view_buyers}
                    onClick={() => getOrders(product)}
                  >
                    <p>View Buyers</p>
                    <ArrowForward
                      style={{
                        color: "#fff",
                        marginTop: "-2px",
                        transform: "rotate(-45deg)",
                        fontSize: "12px",
                      }}
                    />
                  </div> */}
                  <div className={styles.product_image_container}>
                    <img
                      className={styles.product_image}
                      src={
                        product.productImages.length === 0
                          ? product.imageUrl
                          : product.productImages[0].url
                      }
                      alt={product.name}
                    />
                  </div>

                  <div className={styles.product_details}>
                    {/* Product Name and Description */}
                    <div className={styles.product_text}>
                      <p
                        className={styles.product_title}
                        style={{ color: "var(--cart-text)" }}
                      >
                        {product.name}
                      </p>
                      {/* Price */}
                      <div
                        className={styles.product_price}
                        style={{ color: "var(--cart-text)" }}
                      >
                        {product.price} {product.token}
                      </div>
                    </div>

                    <div className={styles.remaining}>
                      <p
                        className={styles.product_remaining}
                        style={{ color: "var(--cart-text)" }}
                      >
                        Remaining:
                      </p>

                      <p
                        className={styles.remaining_amount}
                        style={{ color: "var(--cart-text)" }}
                      >
                        {product.quantity}
                      </p>
                    </div>
                    <div className={styles.purchased}>
                      <p
                        className={styles.product_purchased}
                        style={{ color: "var(--cart-text)" }}
                      >
                        Purchased:
                      </p>

                      <p
                        className={styles.purchased_amount}
                        style={{ color: "var(--cart-text)" }}
                      >
                        {product.purchasedCount}
                      </p>
                    </div>
                    <div
                      className={styles.status}
                      style={{ color: "var(--cart-text)" }}
                    >
                      <p>Status:</p>

                      <p
                        className={styles.status_value}
                        style={{ color: "var(--cart-text)" }}
                      >
                        {product.hide == false ? "Live" : "Draft"}
                      </p>
                    </div>
                    <div className={styles.product_card_ctas}>
                      <p
                        className={styles.edit_button}
                        onClick={() => (
                          setShowEdit(true),
                          console.log("product to edit", product),
                          setProductToEdit(product)
                        )}
                      >
                        Edit Product
                      </p>

                      <div className={styles.product_card_icons}>
                        <IoCopy
                          onClick={() =>
                            window.navigator.clipboard.writeText(
                              `https://ikonshop.io/product/${product.id}`
                            )
                          }
                          style={{
                            fontSize: "20px",
                            color: "var(--cart-text)",
                          }}
                        />
                        <a
                          key={index}
                          onClick={() => router.push(`/product/${product.id}`)}
                        >
                          <IoEye
                            style={{
                              marginLeft: "15px",
                              fontSize: "20px",
                              color: "var(--cart-text)",
                            }}
                          />
                        </a>

                        <IoTrashBin
                          style={{
                            marginLeft: "15px",
                            fontSize: "20px",
                            color: "var(--cart-text)",
                          }}
                          onClick={() => {
                            setShow(true);
                            setProductToDelete(product);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {showLiveProducts === null ? (
            <>
              {draftOwnerProducts.map((product, index) => (
                <div key={index} className={styles.product_card}>
                  {/* Product Image */}
                  <div className={styles.product_card_content}>
                    {/* <div
                    className={styles.view_buyers}
                    onClick={() => getOrders(product)}
                  >
                    <p>View Buyers</p>
                    <ArrowForward
                      style={{
                        color: "#fff",
                        marginTop: "-2px",
                        transform: "rotate(-45deg)",
                        fontSize: "12px",
                      }}
                    />
                  </div> */}
                    <div className={styles.product_image_container}>
                      <img
                        className={styles.product_image}
                        src={
                          product.productImages.length === 0
                            ? product.imageUrl
                            : product.productImages[0].url
                        }
                        alt={product.name}
                      />
                    </div>

                    <div className={styles.product_details}>
                      {/* Product Name and Description */}
                      <div className={styles.product_text}>
                        <p
                          className={styles.product_title}
                          style={{
                            color: product.quantity < 11 ? "red" : mode,
                          }}
                        >
                          {product.name}
                        </p>
                        {/* Price */}
                        <div
                          className={styles.product_price}
                          style={{
                            color: product.quantity < 11 ? "red" : mode,
                          }}
                        >
                          {product.price} {product.token}
                        </div>
                      </div>

                      <div className={styles.remaining}>
                        <p
                          className={styles.product_remaining}
                          style={{
                            color: product.quantity < 11 ? "red" : mode,
                          }}
                        >
                          Remaining:
                        </p>

                        <p
                          className={styles.remaining_amount}
                          style={{
                            color: product.quantity < 11 ? "red" : mode,
                          }}
                        >
                          {product.quantity}
                        </p>
                      </div>
                      <div className={styles.purchased}>
                        <p
                          className={styles.product_purchased}
                          style={{ color: mode1 }}
                        >
                          Purchased:
                        </p>

                        <p
                          className={styles.purchased_amount}
                          style={{ color: mode1 }}
                        >
                          {product.purchasedCount}
                        </p>
                      </div>
                      <div className={styles.status} style={{ color: mode1 }}>
                        <p>Status:</p>

                        <p
                          className={styles.status_value}
                          style={{
                            color: product.hide == false ? "#35b67c" : "red",
                          }}
                        >
                          {product.hide == false ? "Live" : "Draft"}
                        </p>
                      </div>
                      <div className={styles.product_card_ctas}>
                        <p
                          className={styles.edit_button}
                          onClick={() => (
                            setShowEdit(true),
                            console.log("product to edit", product),
                            setProductToEdit(product)
                          )}
                        >
                          Edit Product
                        </p>

                        <div className={styles.product_card_icons}>
                          <IoCopy
                            onClick={() =>
                              window.navigator.clipboard.writeText(
                                `https://ikonshop.io/product/${product.id}`
                              )
                            }
                            style={{
                              fontSize: "20px",
                              color: mode2,
                            }}
                          />
                          <a
                            key={index}
                            onClick={() =>
                              router.push(`/product/${product.id}`)
                            }
                          >
                            <IoEye
                              style={{
                                marginLeft: "15px",
                                fontSize: "20px",
                                color: mode2,
                              }}
                            />
                          </a>

                          <IoTrashBin
                            style={{
                              marginLeft: "15px",
                              fontSize: "20px",
                              color: mode2,
                            }}
                            onClick={() => {
                              setShow(true);
                              setProductToDelete(product);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {liveOwnerProducts.map((product, index) => (
                <div key={index} className={styles.product_card}>
                  {/* Product Image */}
                  <div className={styles.product_card_content}>
                    {/* <div

                    className={styles.view_buyers}
                    onClick={() => getOrders(product)}
                  >
                    <p>View Buyers</p>
                    <ArrowForward
                      style={{
                        color: "#fff",
                        marginTop: "-2px",
                        transform: "rotate(-45deg)",
                        fontSize: "12px",
                      }}
                    />
                  </div> */}
                    <div className={styles.product_image_container}>
                      <img
                        className={styles.product_image}
                        src={
                          product.productImages.length === 0
                            ? product.imageUrl
                            : product.productImages[0].url
                        }
                        alt={product.name}
                      />
                    </div>

                    <div className={styles.product_details}>
                      {/* Product Name and Description */}
                      <div className={styles.product_text}>
                        <p
                          className={styles.product_title}
                          style={{ color: "var(--cart-text)" }}
                        >
                          {product.name}
                        </p>
                        {/* Price */}
                        <div className={styles.product_price}>
                          {product.price} {product.token}
                        </div>
                      </div>

                      <div className={styles.remaining}>
                        <p
                          className={styles.product_remaining}
                          style={{ color: "var(--cart-text)" }}
                        >
                          Remaining:
                        </p>

                        <p
                          className={styles.remaining_amount}
                          style={{ color: "var(--cart-text)" }}
                        >
                          {product.quantity}
                        </p>
                      </div>
                      <div className={styles.purchased}>
                        <p
                          className={styles.product_purchased}
                          style={{ color: "var(--cart-text)" }}
                        >
                          Purchased:
                        </p>

                        <p
                          className={styles.purchased_amount}
                          style={{ color: "var(--cart-text)" }}
                        >
                          {product.purchasedCount}
                        </p>
                      </div>
                      <div
                        className={styles.status}
                        style={{ color: "var(--cart-text)" }}
                      >
                        <p>Status:</p>

                        <p
                          className={styles.status_value}
                          style={{ color: "var(--cart-text)" }}
                        >
                          {product.hide == false ? "Live" : "Draft"}
                        </p>
                      </div>
                      <div className={styles.product_card_ctas}>
                        <p
                          className={styles.edit_button}
                          onClick={() => (
                            setShowEdit(true),
                            console.log("product to edit", product),
                            setProductToEdit(product)
                          )}
                        >
                          Edit Product
                        </p>

                        <div className={styles.product_card_icons}>
                          <IoCopy
                            onClick={() =>
                              window.navigator.clipboard.writeText(
                                `https://ikonshop.io/product/${product.id}`
                              )
                            }
                            style={{
                              fontSize: "20px",
                              color: "var(--cart-text)",
                            }}
                          />
                          <a
                            key={index}
                            onClick={() =>
                              router.push(`/product/${product.id}`)
                            }
                          >
                            <IoEye
                              style={{
                                marginLeft: "15px",
                                fontSize: "20px",
                                color: "var(--cart-text)",
                              }}
                            />
                          </a>

                          <IoTrashBin
                            style={{
                              marginLeft: "15px",
                              fontSize: "20px",
                              color: "var(--cart-text)",
                            }}
                            onClick={() => {
                              setShow(true);
                              setProductToDelete(product);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );

  const renderOrderView = () => (
    <>
      {/* button to clear orders and close */}
      <button
        className={styles.link_button}
        onClick={() => (setOrdersToView([]), setSingleProductOrderView(false))}
      >
        Hide Links
      </button>
      {ordersToView.map((orders, index) => (
        <div key={index} className={styles.order_containter}>
          <a
            className={styles.order_buyer}
            href={`https://solana.fm/account/${orders.buyer}?cluster=mainnet`}
            target="_blank"
          >
            {orders.buyer.slice(0, 4)}...{orders.buyer.slice(-5)}
          </a>
          {orders.email && (
            <a className={styles.order_buyer} href={`mailto:${orders.email}`}>
              Email: {orders.email}
            </a>
          )}
          {orders.shipping && (
            <p className={styles.order_buyer}>Address: {orders.shipping}</p>
          )}
        </div>
      ))}
    </>
  );

  const renderLoading = () => <Loading />;

  const renderNoProducts = () => (
    <div className={styles.no_products}>
      <p>You have no products</p>
    </div>
  );

  const renderCreateComponent = () => {
    return (
      <>
        {/* button to close */}
        <button
          className={styles.back_button}
          onClick={() => setShowCreate(false)}
        >
          <IoChevronBackOutline />
          <span>Back</span>
        </button>
        <div className={styles.create_component}>
          <Create />
        </div>
      </>
    );
  };

  const renderEditComponent = () => {
    return (
      <div>
        {/* button to close */}
        {/* place button in top left of parent div */}

        <button
          className={styles.back_button}
          onClick={() => (setShowEdit(false), setProductToEdit({}))}
        >
          <IoChevronBackOutline />
          <span>Back</span>
        </button>
        <div className={styles.create_component}>
          <EditProduct obj={productToEdit} />
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

      const data = await CheckForCollectionByOwner(magicPubKey.toString());
      console.log("data", data);
      const products = await getCollectionOwner(magicPubKey.toString());
      console.log("products", products.products);
      var live_product_data = [];
      var low_count_live_products = [];
      var draft_product_data = [];
      for (var i = 0; i < products.products.length; i++) {
        var product = products.products[i];
        if (product.type === "product" && product.hide == false) {
          live_product_data.push(product);
        }
        if (product.type === "product" && product.hide == true) {
          draft_product_data.push(product);
        }
        if (
          product.type === "product" &&
          product.quantity < 5 &&
          product.hide == false
        ) {
          low_count_live_products.push(product);
        }
      }
      setLiveOwnerProducts(live_product_data);
      setDraftOwnerProducts(draft_product_data);
      setLowCountProducts(low_count_live_products);
      console.log("userMagicMetadata", userMagicMetadata);
      setLoading(false);
    }
  };

  const checkStandardLogin = async () => {
    if (publicKey) {
      setCurrentWallet(publicKey.toString());
      setUserPublicKey(publicKey.toString());

      const data = await CheckForCollectionByOwner(publicKey.toString());
      console.log("data", data);
      const products = await getCollectionOwner(publicKey.toString());
      console.log("products", products.products);
      var live_product_data = [];
      var low_count_live_products = [];
      var draft_product_data = [];
      for (var i = 0; i < products.products.length; i++) {
        var product = products.products[i];
        if (product.type === "product" && product.hide == false) {
          live_product_data.push(product);
        }
        if (product.type === "product" && product.hide == true) {
          draft_product_data.push(product);
        }
        if (
          product.type === "product" &&
          product.quantity < 5 &&
          product.hide == false
        ) {
          low_count_live_products.push(product);
        }
      }
      setLiveOwnerProducts(live_product_data);
      setDraftOwnerProducts(draft_product_data);
      setLowCountProducts(low_count_live_products);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!publicKey) {
      checkMagicLogin();
    } else if (publicKey) {
      checkStandardLogin();
      console.log("show products");
      setShowCreate(false);
      setShowEdit(false);
      async function update() {
        // wait 1 second for the wallet to update
        await new Promise((r) => setTimeout(r, 1000));
        if (publicKey) {
          setCurrentWallet(publicKey.toString());
          setUserPublicKey(publicKey.toString());

          const data = await CheckForCollectionByOwner(publicKey.toString());
          console.log("data", data);
          const products = await getCollectionOwner(publicKey.toString());
          console.log("products", products.products);
          var live_product_data = [];
          var low_count_live_products = [];
          var draft_product_data = [];
          for (var i = 0; i < products.products.length; i++) {
            var product = products.products[i];
            if (product.type === "product" && product.hide == false) {
              live_product_data.push(product);
            }
            if (product.type === "product" && product.hide == true) {
              draft_product_data.push(product);
            }
            if (
              product.type === "product" &&
              product.quantity < 5 &&
              product.hide == false
            ) {
              low_count_live_products.push(product);
            }
          }
          setLiveOwnerProducts(live_product_data);
          setDraftOwnerProducts(draft_product_data);
          setLowCountProducts(low_count_live_products);
          setLoading(false);
        } else if (localStorage.getItem("userMagicMetadata")) {
          const userMagicMetadata = JSON.parse(
            localStorage.getItem("userMagicMetadata")
          );
          setUserEmail(userMagicMetadata.email);
          const magicPubKey = new web3.PublicKey(
            userMagicMetadata.publicAddress
          );
          setCurrentWallet(magicPubKey.toString());
          setUserPublicKey(magicPubKey.toString());

          const data = await CheckForCollectionByOwner(magicPubKey.toString());
          console.log("data", data);
          const products = await getCollectionOwner(magicPubKey.toString());
          console.log("products", products.products);
          var live_product_data = [];
          var low_count_live_products = [];
          var draft_product_data = [];
          for (var i = 0; i < products.products.length; i++) {
            var product = products.products[i];
            if (product.type === "product") {
              live_product_data.push(product);
            }
            if (product.type === "product" && product.hide == true) {
              draft_product_data.push(product);
            }
            if (product.type === "product" && product.quantity < 5) {
              low_count_live_products.push(product);
            }
          }
          setLiveOwnerProducts(live_product_data);
          setDraftOwnerProducts(draft_product_data);
          setLowCountProducts(low_count_live_products);
          console.log("userMagicMetadata", userMagicMetadata);
          setLoading(false);
        }
      }
      update();
    }
    window.addEventListener("merchant_show_products", () => {
      console.log("show products");
      setShowCreate(false);
      setShowEdit(false);
      async function update() {
        // wait 1 second for the wallet to update
        await new Promise((r) => setTimeout(r, 1000));
        if (publicKey) {
          setCurrentWallet(publicKey.toString());
          setUserPublicKey(publicKey.toString());

          const data = await CheckForCollectionByOwner(publicKey.toString());
          console.log("data", data);
          const products = await getCollectionOwner(publicKey.toString());
          console.log("products", products.products);
          var live_product_data = [];
          var low_count_live_products = [];
          var draft_product_data = [];
          for (var i = 0; i < products.products.length; i++) {
            var product = products.products[i];
            if (product.type === "product") {
              live_product_data.push(product);
            }
            if (product.type === "product" && product.hide == true) {
              draft_product_data.push(product);
            }
            if (product.type === "product" && product.quantity < 5) {
              low_count_live_products.push(product);
            }
          }
          setLiveOwnerProducts(live_product_data);
          setDraftOwnerProducts(draft_product_data);
          setLowCountProducts(low_count_live_products);
          setLoading(false);
        } else if (localStorage.getItem("userMagicMetadata")) {
          const userMagicMetadata = JSON.parse(
            localStorage.getItem("userMagicMetadata")
          );
          setUserEmail(userMagicMetadata.email);
          const magicPubKey = new web3.PublicKey(
            userMagicMetadata.publicAddress
          );
          setCurrentWallet(magicPubKey.toString());
          setUserPublicKey(magicPubKey.toString());

          const data = await CheckForCollectionByOwner(magicPubKey.toString());
          console.log("data", data);
          const products = await getCollectionOwner(magicPubKey.toString());
          console.log("products", products.products);
          var live_product_data = [];
          var low_count_live_products = [];
          var draft_product_data = [];
          for (var i = 0; i < products.products.length; i++) {
            var product = products.products[i];
            if (product.type === "product" && product.hide === false) {
              live_product_data.push(product);
            }
            if (product.type === "product" && product.hide == true) {
              draft_product_data.push(product);
            }
            if (
              product.type === "product" &&
              product.quantity < 5 &&
              product.hide === false
            ) {
              low_count_live_products.push(product);
            }
          }
          setLiveOwnerProducts(live_product_data);
          setDraftOwnerProducts(draft_product_data);
          setLowCountProducts(low_count_live_products);
          console.log("userMagicMetadata", userMagicMetadata);
          setLoading(false);
        }
      }
      update();
    });
    window.addEventListener("magic-logged-in", () => {
      checkMagicLogin();
    });
    window.addEventListener("magic-logged-out", () => {
      setUserEmail(null);
      setUserPublicKey(null);
      setCurrentWallet(null);
      localStorage.removeItem("userMagicMetadata");
    });
    window.addEventListener("productCreated", () => {
      async function update() {
        if (publicKey) {
          setCurrentWallet(publicKey.toString());
          setUserPublicKey(publicKey.toString());

          const data = await CheckForCollectionByOwner(publicKey.toString());
          console.log("data", data);
          const products = await getCollectionOwner(publicKey.toString());
          console.log("products", products.products);
          var live_product_data = [];
          var low_count_live_products = [];
          var draft_product_data = [];
          for (var i = 0; i < products.products.length; i++) {
            var product = products.products[i];
            if (
              product.type === "product" &&
              product.quantity < 5 &&
              product.hide === false
            ) {
              live_product_data.push(product);
            }
            if (product.type === "product" && product.hide == true) {
              draft_product_data.push(product);
            }
            if (
              product.type === "product" &&
              product.quantity < 5 &&
              product.hide === false
            ) {
              low_count_live_products.push(product);
            }
          }
          setLiveOwnerProducts(live_product_data);
          setLowCountProducts(low_count_live_products);
          setLoading(false);
        } else if (localStorage.getItem("userMagicMetadata")) {
          const userMagicMetadata = JSON.parse(
            localStorage.getItem("userMagicMetadata")
          );
          setUserEmail(userMagicMetadata.email);
          const magicPubKey = new web3.PublicKey(
            userMagicMetadata.publicAddress
          );
          setCurrentWallet(magicPubKey.toString());
          setUserPublicKey(magicPubKey.toString());

          const data = await CheckForCollectionByOwner(magicPubKey.toString());
          console.log("data", data);
          const products = await getCollectionOwner(magicPubKey.toString());
          console.log("products", products.products);
          var live_product_data = [];
          var low_count_live_products = [];
          var draft_product_data = [];
          for (var i = 0; i < products.products.length; i++) {
            var product = products.products[i];
            if (
              product.type === "product" &&
              product.quantity < 5 &&
              product.hide === false
            ) {
              live_product_data.push(product);
            }
            if (product.type === "product" && product.hide == true) {
              draft_product_data.push(product);
            }
            if (
              product.type === "product" &&
              product.quantity < 5 &&
              product.hide === false
            ) {
              low_count_live_products.push(product);
            }
          }
          setLiveOwnerProducts(live_product_data);
          setDraftOwnerProducts(draft_product_data);
          setLowCountProducts(low_count_live_products);
          console.log("userMagicMetadata", userMagicMetadata);
          setLoading(false);
        }
      }
      update();
    });
  }, []);

  return (
    <>
      {loading && renderLoading()}
      {!loading && !singleProductOrderView && !showCreate && !showEdit
        ? renderProducts()
        : null}
      {singleProductOrderView && !showCreate && renderOrderView()}
      {noProducts && renderNoProducts()}
      {showCreate && renderCreateComponent()}
      {showEdit && renderEditComponent()}
    </>
  );
}
export default myProducts;
