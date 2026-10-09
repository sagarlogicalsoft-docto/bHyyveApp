import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../../config/api";

import "./login.css";

import logo from "../../assest/bHyyve.jpg";

// =========================================================
// LOGIN COMPONENT
// =========================================================

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // =======================================================
  // LOAD REMEMBERED CREDENTIALS
  // =======================================================

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const savedRememberMe = localStorage.getItem("rememberMe");

    if (savedRememberMe === "true") {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail || "",
        password: savedPassword || "",
        rememberMe: true,
      }));
    }
  }, []);

  // =======================================================
  // HANDLE INPUT CHANGE
  // =======================================================

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    if (name === "rememberMe") {
      if (!checked) {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
        localStorage.removeItem("rememberMe");
      } else {
        localStorage.setItem("rememberMe", "true");

        if (formData.email) {
          localStorage.setItem("rememberedEmail", formData.email);
        }

        if (formData.password) {
          localStorage.setItem("rememberedPassword", formData.password);
        }
      }

      setFormData((prev) => ({
        ...prev,
        rememberMe: checked,
      }));

      return;
    }

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      if (prev.rememberMe) {
        if (name === "email") {
          localStorage.setItem("rememberedEmail", value);
        }

        if (name === "password") {
          localStorage.setItem("rememberedPassword", value);
        }

        localStorage.setItem("rememberMe", "true");
      }

      return updatedData;
    });
  };

  // =======================================================
  // HANDLE LOGIN
  // =======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/admin/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Login Successful");

        // =================================================
        // STORE JWT TOKEN
        // =================================================

        localStorage.setItem("token", response.data.token);

        // =================================================
        // STORE ADMIN USER
        // =================================================

        localStorage.setItem("user", JSON.stringify(response.data.user));

        // =================================================
        // REMEMBER ME
        // =================================================

        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
          localStorage.setItem("rememberedPassword", formData.password);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
          localStorage.removeItem("rememberMe");
        }

        // =================================================
        // REDIRECT
        // =================================================

        setTimeout(() => {
          navigate("/home");
        }, 1200);
      }
    } catch (error) {
      console.error("Login error:", error);

      toast.error(error.response?.data?.message || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      {/* Background */}

      <div
        className="position-fixed top-0 start-0 end-0 bg-img-hero"
        style={{
          backgroundImage:
            "url(https://6valley.6amtech.com/public/assets/admin/svg/components/abstract-bg-4.svg)",
          height: "32rem",
        }}
      >
        <figure className="position-absolute start-0 end-0 bottom-0 mb-0">
          <svg
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1921 273"
            width="100%"
          >
            <polygon fill="#fff" points="0,273 1921,273 1921,0" />
          </svg>
        </figure>
      </div>

      <div className="container py-10">
        {/* Logo */}

        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div
              className="card shadow border-0 auth-card"
              style={{ borderRadius: "12px" }}
            >
              <form onSubmit={handleSubmit}>
                <div className="card-body auth-card">
                  {/* Login Card Logo */}

                  <div className="login-card-logo">
                    <img src={logo} alt="bHyyve Logo" />
                  </div>

                  <p className="admin-login-title">(Admin Login)</p>

                  {/* Email */}

                  <div className="mb-3">
                    <label className="form-label">Email</label>

                    <input
                      type="email"
                      name="email"
                      className="form-control form-control-md"
                      placeholder="Enter Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Password */}

                  <div className="mb-4">
                    <label className="form-label">Password</label>

                    <div className="iconinput">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control form-control-md"
                        placeholder="Enter Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />

                      {showPassword ? (
                        <FaEyeSlash
                          className="eyeicon"
                          onClick={() => setShowPassword(false)}
                        />
                      ) : (
                        <FaEye
                          className="eyeicon"
                          onClick={() => setShowPassword(true)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Remember Me */}

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="form-check d-flex align-items-center">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="form-check-input remember-checkbox"
                        id="rememberMe"
                      />

                      <label
                        className="form-check-label ms-2 fw-bold text-secondary medium"
                        htmlFor="rememberMe"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>

                  {/* Login Button */}

                  <button
                    type="submit"
                    className="btn w-100 rounded-3 px-5 py-3 fw-semibold text-white login-btn d-block mx-auto text-center"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
