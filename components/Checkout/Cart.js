import React, { useState, useEffect } from "react";
import styles from "./styles/Cart.module.css";
import { IoCloseOutline, IoTrashBinOutline } from "react-icons/io5";
import { AiOutlineCheck, AiFillClockCircle } from "react-icons/ai";
import Loading from "../Loading";
import { useRouter } from "next/router";
import { set } from "@project-serum/anchor/dist/cjs/utils/features";
import Link from "next/link";

//This is a Slide out from the right side of the screen that shows the items in the cart and the total price.
const Cart = () => {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [noCart, setNoCart] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart"));
    console.log("all items in cart ", cart);
    if (!cart) {
      setNoCart(true);
      setLoading(false);
      return;
    }
    if (cart) {
      setCart(cart);
      console.log("wtf is going on?", cart.length);
      setTotal(
        cart.length > 0
          ? cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
          : 0
      );
      setLoading(false);
    }
  }, []);

  const handleCheckout = () => {
    alert("Checkout successful");
    localStorage.removeItem("cart");
    setCart([]);
    setTotal(0);
  };

  const handleRemove = (id) => {
    const newCart = cart.filter((item) => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storageEvent"));
    setCart(newCart);
    setTotal(
      newCart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    );
  };

  const handleDecreaseQuantity = (id) => {
    const newCart = cart.map((item) => {
      if (item.quantity <= 1) {
        alert("You cannot have less than 1 item in your cart");
        return;
      }
      if (item.id === id) {
        return {
          ...item,
          quantity: item.quantity - 1,
        };
      }
      return item;
    });
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storageEvent"));
    setCart(newCart);
    setTotal(
      newCart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    );
  };

  const handleIncreaseQuantity = (id) => {
    const newCart = cart.map((item) => {
      if (item.quantity >= item.maxAmount) {
        alert("You cannot add more than the available quantity");
        return {
          ...item,
          quantity: item.quantity,
        };
      }
      if (item.id === id) {
        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }
      return item;
    });
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storageEvent"));
    setCart(newCart);
    setTotal(
      newCart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    );
  };

  return (
    <div className={styles.cart_slideout}>
      <div className={styles.cart_header}>
        <h1>Shopping Cart</h1>
      </div>
      <span
        style={{
          position: "absolute",
          top: "0",
          right: "0",
          margin: "10px 20px",
          fontSize: "30px",
          color: "var(--cart-text)",
        }}
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("cart_close", {
              bubbles: true,
            })
          );
        }}
      >
        <IoCloseOutline />
      </span>
      <hr style={{ width: "79%", margin: "0 auto" }} />
      <div className={styles.cart_body}>
        {loading && <Loading />}
        {noCart && !loading && <p>No items in cart</p>}
        {cart.map((item, index) => {
          return (
            <div key={index} style={{ padding: "15px 60px 15px 60px " }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <img
                    alt="ss"
                    style={{
                      width: "110px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "5px",
                    }}
                    // src={
                    //   item.productImages[0].url
                    //     ? item.productImages[0].url
                    //     : item.productImages
                    // }
                    src={
                      !item.printful
                        ? item.productImages[0].url
                        : item.product.files.find(
                            (file) => file.type === "preview"
                          ).thumbnail_url
                    }
                  />
                  <div
                    style={{
                      marginLeft: "10px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        margin: "0",
                      }}
                    >
                      {item.name}
                    </p>
                    <p
                      style={{
                        fontWeight: "bold",
                        fontSize: "12px",
                        margin: "0",
                      }}
                    >
                      color:
                    </p>
                    <p
                      style={{
                        fontWeight: "bold",
                        fontSize: "12px",
                        margin: "0",
                      }}
                    >
                      Size:
                    </p>
                    <div style={{ marginTop: "10px", fontSize: "12px" }}>
                      {item.quantity > 1 ? (
                        <span
                          className={styles.click_span}
                          onClick={() => handleDecreaseQuantity(item.id)}
                        >
                          -
                        </span>
                      ) : (
                        <IoTrashBinOutline
                          className={styles.trash}
                          onClick={() => handleRemove(item.id)}
                        />
                      )}{" "}
                      <span style={{ marginLeft: "5px", marginRight: "5px" }}>
                        {item.quantity}
                      </span>
                      <span
                        className={styles.click_span}
                        onClick={() => handleIncreaseQuantity(item.id)}
                      >
                        +
                      </span>
                    </div>
                    <div style={{ marginTop: "12px" }}>
                      {item.maxAmount > 0 ? (
                        <>
                          <AiOutlineCheck color="green" />
                          <span
                            style={{
                              fontSize: "12px",
                              marginLeft: "3px",
                              color: "var(--cart-text)",
                            }}
                          >
                            In stock
                          </span>
                        </>
                      ) : (
                        <>
                          <AiFillClockCircle color="#8c8c8c" />
                          <span
                            style={{
                              fontSize: "12px",
                              marginLeft: "3px",
                              color: "var(--cart-text)",
                            }}
                          >
                            Ships in 2 weeks
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "bold" }}>${item.price}</span>
                  <span
                    onClick={() => handleRemove(item.id)}
                    style={{
                      marginTop: "75px",
                      color: "#575757",
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "var(--cart-text)",
                    }}
                  >
                    Remove
                  </span>
                </div>
              </div>
              <hr />
            </div>
          );
        })}
        <div style={{ padding: "15px 60px 15px 60px " }}>
          <div className={styles.total_subtotal}>
            <p
              className={styles.subtotal_txt}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ color: "#8c8c8c", color: "var(--cart-text)" }}>
                {" "}
                Subtotal:
              </span>
              <span>{total.toFixed(2)}</span>
            </p>
          </div>
          <div className={styles.cart_footer}>
            <button
              onClick={() => {
                router.push("/checkout"),
                  window.dispatchEvent(
                    new CustomEvent("cart_close", {
                      bubbles: true,
                    })
                  );
              }}
              disabled={noCart}
            >
              Checkout
            </button>
          </div>
          <p
            style={{
              marginTop: "15px",
              fontSize: "14px",
              fontWeight: "400",
              textAlign: "center",
              color: "var(--cart-text)",
            }}
          >
            Shipping, taxes, and discount codes calculated at checkout.
          </p>
        </div>

        {/* <table className={styles.cart_table_bg}>
          <thead>
            <tr className="cart_table_head">
              <th scope="col">Product Name</th>
              <th scope="col">Price</th>
              <th scope="col">Quantity</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr>
                <td data-label="Product Name">
                  <div className={styles.col_a}>
                    <IoTrashBinOutline
                      className={styles.trash}
                      onClick={() => handleRemove(item.id)}
                    />
                    <a
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        item.printful
                          ? router.push(
                              `/product/p/&&c=${item.collection}&&id=${item.product.sync_product_id}`
                            )
                          : router.push(`/product/${item.id}`)
                      }
                    >
                      <span>{item.name}</span>
                    </a>
                  </div>
                </td>
                <td data-label="Price">
                  {item.price} {item.token}
                </td>
                <td data-label="Quantity">
                  {item.quantity > 1 && (
                    <span
                      className={styles.click_span}
                      onClick={() => handleDecreaseQuantity(item.id)}
                    >
                      -
                    </span>
                  )}{" "}
                  {item.quantity}{" "}
                  <span
                    className={styles.click_span}
                    onClick={() => handleIncreaseQuantity(item.id)}
                  >
                    +
                  </span>
                </td>
                <td data-label="Total">
                  {item.price * item.quantity} {item.token}
                </td>
              </tr>
            ))}
            <tr>
              <td scope="row" data-label="Account">
                Visa - 6076
              </td>
              <td data-label="Due Date">03/01/2016</td>
              <td data-label="Amount">$2,443</td>
              <td data-label="Period">02/01/2016 - 02/29/2016</td>
            </tr>
          </tbody>
        </table> */}
        {/* <ul className={styles.cart_list}>
          <div className={styles.heading_cart_items}>
            <h className={styles.product_name_heading}>Product Name</h>
            <h className={styles.price_heading}>Price</h>
            <h className={styles.quantity_heading}>Quantity</h>
            <h className={styles.total_heading}>Total</h>
          </div>
          {cart.map((item) => (
            <li className={styles.list_item} key={item.id}>
              <div className={styles.cart_flex}>
                <div className={styles.col_a}>
                  <IoTrashBinOutline
                    className={styles.trash}
                    onClick={() => handleRemove(item.id)}
                  />
                  <p>{item.name}</p>
                </div>

                <div className={styles.col_b}>
                  {item.price} {item.token}
                </div>
              </div>
              <div className={styles.col_c}>
                {item.quantity > 1 && (
                  <span
                    className={styles.click_span}
                    onClick={() => handleDecreaseQuantity(item.id)}
                  >
                    -
                  </span>
                )}{" "}
                {item.quantity}{" "}
                <span
                  className={styles.click_span}
                  onClick={() => handleIncreaseQuantity(item.id)}
                >
                  +
                </span>
              </div>
              <div className={styles.col_d}>
                {item.price * item.quantity} {item.token}
              </div>
            </li>
          ))}
        </ul> */}

        {/* <div className={styles.total_subtotal}>
          <p className={styles.subtotal_txt}>
            Subtotal: <span>{total.toFixed(2)}</span>
          </p>
          <p>
            Total: <span>{total.toFixed(2)}</span>
          </p>
        </div> */}
      </div>
      {/* <div className={styles.cart_footer}>
        <button
          onClick={() => {
            router.push("/checkout"),
              window.dispatchEvent(
                new CustomEvent("cart_close", {
                  bubbles: true,
                })
              );
          }}
          disabled={noCart}
        >
          Checkout
        </button>
      </div> */}
    </div>
  );
};

export default Cart;
