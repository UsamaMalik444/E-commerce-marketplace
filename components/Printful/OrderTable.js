import React from "react";
import styles from "./styles/Printful.module.css";

const OrderTable = ({ data }) => {
  // console.log('data', data)
  return (
    <div className={styles.orders_container}>
      <table className={styles.orders_table}>
        <thead>
          <tr>
            <th></th>
            <th>Date</th>
            <th>Product</th>
            <th>Price</th>
            {/* <th>Shipping</th> */}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>
                <img
                  src={row.productImage}
                  alt={row.productName}
                  style={{ width: "100px" }}
                />
              </td>
              <td>{new Date(row.publishedAt).toLocaleDateString()}</td>
              <td>{row.productName} </td>
              <td className={styles.tooltip}>
                {row.price}
                <span className={styles.tooltiptext}>
                  {row.taxPrice && `Tax: ${row.taxPrice}`} <br />
                  {row.shippingPrice && `Shipping: ${row.shippingPrice}`}
                </span>
              </td>
              {/* <td>{row.shipping}</td> */}
              <td>
                <a
                  href={`https://www.printful.com/dashboard?order_id=${row.printId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Order
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
