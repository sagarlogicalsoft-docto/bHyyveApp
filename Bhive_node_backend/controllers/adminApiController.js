const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");
const csv = require("csv-parser");
const { Readable } = require("stream");
const adminService = require("../services/adminService");
const {
  drawRestaurantInvoice,
  addInvoicePageNumbers,
} = require("../services/invoiceService");

//LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await adminService.login(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      ...data,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
// =====================================================
// SERVICE SIDE
// =====================================================

// Sub Admin Management
const getSubAdmins = async (req, res) => {
  try {
    const subAdmins = await adminService.getSubAdmins();

    return res.status(200).json({
      success: true,
      message: "Sub admins fetched successfully.",
      data: subAdmins,
    });
  } catch (error) {
    console.error("Get sub admins error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sub admins.",
    });
  }
};

const changeSubAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.changeSubAdminStatus(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Change sub admin status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update admin status.",
    });
  }
};

const saveSubAdmin = async (req, res) => {
  try {
    const {
      admin_name,
      admin_email,
      admin_password,
      permission,
      role_id,
      employee_since,
    } = req.body;

    if (!admin_name || !admin_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Admin name is required",
      });
    }

    if (!admin_email || !admin_email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!admin_password || !admin_password.trim()) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (!role_id) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    if (!Array.isArray(permission) || permission.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one permission",
      });
    }

    const result = await adminService.saveSubAdmin({
      admin_name: admin_name.trim(),
      admin_email: admin_email.trim(),
      admin_password,
      permission,
      role_id,
      employee_since,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Save sub admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add Sub Admin.",
    });
  }
};

const getSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const subAdmin = await adminService.getSubAdminById(id);

    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: "Sub Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub Admin fetched successfully.",
      data: subAdmin,
    });
  } catch (error) {
    console.error("Get sub admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Sub Admin.",
    });
  }
};

const updateSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      admin_name,
      admin_email,
      admin_password,
      permission,
      role_id,
      employee_since,
    } = req.body;

    // Basic validation
    if (!admin_name) {
      return res.status(400).json({
        success: false,
        message: "Admin name is required",
      });
    }

    if (!admin_email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // if (!role_id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Role is required",
    //   });
    // }

    if (!Array.isArray(permission) || permission.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one permission",
      });
    }

    const result = await adminService.updateSubAdmin(id, {
      admin_name,
      admin_email,
      admin_password,
      permission,
      role_id,
      employee_since,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update sub admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Sub Admin.",
    });
  }
};

const deleteSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Sub Admin ID",
      });
    }

    const result = await adminService.deleteSubAdmin(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete Sub Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete Sub Admin",
    });
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await adminService.getRoles();

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully.",
      data: roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles.",
    });
  }
};

const addRole = async (req, res) => {
  try {
    const { role_name, responsibilities, status } = req.body;

    // Validate role name
    if (!role_name || !role_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const result = await adminService.addRole({
      role_name: role_name.trim(),
      responsibilities: responsibilities || "",
      status: status ?? 1,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Add role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add role",
    });
  }
};

const updateRoleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const result = await adminService.updateRoleStatus(id, status);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update role status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, responsibilities } = req.body;

    if (!id || !role_name || !role_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const result = await adminService.updateRole(id, {
      role_name: role_name.trim(),
      responsibilities: responsibilities || "",
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update role",
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteRole(id);

    return res.json(result);
  } catch (error) {
    console.error("Delete Role Error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete role",
    });
  }
};

// VENDOR MANAGEMENT
const getVendors = async (req, res) => {
  try {
    const vendors = await adminService.getVendorList();

    res.status(200).json({
      success: true,
      message: "Vendor list fetched successfully",
      data: vendors,
    });
  } catch (error) {
    console.error("Get vendors error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor list",
      error: error.message,
    });
  }
};

const getVendorCategories = async (req, res) => {
  try {
    const categories = await adminService.getVendorCategories();

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Get vendor categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

const getVendorCities = async (req, res) => {
  try {
    const cities = await adminService.getVendorCities();

    res.status(200).json({
      success: true,
      message: "Cities fetched successfully",
      data: cities,
    });
  } catch (error) {
    console.error("Get vendor cities error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
      error: error.message,
    });
  }
};

const createVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      business_name,
      hst_number,
      city_id,
      cat_id,
      lat,
      long,
      address,
      facebook_ink,
    } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, mobile and password are required.",
      });
    }

    const cityIds = Array.isArray(city_id) ? city_id.join(",") : city_id || "";

    const categoryIds = Array.isArray(cat_id) ? cat_id.join(",") : cat_id || "";

    const image = req.files?.image?.[0]?.filename || null;
    const idProof = req.files?.id_proof?.[0]?.filename || null;
    const idProofTwo = req.files?.id_proof_two?.[0]?.filename || null;

    const vendorData = {
      name,
      email_id: email,
      mobile,
      password,
      business_name: business_name || null,
      hst_number: hst_number || null,
      cat_id: categoryIds,
      image,
      id_proof: idProof,
      id_proof_two: idProofTwo,
      city_id: cityIds,
      lat: lat || null,
      long: long || null,
      facebook_ink: facebook_ink || null,
    };

    const addressData = {
      address: address || null,
      lat: lat || null,
      long: long || null,
    };

    const vendorId = await adminService.addVendor(vendorData, addressData);

    res.status(201).json({
      success: true,
      message: "Vendor added successfully.",
      data: {
        id: vendorId,
      },
    });
  } catch (error) {
    console.error("Create vendor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add vendor.",
      error: error.message,
    });
  }
};

const uploadVendorDocuments = async (req, res) => {
  try {
    const vendorId = Number(req.params.id);

    if (!Number.isInteger(vendorId) || vendorId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid vendor id is required.",
      });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one document is required.",
      });
    }

    const result = await adminService.uploadVendorDocuments(
      vendorId,
      req.files,
    );

    res.status(200).json({
      success: true,
      message: "Vendor documents uploaded successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Upload vendor documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload vendor documents.",
      error: error.message,
    });
  }
};

const changeKycStatus = async (req, res) => {
  try {
    const vendorId = Number(req.params.id);

    if (!Number.isInteger(vendorId) || vendorId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid vendor id is required.",
      });
    }

    const result = await adminService.changeKycStatus(vendorId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Change KYC status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change KYC status.",
      error: error.message,
    });
  }
};

const deleteSelectedVendors = async (req, res) => {
  try {
    const { vendor_ids } = req.body;

    if (!Array.isArray(vendor_ids) || vendor_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No Vendor selected for deletion",
      });
    }

    const vendorIds = vendor_ids
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);

    if (vendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid Vendor IDs provided",
      });
    }

    const result = await adminService.deleteSelectedVendors(vendorIds);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete selected vendors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete selected vendors.",
      error: error.message,
    });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const vendorId = Number(req.params.id);

    if (!Number.isInteger(vendorId) || vendorId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid vendor id is required.",
      });
    }

    const result = await adminService.deleteVendor(vendorId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete vendor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete vendor.",
      error: error.message,
    });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendorId = req.params.id;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Valid vendor id is required.",
      });
    }

    const result = await adminService.getVendorById(vendorId);

    if (result?.success === false) {
      return res.status(404).json(result);
    }

    const vendor =
      result?.success === true && result.data !== undefined
        ? result.data
        : result;

    return res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Get vendor detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor detail.",
      error: error.message,
    });
  }
};

const getAllCities = async (req, res) => {
  try {
    const cities = await adminService.getAllCities();

    return res.status(200).json({
      success: true,
      message: "Cities fetched successfully.",
      data: cities,
    });
  } catch (error) {
    console.error("Get cities error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities.",
      error: error.message,
    });
  }
};

// GET VENDOR DETAILS PAGE DATA
const getServiceVendorShopDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await adminService.getServiceVendorShopDetails(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor details fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Get service vendor details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor details.",
    });
  }
};

const getServiceVendorAddresses = async (req, res) => {
    try {
      const vendorId = Number.parseInt(req.params.id, 10) || 0;

const rows =
        await adminService.getServiceVendorAddresses(vendorId);

return res.status(200).json({
        status: 1,
        data: rows,
      });
    } catch (error) {
      console.error("Get vendor addresses error:", error);

return res.status(500).json({
        status: 0,
        message: "Failed to fetch vendor addresses.",
      });
    }
  };


const saveServiceVendorAddress = async (req, res) => {
  try {
    const vendorId = Number.parseInt(req.body?.vendor_id, 10) || 0;
    const addressId = Number.parseInt(req.body?.address_id, 10) || 0;

    const address = String(req.body?.address ?? "").trim();
    const lat = String(req.body?.lat ?? "").trim();
    const lng = String(req.body?.long ?? "").trim();

    // Validate required fields individually
    if (vendorId <= 0) {
      return res.status(400).json({
        status: 0,
        message: "The vendor_id field is required and must be valid.",
      });
    }

    if (address === "") {
      return res.status(400).json({
        status: 0,
        message: "The address field is required.",
      });
    }

    if (lat === "") {
      return res.status(400).json({
        status: 0,
        message: "The lat field is required.",
      });
    }

    if (!Number.isFinite(Number(lat))) {
      return res.status(400).json({
        status: 0,
        message: "The lat field must be a valid number.",
      });
    }

    if (lng === "") {
      return res.status(400).json({
        status: 0,
        message: "The long field is required.",
      });
    }

    if (!Number.isFinite(Number(lng))) {
      return res.status(400).json({
        status: 0,
        message: "The long field must be a valid number.",
      });
    }

    await adminService.saveServiceVendorAddress({
      vendorId,
      addressId,
      address,
      lat,
      lng,
    });

    return res.status(200).json({
      status: 1,
      message:
        addressId > 0
          ? "Address updated successfully."
          : "Address added successfully.",
    });
  } catch (error) {
    console.error("Save vendor address error:", error);

    return res.status(500).json({
      status: 0,
      message: "Failed to save vendor address.",
    });
  }
};


const deleteServiceVendorAddress = async (req, res) => {
    try {
      const addressId =
        Number.parseInt(req.params.addressId, 10) || 0;

// Accept vendor_id from the DELETE body or query string.
      const vendorId = Number.parseInt(
        req.body?.vendor_id ?? req.query?.vendor_id,
        10,
      ) || 0;

if (vendorId <= 0 || addressId <= 0) {
        return res.status(400).json({
          status: 0,
          message: "Invalid request",
        });
      }

await adminService.deleteServiceVendorAddress(
        vendorId,
        addressId,
      );

return res.status(200).json({
        status: 1,
        message: "Address deleted successfully",
      });
    } catch (error) {
      console.error("Delete vendor address error:", error);

return res.status(500).json({
        status: 0,
        message: "Failed to delete vendor address.",
      });
    }
  };

// UPDATE VENDOR AND SHOP DETAILS
const updateServiceVendorDetails = async (req, res) => {
  try {
    const result = await adminService.updateServiceVendorDetails(req.body);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Vendor details could not be updated.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor details updated successfully.",
    });
  } catch (error) {
    console.error("Update service vendor details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update vendor details.",
    });
  }
};

// GET VENDOR KEYWORDS
const getServiceVendorKeywords = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id } = req.query;

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required.",
      });
    }

    const data = await adminService.getServiceVendorKeywords(id, category_id);

    return res.status(200).json({
      success: true,
      message: "Vendor keywords fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Get service vendor keywords error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor keywords.",
    });
  }
};

// SAVE VENDOR KEYWORDS
const saveServiceVendorKeywords = async (req, res) => {
  try {
    const vendorId = req.body.vendor_id;
    const keywordIds = req.body.keyword_ids;

    if (!vendorId) {
      return res.status(200).json({
        status: 0,
        message: "Vendor ID is missing.",
      });
    }

    const saved = await adminService.saveServiceVendorKeywords(
      vendorId,
      keywordIds,
    );

    return res.status(200).json({
      status: saved ? 1 : 0,
      message: saved
        ? "Vendor keywords updated successfully."
        : "Failed to save vendor keywords.",
    });
  } catch (error) {
    console.error("Save service vendor keywords error:", error);

    return res.status(500).json({
      status: 0,
      message: "Failed to save vendor keywords.",
    });
  }
};

//Nearby km
const getVendorRadius = async (req, res) => {
  try {
    const data = await adminService.getVendorRadius();

    return res.status(200).json({
      success: true,
      message: "Vendor radius fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Get vendor radius error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor radius.",
    });
  }
};

const saveVendorRadius = async (req, res) => {
  try {
    const { redius, vendor_id } = req.body;

    const result = await adminService.saveVendorRadius({
      redius,
      vendor_id,
    });

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Save vendor radius error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// -----------------------------------------
// USER MANAGEMENT
// -----------------------------------------
// ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await adminService.getUsers();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== ALL USERS: WALLET ====================

const addWalletAmount = async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        status: false,
        message: "Invalid data",
      });
    }

    await adminService.addWalletAmount(userId, amount);

    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    console.error("Add Wallet Amount Error:", error);

    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// ==================== ALL USERS: SINGLE DELETE ====================

const deleteCustomer = async (req, res) => {
  try {
    await adminService.deleteCustomer(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Customer is deleted.",
    });
  } catch (error) {
    console.error("Delete Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== ALL USERS: BULK DELETE ====================

const deleteSelectedUsers = async (req, res) => {
  try {
    // "ids" matches the existing React frontend payload.
    // "city_ids" also supports the original PHP form field.
    const ids = req.body.ids ?? req.body.city_ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No User selected for deletion",
      });
    }

    await adminService.deleteSelectedUsers(ids);

    return res.status(200).json({
      success: true,
      message: "Selected User deleted successfully",
    });
  } catch (error) {
    console.error("Delete Selected Users Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserPageDetails = async (req, res) => {
  try {
    const userId = Number(req.params.id || req.query.user_id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID",
      });
    }
    const data = await adminService.getUserPageDetails(userId);
    if (!data) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    return res.json({
      status: true,
      data,
    });
  } catch (error) {
    console.error("Get User Page Details Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch user details",
    });
  }
};

const updateUserPageDetails = async (req, res) => {
  try {
    const userId = Number(req.params.id || req.body.uid);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID",
      });
    }
    const result = await adminService.updateUserPageDetails(userId, req.body);
    if (result.invalid) {
      return res.status(400).json({
        status: false,
        message: "Detail could not be updated",
      });
    }
    return res.json({
      status: true,
      message: "Detail updated successfully",
      duplicateContact: result.duplicateContact,
    });
  } catch (error) {
    console.error("Update User Details Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to update user details",
    });
  }
};

const updateUserAddress = async (req, res) => {
  try {
    const addressId = Number(req.params.addressId);
    const address = req.body.address;
    if (!Number.isInteger(addressId) || addressId <= 0 || !address) {
      return res.status(400).json({
        status: false,
        message: "Invalid address request",
      });
    }
    await adminService.updateUserAddress(addressId, address);
    return res.json({
      status: true,
      message: "Address updated successfully",
    });
  } catch (error) {
    console.error("Update User Address Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to update address",
    });
  }
};

const deleteUserAddress = async (req, res) => {
  try {
    const addressId = Number(req.params.addressId);
    const userId = Number(req.params.id);
    if (
      !Number.isInteger(addressId) ||
      addressId <= 0 ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        status: false,
        message: "Invalid request",
      });
    }
    const result = await adminService.deleteUserAddress(addressId, userId);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "Address not found",
      });
    }
    return res.json({
      status: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Address Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to delete address",
    });
  }
};

// ==================== EXPERTS MANAGEMENT ====================
const getExperts = async (req, res) => {
  try {
    const experts = await adminService.getExperts();

    return res.status(200).json({
      success: true,
      message: "Experts fetched successfully.",
      data: experts,
    });
  } catch (error) {
    console.error("Get experts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch experts.",
      error: error.message,
    });
  }
};

const saveNewExpert = async (req, res) => {
  try {
    const { name, exp, vendor_id, category_id, scat_id } = req.body;

    if (!name || !exp || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Must Enter Name, Experience & Image",
      });
    }

    const expert = await adminService.saveNewExpert({
      image: req.file.filename,
      name,
      experience: exp,
      vendor_id: vendor_id || null,
      category_id: category_id || null,
      scat_id: scat_id || null,
    });

    return res.status(200).json({
      success: true,
      message: "Expert Saved Successfully",
      data: expert,
    });
  } catch (error) {
    console.error("Save New Expert Error:", error);
    return res.status(500).json({
      success: false,
      message: "Expert Could Not Be Saved",
      error: error.message,
    });
  }
};

const getExpertFormData = async (req, res) => {
  try {
    const data = await adminService.fetchExpertFormData();

    return res.status(200).json({
      success: true,
      message: "Expert form data fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Get expert form data error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch expert form data.",
      error: error.message,
    });
  }
};

const getExpertDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Expert ID is required",
      });
    }

    const expert = await adminService.getExpertDetails(id);

    if (!expert) {
      return res.status(404).json({
        success: false,
        message: "Expert not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expert details fetched successfully.",
      data: expert,
    });
  } catch (error) {
    console.error("Get Expert Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch expert details.",
      error: error.message,
    });
  }
};

const updateExpertBasisDetailController = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      mobile,
      city_id,
      about,
      account_holder,
      account_number,
      branch_name,
      ifsc_code,
    } = req.body;

    const updated = await adminService.updateExpertBasisDetail(id, {
      name,
      email,
      mobile,
      city_id,
      about,
      account_holder,
      account_number,
      branch_name,
      ifsc_code,
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Detail Could Not Updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail Updated Successfully",
    });
  } catch (error) {
    console.error("Update expert error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update expert details.",
      error: error.message,
    });
  }
};

// ==================== APP REVIEWS ====================

const getAppReviews = async (req, res) => {
  try {
    const reviews = await adminService.getAppReviews();

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Get app reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const markAppReviewAsTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.markAppReviewAsTestimonial(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Marks As Testimonial Successfully",
    });
  } catch (error) {
    console.error("Mark testimonial error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const removeAppReviewTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.removeAppReviewTestimonial(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Removed From Testimonial Successfully",
    });
  } catch (error) {
    console.error("Remove testimonial error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteAppReview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteAppReview(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review Deleted Successfully",
    });
  } catch (error) {
    console.error("Delete app review error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// =====================================================
// CATEGORY MANAGEMENT
// =====================================================

const getCategories = async (req, res) => {
  try {
    const categories = await adminService.getCategoriesService();
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
      error: error.message,
    });
  }
};


const updateCategoryOrder = async (req, res) => {
  try {
    const { order_ids } = req.body;

    if (!Array.isArray(order_ids) || order_ids.length === 0) {
      return res.status(400).json({
        result: false,
        msg: "Invalid data received",
      });
    }

    const result = await adminService.updateCategoryOrderService(order_ids);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update category order error:", error);

    return res.status(500).json({
      result: false,
      msg: "DB transaction failed",
    });
  }
};


const updateCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    const result = await adminService.updateCategoryStatusService(id, status);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        Number(status) === 1
          ? "Category activated successfully."
          : "Category deactivated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await adminService.getCategoryByIdService(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully.",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category.",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const {
      cat_id,
      name,
      hideHomeService,
      hideOnSiteService,
      showHomeService,
      showOnSiteService,
      sortDescription,
    } = req.body;

    const { id } = req.params;

    if (!cat_id || !name) {
      return res.status(400).json({
        success: false,
        message: "Category ID and name are required.",
      });
    }

    const finalShowHomeService = hideHomeService
      ? hideHomeService
      : showHomeService;

    const finalShowOnSiteService = hideOnSiteService
      ? hideOnSiteService
      : showOnSiteService;

    await adminService.updateCategoryService(id, {
      category_name: name,
      showHomeService: finalShowHomeService,
      showOnSiteService: finalShowOnSiteService,
      sort_description: sortDescription,
    });

    if (req.file) {
      await adminService.updateCategoryImageService(id, req.file.filename);
    }

    return res.status(200).json({
      success: true,
      message: "Updated Successfully",
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const result = await adminService.deleteCategoryService(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

const deleteSelectedCategories = async (req, res) => {
  try {
    const { cat_id } = req.body;

    if (!Array.isArray(cat_id) || cat_id.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No categories selected for deletion.",
      });
    }

    await adminService.deleteSelectedCategoriesService(cat_id);

    return res.status(200).json({
      success: true,
      message: "Selected categories deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete selected categories. Please try again.",
    });
  }
};

const importCategories = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV or XLSX file.",
      });
    }

    const extension = req.file.originalname.split(".").pop().toLowerCase();

    let rows = [];

    if (extension === "xlsx") {
      const workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
      });

      const sheetName = workbook.SheetNames[0];

      rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else if (extension === "csv") {
      rows = await new Promise((resolve, reject) => {
        const parsedRows = [];

        Readable.from(req.file.buffer)
          .pipe(csv())
          .on("data", (row) => parsedRows.push(row))
          .on("end", () => resolve(parsedRows))
          .on("error", reject);
      });
    }

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Failed to import data. Please check your file format.",
      });
    }

    const categories = rows.map((row) => ({
      category_name: row["Category Name"],
      status: row["Status"],
      category_image: row["Image"],
    }));

    await adminService.importCategoriesService(categories);

    return res.status(200).json({
      success: true,
      message: "Categories imported successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to import categories.",
      error: error.message,
    });
  }
};

const addCategory = async (req, res) => {
  try {
    const {
      category,
      name,
      sort_description,
      hideHomeService,
      hideOnSiteService,
      showHomeService,
      showOnSiteService,
    } = req.body;

    if (!category || category !== "new_cat" || !name) {
      return res.status(400).json({
        success: false,
        message: "Invalid category data.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file.",
      });
    }

    const homeService = hideHomeService ? hideHomeService : showHomeService;

    const onSiteService = hideOnSiteService
      ? hideOnSiteService
      : showOnSiteService;

    const result = await adminService.addCategoryService({
      category_name: name,
      sort_description,
      category_image: req.file.filename,
      showHomeService: homeService,
      showOnSiteService: onSiteService,
    });

    return res.status(201).json({
      success: true,
      message: "Category added successfully.",
      data: { id: result.insertId },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add category.",
      error: error.message,
    });
  }
};


// CATEGORY KEYWORDS MANAGEMENT
// =====================================================

// GET CATEGORY KEYWORDS PAGE DATA
const getCategoryKeywordList = async (req, res) => {
  try {
    const data = await adminService.getCategoryKeywordListService();

    return res.status(200).json({
      success: true,
      message: "Category keywords fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Get Category Keywords Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category keywords.",
      error: error.message,
    });
  }
};

// ADD CATEGORY KEYWORDS
const addCategoryKeywords = async (req, res) => {
  try {
    const { category_id, keywords } = req.body;

    if (
      category_id === undefined ||
      category_id === null ||
      String(category_id).trim() === "" ||
      typeof keywords !== "string" ||
      !keywords.trim()
    ) {
      return res.status(400).json({
        status: "error",
        message: "Category and keyword(s) are required",
      });
    }

    const result = await adminService.addCategoryKeywordsService(
      category_id,
      keywords,
    );

    if (result.status === "error") {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Add Category Keywords Error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// IMPORT CATEGORY KEYWORDS CSV
const importCategoryKeywords = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please select a CSV file to upload",
      });
    }

    const extension = path.extname(req.file.originalname).toLowerCase();

    if (extension !== ".csv") {
      return res.status(400).json({
        status: "error",
        message: "Please upload a valid CSV file",
      });
    }

    const result = await adminService.importCategoryKeywordsService(
      req.file.buffer,
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Import Category Keywords Error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// DELETE ONE CATEGORY KEYWORD
const deleteCategoryKeyword = async (req, res) => {
  try {
    const result = await adminService.deleteCategoryKeywordService(
      req.params.id,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Keyword not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Keyword deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Keyword Error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// DELETE ALL KEYWORDS FOR A CATEGORY
const deleteCategoryKeywordsByCategory = async (req, res) => {
  try {
    const result =
      await adminService.deleteCategoryKeywordsByCategoryService(
        req.params.categoryId,
      );

    const deleted = result.affectedRows;

    return res.status(200).json({
      status: "success",
      deleted,
      message: `${deleted} keyword(s) deleted for this category`,
    });
  } catch (error) {
    console.error("Delete Category Keywords By Category Error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// =====================  SUBCATEGORY MANAGEMENT ================================
const getSubCategories = async (req, res) => {
  try {
    const subCategories = await adminService.getSubCategoriesService();

    return res.status(200).json({
      success: true,
      message: "Sub categories fetched successfully.",
      data: subCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sub categories.",
      error: error.message,
    });
  }
};

const updateSubCategoryOrder = async (req, res) => {
  const orderIds = req.body?.order_ids;

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(200).json({
      result: false,
      msg: "Invalid data received",
    });
  }

  try {
    const result =
      await adminService.updateSubCategoryOrderService(orderIds);

    return res.status(200).json({
      result: true,
      msg: "Order updated successfully",
      updated_count: result.updated_count,
    });
  } catch (error) {
    console.error("Update subcategory order error:", error);

    return res.status(200).json({
      result: false,
      msg: "DB transaction failed",
    });
  }
};

const addSubCategory = async (req, res) => {
  try {
    const { category, name, description } = req.body;

    if (!category || !name) {
      return res.status(400).json({
        success: false,
        message: "Please select category and enter sub category name.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please Select File",
      });
    }

    const result = await adminService.addSubCategoryService({
      cat_id: category,
      name,
      description: description || "",
      image: req.file.filename,
    });

    return res.status(201).json({
      success: true,
      message: "Sub category Added Successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

const getSubCategoryEditData = async (req, res) => {
  try {
    const subCategory = await adminService.getSubCategoryByIdService(
      req.params.id,
    );

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub category fetched successfully.",
      data: subCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sub category.",
      error: error.message,
    });
  }
};

const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { cat_id, name, description } = req.body;

    if (!cat_id || !name) {
      return res.status(400).json({
        status: "error",
        message: "Please fill all the required fields.",
      });
    }

    const data = { cat_id, name, description };

    if (req.file) {
      data.image = req.file.filename;
    }

    const result = await adminService.updateSubCategoryService(id, data);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: "error",
        message: "Something went wrong. Please try again.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const result = await adminService.deleteSubCategoryService(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub Category Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete sub category.",
      error: error.message,
    });
  }
};

const deleteSelectedSubCategories = async (req, res) => {
  try {
    const { sub_cat_id } = req.body;

    if (!Array.isArray(sub_cat_id) || sub_cat_id.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No sub categories selected for deletion.",
      });
    }

    const result =
      await adminService.deleteSelectedSubCategoriesService(sub_cat_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No sub categories found to delete.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Selected sub categories deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete selected sub categories.",
      error: error.message,
    });
  }
};

const changeSubCategoryStatus = async (req, res) => {
  try {
    const result = await adminService.changeSubCategoryStatusService(
      req.params.id,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status Changed Successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// =========================================================
// VENDOR IMAGE SLIDER
// =========================================================

const getAllVendorImages = async (req, res) => {
  try {
    const videos = await adminService.getAllVendorImagesService();

    return res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor images.",
      error: error.message,
    });
  }
};

const getVendorImageFormData = async (req, res) => {
  try {
    const data = await adminService.getVendorImageFormDataService();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor image form data.",
      error: error.message,
    });
  }
};

const getVendorImageById = async (req, res) => {
  try {
    const video = await adminService.getVendorImageByIdService(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor image.",
      error: error.message,
    });
  }
};

const addVendorImage = async (req, res) => {
  try {
    const { name, description, vendor_id, vimage } = req.body;

    if (vimage !== "vimage") {
      return res.status(400).json({
        success: false,
        message: "Invalid image submission.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file.",
      });
    }

    const id = await adminService.addVendorImageService({
      title: name,
      description,
      image: req.file.filename,
      vendor_id,
    });

    return res.status(201).json({
      success: true,
      message: "Image Added",
      id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add vendor image.",
      error: error.message,
    });
  }
};

const updateVendorImage = async (req, res) => {
  try {
    const { name, description, vendor_id } = req.body;
    const { id } = req.params;

    const existing = await adminService.getVendorImageByIdService(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Record not found.",
      });
    }

    await adminService.updateVendorImageService(id, {
      title: name,
      description,
      vendor_id,
      image: req.file?.filename,
    });

    return res.status(200).json({
      success: true,
      message: "Image Updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update vendor image.",
      error: error.message,
    });
  }
};

const deleteVendorImage = async (req, res) => {
  try {
    const existing = await adminService.getVendorImageByIdService(
      req.params.id,
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Record not found.",
      });
    }

    await adminService.deleteVendorImageService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Image Deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete vendor image.",
      error: error.message,
    });
  }
};

const deleteSelectedVendorImages = async (req, res) => {
  try {
    const ids = req.body.home_id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one image.",
      });
    }

    await adminService.deleteSelectedVendorImagesService(ids);

    return res.status(200).json({
      success: true,
      message: "Selected images deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete selected images.",
      error: error.message,
    });
  }
};

// ==================== SERVICE SIDE CITIES ====================
const getServiceSideCities = async (req, res) => {
  try {
    const cities = await adminService.getServiceSideCities();

    return res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error("Get service-side cities error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getServiceSideCityById = async (req, res) => {
  try {
    const city = await adminService.getServiceSideCityById(req.params.id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: city,
    });
  } catch (error) {
    console.error("Get service-side city error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const addServiceSideCity = async (req, res) => {
  try {
    const { city_name, save } = req.body;

    if (save !== "new_city" || !city_name) {
      return res.status(400).json({
        success: false,
        message: "City name is required",
      });
    }

    await adminService.addServiceSideCity(city_name);

    return res.status(201).json({
      success: true,
      message: "City Added Sucessfully...",
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: "City already exists",
      });
    }

    console.error("Add service-side city error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateServiceSideCity = async (req, res) => {
  try {
    const { id, city_name, save } = req.body;

    if (save !== "update" || !id || !city_name) {
      return res.status(400).json({
        success: false,
        message: "City ID and city name are required",
      });
    }

    const result = await adminService.updateServiceSideCity(id, city_name);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "City not found or no changes made",
      });
    }

    return res.status(200).json({
      success: true,
      message: "City Update Sucessfully...",
    });
  } catch (error) {
    console.error("Update service-side city error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteServiceSideCity = async (req, res) => {
  try {
    const result = await adminService.deleteServiceSideCity(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "City not found...",
      });
    }

    return res.status(200).json({
      success: true,
      message: "City Deleted Successfully...",
    });
  } catch (error) {
    console.error("Delete service-side city error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteSelectedServiceSideCities = async (req, res) => {
  try {
    const { city_ids } = req.body;

    if (!Array.isArray(city_ids) || city_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No cities selected for deletion",
      });
    }

    const result = await adminService.deleteSelectedServiceSideCities(city_ids);

    return res.status(200).json({
      success: true,
      message:
        result.affectedRows > 0
          ? "Selected cities deleted successfully"
          : "No matching cities found",
      deletedCount: result.affectedRows,
    });
  } catch (error) {
    console.error("Bulk delete service-side cities error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const importServiceSideCities = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an Excel file",
      });
    }

    if (!req.body.import) {
      return res.status(400).json({
        success: false,
        message: "Import request is required",
      });
    }

    const importedCount = await adminService.importServiceSideCities(
      req.file.buffer,
    );

    if (importedCount > 0) {
      return res.status(200).json({
        success: true,
        message: "City Import successfully",
        importedCount,
      });
    }

    return res.status(400).json({
      success: false,
      message: "No cities imported",
      importedCount: 0,
    });
  } catch (error) {
    console.error("Import service-side cities error:", error);
    return res.status(500).json({
      success: false,
      message: "City import failed",
    });
  }
};

// =====================================================
// RESTAURANT SIDE
// =====================================================

// -----------------------------------------
// RESTAURANT-DASHBOARD
// -----------------------------------------

const getDashboardData = async (req, res) => {
  try {
    const data = await adminService.getDashboardData();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const filter = req.body.filter;

    const data = await adminService.getOrderStats(filter);

    res.status(200).json(data);
  } catch (error) {
    console.error("Order Stats Error:", error);

    res.status(500).json({
      result: false,
      message: error.message,
    });
  }
};

// SALES CHART
const getSalesChartData = async (req, res) => {
  try {
    const filter = req.body.filter;

    const data = await adminService.getSalesChartData(filter);

    res.status(200).json(data);
  } catch (error) {
    console.error("Sales Chart Error:", error);

    res.status(500).json({
      result: false,
      message: error.message,
    });
  }
};

// -----------------------------------------
// RESTAURANT-STORE MANAGEMENT
// -----------------------------------------

// PENDING STORES
const getPendingStores = async (req, res) => {
  try {
    const stores = await adminService.getPendingStores();

    return res.status(200).json({
      success: true,
      message: "Pending stores fetched successfully",
      totalStores: stores.length,
      stores,
    });
  } catch (error) {
    console.error("Get pending stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending stores",
      error: error.message,
    });
  }
};

// GET ADD STORE CITIES
const getAddStoreCities = async (req, res) => {
  try {
    const result = await adminService.getAddStoreCities();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get cities error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities.",
    });
  }
};

// ADD RESTAURANT STORE
const addStore = async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;

    if (!data.business_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business Name is required.",
      });
    }

    if (!data.cat_id) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    if (
      !data.dining_option ||
      (Array.isArray(data.dining_option) && data.dining_option.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one dining option!",
      });
    }

    if (!data.minimum_delivery_time) {
      return res.status(400).json({
        success: false,
        message: "Minimum Delivery Time is required.",
      });
    }

    if (!data.maximum_delivery_time) {
      return res.status(400).json({
        success: false,
        message: "Maximum Delivery Time is required.",
      });
    }

    if (!data.delivery_time_type) {
      return res.status(400).json({
        success: false,
        message: "Delivery Time Type is required.",
      });
    }

    if (!data.business_description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business Description is required.",
      });
    }

    if (!data.latitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude is required.",
      });
    }

    if (!data.longitude) {
      return res.status(400).json({
        success: false,
        message: "Longitude is required.",
      });
    }

    if (!data.restaurant_address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Restaurant address is required.",
      });
    }

    if (!data.first_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "First Name is required.",
      });
    }

    if (!data.last_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Last Name is required.",
      });
    }

    if (!data.email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!data.password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (data.password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (!data.mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile Number is required.",
      });
    }

    if (!data.city_id) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    if (!files?.profilePhoto?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required.",
      });
    }

    if (!files?.idProof?.[0]) {
      return res.status(400).json({
        success: false,
        message: "ID proof is required.",
      });
    }

    if (!files?.businessLicense?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Business license is required.",
      });
    }

    if (!files?.padFile?.[0]) {
      return res.status(400).json({
        success: false,
        message: "PAD file is required.",
      });
    }

    const result = await adminService.addStore(data, files);

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Add restaurant store error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add store. Please try again.",
    });
  }
};

// GET RESTAURANT STORES
const getRestaurantStores = async (req, res) => {
  try {
    const data = await adminService.getRestaurantStores();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get restaurant stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant stores.",
    });
  }
};

// GET STORE BY ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await adminService.getStoreById(id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error("Get restaurant store error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store.",
    });
  }
};

// SEARCH STORES
const searchStores = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required.",
      });
    }

    const stores = await adminService.searchStores(keyword);

    return res.status(200).json({
      success: true,
      data: stores,
    });
  } catch (error) {
    console.error("Search restaurant stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search stores.",
    });
  }
};

// UPDATE STORE
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const files = req.files;

    if (!data.business_name) {
      return res.status(400).json({
        success: false,
        message: "Business Name is required.",
      });
    }

    if (!data.cat_id) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    if (
      !data.dining_option ||
      (Array.isArray(data.dining_option) && data.dining_option.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one dining option!",
      });
    }

    if (!data.minimum_delivery_time) {
      return res.status(400).json({
        success: false,
        message: "Minimum Delivery Time is required.",
      });
    }

    if (!data.maximum_delivery_time) {
      return res.status(400).json({
        success: false,
        message: "Maximum Delivery Time is required.",
      });
    }

    if (!data.delivery_time_type) {
      return res.status(400).json({
        success: false,
        message: "Delivery Time Type is required.",
      });
    }

    if (!data.business_description) {
      return res.status(400).json({
        success: false,
        message: "Description is required.",
      });
    }

    if (!data.latitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude is required.",
      });
    }

    if (!data.longitude) {
      return res.status(400).json({
        success: false,
        message: "Longitude is required.",
      });
    }

    if (!data.city_id) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    if (!data.name) {
      return res.status(400).json({
        success: false,
        message: "First Name is required.",
      });
    }

    if (!data.email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!data.mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile is required.",
      });
    }

    if (!data.restaurant_address) {
      return res.status(400).json({
        success: false,
        message: "Restaurant address is required.",
      });
    }

    if (!data.password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    const result = await adminService.updateStore(id, data, files);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update restaurant store error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update store. Please try again.",
    });
  }
};

// TOGGLE STORE STATUS
const toggleStoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_kyc_approved } = req.body;

    if (is_kyc_approved === undefined || is_kyc_approved === null) {
      return res.status(400).json({
        success: false,
        message: "is_kyc_approved is required.",
      });
    }

    const result = await adminService.toggleStoreStatus(id, is_kyc_approved);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Toggle restaurant store status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update store status.",
    });
  }
};

// DELETE STORE
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteStore(id);

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Delete restaurant store error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete store!",
    });
  }
};

// BULK DELETE STORES
const bulkDeleteStores = async (req, res) => {
  try {
    const { store_ids } = req.body;

    const result = await adminService.bulkDeleteStores(store_ids);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Bulk delete restaurant stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete stores!",
    });
  }
};

// GET STORE LIST CITIES
const getStoreListCities = async (req, res) => {
  try {
    const result = await adminService.getStoreListCities();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Cities Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities.",
    });
  }
};

// GET STORE ORDERS
const getStoreOrders = async (req, res) => {
  try {
    const { id } = req.params;

    const { status, search, page = 1, pageSize = 20 } = req.query;

    const result = await adminService.getStoreOrders({
      storeId: id,
      status,
      search,
      page,
      pageSize,
    });

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get store orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store orders.",
    });
  }
};

// GET STORE ORDER SUMMARY
const getStoreOrderSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.getStoreOrderSummary(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get store order summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order summary.",
    });
  }
};

// GET ORDER DETAILS
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await adminService.getOrderDetails(orderId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details.",
      error: error.message,
    });
  }
};

// GET STORE ITEMS
const getStoreItems = async (req, res) => {
  try {
    const { id } = req.params;

    const { status, search = "", page = 1, pageSize = 10 } = req.query;

    const result = await adminService.getStoreItems({
      storeId: id,
      status,
      search,
      page: Number(page),
      pageSize: Number(pageSize),
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Get store items error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store items.",
      error: error.message,
    });
  }
};

// GET STORE ITEMS SUMMARY
const getStoreItemsSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const counts = await adminService.getStoreItemsSummary(id);

    return res.status(200).json({
      success: true,
      counts,
    });
  } catch (error) {
    console.error("Get store items summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch item summary.",
      error: error.message,
    });
  }
};

// UPDATE STORE ITEM STATUS
const updateStoreItemStatus = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const result = await adminService.toggleStoreItemStatus(id, itemId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update store item status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update item status.",
      error: error.message,
    });
  }
};

// GET ALL RESTAURANT ORDERS
const getAllRestaurantOrders = async (req, res) => {
  try {
    const result = await adminService.getAllRestaurantOrders();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get all restaurant orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant orders.",
    });
  }
};

// GET NEARBY KM
const getNearbyKm = async (req, res) => {
  try {
    const result = await adminService.getNearbyKm();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Nearby KM Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch nearby KM.",
    });
  }
};

// UPDATE NEARBY KM
const updateNearbyKm = async (req, res) => {
  try {
    const { nearby_km, status } = req.body;

    if (
      nearby_km === undefined ||
      nearby_km === null ||
      String(nearby_km).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        errors: {
          nearby_km: "Nearby KM is required.",
        },
      });
    }

    const nearbyKm = Number(nearby_km);

    if (!Number.isFinite(nearbyKm)) {
      return res.status(400).json({
        success: false,
        errors: {
          nearby_km: "Nearby KM must be a valid number.",
        },
      });
    }

    if (nearbyKm <= 0) {
      return res.status(400).json({
        success: false,
        errors: {
          nearby_km: "Nearby KM must be greater than 0.",
        },
      });
    }

    const nearbyStatus =
      status === true || status === 1 || status === "1" || status === "true"
        ? 1
        : 0;

    const result = await adminService.updateNearbyKm(nearbyKm, nearbyStatus);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update Nearby KM Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update nearby KM.",
    });
  }
};

// -----------------------------------------
// RESTAURANT-COUPON MANAGEMENT
// -----------------------------------------

// GET ALL COUPONS
const getAllCoupons = async (req, res) => {
  try {
    const result = await adminService.getAllCoupons();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Restaurant Coupons Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant coupons.",
    });
  }
};

// UPDATE COUPON STATUS
const updateCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 0 && status !== 1 && status !== "0" && status !== "1") {
      return res.status(400).json({
        success: false,
        message: "Status must be 0 or 1.",
      });
    }

    const result = await adminService.updateCouponStatus(id, Number(status));

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update Restaurant Coupon Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon status.",
    });
  }
};

// GET COUPON BY ID
const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.getCouponById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Restaurant Coupon By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon.",
    });
  }
};

// GET CATEGORIES BY IDS
const getCategoriesByIds = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Category IDs are required.",
      });
    }

    const result = await adminService.getCategoriesByIds(ids);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Categories By IDs Error:", error);

    return res.status(500).json({
      success: false,
      data: [],
      message: "Failed to fetch categories.",
    });
  }
};

// GET VENDORS BY IDS
const getVendorsByIds = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Vendor IDs are required.",
      });
    }

    const result = await adminService.getVendorsByIds(ids);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Vendors By IDs Error:", error);

    return res.status(500).json({
      success: false,
      data: [],
      message: "Failed to fetch vendors.",
    });
  }
};

// GET PRODUCTS BY IDS
const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Product IDs are required.",
      });
    }

    const result = await adminService.getProductsByIds(ids);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Products By IDs Error:", error);

    return res.status(500).json({
      success: false,
      data: [],
      message: "Failed to fetch products.",
    });
  }
};

// DELETE COUPON
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteCoupon(id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete Restaurant Coupon Error:", error);

    if (error.message === "Coupon not found.") {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon.",
    });
  }
};

// DELETE SELECTED COUPONS
const deleteSelectedCoupons = async (req, res) => {
  try {
    const { coupon_ids } = req.body;

    if (!Array.isArray(coupon_ids) || coupon_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No coupons selected.",
      });
    }

    const result = await adminService.deleteSelectedCoupons(coupon_ids);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Bulk Delete Restaurant Coupons Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete selected coupons.",
    });
  }
};

// GET COUPON EDIT DATA
const getCouponEditData = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.getCouponEditData(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Restaurant Coupon Edit Data Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon edit data.",
    });
  }
};

// GET ADD COUPON DATA
const getAddCouponData = async (req, res) => {
  try {
    const result = await adminService.getAddCouponData();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Add Coupon Data Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon form data.",
    });
  }
};

// ADD RESTAURANT COUPON
const addCoupon = async (req, res) => {
  try {
    const {
      title,
      code,
      discount_price,
      discount_type,
      description,
      expired_at,
      usage_limit,
      user_type,
      categories,
      vendors,
      products,
    } = req.body;

    if (
      !title ||
      !code ||
      discount_price === undefined ||
      discount_price === "" ||
      !expired_at
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const formattedCode = String(code).trim().toUpperCase();

    const formattedCouponPrice =
      discount_type === "percent" ? `${discount_price}%` : discount_price;

    const usageLimit =
      usage_limit !== undefined && usage_limit !== null && usage_limit !== ""
        ? usage_limit
        : 1;

    const userType = user_type || "all";

    const categoryIds = Array.isArray(categories) ? categories.join(",") : "";

    const vendorIds = Array.isArray(vendors) ? vendors.join(",") : "";

    const productIds = Array.isArray(products) ? products.join(",") : "";

    const data = {
      title,
      code: formattedCode,
      cupon_price: formattedCouponPrice,
      discount_type,
      description: description || "",
      expired_at,
      usage_limit: usageLimit,
      used_count: 0,
      user_type: userType,
      category_ids: categoryIds,
      vendor_ids: vendorIds,
      product_ids: productIds,
      status: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await adminService.addCoupon(data);

    return res.status(201).json(result);
  } catch (error) {
    console.error("Add Restaurant Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not save coupon. Please try again.",
    });
  }
};

// GET VENDORS BY CATEGORY
const getVendorsByCategory = async (req, res) => {
  try {
    const result = await adminService.getVendorsByCategory();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Vendors By Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendors.",
    });
  }
};

// GET PRODUCTS BY VENDOR IDS
const getProductsByVendorIds = async (req, res) => {
  try {
    const { vendor_ids } = req.body;

    if (!Array.isArray(vendor_ids) || vendor_ids.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const result = await adminService.getProductsByVendorIds(vendor_ids);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Products By Vendor IDs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
};

// UPDATE COUPON
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      code,
      discount_price,
      discount_type,
      description,
      expired_at,
      usage_limit,
      user_type,
      status,
      categories,
      vendors,
      products,
    } = req.body;

    if (
      !title ||
      !code ||
      discount_price === undefined ||
      discount_price === "" ||
      !expired_at ||
      !id
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const formattedCode = String(code).trim().toUpperCase();

    const formattedCouponPrice =
      discount_type === "percent" ? `${discount_price}%` : discount_price;

    const usageLimit =
      usage_limit !== undefined && usage_limit !== null && usage_limit !== ""
        ? usage_limit
        : 1;

    const userType = user_type || "all";

    const categoryIds = Array.isArray(categories) ? categories.join(",") : "";

    const vendorIds = Array.isArray(vendors) ? vendors.join(",") : "";

    const productIds = Array.isArray(products) ? products.join(",") : "";

    const data = {
      title,
      code: formattedCode,
      cupon_price: formattedCouponPrice,
      discount_type,
      description: description || "",
      expired_at,
      usage_limit: usageLimit,
      user_type: userType,
      status,
      category_ids: categoryIds,
      vendor_ids: vendorIds,
      product_ids: productIds,
      updated_at: new Date(),
    };

    const result = await adminService.updateCoupon(id, data);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update Restaurant Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon.",
    });
  }
};

// GET ALL MENUS
const getAllMenus = async (req, res) => {
  try {
    const menus = await adminService.getAllMenus();

    return res.status(200).json({
      success: true,
      data: menus,
      total: menus.length,
    });
  } catch (error) {
    console.error("Get all menus error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch menus",
    });
  }
};

// GET ADD RESTAURANT ITEM DATA
const getAddRestaurantItemData = async (req, res) => {
  try {
    const data = await adminService.getAddRestaurantItemData();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get add restaurant item data error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch add restaurant item data",
    });
  }
};

// CREATE MENU
const createMenu = async (req, res) => {
  try {
    const { name } = req.body;

    const menu = await adminService.createMenu(name || "");

    return res.status(201).json({
      success: true,
      message: "Menu added successfully",
      menu,
    });
  } catch (error) {
    console.error("Create menu error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to add menu",
    });
  }
};

// GET MENU BY ID
const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await adminService.getMenuById(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    return res.status(200).json({
      success: true,
      menu,
    });
  } catch (error) {
    console.error("Get menu error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu",
    });
  }
};

// UPDATE MENU
const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const result = await adminService.updateMenu(id, name || "");

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes made or update failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      menu: {
        id: Number(id),
        name: name.trim(),
      },
    });
  } catch (error) {
    console.error("Update menu error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update menu",
    });
  }
};

// DELETE MENU
const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteMenu(id);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete menu",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete menu",
    });
  }
};

// BULK DELETE MENUS
const bulkDeleteMenus = async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await adminService.bulkDeleteMenus(ids);

    return res.status(200).json({
      success: true,
      message: `${result.affectedRows} menu(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Bulk delete menus error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Bulk delete failed",
    });
  }
};

// UPDATE MENU STATUS
const updateMenuStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await adminService.updateMenuStatus(id, status);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to update status",
      });
    }

    return res.status(200).json({
      success: true,
      message: Number(status) === 1 ? "Menu Activated" : "Menu Deactivated",
    });
  } catch (error) {
    console.error("Update menu status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
};

// GET ALL RESTAURANT ITEMS
const getAllRestaurantItems = async (req, res) => {
  try {
    const items = await adminService.getAllRestaurantItems();

    return res.status(200).json({
      success: true,
      data: items,
      total: items.length,
    });
  } catch (error) {
    console.error("Get restaurant items error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant items",
    });
  }
};

// GET RESTAURANT ITEM BY ID
const getRestaurantItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID required",
      });
    }

    const item = await adminService.getRestaurantItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Get restaurant item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant item",
    });
  }
};

// UPDATE RESTAURANT ITEM STATUS
const updateRestaurantItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID required",
      });
    }

    const result = await adminService.updateRestaurantItemStatus(
      id,
      Number(status),
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found or status unchanged",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error("Update restaurant item status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Status update failed",
    });
  }
};

// DELETE RESTAURANT ITEM
const deleteRestaurantItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID required",
      });
    }

    const result = await adminService.deleteRestaurantItem(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (result.item?.item_image) {
      const imagePath = path.join(
        __dirname,
        "../assets/images",
        result.item.item_image,
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Item and its addons deleted successfully",
    });
  } catch (error) {
    console.error("Delete restaurant item error:", error);

    return res.status(500).json({
      success: false,
      message: "Delete failed. Please try again.",
    });
  }
};

// BULK DELETE RESTAURANT ITEMS
const bulkDeleteRestaurantItems = async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await adminService.bulkDeleteRestaurantItems(ids);

    result.items.forEach((item) => {
      if (!item.item_image) return;

      const imagePath = path.join(
        __dirname,
        "../assets/images",
        item.item_image,
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    return res.status(200).json({
      success: true,
      message: `${result.affectedRows} item(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Bulk delete restaurant items error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Bulk delete failed",
    });
  }
};

// CREATE RESTAURANT ITEM
const createRestaurantItem = async (req, res) => {
  try {
    const vendor_id = req.body.vendor_id;
    const name = req.body.name;
    const description = req.body.description;
    const item_type = req.body.item_type;
    const unit_price = req.body.unit_price;
    const discount_price = req.body.discount_price;
    const sub_cat_id = req.body.sub_cat_id;
    const menu_id = req.body.menu_id;

    if (
      vendor_id === undefined ||
      vendor_id === null ||
      vendor_id === "" ||
      name === "" ||
      description === "" ||
      item_type === "" ||
      unit_price === "" ||
      discount_price === "" ||
      sub_cat_id === "" ||
      menu_id === ""
    ) {
      return res.status(400).json({
        result: false,
        msg: "Required: vendor_id, name, description, item_type, unit_price, discount_price, sub_cat_id, menu_id, item_image",
      });
    }

    const itemFile = req.files?.find((file) => file.fieldname === "item_image");

    if (!itemFile) {
      return res.status(400).json({
        result: false,
        msg: "item_image required",
      });
    }

    const insertData = {
      vendor_id,
      name,
      description,
      item_type,
      unit_price,
      discount_price,
      sub_cat_id,
      menu_id,
      item_image: itemFile.filename,
      created_at: new Date(),
    };

    const item = await adminService.createRestaurantItem(insertData);

    return res.status(200).json({
      result: true,
      msg: "Item added successfully",
      data: item,
    });
  } catch (error) {
    console.error("Restaurant item add error:", error);

    return res.status(500).json({
      result: false,
      msg: "Database insert failed",
    });
  }
};

// SAVE ADDON GROUP
const saveAddonGroup = async (req, res) => {
  try {
    const vendor_id = req.body.vendor_id;
    const item_id = req.body.item_id;
    const sub_cat_id = req.body.sub_cat_id;
    const type = req.body.type;
    const title = (req.body.title || "").trim();
    const is_required = req.body.is_required ? 1 : 0;
    const group_id = req.body.group_id;

    let optionNames = req.body.option_name || [];
    let optionPrices = req.body.option_price || [];
    let existingImages = req.body.existing_image || [];

    if (!Array.isArray(optionNames)) {
      optionNames = [optionNames];
    }

    if (!Array.isArray(optionPrices)) {
      optionPrices = [optionPrices];
    }

    if (!Array.isArray(existingImages)) {
      existingImages = [existingImages];
    }

    if (
      !vendor_id ||
      !item_id ||
      !type ||
      title === "" ||
      optionNames.length === 0
    ) {
      return res.status(400).json({
        result: false,
        msg: "Required: vendor_id, item_id, type, title, at least 1 option",
      });
    }

    if (!["addon", "topping"].includes(type)) {
      return res.status(400).json({
        result: false,
        msg: "Invalid type. Must be addon or topping.",
      });
    }

    const options = [];

    for (let idx = 0; idx < optionNames.length; idx++) {
      const name = String(optionNames[idx] || "").trim();

      if (name === "") {
        continue;
      }

      const price =
        optionPrices[idx] !== undefined ? Number(optionPrices[idx]) : 0;

      let image =
        existingImages[idx] !== undefined ? existingImages[idx] : null;

      const uploadedFile = req.files?.find(
        (file) => file.fieldname === `option_image_${idx}`,
      );

      if (type === "topping" && uploadedFile) {
        image = uploadedFile.filename;
      }

      options.push({
        name,
        price,
        image,
      });
    }

    const data = await adminService.saveAddonGroup({
      vendor_id,
      item_id,
      sub_cat_id,
      type,
      title,
      is_required,
      group_id,
      options,
    });

    if (data.deleted) {
      return res.status(200).json({
        result: true,
        msg: "All options removed, group deleted.",
        data,
      });
    }

    return res.status(200).json({
      result: true,
      msg: group_id
        ? `${type.charAt(0).toUpperCase() + type.slice(1)} group updated successfully`
        : `${type.charAt(0).toUpperCase() + type.slice(1)} group added successfully`,
      data,
    });
  } catch (error) {
    console.error("Save addon group error:", error);

    return res.status(error.statusCode || 500).json({
      result: false,
      msg: error.message || "Failed to save addon group",
    });
  }
};

// GET ITEM ADDONS
const getItemAddons = async (req, res) => {
  try {
    const itemId = req.params.id || req.body.item_id || req.query.item_id;

    if (!itemId) {
      return res.status(400).json({
        result: false,
        msg: "item_id required",
      });
    }

    const groups = await adminService.getItemAddons(itemId);

    return res.status(200).json({
      result: true,
      data: groups,
    });
  } catch (error) {
    console.error("Get item addons error:", error);

    return res.status(500).json({
      result: false,
      msg: error.message || "Failed to fetch addons",
    });
  }
};

// DELETE ADDON GROUP
const deleteAddonGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId || req.body.group_id;

    if (!groupId) {
      return res.status(400).json({
        result: false,
        msg: "group_id required",
      });
    }

    await adminService.deleteAddonGroup(groupId);

    return res.status(200).json({
      result: true,
      msg: "Deleted successfully",
    });
  } catch (error) {
    console.error("Delete addon group error:", error);

    return res.status(500).json({
      result: false,
      msg: "Failed to delete addon group",
    });
  }
};

// GET EDIT RESTAURANT ITEM DATA
const getEditRestaurantItemData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        result: false,
        msg: "Item ID required",
      });
    }

    const data = await adminService.getEditRestaurantItemData(id);

    if (!data) {
      return res.status(404).json({
        result: false,
        msg: "Item not found",
      });
    }

    return res.status(200).json({
      result: true,
      data,
    });
  } catch (error) {
    console.error("Get edit restaurant item error:", error);

    return res.status(500).json({
      result: false,
      msg: "Failed to fetch edit restaurant item data",
    });
  }
};

// UPDATE RESTAURANT ITEM
const updateRestaurantItem = async (req, res) => {
  try {
    const item_id = req.body.item_id;
    const vendor_id = req.body.vendor_id;
    const name = req.body.name;
    const description = req.body.description;
    const item_type = req.body.item_type;
    const unit_price = req.body.unit_price;
    const discount_price = req.body.discount_price;
    const sub_cat_id = req.body.sub_cat_id;
    const menu_id = req.body.menu_id;
    const remove_image = req.body.remove_image;

    if (!item_id) {
      return res.status(400).json({
        result: false,
        msg: "Item ID required",
      });
    }

    const existing = await adminService.getRestaurantItemForUpdate(item_id);

    if (!existing) {
      return res.status(404).json({
        result: false,
        msg: "Item not found",
      });
    }

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    const itemFile = req.files?.find((file) => file.fieldname === "item_image");

    let updateData = {
      vendor_id,
      name,
      description,
      item_type,
      unit_price,
      discount_price,
      sub_cat_id,
      menu_id,
      updated_at: new Date(),
    };

    if (itemFile) {
      const oldImagePath = existing.item_image
        ? path.join(__dirname, "../assets/images", existing.item_image)
        : null;

      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      updateData.item_image = itemFile.filename;

      await adminService.updateRestaurantItemImageAndData(item_id, updateData);
    } else if (remove_image === "1") {
      const oldImagePath = existing.item_image
        ? path.join(__dirname, "../assets/images", existing.item_image)
        : null;

      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      updateData.item_image = "";

      await adminService.updateRestaurantItemImageAndData(item_id, updateData);
    } else {
      await adminService.updateRestaurantItem(item_id, updateData);
    }

    return res.status(200).json({
      result: true,
      msg: "Item updated successfully",
    });
  } catch (error) {
    console.error("Restaurant item update error:", error);

    return res.status(500).json({
      result: false,
      msg: "Update failed",
    });
  }
};

// UPDATE ADDON
const updateAddon = async (req, res) => {
  try {
    const addon_id = req.body.addon_id;
    const name = String(req.body.name || "").trim();
    const price = req.body.price;

    if (
      !addon_id ||
      name === "" ||
      price === "" ||
      price === undefined ||
      price === null
    ) {
      return res.status(400).json({
        result: false,
        msg: "Required: addon_id, name, price",
      });
    }

    if (!isNaN(price) === false || Number(price) < 0) {
      return res.status(400).json({
        result: false,
        msg: "Price must be a valid positive number",
      });
    }

    const existing = await adminService.getAddonById(addon_id);

    if (!existing) {
      return res.status(404).json({
        result: false,
        msg: "Addon not found",
      });
    }

    const success = await adminService.updateAddon(addon_id, name, price);

    if (success) {
      return res.status(200).json({
        result: true,
        msg: "Addon updated successfully",
      });
    }

    return res.status(400).json({
      result: false,
      msg: "Update failed",
    });
  } catch (error) {
    console.error("Update addon error:", error);

    return res.status(500).json({
      result: false,
      msg: "Update failed",
    });
  }
};

// DELETE ADDON
const deleteAddon = async (req, res) => {
  try {
    const addon_id = req.body.addon_id;

    if (!addon_id || !isFinite(Number(addon_id))) {
      return res.status(400).json({
        result: false,
        msg: "Valid addon_id required",
      });
    }

    const numericAddonId = Number(addon_id);

    const existing = await adminService.getAddonById(numericAddonId);

    if (!existing) {
      return res.status(404).json({
        result: false,
        msg: "Addon not found or already deleted (id: " + numericAddonId + ")",
      });
    }

    try {
      await adminService.deleteAddon(numericAddonId);
    } catch (error) {
      return res.status(500).json({
        result: false,
        msg: "Delete error: " + error.message,
      });
    }

    const check = await adminService.getAddonById(numericAddonId);

    if (!check) {
      return res.status(200).json({
        result: true,
        msg: "Addon deleted successfully",
      });
    }

    return res.status(400).json({
      result: false,
      msg: "Delete failed - row still exists after delete query",
    });
  } catch (error) {
    console.error("Delete addon error:", error);

    return res.status(500).json({
      result: false,
      msg: "Delete failed",
    });
  }
};

// -----------------------------------------
// RESTAURANT-DRIVER SECTION
// -----------------------------------------

// GET DRIVERS
const getDrivers = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";

    const result = await adminService.getDrivers(search);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get restaurant drivers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch drivers. Please try again.",
    });
  }
};

// TOGGLE DRIVER STATUS
const toggleDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.toggleDriverStatus(id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Driver toggle status error:", error);

    return res.status(500).json({
      success: false,
      message: "Database update failed",
    });
  }
};

// GET DRIVER DETAILS
const getDriverDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.getDriverDetails(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get driver details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch driver details",
    });
  }
};

// DELETE DRIVER
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteDriver(id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete driver!",
    });
  }
};

// BULK DELETE DRIVERS
const bulkDeleteDrivers = async (req, res) => {
  try {
    const driverIds = req.body.driver_ids;

    const result = await adminService.bulkDeleteDrivers(driverIds);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Bulk delete drivers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete drivers!",
    });
  }
};

// GET DRIVER FOR EDIT
const getDriverForEdit = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await adminService.getDriverById(id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error("Get driver for edit error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch driver",
    });
  }
};

// UPDATE DRIVER
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.updateDriver({
      driverId: id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      country_code: req.body.country_code,
      phone: req.body.phone,
      full_phone: req.body.full_phone,
      identity_type: req.body.identity_type,
      identity_number: req.body.identity_number,
      remove_profile_image: req.body.remove_profile_image,
      remove_identity_image: req.body.remove_identity_image,
      profile_image: req.files?.profile_image?.[0]?.filename || "",
      identity_image: req.files?.identity_image?.[0]?.filename || "",
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("Update driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update driver.",
    });
  }
};

// SAVE DRIVER
const saveDriver = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({
        success: false,
        message: "Invalid request",
      });
    }

    const result = await adminService.saveDriver(req.body, req.files);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Save restaurant driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add driver. Please try again.",
    });
  }
};

// GET DRIVER ESTIMATE TIME LIST
const getDriverEstimateTimeList = async (req, res) => {
  const { search } = req.query;
  const page = Number(req.query.page) || 1;

  const data = await adminService.getDriverEstimateTimeList({
    search,
    page,
  });

  return res.status(200).json({
    success: true,
    data,
  });
};

// SAVE DRIVER ESTIMATE TIME
const saveDriverEstimateTime = async (req, res) => {
  try {
    const result = await adminService.saveDriverEstimateTime(req.body);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET DRIVER ESTIMATE TIME FOR EDIT
const getDriverEstimateTimeForEdit = async (req, res) => {
  try {
    const result = await adminService.getDriverEstimateTimeForEdit(
      req.params.id,
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE DRIVER ESTIMATE TIME
const updateDriverEstimateTime = async (req, res) => {
  try {
    const result = await adminService.updateDriverEstimateTime(
      req.params.id,
      req.body,
    );

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE DRIVER TIME STATUS
const updateDriverTimeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    const result = await adminService.updateDriverTimeStatus(id, status);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE DRIVER ESTIMATE TIME
const deleteDriverEstimateTime = async (req, res) => {
  try {
    const result = await adminService.deleteDriverEstimateTime(req.params.id);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// BULK DELETE DRIVER TIMES
const bulkDeleteDriverTimes = async (req, res) => {
  try {
    const result = await adminService.bulkDeleteDriverTimes(req.body.ids);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// RESTAURANT BANNER LIST
const restaurantBanner = async (req, res) => {
  try {
    const search = req.query.search;
    const perPage = req.query.per_page ? req.query.per_page : 0;

    const result = await adminService.getBannerList(search, perPage);

    res.json({
      status: "success",
      banners: result.banners,
      total: result.total,
      fatch_vendor: result.vendors,
    });
  } catch (error) {
    res.json({
      status: "error",
      message: error.message,
    });
  }
};

// ADD BANNER
const restaurantBannerSave = async (req, res) => {
  try {
    const title = req.body.title;
    const vendorId = req.body.vendor_id;
    const itemId = req.body.item_id;

    if (!title || !vendorId || !itemId) {
      return res.json({
        status: "error",
        message: "Validation failed",
      });
    }

    const imagePath = req.file ? req.file.filename : "";

    const banner = await adminService.saveBanner({
      title,
      vendor_id: vendorId,
      item_id: itemId,
      image: imagePath,
      status: 1,
      created_at: new Date(),
    });

    res.json({
      status: "success",
      message: "Banner added successfully",
      banner,
    });
  } catch (error) {
    res.json({
      status: "error",
      message: "Failed to add banner",
    });
  }
};

// GET SINGLE BANNER
const restaurantBannerList = async (req, res) => {
  try {
    const banner = await adminService.getBanner(req.params.id);

    if (banner) {
      return res.json({
        status: "success",
        data: banner,
      });
    }

    res.json({
      status: "error",
      message: "Banner not found",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: error.message,
    });
  }
};

// DELETE BANNER
const restaurantBannerDelete = async (req, res) => {
  try {
    const result = await adminService.removeBanner(req.params.id);

    if (!result.found) {
      return res.json({
        status: "error",
        message: "Banner not found",
      });
    }

    if (result.banner.image) {
      const imagePath = path.join(
        __dirname,
        "../assets/images",
        result.banner.image,
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (result.deleted) {
      return res.json({
        status: "success",
        message: "Banner deleted successfully",
      });
    }

    res.json({
      status: "error",
      message: "Failed to delete banner",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: "Failed to delete banner",
    });
  }
};

// UPDATE BANNER STATUS
const restaurantBannerUpdateStatus = async (req, res) => {
  try {
    const bannerId = req.body.banner_id;
    const status = req.body.status;

    const result = await adminService.changeBannerStatus(bannerId, status);

    if (result.affectedRows > 0) {
      const message =
        status == 1
          ? "Banner activated successfully"
          : "Banner deactivated successfully";

      return res.json({
        status: "success",
        message,
      });
    }

    res.json({
      status: "error",
      message: "Failed to update status",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: "Failed to update status",
    });
  }
};

// UPDATE BANNER
const restaurantBannerUpdate = async (req, res) => {
  try {
    const bannerId = req.body.banner_id;
    const title = req.body.title;
    const vendorId = req.body.vendor_id;
    const itemId = req.body.item_id;

    if (!bannerId || !title || !vendorId || !itemId) {
      return res.json({
        status: "error",
        message: "Validation failed",
      });
    }

    const existing = await adminService.getBanner(bannerId);

    if (!existing) {
      return res.json({
        status: "error",
        message: "Banner not found",
      });
    }

    let imagePath = existing.image;

    if (req.file) {
      imagePath = req.file.filename;
    }

    const result = await adminService.editBanner(bannerId, {
      title,
      vendor_id: vendorId,
      item_id: itemId,
      image: imagePath,
      updated_at: new Date(),
    });

    if (result.updated) {
      return res.json({
        status: "success",
        message: "Banner updated successfully",
      });
    }

    res.json({
      status: "error",
      message: "Failed to update banner",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: "Failed to update banner",
    });
  }
};

// GET RESTAURANT ITEMS
const getRestaurantItems = async (req, res) => {
  try {
    const vendorId = req.params.vendor_id;

    if (!vendorId || isNaN(vendorId)) {
      return res.json({
        status: "error",
        message: "Invalid vendor id",
        data: [],
      });
    }

    const items = await adminService.getItemsByVendor(vendorId);

    res.json({
      status: "success",
      data: items,
    });
  } catch (error) {
    res.json({
      status: "error",
      message: error.message,
    });
  }
};

// GET UNREAD NOTIFICATIONS
const getUnreadNotifications = async (req, res) => {
  try {
    const data = await adminService.getUnreadNotifications();

    res.json(data);
  } catch (error) {
    console.error("Get unread notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET UNREAD NOTIFICATION COUNT
const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await adminService.getUnreadNotificationCount();

    return res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error getting unread notification count:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// MARK ALL NOTIFICATIONS AS READ
const markAllAsRead = async (req, res) => {
  try {
    const data = await adminService.markAllAsRead();

    res.json(data);
  } catch (error) {
    console.error("Mark notifications as read error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET RESTAURANT NOTIFICATIONS
const getRestaurantNotifications = async (req, res) => {
  try {
    const notifications = await adminService.getRestaurantNotifications();

    res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get restaurant notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// BULK DELETE NOTIFICATIONS
const bulkDeleteNotifications = async (req, res) => {
  try {
    const ids = req.body.ids;

    const data = await adminService.bulkDeleteNotifications(ids);

    res.json(data);
  } catch (error) {
    console.error("Bulk delete notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// OPEN RESTAURANT NOTIFICATION
const openRestaurantNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await adminService.openRestaurantNotification(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (!data.booked_id) {
      return res.status(404).json({
        success: false,
        message: "Booking ID not found",
      });
    }

    res.json({
      success: true,
      notification: data.notification,
      booked_id: data.booked_id,
    });
  } catch (error) {
    console.error("Open restaurant notification error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET RESTAURANT NOTIFICATION TRANSACTION
const getRestaurantNotificationTransaction = async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!booking_id) {
      return res.status(404).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const order =
      await adminService.getRestaurantNotificationTransaction(booking_id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get restaurant notification transaction error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GENERATE RESTAURANT INVOICE
const generateRestaurantInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { vendor_id } = req.query;

    if (!orderId || !vendor_id) {
      return res.status(400).json({
        success: false,
        message: "Parameters orderId and vendor_id are required",
      });
    }

    const result = await adminService.getInvoiceData(orderId, vendor_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No order found for given orderId / vendor_id",
      });
    }

    const pdf = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `inline; filename="BHIVE INVOICE-${result.id}.pdf"`,
    );

    pdf.on("error", (error) => {
      console.error("Invoice PDF stream error:", error);

      if (!res.headersSent) {
        res.status(500).end("Unable to generate invoice PDF");
      } else {
        res.destroy(error);
      }
    });

    pdf.pipe(res);

    // DRAW INVOICE UI FROM TEMPLATE
    drawRestaurantInvoice(pdf, result);

    // ADD PAGE NUMBERS
    addInvoicePageNumbers(pdf);

    pdf.end();
  } catch (error) {
    console.error("Error generating restaurant invoice:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.destroy(error);
  }
};

// Get restaurant category list
const getRestaurantCategories = async (req, res) => {
  try {
    const categories = await adminService.getRestaurantCategories();

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching restaurant categories:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant categories",
    });
  }
};

// UPDATE RESTAURANT CATEGORY
const updateRestaurantCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.updateRestaurantCategory(
      id,
      req.body,
      req.file,
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: result,
    });
  } catch (error) {
    console.error("Error updating restaurant category:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update restaurant category",
    });
  }
};

// UPDATE RESTAURANT CATEGORY STATUS
const updateRestaurantCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await adminService.updateRestaurantCategoryStatus(id, status);

    return res.status(200).json({
      success: true,
      message: "Category status updated successfully",
    });
  } catch (error) {
    console.error("Error updating restaurant category status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category status",
    });
  }
};

//GET RESTAURANT SUB CATEGORY LIST
const getRestaurantSubCategories = async (req, res) => {
  try {
    const subcategories = await adminService.getRestaurantSubCategories();

    return res.status(200).json({
      success: true,
      subcategories,
    });
  } catch (error) {
    console.error("Error fetching restaurant subcategories:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant subcategories",
    });
  }
};

//CHANGE RESTAURANT SUB CATEGORY STATUS
const changeRestaurantSubCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    await adminService.changeRestaurantSubCategoryStatus(id);

    return res.status(200).json({
      success: true,
      message: "Status Changed Successfully",
    });
  } catch (error) {
    console.error("Error changing restaurant subcategory status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change subcategory status",
    });
  }
};

//UPDATE RESTAURANT SUB CATEGORY
const updateRestaurantSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.updateRestaurantSubCategory(
      id,
      req.body,
      req.file,
    );

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Updated Successfully",
      subCategory: result.subCategory,
    });
  } catch (error) {
    console.error("Error updating restaurant subcategory:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const deleteRestaurantSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await adminService.deleteRestaurantSubCategory(id);

    return res.status(200).json({
      success: true,
      message: "Sub Category Deleted Successfully",
    });
  } catch (error) {
    console.error("Error deleting restaurant subcategory:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete subcategory",
    });
  }
};

const deleteSelectedRestaurantSubCategories = async (req, res) => {
  try {
    const { sub_cat_id } = req.body;

    const result =
      await adminService.deleteSelectedRestaurantSubCategories(sub_cat_id);

    return res.status(200).json({
      success: true,
      message: "Selected Sub Categories Deleted Successfully",
      receivedIds: sub_cat_id,
      affectedRows: result?.affectedRows || 0,
    });
  } catch (error) {
    console.error("Error deleting selected restaurant subcategories:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete selected subcategories",
    });
  }
};

const addRestaurantSubCategory = async (req, res) => {
  try {
    const result = await adminService.addRestaurantSubCategory(
      req.body,
      req.file,
    );

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Sub Category Added Successfully",
    });
  } catch (error) {
    console.error("Error adding restaurant subcategory:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add restaurant subcategory",
    });
  }
};

// -----------------------------------------
// GET RESTAURANT STORE KEYWORDS
// -----------------------------------------

const getRestaurantStoreKeywords = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await adminService.getRestaurantStoreById(id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const categoryKeywords =
      await adminService.getRestaurantKeywordsByCategory();

    const vendorKeywordIds =
      await adminService.getRestaurantVendorKeywordIds(id);

    res.status(200).json({
      success: true,
      categoryKeywords,
      vendorKeywordIds,
    });
  } catch (error) {
    console.error("Get Restaurant Store Keywords Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SAVE RESTAURANT VENDOR KEYWORDS
const saveRestaurantVendorKeywords = async (req, res) => {
  try {
    const vendorId = req.body.vendor_id;
    const keywordIds = req.body.keyword_ids;

    if (!vendorId) {
      return res.status(200).json({
        status: 0,
        message: "Vendor ID missing.",
      });
    }

    const result = await adminService.saveRestaurantVendorKeywords(
      vendorId,
      keywordIds,
    );

    if (result) {
      return res.status(200).json({
        status: 1,
        message: "Keywords updated successfully.",
      });
    }

    return res.status(200).json({
      status: 0,
      message: "Something went wrong.",
    });
  } catch (error) {
    console.error("Save Restaurant Vendor Keywords Error:", error);

    res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};

module.exports = {
  login,

  //SERVICE SIDE
  //sub admin management
  getSubAdmins,
  changeSubAdminStatus,
  saveSubAdmin,
  getSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  getRoles,
  addRole,
  updateRoleStatus,
  updateRole,
  deleteRole,

  //vendor management
  getVendors,
  getVendorCategories,
  getVendorCities,
  createVendor,
  uploadVendorDocuments,
  changeKycStatus,
  deleteVendor,
  deleteSelectedVendors,
  getVendorById,
  getAllCities,
  getServiceVendorShopDetails,
  getServiceVendorAddresses,
  saveServiceVendorAddress,
  deleteServiceVendorAddress,
  updateServiceVendorDetails,
  getServiceVendorKeywords,
  saveServiceVendorKeywords,

  getVendorRadius,
  saveVendorRadius,

  //user management
  getUsers,
  addWalletAmount,
  deleteCustomer,
  deleteSelectedUsers,
  getUserPageDetails,
  updateUserPageDetails,
  updateUserAddress,
  deleteUserAddress,

  // expert Management
  getExperts,
  saveNewExpert,
  getExpertFormData,
  getExpertDetails,
  updateExpertBasisDetailController,

  //app review management
  getAppReviews,
  markAppReviewAsTestimonial,
  removeAppReviewTestimonial,
  deleteAppReview,

  //category management
  getCategories,
  updateCategoryOrder,
  updateCategoryStatus,
  getCategoryById,
  updateCategory,
  deleteCategory,
  deleteSelectedCategories,
  importCategories,
  addCategory,

  // keywords
  getCategoryKeywordList,
  addCategoryKeywords,
  importCategoryKeywords,
  deleteCategoryKeyword,
  deleteCategoryKeywordsByCategory,

  getSubCategories,
  updateSubCategoryOrder,
  addSubCategory,
  getSubCategoryEditData,
  updateSubCategory,
  deleteSubCategory,
  deleteSelectedSubCategories,
  changeSubCategoryStatus,

  // Vendor image slider management
  getAllVendorImages,
  getVendorImageFormData,
  getVendorImageById,
  addVendorImage,
  updateVendorImage,
  deleteVendorImage,
  deleteSelectedVendorImages,

  //city management
  importServiceSideCities,
  getServiceSideCities,
  getServiceSideCityById,
  addServiceSideCity,
  updateServiceSideCity,
  deleteServiceSideCity,
  deleteSelectedServiceSideCities,

  //RESTAURANT SIDE
  //dashboard
  getDashboardData,
  getOrderStats,
  getSalesChartData,
  //store management
  getPendingStores,
  getAddStoreCities,
  addStore,
  getRestaurantStores,
  getStoreById,
  searchStores,
  updateStore,
  toggleStoreStatus,
  deleteStore,
  bulkDeleteStores,
  getStoreListCities,
  getStoreOrders,
  getStoreOrderSummary,
  getOrderDetails,
  getStoreItems,
  getStoreItemsSummary,
  updateStoreItemStatus,
  getAllRestaurantOrders,
  getNearbyKm,
  updateNearbyKm,

  //Keywords restaurant
  getRestaurantStoreKeywords,
  saveRestaurantVendorKeywords,

  //category management restaurant
  getRestaurantCategories,
  updateRestaurantCategory,
  updateRestaurantCategoryStatus,
  getRestaurantSubCategories,
  changeRestaurantSubCategoryStatus,
  updateRestaurantSubCategory,
  deleteRestaurantSubCategory,
  deleteSelectedRestaurantSubCategories,
  addRestaurantSubCategory,

  //coupon management
  getAllCoupons,
  updateCouponStatus,
  getCouponById,
  getCategoriesByIds,
  getVendorsByIds,
  getProductsByIds,
  deleteCoupon,
  deleteSelectedCoupons,
  getCouponEditData,
  getVendorsByCategory,
  getAddCouponData,
  addCoupon,
  getProductsByVendorIds,
  updateCoupon,

  //product management
  getAllMenus,
  getAddRestaurantItemData,
  createMenu,
  getMenuById,
  updateMenu,
  deleteMenu,
  bulkDeleteMenus,
  updateMenuStatus,

  getAllRestaurantItems,
  getRestaurantItemById,
  updateRestaurantItemStatus,
  deleteRestaurantItem,
  bulkDeleteRestaurantItems,
  createRestaurantItem,

  saveAddonGroup,
  getItemAddons,
  deleteAddonGroup,
  getEditRestaurantItemData,
  updateRestaurantItem,
  updateAddon,
  deleteAddon,

  //driver section
  getDrivers,
  toggleDriverStatus,
  getDriverDetails,
  getDriverForEdit,
  updateDriver,
  deleteDriver,
  bulkDeleteDrivers,
  saveDriver,
  getDriverEstimateTimeList,
  saveDriverEstimateTime,
  getDriverEstimateTimeForEdit,
  updateDriverEstimateTime,
  updateDriverTimeStatus,
  deleteDriverEstimateTime,
  bulkDeleteDriverTimes,

  restaurantBanner,
  restaurantBannerSave,
  restaurantBannerList,
  restaurantBannerDelete,
  restaurantBannerUpdateStatus,
  restaurantBannerUpdate,
  getRestaurantItems,

  getUnreadNotifications,
  getUnreadNotificationCount,
  markAllAsRead,
  getRestaurantNotifications,
  bulkDeleteNotifications,
  openRestaurantNotification,
  getRestaurantNotificationTransaction,

  generateRestaurantInvoice,
};
