import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { FaTags, FaSearch, FaTimes, FaRedo, FaSave } from "react-icons/fa";
import api from "../../../../config/api";
import StoreHeaderCommon from "./StoreHeaderCommon";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import Breadcrumbs from "../../common/BreadCrumbs";
import "./storeKeywords.css";

const PAGE_STEP = 50;

const KeywordsService = {
  // Store header information
  getStore(storeId, { signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}`, { signal });
  },

  // Store + restaurant category keywords + assigned keywords
  getStoreKeywords(storeId, { signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}/keywords`, { signal });
  },

  // Update assigned restaurant keywords
  updateStoreKeywords(vendorId, keywordIds) {
    return api.post(`/restaurant/stores/keywords`, {
      vendor_id: vendorId,
      keyword_ids: keywordIds,
    });
  },
};

function getErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function StoreKeywords() {
  const { id } = useParams();

  const [store, setStore] = useState(null);

  const [allKeywords, setAllKeywords] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const abortRef = useRef(null);

  /* ---------- store header info (name + status) ---------- */

  useEffect(() => {
    const controller = new AbortController();

    KeywordsService.getStore(id, { signal: controller.signal })
      .then((response) => setStore(response.data?.data || null))
      .catch(() => setStore(null));

    return () => controller.abort();
  }, [id]);

  const storeName =
    store?.business_name || store?.store_name || store?.name || "Store";

  const storeStatus =
    Number(store?.is_kyc_approved) === 1 ? "Active" : "Inactive";

  /* ---------- keywords ---------- */

  const loadKeywords = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await KeywordsService.getStoreKeywords(id, {
        signal: controller.signal,
      });

      const data = response.data;

      const all = data?.categoryKeywords || [];
      const assigned = data?.vendorKeywordIds || [];

      setAllKeywords(all);
      setSelectedIds(assigned);
      setSavedIds(assigned);
    } catch (err) {
      if (err.name !== "AbortError" && err.name !== "CanceledError") {
        setError(
          getErrorMessage(err, "Something went wrong while loading keywords."),
        );

        setAllKeywords([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadKeywords();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [loadKeywords]);

  /* ---------- search + selected-only filter ---------- */

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filteredKeywords = useMemo(() => {
    const term = searchInput.trim().toLowerCase();

    return allKeywords.filter((item) => {
      if (showSelectedOnly && !selectedSet.has(item.id)) return false;
      if (!term) return true;
      return String(item.keyword).toLowerCase().includes(term);
    });
  }, [allKeywords, searchInput, showSelectedOnly, selectedSet]);

  // only a slice is rendered; more rows load while scrolling
  const visibleKeywords = useMemo(
    () => filteredKeywords.slice(0, visibleCount),
    [filteredKeywords, visibleCount],
  );

  function handleBodyScroll(e) {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

    if (
      scrollTop + clientHeight >= scrollHeight - 80 &&
      visibleCount < filteredKeywords.length
    ) {
      setVisibleCount((count) => count + PAGE_STEP);
    }
  }

  function handleSearchChange(value) {
    setSearchInput(value);
    setVisibleCount(PAGE_STEP);
  }

  function handleToggleSelectedOnly() {
    setShowSelectedOnly((prev) => !prev);
    setVisibleCount(PAGE_STEP);
  }

  /* ---------- selection ---------- */

  function handleToggle(keywordId) {
    setActionError("");

    setSelectedIds((prev) =>
      prev.includes(keywordId)
        ? prev.filter((value) => value !== keywordId)
        : [...prev, keywordId],
    );
  }

  const hasChanges =
    selectedIds.length !== savedIds.length ||
    selectedIds.some((value) => !savedIds.includes(value));

  async function handleUpdate() {
    setIsSaving(true);
    setActionError("");

    try {
      await KeywordsService.updateStoreKeywords(id, selectedIds);

      setSavedIds(selectedIds);
      setShowSuccessModal(true);
    } catch (err) {
      setActionError(getErrorMessage(err, "Couldn't update the keywords."));
    } finally {
      setIsSaving(false);
    }
  }

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
              label: "Keywords",
            },
          ]}
        />
      </div>

      <div className="store-keywords-page">
        <StoreHeaderCommon
          storeName={storeName}
          storeId={id}
          storeStatus={storeStatus}
        />

        <div className="store-keywords">
          <div className="store-keywords__panel">
            <div className="store-keywords__panel-header">
              <div className="store-keywords__panel-title">
                <h2>Keywords</h2>
                <span className="store-keywords__total-pill">
                  Total {allKeywords.length}
                </span>
                <span className="store-keywords__count-pill">
                  {selectedIds.length} selected
                </span>
              </div>

              <div className="store-keywords__search">
                <FaSearch className="store-keywords__search-icon" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search keywords..."
                  aria-label="Search keywords"
                />
                {searchInput && (
                  <button
                    type="button"
                    className="store-keywords__search-clear"
                    onClick={() => handleSearchChange("")}
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {actionError && (
              <div className="store-keywords__action-error">{actionError}</div>
            )}

            {/* TOOLBAR: selected only */}
            {!isLoading && !error && allKeywords.length > 0 && (
              <div className="store-keywords__toolbar">
                <label className="store-keywords__toolbar-check">
                  <input
                    type="checkbox"
                    checked={showSelectedOnly}
                    onChange={handleToggleSelectedOnly}
                  />
                  <span>Selected only</span>
                </label>
              </div>
            )}

            <div className="store-keywords__body" onScroll={handleBodyScroll}>
              {isLoading && (
                <div className="store-keywords__list" aria-hidden="true">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} className="store-keywords__skeleton" />
                  ))}
                </div>
              )}

              {!isLoading && !error && visibleKeywords.length > 0 && (
                <div className="store-keywords__list">
                  {visibleKeywords.map((item) => {
                    const isSelected = selectedSet.has(item.id);

                    return (
                      <label
                        key={item.id}
                        className={`store-keywords__row ${
                          isSelected ? "selected" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggle(item.id)}
                        />
                        <span>{item.keyword}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {!isLoading && !error && filteredKeywords.length === 0 && (
                <div className="store-keywords__empty">
                  <FaTags />
                  <p className="store-keywords__empty-title">
                    No Keywords Found
                  </p>
                  <p className="store-keywords__empty-copy">
                    {searchInput || showSelectedOnly
                      ? "Try a different search or filter."
                      : "There are no keywords available yet."}
                  </p>
                </div>
              )}

              {error && (
                <div className="store-keywords__empty">
                  <FaTags />
                  <p className="store-keywords__empty-title">
                    Couldn't load keywords
                  </p>
                  <p className="store-keywords__empty-copy">{error}</p>
                  <button
                    type="button"
                    className="store-keywords__retry"
                    onClick={loadKeywords}
                  >
                    <FaRedo />
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* BOTTOM RIGHT - UPDATE BUTTON */}
            <div className="store-keywords__footer">
              <button
                type="button"
                className="store-keywords__update-btn"
                onClick={handleUpdate}
                disabled={isSaving || isLoading || !!error || !hasChanges}
              >
                <FaSave />
                {isSaving ? "Updating…" : "Update Keyword"}
              </button>
            </div>
          </div>
        </div>
        <SuccessModal
          show={showSuccessModal}
          title="Success!"
          message="Keywords updated successfully."
          buttonText="OK"
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </>
  );
}
