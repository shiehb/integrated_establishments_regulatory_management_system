// SystemConfiguration.jsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import Notification from "../components/Notification";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import { Mail, Clock, Save, TestTube, Eye, EyeOff, X } from "lucide-react";
import api, { getProfile } from "../services/api";

const MASKED = "••••••••";

const SystemConfiguration = () => {
  const [initialConfig, setInitialConfig] = useState({
    email_host: "smtp.gmail.com",
    email_port: 587,
    email_use_tls: true,
    email_host_user: "",
    email_host_password: "",
    default_from_email: "",
    access_token_lifetime_minutes: 60,
    refresh_token_lifetime_days: 1,
    rotate_refresh_tokens: true,
    blacklist_after_rotation: true,
  });

  const [config, setConfig] = useState({ ...initialConfig });

  // --- NEW userLevel & loading ---
  const [userLevel, setUserLevel] = useState("public");
  const [loadingUser, setLoadingUser] = useState(true);

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailPasswordMasked, setEmailPasswordMasked] = useState(false);

  const [testEmail, setTestEmail] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = localStorage.getItem("access");
        if (!accessToken) {
          setUserLevel("public");
          setLoadingUser(false);
          return;
        }

        const profile = await getProfile();
        const level = profile.userlevel || "public";
        setUserLevel(level);
        localStorage.setItem("userLevel", level);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        const fallbackLevel = localStorage.getItem("userLevel") || "public";
        setUserLevel(fallbackLevel);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  // Add beforeunload event listener for page navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const fetchConfiguration = async () => {
    try {
      setLoadingConfig(true);
      const response = await api.get("system/config/");
      const data = response.data;

      let emailPassword = data.email_host_password ?? "";
      let masked = false;
      if (emailPassword === MASKED) {
        emailPassword = "";
        masked = true;
      }

      const newConfig = {
        ...initialConfig,
        ...data,
        email_host_password: emailPassword,
      };

      setInitialConfig(newConfig);
      setConfig(newConfig);
      setEmailPasswordMasked(masked);
      setTestEmail(data.email_host_user || "");
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error fetching configuration:", error);
      showMessage("Failed to load configuration", "error");
    } finally {
      setLoadingConfig(false);
    }
  };

  // Check for changes whenever config changes
  useEffect(() => {
    const hasChanges = JSON.stringify(config) !== JSON.stringify(initialConfig);
    setHasUnsavedChanges(hasChanges);
  }, [config, initialConfig]);

  const showMessage = (msg, type = "success") => {
    setNotification({ open: true, type, message: msg });
  };

  const handleInputChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "email_host_password") {
      setEmailPasswordMasked(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { ...config };

      if (emailPasswordMasked && !payload.email_host_password) {
        delete payload.email_host_password;
      }
      if (payload.email_host_password === MASKED) {
        delete payload.email_host_password;
      }

      const response = await api.put("system/config/update/", payload);
      showMessage("Configuration saved successfully!", "success");

      if (response.data.configuration) {
        const returned = { ...response.data.configuration };
        if (returned.email_host_password === MASKED) {
          returned.email_host_password = "";
          setEmailPasswordMasked(true);
        } else {
          setEmailPasswordMasked(false);
        }

        setInitialConfig(returned);
        setConfig(returned);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      const errorMsg =
        error.response?.data?.error || "Failed to save configuration";
      showMessage(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      resetToInitial();
    }
  };

  const resetToInitial = () => {
    setConfig({ ...initialConfig });
    setHasUnsavedChanges(false);
    setShowCancelConfirm(false);
    showMessage("Changes discarded", "info");
  };

  const handleOpenConfirm = () => setConfirmOpen(true);
  const handleCancelConfirm = () => setConfirmOpen(false);
  const handleConfirm = async () => {
    setConfirmOpen(false);
    await handleSave();
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      showMessage("Please enter a test email address", "error");
      return;
    }

    try {
      setTesting(true);
      const response = await api.post("system/config/test-email/", {
        test_email: testEmail,
      });
      showMessage(response.data.message, "success");
    } catch (error) {
      console.error("Error testing email:", error);
      const errorMsg = error.response?.data?.error || "Email test failed";
      showMessage(errorMsg, "error");
    } finally {
      setTesting(false);
    }
  };

  // --- Combined Loading State ---
  if (loadingUser || loadingConfig) {
    return (
      <>
        <Header userLevel={userLevel} />
        <LayoutWithSidebar userLevel={userLevel}>
          <div
            className="flex flex-col items-center justify-center min-h-[200px] p-4"
            role="status"
            aria-live="polite"
          >
            <div className="w-8 h-8 mb-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">
              Loading system configuration...
            </p>
          </div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header userLevel={userLevel} />
      <LayoutWithSidebar userLevel={userLevel}>
        <div className="p-4 bg-white h-[calc(100vh-165px)]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="flex items-center text-2xl font-bold text-sky-600">
                System Configuration
                {hasUnsavedChanges && (
                  <span className="px-2 py-1 ml-2 text-xs rounded-full bg-amber-100 text-amber-800">
                    Unsaved Changes
                  </span>
                )}
              </h1>
              <p className="mt-1 text-gray-600">
                Manage email settings and access token configurations
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              {hasUnsavedChanges && (
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center px-3 py-1 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  <X className="mr-2" size={16} />
                  Cancel
                </button>
              )}
              <button
                onClick={handleOpenConfirm}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center px-3 py-1 text-white rounded-md bg-sky-600 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              >
                <Save className="mr-2" size={16} />
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>

          {notification.open && (
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification({ ...notification, open: false })}
              duration={5000}
            />
          )}

          {/* Save Confirmation Dialog */}
          <ConfirmationDialog
            open={confirmOpen}
            title="Save Configuration"
            message="Are you sure you want to apply these configuration changes?"
            loading={saving}
            onCancel={handleCancelConfirm}
            onConfirm={handleConfirm}
            confirmText="Save"
            cancelText="Cancel"
          />

          {/* Cancel Confirmation Dialog */}
          <ConfirmationDialog
            open={showCancelConfirm}
            title="Discard Changes"
            message="You have unsaved changes. Are you sure you want to discard them?"
            loading={false}
            onCancel={() => setShowCancelConfirm(false)}
            onConfirm={resetToInitial}
            confirmText="Discard Changes"
            cancelText="Continue Editing"
            confirmVariant="danger"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Email Configuration (Left: span 2) */}
            <div className="p-6 bg-white rounded shadow md:col-span-2 ">
              <div className="flex items-center mb-4">
                <Mail className="mr-2 text-sky-700" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Email Configuration
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={config.email_host}
                    onChange={(e) =>
                      handleInputChange("email_host", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={config.email_port}
                    onChange={(e) =>
                      handleInputChange("email_port", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    min="1"
                    max="65535"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email Username
                  </label>
                  <input
                    type="email"
                    value={config.email_host_user}
                    onChange={(e) =>
                      handleInputChange("email_host_user", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email Password
                  </label>
                  <div className="relative">
                    <input
                      type={showEmailPassword ? "text" : "password"}
                      value={config.email_host_password}
                      onChange={(e) =>
                        handleInputChange("email_host_password", e.target.value)
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder={emailPasswordMasked ? MASKED : "••••••••"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute text-gray-500 transform -translate-y-1/2 right-2 top-1/2 hover:text-gray-700"
                    >
                      {showEmailPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {emailPasswordMasked && (
                    <p className="mt-1 text-sm text-gray-500">
                      Password is masked — type a new password to change it.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Default From Email
                  </label>
                  <input
                    type="text"
                    value={config.default_from_email}
                    onChange={(e) =>
                      handleInputChange("default_from_email", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="noreply@ or user@domain.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You can use "noreply@" (without domain) or a complete email address. If using "noreply@", the system will use your email host user domain.
                  </p>
                  {config.constructed_from_email && config.constructed_from_email !== config.default_from_email && (
                    <p className="mt-1 text-xs text-blue-600 font-medium">
                      Final email address: {config.constructed_from_email}
                    </p>
                  )}
                  {config.email_host_user && config.email_host_user.includes('gmail.com') && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-xs text-yellow-800">
                        <strong>Gmail Limitation:</strong> Gmail only allows sending emails from verified addresses. 
                        If you want to use "noreply@gmail.com", you need to add it as an alias in your Gmail account, 
                        or use a different email service that supports custom sender addresses.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="email_use_tls"
                    checked={config.email_use_tls}
                    onChange={(e) =>
                      handleInputChange("email_use_tls", e.target.checked)
                    }
                    className="w-4 h-4 mt-1 border-gray-300 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <label
                    htmlFor="email_use_tls"
                    className="block text-sm text-gray-700"
                  >
                    Use TLS
                    <p className="mt-1 text-xs text-gray-500">
                      Transport Layer Security (TLS) encrypts email
                      communication between your server and the mail provider.
                      <span className="font-medium text-gray-600">
                        Recommended: Keep enabled in production for security.
                      </span>
                    </p>
                  </label>
                </div>
              </div>

              {/* Email Test Section */}
              <div className="pt-4 mt-6 border-t border-gray-200">
                <h3 className="mb-3 font-medium text-gray-900 text-md">
                  Test Email Configuration
                </h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter email address to test"
                  />
                  <button
                    onClick={handleTestEmail}
                    disabled={testing}
                    className="flex items-center px-2 py-1 text-white rounded-md bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <TestTube className="mr-1" size={16} />
                    {testing ? "Testing..." : "Test Email"}
                  </button>
                </div>
              </div>
            </div>

            {/* Access Token Configuration (Right column) */}
            <div className="p-6 bg-white rounded shadow">
              <div className="flex items-center mb-4">
                <Clock className="mr-2 text-sky-700" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Access Token Configuration
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Access Token Lifetime (minutes)
                  </label>
                  <input
                    type="number"
                    value={config.access_token_lifetime_minutes}
                    onChange={(e) =>
                      handleInputChange(
                        "access_token_lifetime_minutes",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    min="5"
                    max="1440"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    How long access tokens remain valid (5-1440 minutes)
                  </p>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Refresh Token Lifetime (days)
                  </label>
                  <input
                    type="number"
                    value={config.refresh_token_lifetime_days}
                    onChange={(e) =>
                      handleInputChange(
                        "refresh_token_lifetime_days",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    min="1"
                    max="365"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    How long refresh tokens remain valid (1-365 days)
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rotate_refresh_tokens"
                    checked={config.rotate_refresh_tokens}
                    onChange={(e) =>
                      handleInputChange(
                        "rotate_refresh_tokens",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 border-gray-300 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <label
                    htmlFor="rotate_refresh_tokens"
                    className="block ml-2 text-sm text-gray-700"
                  >
                    Rotate Refresh Tokens
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="blacklist_after_rotation"
                    checked={config.blacklist_after_rotation}
                    onChange={(e) =>
                      handleInputChange(
                        "blacklist_after_rotation",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 border-gray-300 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <label
                    htmlFor="blacklist_after_rotation"
                    className="block ml-2 text-sm text-gray-700"
                  >
                    Blacklist After Rotation
                  </label>
                </div>
              </div>

              {/* Password Generation Info */}
              <div className="pt-4 mt-6 border-t border-gray-200">
                <h3 className="mb-2 font-medium text-gray-900 text-md">
                  Password Information
                </h3>
                <p className="text-sm text-gray-600">
                  New user passwords are automatically generated as secure
                  8-character passwords containing uppercase, lowercase, and
                  numbers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
};

export default SystemConfiguration;
