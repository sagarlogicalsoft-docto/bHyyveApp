import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  FaSearch,
  FaPlus,
  FaFileCsv,
  FaTrashAlt,
  FaTimes,
  FaTags,
  FaInbox,
  FaCloudUploadAlt,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationCircle,
} from "react-icons/fa";

import ServiceBreadcrumbs from "../../../Components/common/ServiceBreadcrumbs";
import ServiceConfirmModal from "../../../Components/common/modal/serviceModal/ServiceConfirmModal";
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";

import api from "../../../config/api";

import "./categoryKeywords.css";

const IMAGE_BASE_URL = "http://localhost:6010/assets/images/"; 

const getCategoryImageUrl = (image) =>
  image ? `${IMAGE_BASE_URL}${image}` : "";

// Mapped from the PHP controller methods
const ENDPOINTS = {
  list: "/admin/category-keywords", //                      page load (grouped keywords)
  categories: "/admin/categories", //                       "Add keyword" dropdown
  add: "/admin/category-keywords", //                       Admin/add_category_keyword (POST)
  import: "/admin/category-keywords/import", //             Admin/import_category_keywords (POST, multipart)
  remove: (id) => `/admin/category-keywords/${id}`, //      Admin/delete_category_keyword/:id (DELETE)
  removeByCategory: (categoryId) =>
    `/admin/category-keywords/category/${categoryId}`, //   Admin/delete_category_keywords_by_category/:id (DELETE)
};

// PHP responses look like { status: "success" | "error", message, ... }
const ensureSuccess = (data) => {
  if (!data || data.status !== "success") {
    throw new Error((data && data.message) || "Something went wrong.");
  }
  return data;
};

const toError = (err, fallback) => {
  const message =
    err?.response?.data?.message || err?.message || fallback || "Request failed.";
  return new Error(message);
};

// -----------------------------------------------------------------------------
// API IMPLEMENTATION
// -----------------------------------------------------------------------------
const real = {
  async fetchCategoryKeywords() {
    const { data } = await api.get(ENDPOINTS.list);

    if (data?.success !== true) {
      throw new Error(data?.message || "Could not load category keywords.");
    }

    const grouped = data.data?.grouped_keywords;

    if (Array.isArray(grouped)) {
      return grouped;
    }

    if (grouped && typeof grouped === "object") {
      return Object.values(grouped);
    }

    return [];
  },

  async fetchCategories() {
    const { data } = await api.get(ENDPOINTS.categories);

    if (data?.success !== true) {
      throw new Error(data?.message || "Could not load categories.");
    }

    // Your existing getCategories controller returns data: categories.
    const categories = data.data;

    return Array.isArray(categories) ? categories : [];
  },

  async addCategoryKeywords({ categoryId, keywords }) {
    const { data } = await api.post(ENDPOINTS.add, {
      category_id: categoryId,
      keywords: keywords.join(", "),
    });

    return ensureSuccess(data);
  },

  // Backend should return { status, inserted, skipped }
  async importCategoryKeywords(file) {
    const body = new FormData();
    body.append("csv_file", file);
    const { data } = await api.post(ENDPOINTS.import, body);
    return ensureSuccess(data);
  },

  async deleteCategoryKeyword(id) {
    const { data } = await api.delete(ENDPOINTS.remove(id));
    return ensureSuccess(data);
  },

  // Backend should return { status, deleted }
  async deleteCategoryKeywordsByCategory(categoryId) {
    const { data } = await api.delete(ENDPOINTS.removeByCategory(categoryId));
    return ensureSuccess(data);
  },
};

// -----------------------------------------------------------------------------
// PUBLIC API (wraps errors so the page always gets a readable message)
// -----------------------------------------------------------------------------
const wrap = (fn, fallback) => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    throw toError(err, fallback);
  }
};

const fetchCategoryKeywords = wrap(real.fetchCategoryKeywords, "Could not load keywords.");
const fetchCategories = wrap(real.fetchCategories, "Could not load categories.");
const addCategoryKeywords = wrap(real.addCategoryKeywords, "Could not add keywords.");
const importCategoryKeywords = wrap(real.importCategoryKeywords, "Could not import the file.");
const deleteCategoryKeyword = wrap(real.deleteCategoryKeyword, "Could not delete the keyword.");
const deleteCategoryKeywordsByCategory = wrap(
  real.deleteCategoryKeywordsByCategory,
  "Could not delete the keywords.",
);

// -----------------------------------------------------------------------------
// CONSTANTS + HELPERS
// -----------------------------------------------------------------------------
const PAGE_SIZE = 6; // categories per page
const COLLAPSED_COUNT = 14; // chips shown before "Show all"

const AVATAR_TONES = [
  ["#eef1ff", "#5e72e4"],
  ["#e6f7f0", "#14915a"],
  ["#fff4e5", "#c26a00"],
  ["#fdebf1", "#c4285d"],
  ["#e8f6fb", "#117a9a"],
  ["#f3ecff", "#7a4bd6"],
];

const toneFor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
};

// "pizza, burger\npasta" -> ["pizza", "burger", "pasta"] (case-insensitive de-dupe)
const parseKeywords = (raw) => {
  const seen = new Set();
  return raw
    .split(/[,\n]/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => {
      const key = word.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Page numbers with gaps, e.g.  1 2 3 … 11 12   |   1 2 … 5 6 7 … 11 12   |   1 2 … 10 11 12
const range = (from, to) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

const getPageItems = (current, total) => {
  if (total <= 9) return range(1, total);

  const lead = current <= 3 ? 3 : 2; // show 3 leading pages near the start
  const tail = current >= total - 2 ? 3 : 2; // and 3 trailing pages near the end

  const pages = new Set([
    ...range(1, lead),
    ...range(total - tail + 1, total),
    current - 1,
    current,
    current + 1,
  ]);

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const items = [];
  sorted.forEach((p, i) => {
    if (i > 0) {
      const gap = p - sorted[i - 1];
      if (gap === 2) items.push(p - 1); // a single missing page: show it instead of "…"
      else if (gap > 2) items.push(`gap-${p}`);
    }
    items.push(p);
  });
  return items;
};

// Merge the keywords returned by "add" into the existing groups
const mergeAdded = (groups, added) => {
  const exists = groups.some((g) => g.category_id === added.category_id);
  if (exists) {
    return groups.map((g) =>
      g.category_id === added.category_id
        ? { ...g, keywords: [...g.keywords, ...added.keywords] }
        : g,
    );
  }
  return [
    {
      category_id: added.category_id,
      category_name: added.category_name,
      category_image: added.category_image,
      keywords: added.keywords,
    },
    ...groups,
  ];
};


// Remove one keyword; drop the category card when it becomes empty
const removeKeyword = (groups, categoryId, keywordId) =>
  groups
    .map((g) =>
      g.category_id === categoryId
        ? { ...g, keywords: g.keywords.filter((k) => k.id !== keywordId) }
        : g,
    )
    .filter((g) => g.keywords.length > 0);

const Highlight = ({ text, term }) => {
  if (!term) return text;
  const index = text.toLowerCase().indexOf(term);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="catkw-mark">{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  );
};

// -----------------------------------------------------------------------------
// SMALL PRESENTATIONAL PIECES
// -----------------------------------------------------------------------------
function CategoryAvatar({ name, image }) {
  const [failed, setFailed] = useState(false);
  const src = getCategoryImageUrl(image);

  if (!src || failed) {
    const [bg, fg] = toneFor(name);
    return (
      <span
        className="catkw-avatar catkw-avatar--fallback"
        style={{ background: bg, color: fg }}
        aria-hidden="true"
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      className="catkw-avatar"
      src={src}
      alt=""
      onError={() => setFailed(true)}
    />
  );
}

const CategoryCard = React.memo(function CategoryCard({
  group,
  term,
  expanded,
  onToggle,
  onDeleteKeyword,
  onDeleteAll,
}) {
  const searching = Boolean(term);
  const list = group.shown;
  const collapsible = !searching && list.length > COLLAPSED_COUNT;
  const items = collapsible && !expanded ? list.slice(0, COLLAPSED_COUNT) : list;
  const total = group.keywords.length;

  
  return (
    <article className="catkw-card">
      <header className="catkw-card-head">
        <div className="catkw-card-title">
          <CategoryAvatar name={group.category_name} image={group.category_image} />
          <div className="catkw-card-text">
            <h3 className="catkw-card-name" title={group.category_name}>
              <Highlight text={group.category_name} term={term} />
            </h3>
            <span className="catkw-card-sub">
              {searching && list.length !== total
                ? `${list.length} of ${total} keywords`
                : `${total} ${total === 1 ? "keyword" : "keywords"}`}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="catkw-btn catkw-btn--danger-ghost catkw-btn--sm"
          onClick={() => onDeleteAll(group)}
        >
          <FaTrashAlt aria-hidden="true" />
          <span>Delete all</span>
        </button>
      </header>

      <ul className="catkw-chips">
        {items.map((kw) => (
          <li key={kw.id} className="catkw-chip">
            <span>
              <Highlight text={kw.keyword} term={term} />
            </span>
            <button
              type="button"
              className="catkw-chip-x"
              aria-label={`Delete keyword ${kw.keyword}`}
              onClick={() => onDeleteKeyword(group, kw)}
            >
              <FaTimes aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {collapsible && (
        <button type="button" className="catkw-toggle" onClick={() => onToggle(group.category_id)}>
          {expanded ? (
            <>
              Show fewer <FaChevronUp aria-hidden="true" />
            </>
          ) : (
            <>
              Show all {list.length} keywords <FaChevronDown aria-hidden="true" />
            </>
          )}
        </button>
      )}
    </article>
  );
});

function SkeletonGrid() {
  return (
    <div className="catkw-grid" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="catkw-card">
          <div className="catkw-sk-head">
            <span className="catkw-sk catkw-sk--avatar" />
            <span className="catkw-sk catkw-sk--title" />
          </div>
          <div className="catkw-sk-row">
            {Array.from({ length: 8 }, (_, j) => (
              <span
                key={j}
                className="catkw-sk catkw-sk--chip"
                style={{ width: `${70 + ((i + j) % 4) * 28}px` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, text, action }) {
  return (
    <div className="catkw-empty">
      <span className="catkw-empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

function Pagination({ current, total, onChange }) {
  return (
    <nav className="catkw-pagination" aria-label="Pagination">
      <button
        type="button"
        className="catkw-pg catkw-pg--nav"
        aria-label="Previous page"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        <FaChevronLeft aria-hidden="true" />
      </button>

      <ul className="catkw-pg-list">
        {getPageItems(current, total).map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                className={`catkw-pg${item === current ? " is-active" : ""}`}
                aria-label={`Page ${item}`}
                aria-current={item === current ? "page" : undefined}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className="catkw-pg-gap" aria-hidden="true">
              …
            </li>
          ),
        )}
      </ul>

      <span className="catkw-pg-compact">
        Page {current} of {total}
      </span>

      <button
        type="button"
        className="catkw-pg catkw-pg--nav"
        aria-label="Next page"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
      >
        <FaChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}

// -----------------------------------------------------------------------------
// MODAL SHELL (used by the Add and Import dialogs)
// -----------------------------------------------------------------------------
function CatkwModal({ icon, title, subtitle, onClose, children, busy = false }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [busy, onClose]);

  return createPortal(
    <div
      className="catkw-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="catkw-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catkw-dialog-title"
      >
        <div className="catkw-dialog-head">
          <span className="catkw-dialog-badge" aria-hidden="true">
            {icon}
          </span>
          <div className="catkw-dialog-titles">
            <h2 id="catkw-dialog-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="catkw-icon-btn"
            aria-label="Close"
            onClick={onClose}
            disabled={busy}
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

// -----------------------------------------------------------------------------
// ADD KEYWORD DIALOG
// -----------------------------------------------------------------------------
function AddKeywordModal({ categories, onClose, onSubmit }) {
  const [categoryId, setCategoryId] = useState("");
  const [raw, setRaw] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const parsed = useMemo(() => parseKeywords(raw), [raw]);
  const categoryError = !categoryId ? "Select a category." : "";
  const keywordError = parsed.length === 0 ? "Enter at least one keyword." : "";

  const dropChip = (word) => setRaw(parsed.filter((k) => k !== word).join(", "));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (categoryError || keywordError) return;

    setSubmitting(true);
    setError("");
    try {
      await onSubmit({ categoryId, keywords: parsed }); // parent closes this dialog on success
    } catch (err) {
      setError(err.message || "Could not add keywords.");
      setSubmitting(false);
    }
  };

  return (
    <CatkwModal
      icon={<FaTags />}
      title="Add keywords"
      subtitle="Add one keyword, or paste a list separated by commas or new lines."
      onClose={onClose}
      busy={submitting}
    >
      <form className="catkw-form" onSubmit={handleSubmit} noValidate>
        <div className="catkw-dialog-body">
          <div className="catkw-field">
            <label htmlFor="catkw-category">Category</label>
            <select
              id="catkw-category"
              className="catkw-select"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              aria-invalid={touched && Boolean(categoryError)}
              disabled={submitting}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            {touched && categoryError && <p className="catkw-field-error">{categoryError}</p>}
          </div>

          <div className="catkw-field">
            <label htmlFor="catkw-keywords">Keywords</label>
            <textarea
              id="catkw-keywords"
              className="catkw-textarea"
              rows={3}
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              placeholder={"pizza\nburger, pasta, garlic bread"}
              aria-invalid={touched && Boolean(keywordError)}
              disabled={submitting}
            />
            {touched && keywordError && <p className="catkw-field-error">{keywordError}</p>}
          </div>

          {parsed.length > 0 && (
            <div className="catkw-preview">
              <p className="catkw-preview-label">
                {parsed.length} {parsed.length === 1 ? "keyword" : "keywords"} ready to add
              </p>
              <ul className="catkw-chips" aria-label="Keywords to add">
                {parsed.map((word) => (
                  <li key={word} className="catkw-chip">
                    <span>{word}</span>
                    <button
                      type="button"
                      className="catkw-chip-x"
                      aria-label={`Remove ${word} from the list`}
                      onClick={() => dropChip(word)}
                      disabled={submitting}
                    >
                      <FaTimes aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <p className="catkw-form-error" role="alert">
              <FaExclamationCircle aria-hidden="true" /> {error}
            </p>
          )}
        </div>

        <div className="catkw-dialog-foot">
          <button
            type="button"
            className="catkw-btn catkw-btn--secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="catkw-btn catkw-btn--primary modal-add" disabled={submitting}>
            {submitting ? (
              <>
                <span className="catkw-spinner" aria-hidden="true" /> Adding...
              </>
            ) : (
              <>
                <FaPlus aria-hidden="true" />
                {parsed.length > 1 ? `Add ${parsed.length} keywords` : "Add keyword"}
              </>
            )}
          </button>
        </div>
      </form>
    </CatkwModal>
  );
}

// -----------------------------------------------------------------------------
// IMPORT CSV DIALOG
// -----------------------------------------------------------------------------
function ImportModal({ file, error, busy, onFile, onClose, onImport }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  const accept = (picked) => {
    if (!picked) return;
    if (!/\.csv$/i.test(picked.name)) {
      setFileError("Only .csv files are supported.");
      return;
    }
    setFileError("");
    onFile(picked);
  };

  const shownError = fileError || error;

  return (
    <CatkwModal
      icon={<FaFileCsv />}
      title="Import keywords"
      subtitle="Upload a CSV file to add keywords in bulk."
      onClose={onClose}
      busy={busy}
    >
      <div className="catkw-form">
        <div className="catkw-dialog-body">
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            hidden
            onChange={(event) => {
              accept(event.target.files[0]);
              event.target.value = "";
            }}
          />

          {!file ? (
            <div
              className={`catkw-drop${dragging ? " is-dragging" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                accept(event.dataTransfer.files[0]);
              }}
            >
              <span className="catkw-drop-icon" aria-hidden="true">
                <FaCloudUploadAlt />
              </span>
              <p className="catkw-drop-title">Drag and drop your CSV file here</p>
              <p className="catkw-drop-sub">or</p>
              <button
                type="button"
                className="catkw-btn catkw-btn--secondary"
                onClick={() => inputRef.current?.click()}
              >
                Browse files
              </button>
            </div>
          ) : (
            <div className={`catkw-file${busy ? " is-busy" : ""}`}>
              <span className="catkw-file-badge" aria-hidden="true">
                <FaFileCsv />
              </span>
              <div className="catkw-file-meta">
                <p className="catkw-file-name" title={file.name}>
                  {file.name}
                </p>
                <p className="catkw-file-sub">
                  {formatFileSize(file.size)} · {busy ? "Importing..." : "Ready to import"}
                </p>
              </div>
              {!busy && (
                <div className="catkw-file-actions">
                  <button
                    type="button"
                    className="catkw-btn catkw-btn--secondary catkw-btn--sm"
                    onClick={() => inputRef.current?.click()}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    className="catkw-icon-btn catkw-icon-btn--danger"
                    aria-label="Remove file"
                    onClick={() => onFile(null)}
                  >
                    <FaTrashAlt aria-hidden="true" />
                  </button>
                </div>
              )}
              {busy && <span className="catkw-file-bar" aria-hidden="true" />}
            </div>
          )}

          <p className="catkw-note">Duplicate and invalid rows are skipped during import.</p>

          {shownError && (
            <p className="catkw-form-error" role="alert">
              <FaExclamationCircle aria-hidden="true" /> {shownError}
            </p>
          )}
        </div>

        <div className="catkw-dialog-foot">
          <button
            type="button"
            className="catkw-btn catkw-btn--secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="catkw-btn catkw-btn--primary"
            disabled={!file || busy}
            onClick={onImport}
          >
            {busy ? (
              <>
                <span className="catkw-spinner" aria-hidden="true" /> Importing...
              </>
            ) : (
              <>
                <FaCloudUploadAlt aria-hidden="true" /> Import keywords
              </>
            )}
          </button>
        </div>
      </div>
    </CatkwModal>
  );
}

// -----------------------------------------------------------------------------
// PAGE
// -----------------------------------------------------------------------------
export default function CategoryKeywords() {
  const panelRef = useRef(null);

  // data
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // view state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(() => new Set());

  // dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [confirm, setConfirm] = useState(null); // { title, message, confirmText, variant, run }
  const [success, setSuccess] = useState(null); // { title, message }
  const [notice, setNotice] = useState("");

  // ---- load ----
  const loadData = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setLoadError("");
    try {
      const [grouped, cats] = await Promise.all([fetchCategoryKeywords(), fetchCategories()]);
      setGroups(grouped);
      setCategories(cats);
      console.log("Grouped keywords:", grouped);
    } catch (err) {
      setLoadError(err.message || "Could not load keywords.");
    } finally {
      setLoading(false);
    }
  }, []);
  

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---- derived ----
  const term = search.trim().toLowerCase();

  const totalKeywords = useMemo(
    () => groups.reduce((sum, g) => sum + g.keywords.length, 0),
    [groups],
  );

  // Same rules as the PHP page: a category-name match shows all its keywords,
  // otherwise only the matching keywords are shown.
  const visibleGroups = useMemo(() => {
    if (!term) return groups.map((g) => ({ ...g, shown: g.keywords }));
    return groups.reduce((acc, g) => {
      const nameMatch = g.category_name.toLowerCase().includes(term);
      const shown = nameMatch
        ? g.keywords
        : g.keywords.filter((k) => k.keyword.toLowerCase().includes(term));
      if (nameMatch || shown.length > 0) acc.push({ ...g, shown });
      return acc;
    }, []);
  }, [groups, term]);

  const totalPages = Math.max(1, Math.ceil(visibleGroups.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageGroups = visibleGroups.slice(startIndex, startIndex + PAGE_SIZE);

  // ---- stable callbacks (the success modal's auto-close depends on onClose) ----
  const closeSuccess = useCallback(() => setSuccess(null), []);
  const closeConfirm = useCallback(() => setConfirm(null), []);
  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeImport = useCallback(() => {
    setImportOpen(false);
    setImportFile(null);
    setImportError("");
  }, []);

  const goToPage = (next) => {
    setPage(next);
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleExpanded = useCallback((categoryId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }, []);

  // ---- add ----
  const handleAdd = async ({ categoryId, keywords }) => {
    const result = await addCategoryKeywords({ categoryId, keywords });
    setGroups((prev) => mergeAdded(prev, result));
    setAddOpen(false);
    setSuccess({
      title: "Keywords added",
      message: result.message || `${result.keywords.length} keyword(s) added.`,
    });
  };

  // ---- delete one keyword ----
  const requestDeleteKeyword = useCallback((group, kw) => {
    setConfirm({
      title: "Delete keyword?",
      message: `“${kw.keyword}” will be permanently removed from ${group.category_name}.`,
      confirmText: "Delete",
      variant: "danger",
      run: async () => {
        try {
          await deleteCategoryKeyword(kw.id);
          setGroups((prev) => removeKeyword(prev, group.category_id, kw.id));
          setConfirm(null);
          setSuccess({ title: "Keyword deleted", message: `“${kw.keyword}” was removed.` });
        } catch (err) {
          setConfirm(null);
          setNotice(err.message);
        }
      },
    });
  }, []);

  // ---- delete all keywords in a category ----
  const requestDeleteAll = useCallback((group) => {
    setConfirm({
      title: "Delete all keywords?",
      message: `All ${group.keywords.length} keywords in ${group.category_name} will be permanently removed.`,
      confirmText: "Delete all",
      variant: "danger",
      run: async () => {
        try {
          const result = await deleteCategoryKeywordsByCategory(group.category_id);
          setGroups((prev) => prev.filter((g) => g.category_id !== group.category_id));
          setConfirm(null);
          setSuccess({
            title: "Keywords deleted",
            message: `${result.deleted ?? group.keywords.length} keyword(s) removed from ${group.category_name}.`,
          });
        } catch (err) {
          setConfirm(null);
          setNotice(err.message);
        }
      },
    });
  }, []);

  // ---- import (no confirm step: import straight away, then show the success modal) ----
  const handleImportFile = useCallback((file) => {
    setImportFile(file);
    setImportError("");
  }, []);

  const handleImport = async () => {
    if (!importFile || importing) return;

    setImporting(true);
    setImportError("");
    try {
      const result = await importCategoryKeywords(importFile);
      setImportOpen(false);
      setImportFile(null);
      setSuccess({
        title: "Import complete",
        message: `${result.inserted} keyword(s) imported, ${result.skipped} skipped (duplicate or invalid).`,
      });
      loadData({ silent: true });
    } catch (err) {
      setImportError(err.message || "Could not import the file.");
    } finally {
      setImporting(false);
    }
  };

  // ---- render ----
  const hasData = groups.length > 0;
  const retry = () => loadData();

  let body;
  if (loading) {
    body = <SkeletonGrid />;
  } else if (loadError) {
    body = (
      <EmptyState
        icon={<FaExclamationCircle />}
        title="Could not load keywords"
        text={loadError}
        action={
          <button type="button" className="catkw-btn catkw-btn--primary" onClick={retry}>
            Try again
          </button>
        }
      />
    );
  } else if (!hasData) {
    body = (
      <EmptyState
        icon={<FaInbox />}
        title="No keywords yet"
        text="Import a CSV file or add your first keyword to get started."
        action={
          <button type="button" className="catkw-btn catkw-btn--primary" onClick={() => setAddOpen(true)}>
            <FaPlus aria-hidden="true" /> Add keyword
          </button>
        }
      />
    );
  } else if (visibleGroups.length === 0) {
    body = (
      <EmptyState
        icon={<FaSearch />}
        title="No matches"
        text={`Nothing matches “${search.trim()}”. Check the spelling or try a shorter word.`}
        action={
          <button type="button" className="catkw-btn catkw-btn--secondary" onClick={() => setSearch("")}>
            Clear search
          </button>
        }
      />
    );
  } else {
    body = (
      <>
        <div className="catkw-grid">
          {pageGroups.map((group) => (
            <CategoryCard
              key={group.category_id}
              group={group}
              term={term}
              expanded={expanded.has(group.category_id)}
              onToggle={toggleExpanded}
              onDeleteKeyword={requestDeleteKeyword}
              onDeleteAll={requestDeleteAll}
            />
          ))}
        </div>

        <footer className="catkw-pager">
          <p className="catkw-pager-info">
            Showing <strong>{startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, visibleGroups.length)}</strong> of{" "}
            <strong>{visibleGroups.length}</strong> categories
          </p>

          {totalPages > 1 && (
            <Pagination current={currentPage} total={totalPages} onChange={goToPage} />
          )}
        </footer>
      </>
    );
  }

  return (
    <div className="catkw-page-wrap">
      <ServiceBreadcrumbs items={[{ label: "Category Keywords" }]} />

      <section className="catkw-panel" ref={panelRef}>
        <header className="catkw-toolbar">
          <div className="catkw-heading">
            <h1>Category keywords</h1>
            <p className="catkw-stats">
              <span>
                <strong>{groups.length.toLocaleString()}</strong> categories
              </span>
              <span>
                <strong>{totalKeywords.toLocaleString()}</strong> keywords
              </span>
            </p>
          </div>

          <div className="catkw-actions">
            <div className="catkw-search">
              <FaSearch aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search category or keyword"
                aria-label="Search category or keyword"
              />
              {search && (
                <button
                  type="button"
                  className="catkw-search-clear"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <FaTimes aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="button"
              className="catkw-btn catkw-btn--secondary"
              onClick={() => setImportOpen(true)}
            >
              <FaFileCsv aria-hidden="true" /> Import CSV
            </button>

            <button
              type="button"
              className="catkw-btn catkw-btn--primary"
              onClick={() => setAddOpen(true)}
              disabled={loading}
            >
              <FaPlus aria-hidden="true" /> Add keyword
            </button>
          </div>
        </header>

        {notice && (
          <div className="catkw-notice" role="alert">
            <FaExclamationCircle aria-hidden="true" />
            <span>{notice}</span>
            <button type="button" className="catkw-icon-btn" aria-label="Dismiss" onClick={() => setNotice("")}>
              <FaTimes aria-hidden="true" />
            </button>
          </div>
        )}

        {body}
      </section>

      {addOpen && (
        <AddKeywordModal categories={categories} onClose={closeAdd} onSubmit={handleAdd} />
      )}

      {importOpen && (
        <ImportModal
          file={importFile}
          error={importError}
          busy={importing}
          onFile={handleImportFile}
          onClose={closeImport}
          onImport={handleImport}
        />
      )}

      <ServiceConfirmModal
        isOpen={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmText={confirm?.confirmText}
        variant={confirm?.variant}
        onConfirm={() => confirm?.run()}
        onCancel={closeConfirm}
      />

      <ServiceSuccessModal
        isOpen={Boolean(success)}
        title={success?.title}
        message={success?.message}
        autoCloseMs={2200}
        onClose={closeSuccess}
      />
    </div>
  );
}