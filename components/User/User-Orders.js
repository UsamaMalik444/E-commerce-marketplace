import React, { useState, useEffect } from "react";
import { getBuyerOrders } from "../../lib/api";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import Header from "../Header";
import styles from "./styles/UserOrders.module.css";
import Loading from "../Loading";
import {
  IoArrowBackOutline,
  IoBarChartOutline,
  IoDocumentOutline,
  IoFileTrayFullOutline,
  IoInformationCircleOutline,
  IoLinkOutline,
  IoChevronDown,
  IoTrashBin,
  IoFingerPrintSharp,
  IoCopy,
  IoEye,
  IoLink,
  IoGift,
  IoCheckmark,
  IoClose,
  IoEyeOff,
  IoCheckmarkCircleSharp,
  IoChevronUp,
  IoLogOutOutline,
  IoCopyOutline,
  IoLogoTwitter,
} from "react-icons/io5";
import * as web3 from "@solana/web3.js";
import Table from "@mui/joy/Table";

function UserOrders() {
  const [loading, setLoading] = useState(true);
  const [noOrders, setNoOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stableOrders, setStableOrders] = useState([]);
  const [tipjarOrders, setTipjarOrders] = useState([]);
  const [stableTipjarOrders, setStableTipjarOrders] = useState([]);
  const [ascendingOrders, setAscendingOrders] = useState([]);

  const [productIdArray, setProductIdArray] = useState([]);
  const [currentWallet, setCurrentWallet] = useState([]);
  const { publicKey } = useWallet();
  const [userPublicKey, setUserPublicKey] = useState("");

  // create switch case to toggle between orders and tipjar orders
  const [orderType, setOrderType] = useState("orders");
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleOrderType = (e) => {
    setOrderType(e.target.value);
  };

  const renderOrderToggle = () => {
    return (
      <>
        {!loading && (
          <div className={styles.toggleItem}>
            <div
              id="container"
              onClick={() =>
                orderType === "orders"
                  ? setOrderType("tipjarOrders")
                  : setOrderType("orders")
              }
            >
              {orderType === "orders" ? (
                <div id="target" className="moon">
                  <IoLink className="moon_tog" />
                </div>
              ) : (
                <div id="target" className="sun">
                  <IoGift className="sunny_tog" />
                </div>
              )}
            </div>
            <span>
              {orderType === "orders"
                ? "Switch to TipJar Orders"
                : "Switch to Link Orders"}
            </span>
          </div>
        )}
      </>
    );
  };

  const renderLoading = () => <Loading />;

  const renderDisplay = () => {
    // console.log("wtf is the orders", orders);
    return (
      <div className={styles.order_container}>
        {/* TODO: Fix Search and Sort */}
        {/* <div className={styles.searchBarSection}>
          <div className={styles.search_filter}>
            <div className={styles.inputSection}>
              <input type="text" name="Search" placeholder="Search products" />
              <IoSearchOutline className={styles.searchIcon} />
            </div>
            <div className={styles.sortContainer}>
              <span>Filter by</span>
              <IoOptionsOutline />
            </div>
          </div>
        </div> */}
        {/* <h4 className={styles.order_header}>Order History</h4> */}
        {/* toggle to switch between orders and tipjarOrders */}

        {renderOrderToggle()}

        <Table
          className={styles.orders_table}
          aria-label="table variants"
          variant="soft"
          color="success"
        >
          <tbody>
            <tr className={styles.table_header}>
              <th>Order</th>
              <th>Item</th>
              <th>Price</th>
              <th>Date</th>
              {orders.length > 0 || tipjarOrders.length > 0 ? <th></th> : <></>}
            </tr>

            {orderType === "orders"
              ? // map orders in reverse order

                orders.map((orders, index) => (
                  <tr key={index} className={styles.table_text}>
                    <td>
                      {orders.createdAt ? (
                        <a
                          href={
                            new Date(orders.createdAt) >
                            new Date("2023-02-22T00:00:00.000Z")
                              ? `https://solana.fm/tx/${orders.orderID}`
                              : `https://solana.fm/address/${orders.orderID}`
                          }
                          target="_blank"
                        >
                          {orders.orderID?.slice(0, 4) +
                            "..." +
                            orders.orderID?.slice(orders.orderID.length - 4)}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      {orders.productid[0] ? (
                        <a
                          className={styles.view_link}
                          href={`/product/${orders.productid[0].id}`}
                          target="blank"
                        >
                          {orders.productid[0].name}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      {orders.price ? `${orders.price} ${orders.token}` : "N/A"}
                    </td>
                    {/* make date string like 1/2/2023 */}
                    <td>
                      {orders.createdAt
                        ? new Date(orders.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {orders.productid[0] ? (
                        <a
                          href={`/product/${orders.productid[0].id}`}
                          target="blank"
                        >
                          View
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))
              : tipjarOrders.map((orders, index) => (
                  <tr key={index} className={styles.table_text}>
                    <td>
                      {orders.createdAt ? (
                        <a
                          href={
                            new Date(orders.createdAt) >
                            new Date("2023-02-22T00:00:00.000Z")
                              ? `https://solana.fm/tx/${orders.orderID}`
                              : `https://solana.fm/address/${orders.orderID}`
                          }
                          target="_blank"
                        >
                          {orders.orderID?.slice(0, 4) +
                            "..." +
                            orders.orderID?.slice(orders.orderID.length - 4)}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      {orders.productid[0] ? (
                        <a
                          className={styles.view_link}
                          href={`/product/${orders.productid[0].id}`}
                          target="blank"
                        >
                          {orders.productid[0].name}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      {orders.price ? `${orders.price} ${orders.token}` : "N/A"}
                    </td>
                    {/* make date string like 1/2/2023 */}
                    <td>
                      {orders.createdAt
                        ? new Date(orders.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {orders.productid[0] ? (
                        <a href={`/order/${orders.orderID}`} target="blank">
                          View
                        </a>
                      ) : (
                        // <a href={`/product/${orders.productid[0].id}`} target='blank'>View</a>
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </Table>
      </div>
    );
  };

  useEffect(() => {
    if (publicKey) {
      const owner = publicKey.toString();
      setCurrentWallet(owner);
      const getOrders = async () => {
        const orders = await getBuyerOrders(owner);
        if (orders.length > 0) {
          var link_orders = [];
          var tipjar_orders = [];
          for (let i = 0; i < orders.length; i++) {
            if (
              orders[i].productid[0] &&
              orders[i].productid[0].type === "link"
            ) {
              link_orders.push(orders[i]);
            }
            if (
              orders[i].productid[0] &&
              orders[i].productid[0].type === "tipjar"
            ) {
              tipjar_orders.push(orders[i]);
            }
          }

          console.log("link orders", link_orders);
          console.log("tipjar orders", tipjar_orders);
          setOrders(link_orders);
          setStableOrders(link_orders);
          setTipjarOrders(tipjar_orders);
          setStableTipjarOrders(tipjar_orders);

          const productIds = link_orders.map((order) => order.productid);
          setProductIdArray(productIds);

          setNoOrders(false);
          setLoading(false);
        } else {
          setNoOrders(true);
          setLoading(false);
        }
      };
      getOrders();
    }
  }, [publicKey]);

  useEffect(() => {
    const checkMagicLogin = async () => {
      if (localStorage.getItem("userMagicMetadata")) {
        const userMagicMetadata = JSON.parse(
          localStorage.getItem("userMagicMetadata")
        );
        const magicPubKey = new web3.PublicKey(userMagicMetadata.publicAddress);
        setUserPublicKey(magicPubKey.toString());
        const owner = magicPubKey.toString();
        setCurrentWallet(owner);
        const getOrders = async () => {
          const orders = await getBuyerOrders(owner);
          if (orders.length > 0) {
            var link_orders = [];
            for (let i = 0; i < orders.length; i++) {
              if (orders[i].productid[0].type === "link") {
                link_orders.push(orders[i]);
              }
            }

            setOrders(link_orders);

            const productIds = link_orders.map((order) => order.productid);
            setProductIdArray(productIds);

            setNoOrders(false);
          } else {
            setNoOrders(true);
          }
        };
        getOrders();
      }
    };
    if (!publicKey) {
      checkMagicLogin();
      setLoading(false);
    }

    window.addEventListener("magic-logged-in", () => {
      checkMagicLogin();
    });
    window.addEventListener("magic-logged-out", () => {
      setUserPublicKey(null);
      localStorage.removeItem("userMagicMetadata");
    });
  }, []);

  useEffect(() => {
    if (search) {
      const filteredOrders = orders.filter((order) => {
        order.productid[0].name.toLowerCase().includes(search.toLowerCase());
      });

      setOrders(filteredOrders);
    }
    if (!search) {
      setOrders(stableOrders);
      setTipjarOrders(stableTipjarOrders);
    }
  }, [search]);

  return (
    <>
      <div className={styles.main_container}>
        {loading ? renderLoading() : renderDisplay()}

        {orders === 0 ? <h1>No Orders Found!</h1> : null}
      </div>
    </>
  );
}
export default UserOrders;
