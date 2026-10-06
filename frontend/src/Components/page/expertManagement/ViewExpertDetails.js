import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./viewExpertDetails.css";
import { getImage } from "../../utils/images";

/* ------------------------------------------------------------------ *
 * API layer
 * ------------------------------------------------------------------ */

const API_BASE_URL =  "http://localhost:5000/api";

function getAuthToken() {
  return typeof window !== "undefined"
    ? window.localStorage.getItem("authToken")
    : null;
}

function buildHeaders(isFormData = false) {
  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse(response) {
  let payload = null;

  try {
    payload = await response.json();
  } catch (err) {
    // no JSON body
  }

  if (!response.ok) {
    const message =
      (payload && (payload.message || payload.error)) ||
      `Request failed (${response.status})`;

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;

    throw error;
  }

  return payload;
}

/* ------------------------------------------------------------------ *
 * EXPERT GET API
 *
 * GET /api/expert/expert-details/:id
 * ------------------------------------------------------------------ */

async function fetchExpertProfile(expertId) {
  const response = await fetch(
    `${API_BASE_URL}/expert/expert-details/${expertId}`,
    {
      method: "GET",
      headers: buildHeaders(),
    },
  );

  return handleResponse(response);
}

/* ------------------------------------------------------------------ *
 * EXPERT UPDATE API
 *
 * PUT /api/expert/update-expert/:id
 *
 * This contains ONLY the fields handled by:
 * update_expert_basis_detail()
 *
 * PHP fields:
 * name
 * email
 * mobile
 * city_id
 * about
 * account_holder
 * account_number
 * branch_name
 * ifsc_code
 * ------------------------------------------------------------------ */

async function updateExpertProfile(expertId, profileData) {
  const response = await fetch(
    `${API_BASE_URL}/expert/update-expert/${expertId}`,
    {
      method: "PUT",
      headers: buildHeaders(),
      body: JSON.stringify(profileData),
    },
  );

  return handleResponse(response);
}

/* ------------------------------------------------------------------ *
 * EXISTING VENDOR API FUNCTIONS
 *
 * Kept here exactly for your existing Documents UI.
 * ------------------------------------------------------------------ */

async function updateVendorAvatar(vendorId, file) {
  const formData = new FormData();

  formData.append("avatar", file);

  const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/avatar`, {
    method: "POST",
    headers: buildHeaders(true),
    body: formData,
  });

  return handleResponse(response);
}

async function fetchVendorDocuments(vendorId) {
  const response = await fetch(
    `${API_BASE_URL}/vendors/${vendorId}/documents`,
    {
      method: "GET",
      headers: buildHeaders(),
    },
  );

  return handleResponse(response);
}

async function uploadVendorDocument(vendorId, docKey, file) {
  const formData = new FormData();

  formData.append("document", file);

  const response = await fetch(
    `${API_BASE_URL}/vendors/${vendorId}/documents/${docKey}`,
    {
      method: "POST",
      headers: buildHeaders(true),
      body: formData,
    },
  );

  return handleResponse(response);
}

/* ------------------------------------------------------------------ *
 * EXISTING CONSTANTS
 * ------------------------------------------------------------------ */

const CITY_OPTIONS = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
];

const EMPTY_PROFILE = {
  avatarUrl: "",
  vendorName: "",
  fullName: "",
  email: "",
  mobile: "",
  city: "",
  about: "",
  accountStatus: "active",

  bank: {
    accountHolderName: "",
    accountNumber: "",
    branchName: "",
    ifscCode: "",
  },
};

/* ------------------------------------------------------------------ *
 * COMPONENT
 * ------------------------------------------------------------------ */

export default function ViewExpertDetails({ vendorId }) {
  const { id } = useParams();

  const expertId = id || vendorId;

  const [activeTab, setActiveTab] = useState("vendor");

  const [profile, setProfile] = useState(EMPTY_PROFILE);

  const [profileLoading, setProfileLoading] = useState(true);

  const [profileError, setProfileError] = useState(null);

  const [saveState, setSaveState] = useState("idle");

  const [avatarUploading, setAvatarUploading] = useState(false);

  const avatarInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);

  const [documentsLoading, setDocumentsLoading] = useState(true);

  const [documentsError, setDocumentsError] = useState(null);

  const [uploadingDocKey, setUploadingDocKey] = useState(null);

  /* ---------------------------------------------------------------- *
   * LOAD EXPERT DETAILS
   * ---------------------------------------------------------------- */

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      if (!expertId) {
        throw new Error("Expert ID is missing.");
      }

      const response = await fetchExpertProfile(expertId);

    

      const data = response?.data || response;

      if (!data) {
        throw new Error("Expert data not found.");
      }

      setProfile({
        ...EMPTY_PROFILE,

        avatarUrl: getImage(data.image),

        vendorName: data.vendor_name || "",

        fullName: data.name || "",

        email: data.email || "",

        mobile: data.mobile || "",

        city: data.city_name || "",

        about: data.about || "",

        accountStatus: Number(data.status) === 1 ? "active" : "inactive",

        bank: {
          accountHolderName: data.account_holder || "",

          accountNumber: data.account_number || "",

          branchName: data.branch_name || "",

          ifscCode: data.ifsc_code || "",
        },
      });
    } catch (err) {
      console.error("Get expert details error:", err);

      setProfileError(err.message || "Could not load this expert.");
    } finally {
      setProfileLoading(false);
    }
  }, [expertId]);

  /* ---------------------------------------------------------------- *
   * LOAD DOCUMENTS
   *
   * Existing functionality preserved.
   * ---------------------------------------------------------------- */

  const loadDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    setDocumentsError(null);

    try {
      const data = await fetchVendorDocuments(vendorId);

      setDocuments(Array.isArray(data) ? data : data.documents || []);
    } catch (err) {
      setDocumentsError(err.message || "Could not load documents.");
    } finally {
      setDocumentsLoading(false);
    }
  }, [vendorId]);

  /* ---------------------------------------------------------------- *
   * INITIAL LOAD
   * ---------------------------------------------------------------- */

  useEffect(() => {
    loadProfile();
    loadDocuments();
  }, [loadProfile, loadDocuments]);

  /* ---------------------------------------------------------------- *
   * FIELD CHANGE
   * ---------------------------------------------------------------- */

  function handleFieldChange(field, value) {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /* ---------------------------------------------------------------- *
   * BANK FIELD CHANGE
   * ---------------------------------------------------------------- */

  function handleBankFieldChange(field, value) {
    setProfile((prev) => ({
      ...prev,

      bank: {
        ...prev.bank,
        [field]: value,
      },
    }));
  }

  /* ---------------------------------------------------------------- *
   * EXISTING AVATAR FUNCTION
   *
   * Kept as-is because you asked not to change other functionality.
   * ---------------------------------------------------------------- */

  async function handleAvatarSelect(event) {
    const file = event.target.files && event.target.files[0];

    if (!file) return;

    setAvatarUploading(true);

    try {
      const result = await updateVendorAvatar(vendorId, file);

      setProfile((prev) => ({
        ...prev,
        avatarUrl: (result && result.avatarUrl) || prev.avatarUrl,
      }));
    } catch (err) {
      setProfileError(err.message || "Could not update the photo.");
    } finally {
      setAvatarUploading(false);

      event.target.value = "";
    }
  }

  /* ---------------------------------------------------------------- *
   * SAVE EXPERT DETAILS
   *
   * Converted directly from PHP:
   *
   * update_expert_basis_detail()
   * ------------------------------------------------------------------ */

  async function handleSaveProfile(event) {
    event.preventDefault();

    setSaveState("saving");
    setProfileError(null);

    try {
      /*
       * EXACT PHP update fields.
       *
       * PHP:
       *
       * $post_data['name']
       * $post_data['email']
       * $post_data['mobile']
       * $post_data['city_id']
       * $post_data['about']
       * $post_data['account_holder']
       * $post_data['account_number']
       * $post_data['branch_name']
       * $post_data['ifsc_code']
       */

      const expertData = {
        name: profile.fullName,
        email: profile.email,
        mobile: profile.mobile,

        /*
         * Current UI has city name.
         *
         * Backend PHP expects city_id.
         *
         * Since your current GET returns city_name,
         * this UI field cannot send city_id correctly yet.
         *
         * We therefore send the existing value.
         */

        city_id: profile.city,

        about: profile.about,

        account_holder: profile.bank.accountHolderName,

        account_number: profile.bank.accountNumber,

        branch_name: profile.bank.branchName,

        ifsc_code: profile.bank.ifscCode,
      };

      if (!expertId) {
        setSaveState("error");
        setProfileError("Expert ID is missing.");
        return;
      }

      await updateExpertProfile(expertId, expertData);

      setSaveState("saved");

      /*
       * Reload the same expert after successful update.
       */
      await loadProfile();

      setTimeout(() => {
        setSaveState("idle");
      }, 2500);
    } catch (err) {
      console.error("Update expert details error:", err);

      setProfileError(err.message || "Could not save changes.");

      setSaveState("error");
    }
  }

  /* ---------------------------------------------------------------- *
   * EXISTING DOCUMENT UPLOAD
   * ---------------------------------------------------------------- */

  async function handleDocumentUpload(docKey, file) {
    setUploadingDocKey(docKey);

    try {
      const result = await uploadVendorDocument(vendorId, docKey, file);

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.key === docKey
            ? {
                ...doc,
                status: (result && result.status) || "submitted",
                fileName: file.name,
              }
            : doc,
        ),
      );
    } catch (err) {
      setDocumentsError(err.message || "Could not upload that document.");
    } finally {
      setUploadingDocKey(null);
    }
  }

  const submittedCount = documents.filter(
    (doc) => doc.status === "submitted",
  ).length;

  const isActive = profile.accountStatus === "active";

  /* ---------------------------------------------------------------- *
   * JSX
   * ---------------------------------------------------------------- */

  return (
    <div className="view-details">
      <header className="vd-header">
        <div className="vd-header-identity">
          <span className="vd-header-label">Expert</span>

          <h1 className="vd-header-name">{profile.fullName || "—"}</h1>
        </div>

        <div className="vd-header-actions">
          <span
            className={`vd-status-chip ${
              isActive ? "is-active" : "is-inactive"
            }`}
          >
            <span className="vd-status-dot" aria-hidden="true" />

            {isActive ? "Active" : "Inactive"}
          </span>

          <button
            type="button"
            className="vd-link-button"
            onClick={() => setActiveTab("documents")}
          >
            Upload documents
          </button>
        </div>
      </header>

      <nav className="vd-tabs" role="tablist" aria-label="Profile sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "vendor"}
          className={`vd-tab ${activeTab === "vendor" ? "is-active" : ""}`}
          onClick={() => setActiveTab("vendor")}
        >
          Vendor
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "documents"}
          className={`vd-tab ${activeTab === "documents" ? "is-active" : ""}`}
          onClick={() => setActiveTab("documents")}
        >
          Documents
          {documents.length > 0 && (
            <span className="vd-tab-count">
              {submittedCount}/{documents.length}
            </span>
          )}
        </button>
      </nav>

      <div className="vd-panel">
        {activeTab === "vendor" && (
          <form className="vd-form" onSubmit={handleSaveProfile}>
            {profileError && (
              <div className="vd-alert" role="alert">
                {profileError}
              </div>
            )}

            {profileLoading ? (
              <p className="vd-hint">Loading profile…</p>
            ) : (
              <>
                {/* ------------------------------------------------ *
                 * IMAGE
                 * ------------------------------------------------ */}

                <div className="vd-avatar-row">
                  <div className="vd-avatar">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={`${profile.fullName || "Vendor"} profile`}
                      />
                    ) : (
                      <span className="vd-avatar-fallback">
                        {(profile.fullName || "?")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}

                    <button
                      type="button"
                      className="vd-avatar-edit"
                      onClick={() =>
                        avatarInputRef.current && avatarInputRef.current.click()
                      }
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? "Uploading…" : "Change photo"}
                    </button>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="vd-visually-hidden"
                      onChange={handleAvatarSelect}
                    />
                  </div>
                </div>

                {/* ------------------------------------------------ *
                 * VENDOR DETAIL
                 * ------------------------------------------------ */}

                <section className="vd-section">
                  <h2 className="vd-section-title">Vendor detail</h2>

                  <div className="vd-field">
                    <label htmlFor="vendorName">Vendor name</label>

                    <input
                      id="vendorName"
                      type="text"
                      value={profile.vendorName}
                      onChange={(e) =>
                        handleFieldChange("vendorName", e.target.value)
                      }
                      placeholder="e.g. One More Bite"
                    />
                  </div>
                </section>

                {/* ------------------------------------------------ *
                 * PERSONAL DETAIL
                 * ------------------------------------------------ */}

                <section className="vd-section">
                  <h2 className="vd-section-title">Personal detail</h2>

                  <div className="vd-grid">
                    <div className="vd-field">
                      <label htmlFor="fullName">Full name</label>

                      <input
                        id="fullName"
                        type="text"
                        value={profile.fullName}
                        onChange={(e) =>
                          handleFieldChange("fullName", e.target.value)
                        }
                      />
                    </div>

                    <div className="vd-field">
                      <label htmlFor="email">Email</label>

                      <input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          handleFieldChange("email", e.target.value)
                        }
                        placeholder="name@example.com"
                      />
                    </div>

                    <div className="vd-field">
                      <label htmlFor="mobile">Mobile</label>

                      <input
                        id="mobile"
                        type="tel"
                        value={profile.mobile}
                        onChange={(e) =>
                          handleFieldChange("mobile", e.target.value)
                        }
                        placeholder="10-digit number"
                      />
                    </div>

                    <div className="vd-field">
                      <label htmlFor="city">City</label>

                      <select
                        id="city"
                        value={profile.city}
                        onChange={(e) =>
                          handleFieldChange("city", e.target.value)
                        }
                      >
                        <option value="">Select</option>

                        {CITY_OPTIONS.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="vd-field vd-field-wide">
                      <label htmlFor="about">About</label>

                      <textarea
                        id="about"
                        rows={3}
                        value={profile.about}
                        onChange={(e) =>
                          handleFieldChange("about", e.target.value)
                        }
                        placeholder="A short introduction shown on the vendor's public profile"
                      />
                    </div>
                  </div>
                </section>

                {/* ------------------------------------------------ *
                 * BANK DETAIL
                 * ------------------------------------------------ */}

                <section className="vd-section">
                  <h2 className="vd-section-title">Bank detail</h2>

                  <div className="vd-grid">
                    <div className="vd-field">
                      <label htmlFor="accHolderName">Account holder name</label>

                      <input
                        id="accHolderName"
                        type="text"
                        value={profile.bank.accountHolderName}
                        onChange={(e) =>
                          handleBankFieldChange(
                            "accountHolderName",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="vd-field">
                      <label htmlFor="accountNumber">Account number</label>

                      <input
                        id="accountNumber"
                        type="text"
                        inputMode="numeric"
                        value={profile.bank.accountNumber}
                        onChange={(e) =>
                          handleBankFieldChange("accountNumber", e.target.value)
                        }
                      />
                    </div>

                    <div className="vd-field">
                      <label htmlFor="branchName">Branch name</label>

                      <input
                        id="branchName"
                        type="text"
                        value={profile.bank.branchName}
                        onChange={(e) =>
                          handleBankFieldChange("branchName", e.target.value)
                        }
                      />
                    </div>

                    <div className="vd-field">
                      <label htmlFor="ifscCode">IFSC code</label>

                      <input
                        id="ifscCode"
                        type="text"
                        value={profile.bank.ifscCode}
                        onChange={(e) =>
                          handleBankFieldChange(
                            "ifscCode",
                            e.target.value.toUpperCase(),
                          )
                        }
                        placeholder="e.g. HDFC0001234"
                      />
                    </div>
                  </div>
                </section>

                {/* ------------------------------------------------ *
                 * SAVE
                 * ------------------------------------------------ */}

                <div className="vd-form-footer">
                  {saveState === "saved" && (
                    <span className="vd-save-hint is-success">Saved</span>
                  )}

                  {saveState === "error" && (
                    <span className="vd-save-hint is-error">
                      Save failed — try again
                    </span>
                  )}

                  <button
                    type="submit"
                    className="vd-primary-button"
                    disabled={saveState === "saving"}
                  >
                    {saveState === "saving" ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* ========================================================= *
         * DOCUMENTS
         * Existing code preserved
         * ========================================================= */}

        {activeTab === "documents" && (
          <div className="vd-documents">
            {documentsError && (
              <div className="vd-alert" role="alert">
                {documentsError}
              </div>
            )}

            {documentsLoading ? (
              <p className="vd-hint">Loading documents…</p>
            ) : (
              <>
                <div className="vd-documents-summary">
                  <span>
                    {submittedCount} of {documents.length} documents submitted
                  </span>

                  <div className="vd-progress-track">
                    <div
                      className="vd-progress-fill"
                      style={{
                        width: `${
                          documents.length
                            ? (submittedCount / documents.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <ul className="vd-document-list">
                  {documents.map((doc) => {
                    const isSubmitted = doc.status === "submitted";

                    const isUploading = uploadingDocKey === doc.key;

                    return (
                      <li key={doc.key} className="vd-document-row">
                        <div className="vd-document-info">
                          <span className="vd-document-label">{doc.label}</span>

                          {doc.fileName && (
                            <span className="vd-document-filename">
                              {doc.fileName}
                            </span>
                          )}
                        </div>

                        <div className="vd-document-actions">
                          <span
                            className={`vd-status-chip ${
                              isSubmitted ? "is-active" : "is-pending"
                            }`}
                          >
                            <span
                              className="vd-status-dot"
                              aria-hidden="true"
                            />

                            {isSubmitted ? "Submitted" : "Not submitted"}
                          </span>

                          <label className="vd-upload-button">
                            {isUploading
                              ? "Uploading…"
                              : isSubmitted
                                ? "Replace"
                                : "Upload"}

                            <input
                              type="file"
                              className="vd-visually-hidden"
                              disabled={isUploading}
                              onChange={(e) => {
                                const file =
                                  e.target.files && e.target.files[0];

                                if (file) {
                                  handleDocumentUpload(doc.key, file);
                                }

                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
