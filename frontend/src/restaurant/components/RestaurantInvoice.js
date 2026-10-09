import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../config/api";

const RestaurantInvoice = () => {
  const { orderId } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/restaurant/orders/${orderId}/invoice?vendor_id=127`
        );

        if (response.data?.success) {
          setInvoice(response.data.data);
        } else {
          setError(response.data?.message || "Failed to load invoice.");
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);

        setError(
          err.response?.data?.message || "Failed to load invoice."
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchInvoice();
    }
  }, [orderId]);

  if (loading) {
    return <div>Loading invoice...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!invoice) {
    return <div>No invoice data found.</div>;
  }

  return (
    <div>
      <h1>bHyyve Invoice</h1>

      <p>
        <strong>Invoice #:</strong> {invoice.invoice_number}
      </p>

      <p>
        <strong>Booking ID:</strong> {invoice.booking_id}
      </p>

      <p>
        <strong>Customer:</strong> {invoice.fname} {invoice.lname}
      </p>

      <p>
        <strong>Email:</strong> {invoice.email}
      </p>

      <p>
        <strong>Phone:</strong> {invoice.mobile}
      </p>

      <p>
        <strong>Address:</strong> {invoice.delivery_address}
      </p>

      <hr />

      <h2>Service Invoice</h2>

      {invoice.product_list?.map((item, index) => (
        <div key={index}>
          <p>
            <strong>{item.name}</strong>
          </p>

          <p>Type: {item.item_type}</p>
          <p>Price: ${item.price}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Amount: ${item.final_amount}</p>
        </div>
      ))}

      <hr />

      <p>
        <strong>Subtotal:</strong> ${invoice.subtotal_amount}
      </p>

      <p>
        <strong>Discount:</strong> ${invoice.discount_amount}
      </p>

      <p>
        <strong>HST ({invoice.hst}):</strong> ${invoice.hst_amount}
      </p>

      <p>
        <strong>Delivery Charge:</strong> $
        {invoice.delivery_charge_amount}
      </p>

      <p>
        <strong>Total:</strong> ${invoice.total_amount || "0.00"}
      </p>
    </div>
  );
};

export default RestaurantInvoice;