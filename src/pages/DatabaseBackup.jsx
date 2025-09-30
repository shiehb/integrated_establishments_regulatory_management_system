// src/pages/DatabaseBackup.jsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import Notification from "../components/Notification";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import { Save, Upload, Database, Braces, FileSpreadsheet } from "lucide-react";
import {
  getProfile,
  createBackup,
  restoreBackupFromFile,
  restoreBackupByName,
  getBackups,
  deleteBackup,
} from "../services/api";

const DatabaseBackup = () => {
  const [userLevel, setUserLevel] = useState("public");
  const [loadingUser, setLoadingUser] = useState(true);

  const [backupFormat, setBackupFormat] = useState("json");
  const [backupPath, setBackupPath] = useState("");
  const [restoreFile, setRestoreFile] = useState(null);
  const [restorePath, setRestorePath] = useState("");

  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);

  const [backups, setBackups] = useState([]);

  // fetch user level
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getProfile();
        setUserLevel(profile.userlevel || "public");
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserProfile();
  }, []);

  // load backups list
  const loadBackups = async () => {
    try {
      const data = await getBackups();
      setBackups(data.backups || []);
    } catch (error) {
      console.error("Error loading backups:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to load backups";
      showMessage(errorMessage, "error");
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
      const response = await createBackup(backupFormat, backupPath);
      showMessage(response.message || "Backup created successfully!");
      loadBackups();
    } catch (error) {
      console.error("Backup error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create backup";
      showMessage(errorMessage, "error");
    } finally {
      setProcessing(false);
      setConfirmOpen(false);
    }
  };

  const handleRestore = async () => {
    try {
      setProcessing(true);
      let response;
      if (selectedBackup) {
        response = await restoreBackupByName(selectedBackup.fileName);
      } else if (restoreFile) {
        response = await restoreBackupFromFile(restoreFile, restorePath);
      } else {
        showMessage("Please choose a backup file", "error");
        return;
      }
      showMessage(response.message || "Database restored successfully!");
      loadBackups();
    } catch (error) {
      console.error("Restore error:", error);
      showMessage("Failed to restore backup", "error");
    } finally {
      setProcessing(false);
      setRestoreConfirm(false);
      setSelectedBackup(null);
    }
  };

  const handleDeleteBackup = async (fileName) => {
    try {
      await deleteBackup(fileName);
      showMessage("Backup deleted successfully!");
      loadBackups();
    } catch (error) {
      console.error("Delete error:", error);
      showMessage("Failed to delete backup", "error");
    }
  };

  const formatIcons = {
    json: Braces,
    sql: Database,
    csv: FileSpreadsheet,
  };

  if (loadingUser) {
    return (
      <>
        <Header />
        <LayoutWithSidebar>
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 mb-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading Backup Page...</p>
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
        <div className="p-4 bg-white h-[calc(100vh-165px)] overflow-y-auto">
          <h1 className="flex items-center mb-6 text-2xl font-bold text-sky-600">
            <Database className="mr-2" /> Database Backup & Restore
          </h1>

          {notification.open && (
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification({ ...notification, open: false })}
              duration={5000}
            />
          )}

          {/* Grid for Backup & Restore */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Backup Section */}
            <div className="flex flex-col p-6 bg-white rounded shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Create Backup
              </h2>
              <div className="flex-1 space-y-6">
                {/* Backup Format Selection */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Backup Format
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {["json", "sql", "csv"].map((format) => {
                      const Icon = formatIcons[format];
                      const isSelected = backupFormat === format;
                      return (
                        <div
                          key={format}
                          onClick={() => setBackupFormat(format)}
                          className={`cursor-pointer p-4 border rounded-lg shadow-sm transition flex flex-col items-center
                            ${
                              isSelected
                                ? "border-sky-600 bg-sky-50 ring-2 ring-sky-500"
                                : "border-gray-300 hover:bg-gray-50"
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
                            {format}
                          </h3>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Backup Path Input */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Save Path
                  </label>
                  <input
                    type="text"
                    value={backupPath}
                    onChange={(e) => setBackupPath(e.target.value)}
                    placeholder="/custom/path/backup/"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={processing}
                  className="flex items-center px-4 py-2 text-white rounded-md bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
                >
                  <Save className="mr-2" size={18} />
                  {processing ? "Processing..." : "Create Backup"}
                </button>
              </div>
            </div>

            {/* Restore Section */}
            <div className="flex flex-col p-6 bg-white rounded shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Restore Backup
              </h2>
              <div className="flex-1 space-y-6">
                {/* Restore File */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Backup File
                  </label>
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files.length > 0) {
                        setRestoreFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition 
                      ${
                        restoreFile
                          ? "border-green-600 bg-green-50"
                          : "border-gray-300 hover:border-sky-500 hover:bg-sky-50"
                      }`}
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    {restoreFile ? (
                      <>
                        <p className="text-sm font-medium text-gray-800">
                          {restoreFile.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          File ready to restore
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">
                          Drag & drop a file here
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          or click to browse
                        </p>
                      </>
                    )}
                    <input
                      id="fileInput"
                      type="file"
                      className="hidden"
                      onChange={(e) => setRestoreFile(e.target.files[0])}
                    />
                  </div>
                </div>

                {/* Restore Path Input */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Restore Path
                  </label>
                  <input
                    type="text"
                    value={restorePath}
                    onChange={(e) => setRestorePath(e.target.value)}
                    placeholder="/custom/path/restore/"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setRestoreConfirm(true)}
                  disabled={processing}
                  className="flex items-center px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <Upload className="mr-2" size={18} />
                  {processing ? "Processing..." : "Restore Backup"}
                </button>
              </div>
            </div>
          </div>

          {/* Backup List Table */}
          <div className="mt-8 overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Size
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backups.length > 0 ? (
                  backups.map((backup) => (
                    <tr key={backup.fileName}>
                      <td className="px-6 py-4 underline cursor-pointer text-sky-600">
                        {backup.fileName}
                      </td>
                      <td className="px-6 py-4">{backup.created}</td>
                      <td className="px-6 py-4">{backup.size}</td>
                      <td className="flex items-center justify-center gap-2 px-6 py-4">
                        <button
                          onClick={() => handleDeleteBackup(backup.fileName)}
                          className="p-2 text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBackup(backup);
                            setRestoreConfirm(true);
                          }}
                          className="p-2 text-white bg-yellow-500 rounded hover:bg-yellow-600"
                        >
                          ♻️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No backups available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Confirm Backup */}
          <ConfirmationDialog
            open={confirmOpen}
            title="Confirm Backup"
            message="Are you sure you want to create a backup with the selected format and path?"
            loading={processing}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleBackup}
            confirmText="Backup"
            cancelText="Cancel"
          />

          {/* Confirm Restore */}
          <ConfirmationDialog
            open={restoreConfirm}
            title="Confirm Restore"
            message="Restoring will overwrite existing data. Continue?"
            loading={processing}
            onCancel={() => {
              setRestoreConfirm(false);
              setSelectedBackup(null);
            }}
            onConfirm={handleRestore}
            confirmText="Restore"
            cancelText="Cancel"
            confirmVariant="danger"
          />
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
};

export default DatabaseBackup;
