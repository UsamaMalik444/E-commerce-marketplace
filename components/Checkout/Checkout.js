import React, { useState, useEffect } from "react";
import { IoCloseOutline, IoTrashBinOutline } from "react-icons/io5";
import Buy from "./BuyCheckout";
import Loading from "../Loading";
import styles from "./styles/Checkout.module.css";
import tokens from "../../constants/tokens";
import { getLivePrice } from "../../hooks/moralis";
import { token } from "@metaplex-foundation/js";
import { set } from "@project-serum/anchor/dist/cjs/utils/features";
import { useRouter } from "next/router";

const Checkout = () => {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [noCart, setNoCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalLoading, setTotalLoading] = useState(true);
  const [completeCartPaymentOptions, setCompleteCartPaymentOptions] = useState(
    []
  );
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [tokenTotals, setTokenTotals] = useState([]);

  async function get_equivalent_tokens(req) {
    const price = await getLivePrice(req);

    return price;
  }

  const prepTxn = () => {
    calculateTotal();
  };

  const handleRemove = (product) => {
    const newCart = cart.filter((item) => item.id !== product.product);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storageEvent"));
    setCart(newCart);
    window.location.reload();
  };

  const calculateTotal = async () => {
    if (selectedTokens.length === 0) {
      setTotalLoading(false);
      return;
    }
    setTotalLoading(true);
    var unique_tokens = [];
    console.log("selectedTokens", selectedTokens);
    for (let i = 0; i < selectedTokens.length; i++) {
      if (!unique_tokens.includes(selectedTokens[i].token)) {
        unique_tokens.push(selectedTokens[i].token);
      }
    }
    console.log("unique_tokens", unique_tokens);
    // get the total for each unique token
    var token_totals = [];
    for (let i = 0; i < unique_tokens.length; i++) {
      var total = 0;
      for (let j = 0; j < selectedTokens.length; j++) {
        if (selectedTokens[j].token === unique_tokens[i]) {
          total = (
            parseFloat(total) + parseFloat(selectedTokens[j].total_price)
          ).toString();
        }
      }
      token_totals.push({
        token: unique_tokens[i],
        total: total,
        item: selectedTokens[i],
      });
    }
    setTokenTotals(token_totals);

    console.log("token_totals", token_totals);

    setTotalLoading(false);
  };

  async function sortCart() {
    const local_cart = JSON.parse(localStorage.getItem("cart"));
    console.log("local_cart", local_cart);
    if (!local_cart) {
      setNoCart(true);
      setLoading(false);
      setTotalLoading(false);
      return;
    }
    setCart(local_cart);
    var complete_cart_payment_options = [];
    var token_price_equivalent = [];
    for (let i = 0; i < local_cart.length; i++) {
      var payment_options = [];
      if (local_cart[i].paymentOptions.length > 0) {
        for (let j = 0; j < local_cart[i].paymentOptions.length; j++) {
          // for each payment option we need to get the token price equivalent

          if (local_cart[i].paymentOptions[j] != "usdc") {
            const token_price_equivalent = await get_equivalent_tokens({
              token: local_cart[i].paymentOptions[j].toUpperCase(),
              amount: local_cart[i].quantity,
              usdc_target: local_cart[i].price,
            });

            payment_options.push({
              token: local_cart[i].paymentOptions[j],
              amount: local_cart[i].quantity,
              usdc_target: local_cart[i].price,
              price: token_price_equivalent,
            });
          } else {
            payment_options.push({
              token: local_cart[i].paymentOptions[j],
              amount: local_cart[i].quantity,
              usdc_target: local_cart[i].price,
              price: local_cart[i].price * local_cart[i].quantity,
            });
          }
        }

        complete_cart_payment_options.push({
          name: local_cart[i].name,
          quantity: local_cart[i].quantity,
          price: local_cart[i].price,
          token: local_cart[i].token,
          token_price_equivalent: payment_options,
          product: local_cart[i].id,
          printful: local_cart[i].printful ? local_cart[i].printful : false,
          printful_details: local_cart[i].product
            ? local_cart[i].product
            : null,
          collection: local_cart[i].collection
            ? local_cart[i].collection
            : null,
          owner: local_cart[i].owner,
          image:
            local_cart[i].productImages &&
            local_cart[i].productImages.length > 0 &&
            !local_cart[i].printful
              ? local_cart[i].productImages[0].url
              : null,
          maxAmount: local_cart[i].printful ? 20 : local_cart[i].maxAmount,
        });
      } else {
        payment_options.push({
          token: local_cart[i].token,
          amount: local_cart[i].quantity,
          usdc_target: local_cart[i].price,
          price: local_cart[i].price,
        });
        complete_cart_payment_options.push({
          name: local_cart[i].name,
          quantity: local_cart[i].quantity,
          price: local_cart[i].price,
          token: local_cart[i].token,
          token_price_equivalent: payment_options,
          product: local_cart[i].id,
          image: local_cart[i].productImages[0].url,
          printful: local_cart[i].printful ? local_cart[i].printful : false,
          printful_details: local_cart[i].product
            ? local_cart[i].product
            : null,
          collection: local_cart[i].collection
            ? local_cart[i].collection
            : null,
          owner: local_cart[i].owner,
          maxAmount: local_cart[i].printful ? 20 : local_cart[i].maxAmount,
        });
      }
    }

    setCompleteCartPaymentOptions(complete_cart_payment_options);

    var token_array = [];
    for (let i = 0; i < complete_cart_payment_options.length; i++) {
      var temp_obj = {
        item: complete_cart_payment_options[i].name,
        token: complete_cart_payment_options[i].token,
        total_price:
          complete_cart_payment_options[i].price *
          complete_cart_payment_options[i].quantity,
        product: complete_cart_payment_options[i].product,
        quantity: complete_cart_payment_options[i].quantity,
        printful: complete_cart_payment_options[i].printful,
        printful_details: complete_cart_payment_options[i].printful_details
          ? complete_cart_payment_options[i].printful_details
          : null,
        collection: complete_cart_payment_options[i].collection
          ? complete_cart_payment_options[i].collection
          : null,
        owner: complete_cart_payment_options[i].owner,
        maxAmount: complete_cart_payment_options[i].printful
          ? 20
          : complete_cart_payment_options[i].maxAmount,
      };
      token_array.push(temp_obj);
    }

    setSelectedTokens(token_array);
    // await calculateTotal();
    setTotalLoading(false);
  }

  const handleDecreaseQuantity = (id) => {
    const newCart = cart.map((item) => {
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

    setTotalLoading(true);
    sortCart();
  };

  const handleIncreaseQuantity = (id) => {
    const newCart = cart.map((item) => {
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
    // setTotal(
    //     newCart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    // );
    setTotalLoading(true);
    sortCart();
  };

  const renderCartTotal = () => {
    return (
      <div className={styles.cart_total_container}>
        <div className={styles.header}>
          <h3>Checkout</h3>
        </div>
        {/* <h1 className={styles.cart_total_header}>Select your Payment</h1> */}
        <div className={styles.main}>
          <div className={styles.cart_total_body}>
            <span>
              <p className={styles.token_totals_total}>Subtotal:</p>
            </span>

            <div className={styles.total_and_buy}>
              <h1>
                {tokenTotals.map((item, index) => {
                  return (
                    <div className={styles.token_totals_container} key={index}>
                      <p className={styles.token_totals_token}>{item.token}</p>
                      <img
                        className={styles.token_totals_logo}
                        src={
                          tokens.find(
                            (token) => token.symbol === item.token.toUpperCase()
                          ).logo
                        }
                      />
                      <h1 className={styles.token_totals_total}>
                        {item.token === "usdc" &&
                        parseFloat(item.total).toFixed(2)
                          ? parseFloat(item.total).toFixed(2)
                          : null}
                        {item.token !== "usdc" && item.total > 0
                          ? item.total.slice(0, 8)
                          : null}
                      </h1>
                    </div>
                  );
                })}
              </h1>
              {cart.some(
                (item) => item.reqUserAddress === true || item.printful === true
              ) ? (
                <span
                  style={{
                    fontSize: "12px",
                    fontStyle: "italic",
                    color: "red",
                    textAlign: "center",
                    marginBottom: "10px",
                  }}
                >
                  *shipping cost will be displayed after address is entered*
                </span>
              ) : null}
              {tokenTotals.length > 0 ? (
                <Buy
                  id={cart[0].id}
                  price={tokenTotals[0].total}
                  token={tokenTotals[0].token}
                  tokenTotals={tokenTotals}
                  cart={completeCartPaymentOptions}
                  selectedTokens={selectedTokens}
                />
              ) : null}
            </div>
          </div>
          <section className={styles.checkout_details}>
            {noCart ? (
              <h1 className={styles.cart_total_body_empty}>
                Your cart is empty
              </h1>
            ) : (
              completeCartPaymentOptions.map((item, index) => {
                return (
                  <div key={index} className={styles.checkout_details_inner}>
                    {/* tooltip that when hover active display middle of screen with product details (owner, reqs etc.) */}
                    {/* <div
                                            className={styles.cart_item_tooltip}
                                        >
                                            <h1>Owner: {item.owner}</h1>
                                            <h1>Collection: {item.collection}</h1>
                                            <h1>Printful: {item.printful ? 'true' : 'false'}</h1>                                        
                                        </div> */}
                    <div className={styles.checkout_lists}>
                      <div className={styles.card}>
                        <div className={styles.card_image}>
                          <img
                            className={styles.cart_total_body_item_image}
                            src={
                              !item.printful
                                ? item.image
                                : item.printful_details.files.find(
                                    (file) => file.type === "preview"
                                  ).thumbnail_url
                            }
                          />
                        </div>
                        <div className={styles.card_details}>
                          <div className={styles.card_name}>
                            <a
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                item.printful
                                  ? router.push(
                                      `/product/p/&&c=${item.collection}&&id=${item.printful_details.sync_product_id}`
                                    )
                                  : router.push(`/product/${item.id}`)
                              }
                            >
                              {item.name}
                            </a>
                          </div>
                          <div className={styles.card_price}>
                            x {item.quantity}
                          </div>

                          <div className={styles.card_price}>
                            <span>
                              <img
                                src={
                                  // find usdc token in tokens array and return the logo
                                  tokens.find(
                                    (token) => token.symbol === "USDC"
                                  ).logo
                                }
                              />
                            </span>
                            {item.price}
                          </div>

                          <div className={styles.card_wheel}>
                            {item.quantity > 1 ? (
                              <button
                                onClick={() =>
                                  handleDecreaseQuantity(item.product)
                                }
                              >
                                -
                              </button>
                            ) : (
                              <IoTrashBinOutline
                                className={styles.trash}
                                onClick={() => handleRemove(item)}
                              />
                            )}
                            <span>{item.quantity}</span>
                            {item.quantity + 1 <= item.maxAmount ? (
                              <button
                                onClick={() =>
                                  handleIncreaseQuantity(item.product)
                                }
                              >
                                +
                              </button>
                            ) : (
                              <button
                                style={{
                                  backgroundColor: "red",
                                  color: "white",
                                  cursor: "not-allowed",
                                }}
                                disabled
                              >
                                +
                              </button>
                            )}
                          </div>

                          <div
                            className={
                              styles.cart_total_body_item_payment_options
                            }
                          >
                            <select
                              onChange={(e) => {
                                var item_split = e.target.value.split(",");

                                // if the item is already in the selected tokens array, remove it and add the new one
                                if (
                                  selectedTokens.find(
                                    (token) => token.product === item.product
                                  )
                                ) {
                                  var obj = {
                                    item: item,
                                    token: item_split[0],
                                    total_price: item_split[1],
                                    quantity: item.quantity,
                                    product: item.product,
                                  };
                                  var filtered = selectedTokens.filter(
                                    (token) => token.product !== item.product
                                  );
                                  setSelectedTokens([...filtered, obj]);
                                } else {
                                  var obj = {
                                    item: item,
                                    token: item_split[0],
                                    total_price: item_split[1],
                                    quantity: item.quantity,
                                    product: item.product,
                                  };
                                  console.log("obj", obj);
                                  setSelectedTokens([...selectedTokens, obj]);
                                }
                              }}
                            >
                              {item.token_price_equivalent.map(
                                (option, index) => {
                                  return isNaN(option.price) ? null : (
                                    <option
                                      key={index}
                                      value={[option.token, option.price]}
                                    >
                                      <img
                                        className={
                                          styles.cart_total_body_item_image
                                        }
                                        src={
                                          tokens.find(
                                            (token) =>
                                              token.symbol ===
                                              option.token.toUpperCase()
                                          ).logo
                                        }
                                      />
                                      {option.token.toUpperCase()} -{" "}
                                      {option.price}
                                    </option>
                                  );
                                }
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    );
  };

  useEffect(() => {
    sortCart();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedTokens.length > 0 && completeCartPaymentOptions.length > 0) {
      console.log("calculate total");
      calculateTotal();
    }
  }, [selectedTokens, completeCartPaymentOptions]);

  return (
    <div className={styles.main_container}>
      {loading ? <Loading /> : null}
      {totalLoading ? <Loading /> : null}
      {!loading && !totalLoading ? renderCartTotal() : null}
    </div>
  );
};

export default Checkout;
