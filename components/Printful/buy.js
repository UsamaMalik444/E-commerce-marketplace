import React, { useEffect, useState, useMemo } from "react";
import { Keypair, Transaction, Connection } from "@solana/web3.js";
import { findReference, FindReferenceError } from "@solana/pay";
import { useWallet } from "@solana/wallet-adapter-react";
import { placeOrder, confirmOrder, deleteOrder } from "../../hooks/printful";
import {
  fetchItem,
  addOrder,
  deleteProductFromBuyer,
  getBuyerOrders,
  updateProductCounts,
  getSingleProductBySku,
  createOrderPrintful,
} from "../../lib/api";
// import { hasPurchased } from "../services/index";
import styles from "./styles/Printful.module.css";
import Loading from "../Loading";

const STATUS = {
  Initial: "Initial",
  Submitted: "Submitted",
  Paid: "Paid",
};

export default function BuyPrintful({
  id,
  owner,
  variant_id,
  product,
  collection,
  noteToOwner,
  price,
  image,
}) {
  // console.log("this is the buy price", price);
  const connection = new Connection(
    "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7",
    "confirmed"
  );
  const { publicKey, sendTransaction } = useWallet();
  const orderID = useMemo(() => Keypair.generate().publicKey, []); // Public key used to identify the order
  const [loading, setLoading] = useState(false); // Loading state of all above
  const [infoCaptured, setInfoCaptured] = useState(false); // Whether the info has been grabbed from the user
  const [shippingCaptured, setShippingCaptured] = useState(false); // Whether the shipping info has been grabbed from the user
  const [status, setStatus] = useState(STATUS.Initial); // Tracking transaction status

  const [showEmail, setShowEmail] = useState(true); // Whether to show the email input form
  const [email, setEmail] = useState(""); // Email address of the user
  const [emailCaptured, setEmailCaptured] = useState(false); // Whether the email has been grabbed from the user

  const [showNote, setShowNote] = useState(true); // Whether to show the note input form
  const [note, setNote] = useState(null); // Note to the seller
  const [noteCaptured, setNoteCaptured] = useState(false); // Whether the note has been grabbed from the user

  const [showShipping, setShowShipping] = useState(true); // Whether to show the shipping input form
  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    international: false,
  }); // Shipping address of the user
  const [shippingInfo, setShippingInfo] = useState(""); // Shipping info of the user in string form
  const token = "usdc";

  const [printTax, setPrintTax] = useState(0.0); // Tax amount for the print
  const [printShipping, setPrintShipping] = useState(0.0); // Shipping amount for the print
  const [printTotal, setPrintTotal] = useState(0.0); // Total amount for the print
  const [draftReturned, setDraftReturned] = useState(false); // Whether the draft has been returned from Printful
  const [printObj, setPrintObj] = useState(null); // The print object returned from Printful

  // Fetch the transaction object from the server (done to avoid tampering)
  const processTransaction = async () => {
    setLoading(true);
    console.log("sending this order", order);
    const txResponse = await fetch("../../api/createPrintfulTransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    const txData = await txResponse.json();
    // console.log("txData", txData);
    const tx = Transaction.from(Buffer.from(txData.transaction, "base64"));
    try {
      const txHash = await sendTransaction(tx, connection);

      order.orderID = txHash;

      console.log("txHash", txHash);

      console.log(
        `Transaction sent: https://solana.fm/tx/${txHash}?cluster=mainnet`
      );
      setStatus(STATUS.Submitted);
    } catch (error) {
      console.error(error);
      if (error.code === 4001) {
        alert("Transaction rejected.");
      }
      if (error.code === -32603 || error.code === -32003) {
        alert(
          "Transaction failed, probably due to one of the wallets not having this token"
        );
      }
      if (error.code === -32000) {
        alert("Transaction failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const order = useMemo(
    () => ({
      id: id,
      variantId: variant_id,
      buyer: publicKey ? publicKey.toString() : "",
      orderID: orderID.toString(),
      // if product is a tip jar set the price to tip amount and set the token type to the tip jar token type
      product: product,
      owner: owner,
      token: token,
      email: email,
      shippingInfo: shippingInfo,
      note: note != null ? note : noteToOwner,
      collection: collection,
      price: (parseFloat(price) + printShipping + printTax).toFixed(2),
      image: image,
      shippingCost: printShipping,
      tax: printTax,
    }),
    [
      publicKey,
      orderID,
      owner,
      id,
      variant_id,
      product,
      email,
      shippingInfo,
      noteToOwner,
      collection,
      price,
      image,
      printShipping,
    ]
  );
  useEffect(() => {
    // Check if transaction was confirmed
    if (status === STATUS.Submitted) {
      setLoading(true);
      const interval = setInterval(async () => {
        try {
          const result = await findReference(connection, orderID);

          console.log("Finding tx reference", result.confirmationStatus);
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
      };
    }

    if (status === STATUS.Paid) {
      console.log("Thank you for your purchase!");
      console.log("Confirming order w/ Printful");

      //         "city": "Sydney",
      //         "state_code": "NSW",
      //         "country_code": "AU",
      //         "zip": "2200"
      //     },
      //     "items": [
      //         {
      //             "variant_id": 11513,
      //             "quantity": 1,
      //             "files": [
      //                 {
      //                     "url": "http://example.com/files/posters/poster_1.jpg"
      //                 }
      //             ]
      //         }
      //     ]
      // }

      async function completeOrder() {
        try {
          const confirm_order = await confirmOrder(
            collection,
            printObj.printId
          );
          console.log("confirm_order", confirm_order);
          await createOrderPrintful(printObj);
        } catch (e) {
          console.log("error", e);
        }
      }
      completeOrder();
    }
  }, [status]);

  // render form to capture user email
  const renderEmailForm = () => {
    var validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const handleChange = (e) => {
      setEmail(e.target.value);
      // console.log("email", email);
    };
    return (
      <div className={styles.emailForm}>
        <label>Email</label>
        <div className={styles.input_field}>
          <input
            type="email"
            placeholder="jim@gmail.com"
            value={email}
            onChange={handleChange}
          />
        </div>
        <button
          className={styles.saveBtn}
          onClick={() => {
            if (email !== "" && validRegex.test(email)) {
              setEmail(email);
              // console.log("Email captured", email);
              setEmailCaptured(true);
              setShowEmail(false);
            } else {
              alert("Please enter a valid email");
            }
          }}
        >
          Save
        </button>
      </div>
    );
  };

  // render form to capture user shipping info
  const renderShippingForm = () => {
    return (
      <div className={styles.shippingForm}>
        <label style={{ marginBottom: "20px" }}>Shipping Address</label>
        <div className={styles.input_field}>
          <input
            type="text"
            placeholder="Name"
            value={shipping.name}
            onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
          />
        </div>
        <div className={styles.input_field}>
          <input
            type="text"
            placeholder="Address"
            value={shipping.address}
            onChange={(e) =>
              setShipping({ ...shipping, address: e.target.value })
            }
          />
        </div>

        {/* <div className={styles.form_row}>
          <div className={styles.col_half}> */}
        <div className={styles.input_field}>
          <input
            type="text"
            placeholder="City"
            value={shipping.city}
            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
          />
        </div>
        {/* </div> */}
        {/* <div className={styles.col_half}> */}
        <div className={styles.input_field}>
          <input
            type="text"
            placeholder="Zip"
            value={shipping.zip}
            onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
          />
        </div>
        {/* </div>
        </div> */}
        <div className={styles.input_field}>
          <input
            type="text"
            placeholder="State"
            value={shipping.state}
            onChange={(e) =>
              setShipping({ ...shipping, state: e.target.value })
            }
          />
        </div>
        <div className={styles.input_field}>
          <input
            type="text"
            placeholder="Country"
            value={shipping.country}
            onChange={(e) =>
              setShipping({ ...shipping, country: e.target.value })
            }
          />
        </div>

        <button
          className={styles.saveBtn}
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
              // console.log("Shipping info captured", shipping);
              setShowShipping(false);
              setShippingCaptured(true);
              // setShippingInfo as a string of only the values from the shipping not the key's
              setShippingInfo(
                `${shipping.name}, ${shipping.address}, ${shipping.city}, ${shipping.state}, ${shipping.country}, ${shipping.zip}, ${shipping.international}`
              );
              // console.log("Shipping info,", shippingInfo);
            } else {
              alert("Please fill out all shipping fields");
            }
          }}
        >
          Save
        </button>
      </div>
    );
  };

  const renderNoteForm = () => {
    return (
      <div className={styles.noteForm}>
        <label style={{ marginBottom: "20px" }}>Note to Seller</label>
        <div className={styles.input_field}>
          <input
            type="text"
            placeholder="Note to Seller"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button
          className={styles.saveBtn}
          onClick={() => {
            if (note !== "") {
              setNote(note);
              // console.log("Note captured", note);
              setShowNote(false);
              setNoteCaptured(true);
            } else {
              alert("Please enter a note to seller");
            }
          }}
        >
          Save
        </button>
      </div>
    );
  };

  useEffect(() => {
    if (shippingCaptured) {
      async function getDraft() {
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
              variant_id: product.variant_id,
              quantity: 1,
              files: product.files,
            },
          ],
        };
        console.log("All info captured");
        const print_id = await placeOrder(collection, orderData);
        const shipping_cost = print_id.costs.shipping;
        const tax_cost = print_id.costs.tax;
        const total_cost = print_id.costs.total;
        setPrintShipping(shipping_cost);
        setPrintTax(parseFloat(tax_cost));
        setPrintTotal(total_cost);
        // make the print_order_object based off the returned print_id
        const print_order_object = {
          buyer: publicKey.toString(),
          email: email,
          note: note,
          collectionId: collection,
          orderId: orderID.toString(),
          productId: product.id,
          variantId: product.variant_id,
          printId: print_id.id,
          productImage: image,
          productName: product.name,
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
          }, ${print_id.recipient.city}, ${print_id.recipient.state_code}, ${
            print_id.recipient.country_code
          }, ${print_id.recipient.zip}`,
          shipping_service_name: print_id.shipping_service_name,
        };
        console.log("print_id", print_id);
        console.log("print_order_object", print_order_object);
        setPrintObj(print_order_object);
        setDraftReturned(true);
      }
      getDraft();
    }
  }, [shippingCaptured]);

  if (!publicKey) {
    return (
      <div>
        <p>Connect to app to buy!</p>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      {/* Display either buy button or IPFSDownload component based on if Hash exists */}
      {showShipping ? renderShippingForm() : null}
      {showEmail ? renderEmailForm() : null}
      {showNote ? renderNoteForm() : null}
      {showNote && noteCaptured ? (
        <div className={styles.note}>
          <p>Note to Seller: {note}</p>
        </div>
      ) : null}
      {shippingCaptured && shipping ? (
        <p>
          {shipping.name} {shipping.address} {shipping.city} {shipping.state}{" "}
          {shipping.country} {shipping.zip}{" "}
          {shipping.international ? shipping.international : null}
        </p>
      ) : null}
      {draftReturned ? (
        <div className={styles.draft}>
          <p>Shipping: {printShipping}</p>
          <p>Tax: {printTax}</p>
          <p>Total: {(parseFloat(price) + printShipping).toFixed(2)}</p>
        </div>
      ) : null}
      {shippingCaptured && emailCaptured && draftReturned ? (
        <>
          <button
            disabled={loading || !emailCaptured || !shippingCaptured}
            className="buy-button"
            onClick={processTransaction}
          >
            Pay {(parseFloat(price) + printShipping + printTax).toFixed(2)}{" "}
            {token.toUpperCase()} Now
          </button>

          <button
            disabled={loading || !emailCaptured || !shippingCaptured}
            className="buy-button"
            onClick={() => deleteOrder(collection, orderID)}
          >
            Delete order
          </button>
        </>
      ) : null}
      {shippingCaptured && !emailCaptured ? (
        <p>Please enter your email address to continue with your purchase.</p>
      ) : null}
    </div>
  );
}
