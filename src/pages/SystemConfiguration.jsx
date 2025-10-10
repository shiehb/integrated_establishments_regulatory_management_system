// SystemConfiguration.jsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import { Mail, Clock, Save, TestTube, Eye, EyeOff, X } from "lucide-react";
import api, { getProfile } from "../services/api";
import { useNotifications } from "../components/NotificationManager";

const MASKED = "••••••••";

const SystemConfiguration = () => {
  const [initialConfig, setInitialConfig] = useState({
    email_host: "smtp.gmail.com",
    email_port: 587,
    email_use_tls: true,
    email_host_user: "",
    email_host_password: "",
    default_from_email: "",
    email_from_name: "",
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
  const notifications = useNotifications();

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (type === "success") {
      notifications.success(msg, {
        title: "Configuration Updated",
        duration: 4000
      });
    } else if (type === "error") {
      notifications.error(msg, {
        title: "Configuration Error",
        duration: 6000
      });
    } else {
      notifications.info(msg, {
        title: "Configuration Info",
        duration: 4000
      });
    }
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
        <div className="p-4 bg-white overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-sky-600">
              System Configuration
            </h1>
            <div className="flex gap-3">
              {hasUnsavedChanges && (
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <X className="mr-2" size={16} />
                  Cancel
                </button>
              )}
              <button
                onClick={handleOpenConfirm}
                disabled={saving || !hasUnsavedChanges}
                className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
              >
                <Save className="mr-2" size={16} />
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
          
          {/* Status indicator */}
          {hasUnsavedChanges && (
            <div className="mb-8">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                <div className="w-2 h-2 mr-2 bg-amber-500 rounded-full animate-pulse"></div>
                Unsaved Changes
              </span>
            </div>
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

          {/* Main Configuration Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Email Configuration Section */}
            <div className="xl:col-span-2">
              <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow">
                <h2 className="mb-2 text-lg font-semibold text-sky-600">
                  Email Configuration
                </h2>
                <div className="flex-1 space-y-6">

                  {/* Email Configuration Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* SMTP Host */}
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    {/* SMTP Port */}
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        min="1"
                        max="65535"
                      />
                    </div>

                    {/* Email Username */}
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="your-email@gmail.com"
                      />
                    </div>

                    {/* Email Password */}
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
                          className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          placeholder={emailPasswordMasked ? MASKED : "••••••••"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmailPassword(!showEmailPassword)}
                          className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                        >
                          {showEmailPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      {emailPasswordMasked && (
                        <p className="mt-1 text-xs text-gray-500">
                          Password is masked — type a new password to change it.
                        </p>
                      )}
                    </div>

                    {/* Default From Email */}
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="noreply@ or user@domain.com"
                      />
                      {config.email_host_user && config.email_host_user.includes('gmail.com') && (
                        <p className="mt-1 text-xs text-yellow-600">
                          Gmail requires verified sender addresses
                        </p>
                      )}
                    </div>

                    {/* Email Sender Name */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Email Sender Name
                      </label>
                      <input
                        type="text"
                        value={config.email_from_name}
                        onChange={(e) =>
                          handleInputChange("email_from_name", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="Your Company Name or System Administrator"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Optional display name for email sender
                      </p>
                    </div>

                    {/* TLS Configuration */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="email_use_tls"
                          checked={config.email_use_tls}
                          onChange={(e) =>
                            handleInputChange("email_use_tls", e.target.checked)
                          }
                          className="w-4 h-4 border-gray-300 rounded text-sky-600 focus:ring-sky-500"
                        />
                        <label
                          htmlFor="email_use_tls"
                          className="text-sm font-medium text-gray-700"
                        >
                          Use TLS (Transport Layer Security)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Email Test Section */}
                  <div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="mb-3 text-sm font-medium text-gray-900">
                        Test Email Configuration
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          placeholder="Enter email address to test"
                        />
                        <button
                          onClick={handleTestEmail}
                          disabled={testing}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <TestTube className="mr-2" size={16} />
                          {testing ? "Testing..." : "Test Email"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Access Token Configuration Section */}
            <div className="xl:col-span-1">
              <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow">
                <h2 className="mb-2 text-lg font-semibold text-sky-600">
                  Access Token Configuration
                </h2>
                <div className="flex-1 space-y-6">

                  {/* Token Configuration Form */}
                  <div className="space-y-4">
                    {/* Access Token Lifetime */}
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        min="5"
                        max="1440"
                      />
                    </div>

                    {/* Refresh Token Lifetime */}
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        min="1"
                        max="365"
                      />
                    </div>

                    {/* Rotate Refresh Tokens */}
                    <div>
                      <div className="flex items-center space-x-3">
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
                          className="text-sm font-medium text-gray-700"
                        >
                          Rotate Refresh Tokens
                        </label>
                      </div>
                    </div>

                    {/* Blacklist After Rotation */}
                    <div>
                      <div className="flex items-center space-x-3">
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
                          className="text-sm font-medium text-gray-700"
                        >
                          Blacklist After Rotation
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
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
