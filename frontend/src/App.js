import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Allproducts from "./Components/page/Allproducts";
import DashboardLayout from "./Components/DashboardLayout";
import SubAdminList from "./Components/page/subAdmin/SubAdminList";
import AddSubAdmin from "./Components/page/subAdmin/AddSubAdmin";
import Role from "./Components/page/subAdmin/Role";
import EditSubAdmin from "./Components/page/subAdmin/EditSubAdmin";
import VendorList from "./Components/page/vendor/VendorList";
import AddVendor from "./Components/page/vendor/AddVendor";
import NearbyVendor from "./Components/page/vendor/NearbyVendor";
import AllUsers from "./Components/page/userManagement/AllUsers";
import ViewDetails from "./Components/page/userManagement/ViewDetails";
import AddExpert from "./Components/page/expertManagement/AddExpert";
import ViewExpert from "./Components/page/expertManagement/ViewExpert";
import CategoryList from "./Components/page/categoryManagement/CategoryList";
import AddCategory from "./Components/page/categoryManagement/AddCategory";
import SubCategoryList from "./Components/page/categoryManagement/SubCategoryList";
import AddSubCategory from "./Components/page/categoryManagement/AddSubCategory";
import ManageSlider from "./Components/page/vendorImages/ManageSlider";
import AddImages from "./Components/page/vendorImages/AddImages";
import NewBooking from "./Components/page/booking/NewBooking";
import ViewNewBooking from "./Components/page/booking/ViewNewBooking";
import InprogressBooking from "./Components/page/booking/InprogressBooking";
import ViewInprogressBooking from "./Components/page/booking/ViewInprogressBooking";
import CompletedBookings from "./Components/page/booking/CompletedBookings";
import ViewCompletedBooking from "./Components/page/booking/ViewCompletedBooking";
import RejectedBookings from "./Components/page/booking/RejectedBookings";
import ViewRejectedBookings from "./Components/page/booking/ViewRejectedBookings";
import AiText from "./Components/page/ai_booking/AI_text";
import AllServices from "./Components/page/services/AllServices";
import AddServices from "./Components/page/services/AddServices";

import Home from "./Components/Home";
import Login from "./Components/page/auth/Login";
import Protect from "./Components/page/Protect";
import Test from "./Components/page/Test";
import Notification1 from "./Components/page/Notification1";

import AllEstimate from "./Components/page/estimate/AllEstimate";
import CreateEstimate from "./Components/page/estimate/CreateEstimate";
import ModeType from "./Components/page/estimate/ModeType";
import EstimateReceipt from "./Components/page/estimate/EstimateReceipt";
import NotificationList from "./Components/page/notification/NotificationList";
import NotificationView from "./Components/page/notification/NotificationView";
import AllTimeSlots from "./Components/page/time_slots/AllTimeSlots";
import AddTimeSlots from "./Components/page/time_slots/AddTimeSlots";
import UpdateTimeSlots from "./Components/page/time_slots/UpdateTimeSlots";
import AllRevenue from "./Components/page/revenue/AllRevenue";
import AddNewSlider from "./Components/page/homeSlider/AddNewSlider";
import ManageAllSliders from "./Components/page/homeSlider/ManageAllSliders";
import UserChat from "./Components/page/help_support/UserChat";
import VendorChat from "./Components/page/help_support/VendorChat";
import UserFeedback from "./Components/page/help_support/UserFeedback";
import AboutCompany from "./Components/page/help_support/AboutCompany";
import FAQ from "./Components/page/help_support/FAQ";
import ContactUs from "./Components/page/help_support/ContactUs";
import HelpCenter from "./Components/page/help_support/HelpCenter";
import DeliveryCharge from "./Components/page/help_support/DeliveryCharges";
import BonusGift from "./Components/page/help_support/BonusGift";
import Referral from "./Components/page/help_support/Referral";
import AddCoupon from "./Components/page/coupon/AddCoupon";
import ManageCoupon from "./Components/page/coupon/ManageCoupon";
import ClaimReason from "./Components/page/warranty/ClaimReason";
import WarrantyClaims from "./Components/page/warranty/WarrantyClaims";
import AddNewPackage from "./Components/page/advertisement/AddNewPackage";
import ManagePackage from "./Components/page/advertisement/ManagePackage";
import SubscriptionTransactions from "./Components/page/advertisement/SubscriptionTransactions";
import AddCities from "./Components/page/cities/AddCities";
import ManageCities from "./Components/page/cities/ManageCities";
import AppRatings from "./Components/page/reviews/AppRatings";
import MyProfile from "./Components/page/profile/MyProfile";
import AccountSetting from "./Components/page/profile/AccountSetting";
import Help from "./Components/page/profile/Help";
import Messages from "./Components/page/Messages";

import RestaurantRoutes from "./restaurant/routes/RestaurantRoutes";
import AddRole from "./Components/page/subAdmin/AddRole";
import VendorDetails from "./Components/page/vendor/VendorDetails";
import UploadDocuments from "./Components/page/vendor/UploadDocuments";
import VendorServices from "./Components/page/vendor/VendorServices";
import EditService from "./Components/page/services/EditService";
import ViewExpertDetails from "./Components/page/expertManagement/ViewExpertDetails";
import EditCategory from "./Components/page/categoryManagement/EditCategory";
import EditSubCategory from "./Components/page/categoryManagement/EditSubCategory";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<DashboardLayout />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/my_profile" element={<DashboardLayout />}>
          <Route index element={<MyProfile />} />
        </Route>
        <Route path="/account_settings" element={<DashboardLayout />}>
          <Route index element={<AccountSetting />} />
        </Route>
        <Route path="/help" element={<DashboardLayout />}>
          <Route index element={<Help />} />
        </Route>

        <Route path="/subadmin_list" element={<DashboardLayout />}>
          <Route index element={<SubAdminList />} />
        </Route>

        <Route path="/subadmin/add" element={<DashboardLayout />}>
          <Route index element={<AddSubAdmin />} />
        </Route>

        <Route path="/subadmin/role" element={<DashboardLayout />}>
          <Route index element={<Role />} />
        </Route>
        <Route path="/subadmin/add_role" element={<DashboardLayout />}>
          <Route index element={<AddRole />} />
        </Route>
        <Route path="/subadmin/edit/:id" element={<DashboardLayout />}>
          <Route index element={< EditSubAdmin />} />
        </Route>
        <Route path="/vendor_list" element={<DashboardLayout />}>
          <Route index element={<VendorList />} />
        </Route>
        <Route path="/vendor/add" element={<DashboardLayout />}>
          <Route index element={<AddVendor />} />
        </Route>
        <Route path="/nearby_vendor" element={<DashboardLayout />}>
          <Route index element={<NearbyVendor />} />
        </Route>
        <Route path="/vendor/view/:id" element={<DashboardLayout />}>
          <Route index element={<VendorDetails />} />
        </Route>
        <Route path="/vendor/services/:id" element={<DashboardLayout />}>
          <Route index element={< VendorServices />} />
        </Route>
        <Route path="/vendor/upload_documents/:id" element={<DashboardLayout />}>
          <Route index element={< UploadDocuments />} />
        </Route>
        <Route path="/users" element={<DashboardLayout />}>
          <Route index element={<AllUsers />} />
        </Route>
        <Route path="/users/view/:id" element={<DashboardLayout />}>
          <Route index element={<ViewDetails />} />
        </Route>
        <Route path="/add_new_expert" element={<DashboardLayout />}>
          <Route index element={<AddExpert />} />
        </Route>
        <Route path="/view_experts" element={<DashboardLayout />}>
          <Route index element={<ViewExpert />} />
        </Route>
        <Route path="/expert_details/:id" element={<DashboardLayout />}>
          <Route index element={<ViewExpertDetails />} />
        </Route>
        <Route path="/category_list" element={<DashboardLayout />}>
          <Route index element={<CategoryList />} />
        </Route>
        <Route path="/add_category" element={<DashboardLayout />}>
          <Route index element={<AddCategory />} />
        </Route>
        <Route path="/edit_category/:id" element={<DashboardLayout />}>
          <Route index element={< EditCategory />} />
        </Route>
        <Route path="/sub_category_list" element={<DashboardLayout />}>
          <Route index element={<SubCategoryList />} />
        </Route>
        <Route path="/add_sub_category" element={<DashboardLayout />}>
          <Route index element={< AddSubCategory />} />
        </Route>
        <Route path="/edit_sub_category/:id" element={<DashboardLayout />}>
          <Route index element={< EditSubCategory />} />
        </Route>
        <Route path="/add_vendor_images" element={<DashboardLayout />}>
          <Route index element={<AddImages />} />
        </Route>
        <Route path="/all_ven_images" element={<DashboardLayout />}>
          <Route index element={<ManageSlider />} />
        </Route>
        <Route path="/new_booking" element={<DashboardLayout />}>
          <Route index element={<NewBooking />} />
        </Route>
        <Route path="/new_booking/view/:id" element={<DashboardLayout />}>
          <Route index element={<ViewNewBooking />} />
        </Route>
        <Route path="/inprogress_bookings" element={<DashboardLayout />}>
          <Route index element={<InprogressBooking />} />
        </Route>
        <Route
          path="/inprogress_bookings/view/:id"
          element={<DashboardLayout />}
        >
          <Route index element={<ViewInprogressBooking />} />
        </Route>
        <Route path="/completed_bookings" element={<DashboardLayout />}>
          <Route index element={<CompletedBookings />} />
        </Route>
        <Route
          path="/completed_bookings/view/:id"
          element={<DashboardLayout />}
        >
          <Route index element={<ViewCompletedBooking />} />
        </Route>
        <Route path="/rejected_bookings" element={<DashboardLayout />}>
          <Route index element={<RejectedBookings />} />
        </Route>
        <Route path="/rejected_bookings/view/:id" element={<DashboardLayout />}>
          <Route index element={<ViewRejectedBookings />} />
        </Route>
        <Route path="/ai_text" element={<DashboardLayout />}>
          <Route index element={<AiText />} />
        </Route>
        <Route path="/services" element={<DashboardLayout />}>
          <Route index element={<AllServices />} />
        </Route>
        <Route path="/services/add" element={<DashboardLayout />}>
          <Route index element={<AddServices />} />
        </Route>
        <Route path="/services/edit/:id" element={<DashboardLayout />}>
          <Route index element={< EditService />} />
        </Route>
        <Route path="/estimates" element={<DashboardLayout />}>
          <Route index element={<AllEstimate />} />
        </Route>
        <Route path="/create_estimate" element={<DashboardLayout />}>
          <Route index element={<CreateEstimate />} />
        </Route>
        <Route path="/mode_type" element={<DashboardLayout />}>
          <Route index element={<ModeType />} />
        </Route>
        <Route path="/estimate_receipts" element={<DashboardLayout />}>
          <Route index element={<EstimateReceipt />} />
        </Route>
        <Route path="/notifications" element={<DashboardLayout />}>
          <Route index element={<NotificationList />} />
        </Route>
        <Route path="/notification/view/:id" element={<DashboardLayout />}>
          <Route index element={<NotificationView />} />
        </Route>
        <Route path="/time_slots" element={<DashboardLayout />}>
          <Route index element={<AllTimeSlots />} />
        </Route>
        <Route path="/time_slots/add" element={<DashboardLayout />}>
          <Route index element={<AddTimeSlots />} />
        </Route>
        <Route path="/time_slots/update/:id" element={<DashboardLayout />}>
          <Route index element={<UpdateTimeSlots />} />
        </Route>
        <Route path="/all_revenue" element={<DashboardLayout />}>
          <Route index element={<AllRevenue />} />
        </Route>
        <Route path="/add_new_slider" element={<DashboardLayout />}>
          <Route index element={<AddNewSlider />} />
        </Route>
        <Route path="/manage_sliders" element={<DashboardLayout />}>
          <Route index element={<ManageAllSliders />} />
        </Route>
        <Route path="/user_chats" element={<DashboardLayout />}>
          <Route index element={<UserChat />} />
        </Route>
        <Route path="/vendor_chats" element={<DashboardLayout />}>
          <Route index element={<VendorChat />} />
        </Route>
        <Route path="/user_feedback" element={<DashboardLayout />}>
          <Route index element={<UserFeedback />} />
        </Route>
        <Route path="/about_company" element={<DashboardLayout />}>
          <Route index element={<AboutCompany />} />
        </Route>
        <Route path="/faq" element={<DashboardLayout />}>
          <Route index element={<FAQ />} />
        </Route>
        <Route path="/contact_us" element={<DashboardLayout />}>
          <Route index element={<ContactUs />} />
        </Route>
        <Route path="/help_center" element={<DashboardLayout />}>
          <Route index element={<HelpCenter />} />
        </Route>
        <Route path="/delivery_charge" element={<DashboardLayout />}>
          <Route index element={<DeliveryCharge />} />
        </Route>
        <Route path="/bonus_gift" element={<DashboardLayout />}>
          <Route index element={<BonusGift />} />
        </Route>
        <Route path="/referral" element={<DashboardLayout />}>
          <Route index element={<Referral />} />
        </Route>
        <Route path="/add_coupon" element={<DashboardLayout />}>
          <Route index element={<AddCoupon />} />
        </Route>
        <Route path="/manage_coupons" element={<DashboardLayout />}>
          <Route index element={<ManageCoupon />} />
        </Route>
        <Route path="/claim_reason" element={<DashboardLayout />}>
          <Route index element={<ClaimReason />} />
        </Route>
        <Route path="/warranty_claims" element={<DashboardLayout />}>
          <Route index element={<WarrantyClaims />} />
        </Route>
        <Route path="/add_new_package" element={<DashboardLayout />}>
          <Route index element={<AddNewPackage />} />
        </Route>
        <Route path="/manage_packages" element={<DashboardLayout />}>
          <Route index element={<ManagePackage />} />
        </Route>
        <Route path="/subscription_transactions" element={<DashboardLayout />}>
          <Route index element={<SubscriptionTransactions />} />
        </Route>
        <Route path="/add_new_city" element={<DashboardLayout />}>
          <Route index element={<AddCities />} />
        </Route>
        <Route path="/manage_cities" element={<DashboardLayout />}>
          <Route index element={<ManageCities />} />
        </Route>
        <Route path="/app_reviews" element={<DashboardLayout />}>
          <Route index element={<AppRatings />} />
        </Route>
        <Route path="/notification_1" element={<DashboardLayout />}>
          <Route index element={<Notification1 />} />
        </Route>
        <Route path="/messages" element={<DashboardLayout />}>
          <Route index element={<Messages />} />
        </Route>

        <Route
          path="/allorder"
          element={<Protect ComponentName={Allproducts} />}
        ></Route>

        <Route path="/test" element={<Protect ComponentName={Test} />}></Route>

        {/* RESTAURANT ROUTES */}
        <Route path="/*" 
               element={<RestaurantRoutes />} 
        />
        
      </Routes>
    </div>
  );
}

export default App;
