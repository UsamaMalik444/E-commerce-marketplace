import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Keypair, Transaction, Connection } from "@solana/web3.js";
import { findReference, FindReferenceError } from "@solana/pay";
import { useWallet } from "@solana/wallet-adapter-react";
import { placeOrder, confirmOrder, deleteOrder } from "../../hooks/printful";
import { createOrderPrintful } from "../../lib/api";
import tokens from "../../constants/tokens";
import countryCodes from "../../constants/countryCodes";
import {
  fetchItem,
  addCartOrder,
  updateProductCounts,
  getSingleProductBySku,
} from "../../lib/api";
import styles from "../../styles/Product.module.css";
import Loading from "../Loading";
import { useRouter } from "next/router";
import { IoChevronForward } from "react-icons/io5";

const STATUS = {
  Initial: "Initial",
  Submitted: "Submitted",
  Paid: "Paid",
};

export default function Buy({
  id,
  owner,
  token,
  symbol,
  price,
  product,
  description,
  imageUrl,
  name,
  collection,
  noteToOwner,
  cart,
  selectedTokens,
  tokenTotals,
}) {
  // console.log("selectedTokens", selectedTokens);
  // console.log("token totals", tokenTotals);
  const router = useRouter();
  const connection = new Connection(
    "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7",
    "confirmed"
  );
  const { publicKey, sendTransaction } = useWallet();
  const orderID = useMemo(() => Keypair.generate().publicKey, []); // Public key used to identify the order
  const [item, setItem] = useState(null); // IPFS hash & filename of the purchased item
  const [loading, setLoading] = useState(false); // Loading state of all above
  const [infoCaptured, setInfoCaptured] = useState(true); // Whether the info has been grabbed from the user
  const [shippingCaptured, setShippingCaptured] = useState(false); // Whether the shipping info has been grabbed from the user
  const [status, setStatus] = useState(STATUS.Initial); // Tracking transaction status
  const [ownerEmail, setOwnerEmail] = useState(ownerEmail); // Email address of the owner
  const [showEmail, setShowEmail] = useState(false); // Whether to show the email input form
  const [email, setEmail] = useState(""); // Email address of the user
  const [txHash, setTxHash] = useState(""); // Transaction hash of the submitted transaction
  const [showNote, setShowNote] = useState(false); // Whether to show the note input form
  const [note, setNote] = useState(null); // Note to the seller
  const [noteCaptured, setNoteCaptured] = useState(true); // Whether the note has been grabbed from the user
  const [allowedColorOptions, setAllowedColorOptions] = useState([]); // Array of allowed color options for the item
  const [showTwitter, setShowTwitter] = useState(false); // Whether to show the twitter input form
  const [twitter, setTwitter] = useState(""); // Twitter handle of the user
  const [twitterCaptured, setTwitterCaptured] = useState(true); // Whether the twitter handle has been grabbed from the user

  const [showDiscord, setShowDiscord] = useState(false); // Whether to show the discord input form
  const [discord, setDiscord] = useState(""); // Discord handle of the user
  const [discordCaptured, setDiscordCaptured] = useState(true); // Whether the discord handle has been grabbed from the user

  const [showColorOptions, setShowColorOptions] = useState(false); // Whether to show the color options input form
  const [colorOption, setColorOption] = useState(""); // Color option of the user

  const [showShipping, setShowShipping] = useState(false); // Whether to show the shipping input form
  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    international: false,
  }); // Shipping address of the user
  const [shippingInfo, setShippingInfo] = useState("");
  const [addressVerified, setAddressVerified] = useState(false);
  const [printShipping, setPrintShipping] = useState(0);
  const [printTax, setPrintTax] = useState(0);
  const [printTotal, setPrintTotal] = useState(0);
  const [printObj, setPrintObj] = useState(null);
  const [draftReturned, setDraftReturned] = useState(false);

  const [selectedTokensWithReqs, setSelectedTokensWithReqs] = useState([]);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);

  const [tokensAndTotals, setTokensAndTotals] = useState([]); // array of objects with token name and total price for each token in cart
  // Fetch the transaction object from the server (done to avoid tampering)

  const executeOrderAdds = async () => {
    // for each item in the cart we need to create an order in the system addCartOrder,
    // if the item is a printful item we need to create an order in printful createOrderPrintful

    for (let i = 0; i < cart.length; i++) {
      if (cart[i].printful === true) {
        async function completeOrder() {
          try {
            // console.log('completing order for printObj', printObj)
            const confirm_order = await confirmOrder(
              printObj.collectionId,
              printObj.orderId
            );
            // console.log("confirm_order", confirm_order);
            await createOrderPrintful(printObj);
          } catch (e) {
            console.log("error", e);
          }
        }
        completeOrder();
      } else {
        console.log("cart[i].id", cart[i]);
        let product_details = await getSingleProductBySku(cart[i].product);
        console.log("product_details", product_details);
        const individual_order = {
          buyer: publicKey.toString(),
          collectionId: product_details.product.collections[0].id,
          colorOption:
            product_details.product.reqColor === true ? colorOption : "none",
          discord:
            product_details.product.reqDiscord === true ? discord : "none",
          email: product_details.product.reqUserEmail === true ? email : "none",
          note: product_details.product.reqNote === true ? note : "none",
          orderId: txHash,
          ownerEmail: product_details.product.collections[0].email
            ? product_details.product.collections[0].email
            : "none",
          price: price,
          productId: product_details.product.id,
          shippingInfo:
            product_details.product.reqUserShipping === true
              ? shippingInfo
              : "none",
          token: product_details.product.token,
          twitter:
            product_details.product.reqTwitter === true ? twitter : "none",
          fulfilled: false,
        };
        console.log("triggering order add", individual_order);
        addCartOrder(individual_order).then((res) => {
          console.log("order added, updating counts", res);
          updateProductCounts(individual_order.productId);
        });
      }
    }
  };

  const processTransaction = async () => {
    // setLoading(true);
    try {
      console.log("sending this order", order);
      // const txResponse = await fetch("../../api/createCartTransaction", {
      const txResponse = await fetch("../../api/createCartTransaction3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      const txData = await txResponse.json();

      const tx = Transaction.from(Buffer.from(txData.transaction, "base64"));

      const txHash = await sendTransaction(tx, connection);

      setTxHash(txHash);

      console.log(
        `Transaction sent: https://solana.fm/tx/${txHash}?cluster=mainnet`
      );
      setStatus(STATUS.Submitted);
    } catch (error) {
      console.error(error);
      if (error.code === 4001) {
        <Red message="Transaction rejected by user" />;
      }
      if (error.code === -32603 || error.code === -32003) {
        <Red message="Transaction failed, probably due to one of the wallets not having this token" />;
      }
      if (error.code === -32000) {
        <Red message="Transaction failed" />;
      }
    }
  };

  const order = useMemo(
    () => ({
      id: id,
      buyer: publicKey ? publicKey.toString() : "",
      orderID: orderID.toString(),
      // if product is a tip jar set the price to tip amount and set the token type to the tip jar token type
      token: token,
      price: price,
      owner: owner,
      token: token,
      email: email,
      twitter: twitter,
      discord: discord,
      shippingInfo: shippingInfo,
      note: note != null ? note : noteToOwner,
      colorOption: colorOption,
      collection: collection,
      cart: cart,
      selectedTokens: tokenTotals,
      shippingCost: printShipping,
      tax: printTax,
      txHash: txHash,
      // ownerEmail: ownerEmail,
    }),
    [
      publicKey,
      orderID,
      owner,
      token,
      id,
      email,
      shippingInfo,
      twitter,
      discord,
      note,
      price,
      colorOption,
      cart,
      selectedTokensWithReqs,
      printShipping,
      printTax,
      tokenTotals,
      txHash,
    ]
  );

  // render dropdown selection of color options and set selected color to colorOption
  const renderColorOptions = () => {
    return (
      <div className={styles.shipping_detail}>
        <label for="colorOptions">Select Color:</label>
        <select
          id="colorOptions"
          name="colorOptions"
          onChange={(e) => setColorOption(e.target.value)}
        >
          {allowedColorOptions.map((color) => (
            <option value={color}>{color}</option>
          ))}
        </select>
      </div>
    );
  };

  // render form to capture user email
  const renderEmailForm = () => {
    var validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const handleChange = (e) => {
      setEmail(e.target.value);
    };
    return (
      <section className={styles.checkout_form}>
        <h6>Contact information</h6>
        <div className={styles.form_control}>
          <label>Email</label>

          <input
            type="email"
            placeholder="jim@gmail.com"
            value={email}
            onChange={handleChange}
          />

          <button
            className={styles.saveBtn}
            onClick={() => {
              if (email !== "" && validRegex.test(email)) {
                setEmail(email);
                setShowEmail(false);
                setInfoCaptured(true);
              } else {
                alert("Please enter a valid email");
              }
            }}
          >
            <span>Next</span>
            <IoChevronForward />
          </button>
        </div>
      </section>
    );
  };

  const renderShippingForm = () => {
    return (
      <div className={styles.shipping_container}>
        <div className={styles.checkout_form}>
          <h6>Shipping address</h6>
          <div className={styles.checkout_form}>
            <div className={styles.form_control}>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name..."
                value={shipping.name}
                onChange={(e) =>
                  setShipping({ ...shipping, name: e.target.value })
                }
              />
            </div>
            <div className={styles.form_control}>
              <label>Address</label>
              <input
                type="text"
                placeholder="Your address..."
                value={shipping.address}
                onChange={(e) =>
                  setShipping({ ...shipping, address: e.target.value })
                }
              />
            </div>
            <div className={styles.form_control}>
              <label>City</label>
              <input
                type="text"
                placeholder="Your city..."
                value={shipping.city}
                onChange={(e) =>
                  setShipping({ ...shipping, city: e.target.value })
                }
              />
            </div>

            <div className={styles.form_control}>
              <label>Country</label>
              {/* <input
                type="text"
                placeholder="Country"
                value={shipping.country}
                onChange={(e) =>
                  setShipping({ ...shipping, country: e.target.value })
                }
              /> */}
              {/* map out the countrys from countryCode.name as options, when selected set the countryCode.code as setShipping({...shipping, country: }) */}
              <select
                id="country"
                name="country"
                style={{
                  width: "fit-content",
                  display: "block",
                  height: "50px",
                  borderRadius: "10px",
                  width: "100%",
                }}
                onChange={(e) =>
                  setShipping({ ...shipping, country: e.target.value })
                }
              >
                {countryCodes.map((country) => (
                  <option value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.form_group}>
              <div className={styles.form_control}>
                <label>Zip Code</label>
                <input
                  type="text"
                  placeholder="Zip"
                  value={shipping.zip}
                  onChange={(e) =>
                    setShipping({ ...shipping, zip: e.target.value })
                  }
                />
              </div>
              <div className={styles.form_control}>
                <label>State</label>
                <input
                  type="text"
                  placeholder="State"
                  value={shipping.state}
                  onChange={(e) =>
                    setShipping({ ...shipping, state: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <button
            className={
              shipping.name !== "" &&
              shipping.address !== "" &&
              shipping.city !== "" &&
              shipping.state !== "" &&
              shipping.zip !== "" &&
              shipping.country !== ""
                ? styles.saveBtn
                : styles.unverified
            }
            onClick={() => {
              if (
                shipping.name !== "" &&
                shipping.address !== "" &&
                shipping.city !== "" &&
                shipping.state !== "" &&
                shipping.zip !== "" &&
                shipping.country !== ""
              ) {
                setShipping(shipping);
                setShowShipping(false);
                setShippingCaptured(true);
                // setShippingInfo as a string of only the values from the shipping not the key's
                setShippingInfo(
                  `${shipping.name}, ${shipping.address}, ${shipping.city}, ${shipping.state}, ${shipping.country}, ${shipping.zip}, ${shipping.international}`
                );
              } else {
                alert("Please fill out all shipping fields");
              }
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderNoteForm = () => {
    return (
      <div className={styles.noteForm} style={{ marginTop: "30px" }}>
        <label style={{ marginBottom: "10px" }}>Note to Seller</label>

        <input
          type="text"
          placeholder="Note to Seller"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    );
  };

  // render form to capture user twitter handle
  const renderTwitterForm = () => {
    return (
      <div className={styles.shipping_detail}>
        <label>Twitter Handle</label>

        <input
          tabIndex={showEmail || showShipping || showTwitter ? "0" : "-1"}
          type="text"
          placeholder="@TopShotTurtles"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
        />

        <button
          className={styles.saveBtn}
          onClick={() => {
            if (twitter !== "") {
              setTwitter(twitter);
              setShowTwitter(false);
              setTwitterCaptured(true);
            } else {
              alert("Please enter a valid twitter handle");
            }
          }}
        >
          Next
        </button>
      </div>
    );
  };

  // render form to capture user discord id
  const renderDiscordForm = () => {
    return (
      <div className={styles.shipping_detail}>
        <label style={{ marginBottom: "10px" }}>Discord ID</label>

        <input
          tabIndex={
            showEmail || showShipping || showTwitter || showDiscord ? "0" : "-1"
          }
          type="text"
          placeholder="User#1234"
          value={discord}
          onChange={(e) => setDiscord(e.target.value)}
        />

        <button
          className={styles.saveBtn}
          onClick={() => {
            if (discord !== "") {
              setDiscord(discord);
              setShowDiscord(false);
              setDiscordCaptured(true);
            } else {
              alert("Please enter a valid discord ID");
            }
          }}
        >
          Save
        </button>
      </div>
    );
  };

  const renderFormBox = () => {
    const forms_to_display = [];
    if (showEmail) {
      forms_to_display.push(renderEmailForm());
    }
    if (showShipping) {
      forms_to_display.push(renderShippingForm());
    }
    if (showTwitter) {
      forms_to_display.push(renderTwitterForm());
    }
    if (showDiscord) {
      forms_to_display.push(renderDiscordForm());
    }
    if (showColorOptions) {
      forms_to_display.push(renderColorOptions());
    }
    if (showNote) {
      forms_to_display.push(renderNoteForm());
    }

    return <div>{forms_to_display[currentFormIndex]}</div>;
  };

  // if (!publicKey) {
  //   return (
  //     <div>
  //       <p>Connect to app to buy!</p>
  //     </div>
  //   );
  // }

  // if (loading) {
  //   return <Loading />;
  // }

  // inspect item for userRequireEmail and userRequireShipping when item is present
  useEffect(() => {
    async function getReqs(id) {
      const reqs = await getSingleProductBySku(id);
      // const owner_email = reqs.product.collections[0].email;
      // setOwnerEmail(owner_email);

      if (reqs.product) {
        if (reqs.product.reqTwitter === true) {
          setShowTwitter(true);
          setTwitterCaptured(false);
        }
        if (reqs.product.reqDiscord === true) {
          setShowDiscord(true);
          setDiscordCaptured(false);
        }
        if (reqs.product.reqUserEmail === false) {
          setInfoCaptured(true);
        }
        if (reqs.product.reqUserShipping === false) {
          setShippingCaptured(true);
        }
        if (reqs.product.reqUserEmail === true) {
          setShowEmail(true);
        }
        if (
          reqs.product.reqUserShipping === true ||
          reqs.product.printful === true
        ) {
          setShippingCaptured(false);
          setShowShipping(true);
        }
        if (reqs.product.reqNote === true) {
          setShowNote(true);
          setNoteCaptured(false);
        }
        if (reqs.product.reqColor === true) {
          setShowColorOptions(true);
          setAllowedColorOptions(reqs.product.allowedColorOptions);
        }
      }
      return reqs;
    }

    //we need to getReqs for each item in the cart and then set the state for each item in the cart
    // async function that awaits the results of getSingleProductBySku
    var new_selected_tokens_array = [];
    if (selectedTokens.length > 0) {
      for (let i = 0; i < selectedTokens.length; i++) {
        const item = selectedTokens[i];

        if (item.printful === true) {
          setShippingCaptured(false);
          setShowShipping(true);
        }
        getReqs(item.product).then((res) => {
          const reqs = res.product;
          const selected_token_with_reqs = {
            ...item,
            reqs,
          };

          new_selected_tokens_array.push(selected_token_with_reqs);
        });
      }

      setSelectedTokensWithReqs(new_selected_tokens_array);
    }

    // calculate the total for each token type in the cart and add it to the tokensAndTotals array
    // const tokens_and_totals = [];
    // for(let i = 0; i < new_selected_tokens_array.length; i++) {
    //   const item = new_selected_tokens_array[i];
    //   console.log('item is', item)
    //   const token_and_total = {
    //     name: item.token,
    //     price: parseInt(item.price) * parseInt(item.quantity)
    //   }
    //   tokens_and_totals.push(token_and_total);
    // }
    // console.log('****',tokens_and_totals);
  }, [id]);

  useEffect(() => {
    // Check if transaction was confirmed
    if (status === STATUS.Submitted) {
      setLoading(true);
      const interval = setInterval(async () => {
        try {
          const result = await findReference(connection, orderID);

          if (
            result.confirmationStatus === "confirmed" ||
            result.confirmationStatus === "finalized"
          ) {
            clearInterval(interval);
            setStatus(STATUS.Paid);
          }
        } catch (e) {
          if (e instanceof FindReferenceError) {
            return null;
          }
          console.error("Unknown error", e);
        }
      }, 1000);
      return () => {
        setLoading(false);
        clearInterval(interval);
        executeOrderAdds();

        // addCartOrder(order)

        // updateProductCounts(order.id);
        // clear cart
        localStorage.removeItem("cart");
        // redirect to order page
        // router.push(`/order/${orderID}`);
      };
    }

    async function getItem(id) {
      const item = await fetchItem(id);
      setItem(item);
    }

    if (status === STATUS.Paid) {
      getItem(id);
    }
  }, [status]);

  // *********Printful useEffect
  useEffect(() => {
    // console.log('selected tokens with reqs', selectedTokensWithReqs)
    if (
      shippingCaptured === true &&
      shipping.name != "" &&
      shipping.address != "" &&
      shipping.city != "" &&
      shipping.state != "" &&
      shipping.zip != "" &&
      shipping.country.length > 1
    ) {
      console.log("shipping", shipping);
      async function getDraft() {
        for (let i = 0; i < selectedTokensWithReqs.length; i++) {
          if (selectedTokensWithReqs[i].printful === true) {
            console.log("selectedTokensWithReqs[i]", selectedTokensWithReqs[i]);
            var orderData = {
              recipient: {
                name: shipping.name,
                address1: shipping.address,
                city: shipping.city,
                state_code: shipping.state,
                country_code: shipping.country,
                zip: shipping.zip,
              },
              items: [
                {
                  variant_id:
                    selectedTokensWithReqs[i].printful_details.variant_id,
                  quantity: 1,
                  // include all files except the preview image w/ the type: preview
                  files: selectedTokensWithReqs[i].printful_details.files,
                  options:
                    selectedTokensWithReqs[i].printful_details.options.length >
                    0
                      ? [...selectedTokensWithReqs[i].printful_details.options]
                      : [],
                },
              ],
            };
            const print_id = await placeOrder(
              selectedTokensWithReqs[i].collection,
              orderData
            );
            console.log("print_id", print_id);
            const shipping_cost = print_id.costs ? print_id.costs.shipping : 0;
            const tax_cost = print_id.costs ? print_id.costs.tax : 0;
            const total_cost = print_id.costs.total;
            setPrintShipping(shipping_cost);
            setPrintTax(parseFloat(tax_cost));
            setPrintTotal(total_cost);
            // make the print_order_object based off the returned print_id
            const print_order_object = {
              buyer: publicKey.toString(),
              email: email,
              note: note,
              collectionId: selectedTokensWithReqs[i].collection,
              orderId: print_id.id,
              productId: selectedTokensWithReqs[i].id,
              variantId:
                selectedTokensWithReqs[i].printful_details.product.variant_id,
              printId: selectedTokensWithReqs[i].printful_details.id,
              productImage:
                selectedTokensWithReqs[i].printful_details.product.image,
              productName: selectedTokensWithReqs[i].printful_details.name,
              quantity: 1,
              subtotal: print_id.costs.subtotal,
              shippingPrice: print_id.costs.shipping,
              tax: print_id.costs.tax,
              discount: print_id.costs.discount,
              // turn shippingPrice into a number, turn tax into a number, and add them together to get total
              price:
                parseFloat(price) +
                parseFloat(print_id.costs.tax) +
                parseFloat(print_id.costs.shipping),
              fulfilled: false,
              shipping: `${print_id.recipient.name}, ${
                print_id.recipient.address1
              }, ${
                print_id.recipient.address2 ? print_id.recipient.address2 : null
              }, ${print_id.recipient.city}, ${
                print_id.recipient.state_code
              }, ${print_id.recipient.country_code}, ${print_id.recipient.zip}`,
              shipping_service_name: print_id.shipping_service_name,
            };
            setPrintObj(print_order_object);
            setDraftReturned(true);
            setAddressVerified(true);

            console.log("print_order_object", print_order_object);
          }
        }
      }
      getDraft();
    }
  }, [shippingCaptured, shipping]);

  useEffect(() => {
    if (draftReturned === true) {
      setAddressVerified(true);
    }
  }, [draftReturned]);

  // *********Printful useEffect

  return (
    <div>
      {renderFormBox()}
      {/* {showNote && noteCaptured ? (
        <div className={styles.note}>
          <p>Note to Seller: {note}</p>
        </div>
      ) : null}
      {showTwitter && twitterCaptured ? (
        <p>Twitter Captured: {twitter}</p>
      ) : null}
      {showDiscord && discordCaptured ? (
        <p>Discord Captured: {discord}</p>
      ) : null}
      {infoCaptured && email ? <p>Email Captured: {email}</p> : null} */}
      {infoCaptured && shipping && shippingCaptured ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <p className={styles.shipping_detail}>
            {shipping.name} {shipping.address} {shipping.city} {shipping.state}{" "}
            {shipping.country} {shipping.zip}{" "}
            {shipping.international ? shipping.international : null}
          </p>
          {shipping.name != "" && (
            <button
              style={{
                backgroundColor: "white",
                border: "1px solid black",
                borderRadius: "30px",
                padding: "5px 10px",
                cursor: "pointer",
              }}
              onClick={() => {
                setShowShipping(true);
                setShippingCaptured(false);
              }}
            >
              Edit Shipping
            </button>
          )}
        </div>
      ) : null}
      {item && infoCaptured ? (
        <>
          <h3 className="purchased">Thank you for your order!</h3>

          <button
            disabled={loading || !infoCaptured || !shippingCaptured}
            className="buy-button"
            onClick={processTransaction}
          >
            Buy Again?
          </button>
          <Link
            disabled={loading || !infoCaptured || !shippingCaptured}
            href={`/dashboard?user=true&&showUserOrders=true`}
            className="buy-button"
          >
            <button
              disabled={loading || !infoCaptured || !shippingCaptured}
              className="buy-button"
            >
              View Order
            </button>
          </Link>
        </>
      ) : (
        <div className={styles.buy_container}>
          {!infoCaptured ||
            (!shippingCaptured && (
              <p
                style={{
                  color: "red",
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginTop: "10px",
                  // fontStyle: "italic",
                }}
              >
                Please fill out info above.
              </p>
            ))}

          <div className={styles.cart_total_footer}>
            <p className={styles.token_totals_total}>
              Shipping Cost:{" "}
              {printObj ? (
                <>
                  <img
                    src={
                      // find usdc token in tokens array and return the logo
                      tokens.find((token) => token.symbol === "USDC").logo
                    }
                    alt="USDC"
                    style={{ width: "20px", height: "20px" }}
                  />{" "}
                  {printObj.shippingPrice}
                </>
              ) : (
                "---"
              )}
            </p>
            <p className={styles.token_totals_total}>
              Tax:{" "}
              {printObj ? (
                <>
                  <img
                    src={
                      // find usdc token in tokens array and return the logo
                      tokens.find((token) => token.symbol === "USDC").logo
                    }
                    alt="USDC"
                    style={{ width: "20px", height: "20px" }}
                  />{" "}
                  {printObj.tax}
                </>
              ) : (
                "---"
              )}
            </p>
            <p className={styles.token_totals_total}>
              {/* Total: ${
                  price + printShipping + printTax
                } */}

              {/* Total: {
                  printObj ? `$${printObj.price}` : "---"
                } */}

              {/* selectedTokensWithReqs can contain numerous tokens, filter and display the total for each token type */}

              {tokenTotals.length > 1 ? "Totals:" : "Total:"}

              {tokenTotals.map((token) => {
                // console.log('adjusting token total', tokenTotals)
                // console.log('token', token)
                return (
                  <>
                    <p className={styles.token_totals_total_p}>
                      <img
                        src={
                          tokens.find(
                            (tokenList) =>
                              tokenList.symbol.toLowerCase() === token.token
                          ).logo
                        }
                        alt={token.token}
                        style={{ width: "20px", height: "20px" }}
                      />{" "}
                      {token.token != "usdc" &&
                        token.total > 0 &&
                        token.total.slice(0, 8)}
                      {token.token === "usdc" &&
                        token.total > 0 &&
                        (
                          parseFloat(token.total) +
                          parseFloat(printShipping) +
                          parseFloat(printTax)
                        ).toString()}
                    </p>
                  </>
                );
              })}
            </p>
          </div>

          {infoCaptured ? (
            <button
              disabled={loading || !infoCaptured || !shippingCaptured}
              className="buy-button"
              onClick={processTransaction}
            >
              {tokenTotals.length > 1 ? (
                "Pay Totals"
              ) : (
                <>
                  <span className={styles.pay_btn_span}>Pay</span>
                  <img
                    src={
                      tokens.find(
                        (token) =>
                          token.symbol.toLowerCase() === tokenTotals[0].token
                      ).logo
                    }
                    alt={tokenTotals[0].token}
                    style={{
                      width: "15px",
                      height: "15px",
                      marginRight: "2px",
                    }}
                  />
                  {tokenTotals[0].token != "usdc"
                    ? tokenTotals[0].total
                    : // display up to 2 decimal places
                      (
                        parseFloat(tokenTotals[0].total) +
                        parseFloat(printShipping) +
                        parseFloat(printTax)
                      ).toFixed(2)}{" "}
                </>
              )}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
