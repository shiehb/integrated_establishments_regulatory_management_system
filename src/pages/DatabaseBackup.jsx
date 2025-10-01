// src/pages/DatabaseBackup.jsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import Notification from "../components/Notification";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import {
  Save,
  Upload,
  Database,
  Braces,
  Download,
  Trash2,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import {
  getProfile,
  createBackup,
  restoreBackupFromFile,
  restoreBackupByName,
  getBackups,
  deleteBackup,
  downloadBackup,
} from "../services/api";

const DatabaseBackup = () => {
  const [userLevel, setUserLevel] = useState("public");
  const [loadingUser, setLoadingUser] = useState(true);

  const [backupFormat, setBackupFormat] = useState("json");
  const [backupPath, setBackupPath] = useState("");
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreFileName, setRestoreFileName] = useState("");

  const [processing, setProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState(""); // "backup", "restore", "delete"
  const [notification, setNotification] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupToDelete, setBackupToDelete] = useState(null);

  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(true);

  // fetch user level
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getProfile();
        setUserLevel(profile.userlevel || "public");
      } catch (err) {
        console.error("Error fetching profile:", err);
        showMessage("Failed to load user profile", "error");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserProfile();
  }, []);

  // load backups list
  const loadBackups = async () => {
    try {
      setLoadingBackups(true);
      const data = await getBackups();
      setBackups(data.backups || []);
    } catch (error) {
      console.error("Error loading backups:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to load backups";
      showMessage(errorMessage, "error");
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const showMessage = (msg, type = "success") => {
    setNotification({ open: true, type, message: msg });
  };

  const handleBackup = async () => {
    try {
      setProcessing(true);
      setProcessingAction("backup");
      const response = await createBackup(backupFormat, backupPath);
      showMessage(response.message || "Backup created successfully!");
      // Reset form
      setBackupPath("");
      loadBackups();
    } catch (error) {
      console.error("Backup error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create backup";
      showMessage(errorMessage, "error");
    } finally {
      setProcessing(false);
      setProcessingAction("");
      setConfirmOpen(false);
    }
  };

  const handleRestore = async () => {
    try {
      setProcessing(true);
      setProcessingAction("restore");
      let response;

      if (selectedBackup) {
        response = await restoreBackupByName(selectedBackup.fileName);
      } else if (restoreFile) {
        response = await restoreBackupFromFile(restoreFile);
      } else {
        showMessage("Please choose a backup file", "error");
        return;
      }

      showMessage(response.message || "Database restored successfully!");
      // Reset form
      setRestoreFile(null);
      setRestoreFileName("");
      setSelectedBackup(null);
      loadBackups();
    } catch (error) {
      console.error("Restore error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to restore backup";
      showMessage(errorMessage, "error");
    } finally {
      setProcessing(false);
      setProcessingAction("");
      setRestoreConfirm(false);
    }
  };

  const handleDeleteBackup = async () => {
    if (!backupToDelete) return;

    try {
      setProcessing(true);
      setProcessingAction("delete");
      await deleteBackup(backupToDelete.fileName);
      showMessage("Backup deleted successfully!");
      loadBackups();
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to delete backup";
      showMessage(errorMessage, "error");
    } finally {
      setProcessing(false);
      setProcessingAction("");
      setDeleteConfirm(false);
      setBackupToDelete(null);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith(".sql") || file.name.endsWith(".json")) {
        setRestoreFile(file);
        setRestoreFileName(file.name);
        setSelectedBackup(null);
      } else {
        showMessage("Please select a .sql or .json file", "error");
      }
    }
  };

  const handleBackupSelect = (backup) => {
    setSelectedBackup(backup);
    setRestoreFile(null);
    setRestoreFileName("");
  };

  const handleDownloadBackup = async (backup) => {
    try {
      const response = await downloadBackup(backup.fileName);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", backup.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showMessage(`Downloading ${backup.fileName}`, "info");
    } catch (error) {
      console.error("Download error:", error);
      showMessage("Failed to download backup file", "error");
    }
  };

  const formatIcons = {
    json: Braces,
    sql: Database,
  };

  const getFormatDescription = (format) => {
    const descriptions = {
      json: "Django data format (recommended for MariaDB 10.4)",
      sql: "Database native format (requires MySQL tools for best performance)",
    };
    return descriptions[format] || "";
  };

  if (loadingUser) {
    return (
      <>
        <Header />
        <LayoutWithSidebar>
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 mb-2 border-b-2 rounded-full border-sky-600 animate-spin"></div>
            <p className="text-gray-600">Loading Backup Page...</p>
          </div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel={userLevel}>
        <div className="p-4 bg-white h-[calc(100vh-165px)] overflow-y-auto">
          <h1 className="flex items-center mb-4 text-2xl font-bold text-sky-600">
            {" "}
            Database Backup & Restore
          </h1>

          {notification.open && (
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification({ ...notification, open: false })}
              duration={5000}
            />
          )}

          {/* Updated Layout: Backup/Restore side by side, Table at bottom */}
          <div className="flex flex-col gap-6">
            {/* Backup & Restore Section - Side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Backup Section - Left side */}
              <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow">
                <h2 className="mb-2 text-lg font-semibold text-sky-600">
                  Create Backup
                </h2>
                <div className="flex-1 space-y-6">
                  {/* Backup Format Selection */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Backup Format
                    </label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {["json", "sql"].map((format) => {
                        const Icon = formatIcons[format];
                        const isSelected = backupFormat === format;
                        return (
                          <div
                            key={format}
                            onClick={() => setBackupFormat(format)}
                            className={`cursor-pointer py-2 px-4 border-2 rounded-lg shadow transition flex flex-col items-center
                              ${
                                isSelected
                                  ? "border-sky-600 bg-sky-50 ring-2 ring-sky-500"
                                  : "border-gray-300 hover:border-sky-400 hover:bg-gray-50"
                              }`}
                          >
                            <Icon
                              className={`mb-2 ${
                                isSelected ? "text-sky-600" : "text-gray-400"
                              }`}
                              size={28}
                              strokeWidth={2}
                            />
                            <h3
                              className={`font-semibold capitalize ${
                                isSelected ? "text-sky-700" : "text-gray-800"
                              }`}
                            >
                              {format.toUpperCase()}
                            </h3>
                            <p className="mt-1 text-xs text-center text-gray-500">
                              {getFormatDescription(format)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Backup Path Input */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Custom Save Path (Optional)
                    </label>
                    <input
                      type="text"
                      value={backupPath}
                      onChange={(e) => setBackupPath(e.target.value)}
                      placeholder="C:/custom/path/backup/"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty to use default backup directory: backups/
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={processing}
                    className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing && processingAction === "backup" ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Creating Backup...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2" size={18} />
                        Create Backup
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Restore Section - Right side */}
              <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold text-sky-600">
                  Restore Backup
                </h2>
                <div className="flex-1 space-y-6">
                  {/* Restore File Selection */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Select Backup File
                    </label>
                    <div
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files.length > 0) {
                          const file = e.dataTransfer.files[0];
                          if (
                            file.name.endsWith(".sql") ||
                            file.name.endsWith(".json")
                          ) {
                            setRestoreFile(file);
                            setRestoreFileName(file.name);
                            setSelectedBackup(null);
                          } else {
                            showMessage(
                              "Please drop a .sql or .json file",
                              "error"
                            );
                          }
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition 
                        ${
                          restoreFile || selectedBackup
                            ? "border-green-600 bg-green-50"
                            : "border-gray-300 hover:border-sky-500 hover:bg-sky-50"
                        }`}
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                    >
                      {restoreFile || selectedBackup ? (
                        <>
                          <p className="text-sm font-medium text-gray-800">
                            {restoreFileName || selectedBackup?.fileName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {selectedBackup
                              ? "Backup selected from list"
                              : "File ready to restore"}
                          </p>
                          <p className="mt-2 text-xs font-medium text-green-600">
                            ✓ Ready to restore
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="mb-2 text-gray-400" size={24} />
                          <p className="text-sm text-gray-600">
                            Drag & drop a backup file here
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            or click to browse (.sql or .json)
                          </p>
                        </>
                      )}
                      <input
                        id="fileInput"
                        type="file"
                        className="hidden"
                        accept=".sql,.json"
                        onChange={handleFileSelect}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Or select a backup from the table below
                    </p>
                  </div>

                  {/* Selected Backup Info */}
                  {selectedBackup && (
                    <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
                      <p className="text-sm font-medium text-blue-800">
                        Selected: {selectedBackup.fileName}
                      </p>
                      <p className="text-xs text-blue-600">
                        Created: {selectedBackup.created} • Size:{" "}
                        {selectedBackup.size}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setRestoreConfirm(true)}
                    disabled={processing || (!restoreFile && !selectedBackup)}
                    className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing && processingAction === "restore" ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Restoring...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2" size={18} />
                        Restore Backup
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section - Full width at bottom */}
            <div className="bg-white border border-gray-200 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 rounded-t-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-sky-600">
                    Available Backups
                  </h3>
                  <button
                    onClick={loadBackups}
                    disabled={loadingBackups}
                    className="flex items-center px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`mr-1 ${
                        loadingBackups ? "animate-spin" : ""
                      }`}
                      size={14}
                    />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg">
                  <thead>
                    <tr className="text-sm text-left text-white bg-sky-700">
                      <th className="p-1 border border-gray-300">
                        File Name
                      </th>
                      <th className="p-1 text-center border border-gray-300">
                        Format
                      </th>
                      <th className="p-1 border border-gray-300">Created</th>
                      <th className="p-1 text-center border border-gray-300">
                        Size
                      </th>
                      <th className="p-1 text-center border border-gray-300 w-35">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBackups ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-2 py-8 text-center border border-gray-300"
                        >
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 mr-2 border-b-2 rounded-full animate-spin border-sky-600"></div>
                            <span>Loading backups...</span>
                          </div>
                        </td>
                      </tr>
                    ) : backups.length > 0 ? (
                      backups.map((backup) => (
                        <tr
                          key={backup.fileName}
                          className={`text-xs border border-gray-300 hover:bg-gray-50 cursor-pointer ${
                            selectedBackup?.fileName === backup.fileName
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={() => handleBackupSelect(backup)}
                        >
                          <td className="px-2 py-3 border border-gray-300">
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full mr-3 ${
                                  backup.format === "json"
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                              ></div>
                              <span className="text-sm font-medium text-gray-900">
                                {backup.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center border border-gray-300">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                backup.format === "json"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {backup.format.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-sm text-gray-500 border border-gray-300">
                            {backup.created}
                          </td>
                          <td className="px-2 py-3 text-sm text-gray-500 border border-gray-300">
                            {backup.size}
                          </td>
                          <td className="px-2 py-3 border border-gray-300">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBackupSelect(backup);
                                  setRestoreConfirm(true);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
                                title="Restore this backup"
                              >
                                <RotateCcw size={12} />
                                Restore
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadBackup(backup);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-white rounded bg-sky-600 hover:bg-sky-700"
                                title="Download this backup"
                              >
                                <Download size={12} />
                                Download
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBackupToDelete(backup);
                                  setDeleteConfirm(true);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                                title="Delete this backup"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-2 py-4 text-center text-gray-500 border border-gray-300"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Database
                              className="mb-2 text-gray-400"
                              size={32}
                            />
                            <p className="text-sm">No backups available</p>
                            <p className="mt-1 text-xs">
                              Create your first backup using the form above
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Confirmation Dialogs */}
          <ConfirmationDialog
            open={confirmOpen}
            title="Confirm Backup Creation"
            message={`Are you sure you want to create a ${backupFormat.toUpperCase()} backup? This may take a few moments.`}
            loading={processing && processingAction === "backup"}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleBackup}
            confirmText="Create Backup"
            cancelText="Cancel"
            confirmColor="sky"
          />

          <ConfirmationDialog
            open={restoreConfirm}
            title="Confirm Database Restore"
            message={
              <div>
                <p className="mb-2 font-semibold text-red-600">
                  WARNING: This action cannot be undone!
                </p>
                <p className="mb-2">Restoring will:</p>
                <ul className="mb-3 ml-4 text-sm list-disc">
                  <li>Overwrite all existing data</li>
                  <li>Replace current database contents</li>
                  <li>Potentially cause data loss</li>
                </ul>
                <p className="text-sm">
                  <strong>Backup to restore:</strong>{" "}
                  {selectedBackup?.fileName || restoreFileName}
                </p>
                <p className="mt-2">Are you sure you want to continue?</p>
              </div>
            }
            loading={processing && processingAction === "restore"}
            onCancel={() => {
              setRestoreConfirm(false);
              setSelectedBackup(null);
            }}
            onConfirm={handleRestore}
            confirmText="Yes, Restore Now"
            cancelText="Cancel"
            confirmColor="red"
            size="md"
          />

          <ConfirmationDialog
            open={deleteConfirm}
            title="Confirm Backup Deletion"
            message={`Are you sure you want to delete backup "${backupToDelete?.fileName}"? This action cannot be undone.`}
            loading={processing && processingAction === "delete"}
            onCancel={() => {
              setDeleteConfirm(false);
              setBackupToDelete(null);
            }}
            onConfirm={handleDeleteBackup}
            confirmText="Delete Backup"
            cancelText="Cancel"
            confirmColor="red"
          />
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
};

export default DatabaseBackup;
