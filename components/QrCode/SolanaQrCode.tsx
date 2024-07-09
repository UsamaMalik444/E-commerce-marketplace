import {
  createQR,
  encodeURL,
  TransactionRequestURLFields,
  findReference,
  FindReferenceError,
} from "@solana/pay";
import { Keypair } from "@solana/web3.js";
import { getSingleProductBySku } from "../../lib/api";
import { useState, useMemo, useEffect, useRef } from "react";

const SolanaQrCode = ({ id } : { id: string}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const handleGenerateQR = async () => {
    const { location } = window;
    const product_data = await getSingleProductBySku(id);
    const reference = Keypair.generate().publicKey.toBase58();
    const order_as_string = `products=${id}&quantity=1&amount=${product_data.product.price}&currency=usdc&owner=${product_data.product.owner}&reference=${reference}`;
    const apiUrl = `${location.protocol}//${location.host}/api/payQr?${order_as_string}`;

    console.log("order as string", order_as_string);
    console.log("api url", apiUrl);

    const urlParams: TransactionRequestURLFields = {
      link: new URL(apiUrl),
      label: "IkonShop",
      message: "Thanks for your order! 🤑",
    };
    const solanaUrl = encodeURL(urlParams);
    const qr = createQR(solanaUrl, 512, "transparent");
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
    }
  };

  useEffect(() => {
    handleGenerateQR();
  }, []);

  // return ref={qrRef} in a pop up modal with close button
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "2rem",
        width: 'fit-content',
        height: 'fit-content',
        zIndex: 1000,
        backgroundColor: "white",
      }}
    >
      <div ref={qrRef} />
    </div>
    );
};

export default SolanaQrCode;
