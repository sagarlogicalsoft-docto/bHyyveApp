import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import "./storeTransactions.css";
import api from "../../../../config/api";
import StoreHeaderCommon from "./StoreHeaderCommon";
import Breadcrumbs from "../../common/BreadCrumbs";

const EXPORT_FORMATS = [
  { key: "csv", label: "Export as CSV" },
  { key: "pdf", label: "Export as PDF" },
];

const TransactionsService = {
  getTransactions({ storeId, search, page = 1, pageSize = 10, signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}/transactions`, {
      params: {
        search,
        page,
        pageSize,
      },
      signal,
    });
  },

  exportTransactions(storeId, format, { search, signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}/transactions/export`, {
      params: { format, search },
      responseType: "blob",
      signal,
    });
  },
};

/* ------------------------------------------------------------------ *
 * Formatting helpers
 * ------------------------------------------------------------------ */

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value, currency = "USD") {
  if (value === null || value === undefined || value === "") return "—";

  const currencyMap = {
    USD: "USD",
    INR: "INR",
  };

  const code = currencyMap[currency] || "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
  }).format(Number(value));
}

/* ------------------------------------------------------------------ *
 * Inline icon set — kept as small local functions (not separate
 * files/exports) so the deliverable stays to StoreTransaction.js/.css.
 * ------------------------------------------------------------------ */

function IconSearch(props) {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  );
}

function IconClose(props) {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconDownload(props) {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3.5v12M8 12l4 4 4-4" />
      <path d="M4.5 17v2.2a1.8 1.8 0 001.8 1.8h11.4a1.8 1.8 0 001.8-1.8V17" />
    </svg>
  );
}

function IconChevronDown(props) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 8.5l7 7 7-7" />
    </svg>
  );
}

function IconAlert(props) {
  return (
    <svg width={56} height={56} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3.5L21.5 20h-19L12 3.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 9.5v4.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.7" r="1" fill="currentColor" />
    </svg>
  );
}

function IconRefresh(props) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 12a8 8 0 0113.9-5.4M20 12a8 8 0 01-13.9 5.4" />
      <path d="M17 4v3h-3M7 20v-3h3" />
    </svg>
  );
}

// Small line-art "no data" illustration, kept local so the component
// stays self-contained (no external image asset to wire up later).
function IconNoData(props) {
  return (
    <svg width={170} height={150} viewBox="0 0 170 150" fill="none" {...props}>
      <ellipse cx="85" cy="120" rx="55" ry="10" fill="var(--st-canvas)" />
      <path
        d="M78 42c6-10 16-14 22-8s2 16-4 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="82" cy="40" r="14" stroke="currentColor" strokeWidth="2" />
      <circle cx="94" cy="46" r="1.6" fill="var(--st-primary)" />
      <path
        d="M74 56c-3 4-3 9 0 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M69 70c4-6 12-9 18-9s15 3 19 10c4 7 5 20 3 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M69 70c-8 4-14 12-17 20-2 5-6 9-9 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M96 78c8 2 14 10 15 20-1 6-3 12-2 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="41" cy="103" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="112" cy="118" r="6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function StoreTransaction({ pageSize = 10 }) {
  const { id } = useParams();

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const searchDebounceRef = useRef(null);
  const abortRef = useRef(null);
  const exportMenuRef = useRef(null);

  const loadTransactions = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await TransactionsService.getTransactions({
        storeId: id,
        search: searchTerm || undefined,
        page,
        pageSize,
        signal: controller.signal,
      });

      const data = response.data;
      setTransactions(data?.data || []);
      setTotalCount(data?.totalCount || 0);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(
          err.message || "Something went wrong while loading transactions.",
        );
        setTransactions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, searchTerm, page, pageSize]);

  useEffect(() => {
    loadTransactions();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [loadTransactions]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleSearchInputChange(event) {
    const value = event.target.value;
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchTerm(value.trim());
      setPage(1);
    }, 400);
  }

  function handleClearSearch() {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  }

  async function handleExport(format) {
    setIsExportOpen(false);
    setIsExporting(true);
    try {
      const response = await TransactionsService.exportTransactions(
        id,
        format,
        {
          search: searchTerm || undefined,
        },
      );
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Couldn't export transactions right now.");
    } finally {
      setIsExporting(false);
    }
  }

  const visibleCount = transactions.length;

  return (
    <>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={[
            {
              label: "Stores",
              path: "/restaurant/stores_list",
            },
            {
              label: "Transactions",
            },
          ]}
        />
      </div>

      <div className="store-transaction-page">
        <StoreHeaderCommon
          storeName="Store"
          storeId={id}
          storeStatus="Active"
        />

        <div className="store-transactions">
          <div className="store-transactions__panel">
            <div className="store-transactions__panel-header">
              <div className="store-transactions__panel-title">
                <h2>Transactions</h2>
                <span className="store-transactions__count-pill">
                  {totalCount}
                </span>
              </div>

              <div className="store-transactions__actions">
                <div className="store-transactions__search">
                  <IconSearch className="store-transactions__search-icon" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    placeholder="Search order, customer..."
                    aria-label="Search transactions"
                  />
                </div>

                {searchInput && (
                  <button
                    type="button"
                    className="store-transactions__clear-btn"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                  >
                    <IconClose />
                  </button>
                )}

                <div className="store-transactions__export" ref={exportMenuRef}>
                  <button
                    type="button"
                    className="store-transactions__export-btn"
                    onClick={() => setIsExportOpen((open) => !open)}
                    disabled={isExporting}
                    aria-haspopup="true"
                    aria-expanded={isExportOpen}
                  >
                    <IconDownload />
                    {isExporting ? "Exporting…" : "Export"}
                    <IconChevronDown />
                  </button>

                  {isExportOpen && (
                    <div
                      className="store-transactions__export-menu"
                      role="menu"
                    >
                      {EXPORT_FORMATS.map((format) => (
                        <button
                          key={format.key}
                          type="button"
                          role="menuitem"
                          onClick={() => handleExport(format.key)}
                        >
                          {format.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="store-transactions__table-wrap">
              <table className="store-transactions__table">
                <thead>
                  <tr>
                    <th className="col-index">Sl</th>
                    <th>Received At</th>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Vendor</th>
                    <th>Transaction Ref</th>
                    <th>Subtotal</th>
                    <th>Delivery Charge</th>
                    <th>Order Total</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr
                        key={`skeleton-${i}`}
                        className="row-skeleton"
                        aria-hidden="true"
                      >
                        {Array.from({ length: 10 }).map((__, j) => (
                          <td key={j}>
                            <span className="skeleton-bar" />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!isLoading &&
                    !error &&
                    transactions.map((txn, index) => (
                      <tr key={txn.id}>
                        <td className="col-index">
                          {(page - 1) * pageSize + index + 1}
                        </td>

                        <td className="cell-date">
                          {formatDateTime(txn.receivedAt)}
                        </td>

                        <td className="cell-mono">#{txn.orderNumber || "—"}</td>

                        <td>{txn.customerName || "—"}</td>

                        <td>{txn.vendorName || "—"}</td>

                        <td className="cell-mono">
                          {txn.transactionRef || "—"}
                        </td>

                        <td className="cell-mono">
                          {formatCurrency(txn.subtotal, txn.currency)}
                        </td>

                        <td className="cell-mono">
                          {formatCurrency(txn.deliveryCharge, txn.currency)}
                        </td>

                        <td className="cell-mono">
                          {formatCurrency(txn.orderTotal, txn.currency)}
                        </td>

                        <td className="cell-mono cell-amount">
                          {formatCurrency(txn.amount, txn.currency)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {!isLoading && !error && visibleCount === 0 && (
                <div className="store-transactions__empty">
                  <IconNoData className="store-transactions__empty-icon" />
                  <p className="store-transactions__empty-title">
                    No Data Found
                  </p>
                </div>
              )}

              {error && (
                <div className="store-transactions__error">
                  <IconAlert className="store-transactions__error-icon" />

                  <p className="store-transactions__empty-title">
                    Couldn't load transactions
                  </p>

                  <p className="store-transactions__error-copy">{error}</p>

                  <button
                    type="button"
                    className="store-transactions__retry"
                    onClick={loadTransactions}
                  >
                    <IconRefresh />
                    Retry
                  </button>
                </div>
              )}
            </div>

            {!isLoading && !error && totalPages > 1 && (
              <div className="store-transactions__pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>

                <span>
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
