import { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
  X,
  Search,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
  Tag,
  Users,
  Info,
  Image as ImageIcon,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import {
  getHelpTopics,
  getHelpCategories,
  saveHelpTopics,
  saveHelpCategories,
  exportHelpData,
  uploadHelpImage,
} from "../../services/helpApi";
import { helpCategories as defaultCategories } from "../../data/helpCategories";
import { USER_LEVELS } from "../../constants/helpConstants";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useNotifications } from "../NotificationManager";

export default function HelpEditor() {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("topics");
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [uploadingImages, setUploadingImages] = useState({});
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const notifications = useNotifications();

  // Topic modal state
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopicData, setEditingTopicData] = useState(null); // Topic being edited in modal
  const [isNewTopic, setIsNewTopic] = useState(false); // Track if adding new vs editing existing
  const [topicModalErrors, setTopicModalErrors] = useState({});

  // Category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryData, setEditingCategoryData] = useState(null); // Store category being edited in modal
  const [editingCategoryOriginalKey, setEditingCategoryOriginalKey] = useState(null); // Track original key for editing
  const [categoryModalErrors, setCategoryModalErrors] = useState({});

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null, // 'deleteTopic', 'deleteCategory', 'import', 'saveTopic'
    title: "",
    message: "",
    onConfirm: null,
    data: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [topicsData, categoriesData] = await Promise.all([
        getHelpTopics(),
        getHelpCategories(),
      ]);
      setTopics(topicsData || []);
      setCategories(categoriesData || []);
      setError(null);
    } catch (err) {
      console.error("Error loading help data:", err);
      setError("Failed to load help data. Using defaults.");
      // Fallback to default data
      setCategories(defaultCategories || []);
    } finally {
      setLoading(false);
    }
  };


  const handleExport = async () => {
    try {
      const data = await exportHelpData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `help_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notifications.success("Help data exported successfully!");
    } catch (error) {
      notifications.error(error.message || "Failed to export help data.");
      setError("Failed to export help data.");
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileInput = event.target; // Store reference for reset

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.topics || !data.categories) {
        throw new Error("Invalid backup file format");
      }

      setConfirmDialog({
        open: true,
        type: 'import',
        title: "Import Help Data",
        message: (
          <div>
            <p>This will replace all current help topics and categories with the imported data.</p>
            <p className="mt-2 text-sm text-amber-600 font-medium">
              ⚠️ This action cannot be undone. Make sure you have a backup before proceeding.
            </p>
            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
              <p><strong>Topics:</strong> {data.topics?.length || 0}</p>
              <p><strong>Categories:</strong> {data.categories?.length || 0}</p>
            </div>
          </div>
        ),
        onConfirm: () => {
          setTopics(data.topics || []);
          setCategories(data.categories || []);
          setSelectedTopicId(null);
          setConfirmDialog({ ...confirmDialog, open: false });
          notifications.success("Help data imported successfully!");
          // Reset file input
          fileInput.value = "";
        },
        data: data,
      });
    } catch (err) {
      notifications.error("Failed to import help data. Invalid file format.");
      setError("Failed to import help data. Invalid file format.");
      console.error("Import error:", err);
      // Reset file input
      fileInput.value = "";
    }
  };

  // Topic management
  const addTopic = () => {
    const newTopic = {
      id: Math.max(...topics.map((t) => t.id || 0), 0) + 1,
      title: "",
      description: "",
      category: categories.length > 0 ? categories[0].key : "general",
      tags: [],
      access: [],
      steps: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditingTopicData(newTopic);
    setIsNewTopic(true);
    setTopicModalErrors({});
    setTopicModalOpen(true);
  };

  // Open edit modal for existing topic
  const openEditTopicModal = (topic) => {
    setEditingTopicData(JSON.parse(JSON.stringify(topic)));
    setIsNewTopic(false);
    setTopicModalErrors({});
    setTopicModalOpen(true);
  };


  // Validate topic form
  const validateTopic = (topicData) => {
    const errors = {};
    
    if (!topicData.title || !topicData.title.trim()) {
      errors.title = "Topic title is required";
    } else if (topicData.title.length > 200) {
      errors.title = "Title must be less than 200 characters";
    }
    
    if (topicData.category && !categories.find(c => c.key === topicData.category)) {
      errors.category = "Please select a valid category";
    }
    
    return errors;
  };

  // Handle topic modal save (shows confirmation first)
  const handleSaveTopicFromModal = () => {
    if (!editingTopicData) return;

    const errors = validateTopic(editingTopicData);
    if (Object.keys(errors).length > 0) {
      setTopicModalErrors(errors);
      return;
    }

    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      type: 'saveTopic',
      title: isNewTopic ? "Save New Topic" : "Save Topic Changes",
      message: (
        <div>
          {isNewTopic ? (
            <>
              <p>Are you sure you want to save this new topic?</p>
              <p className="mt-2 text-sm text-gray-600">
                Topic: <span className="font-semibold">"{editingTopicData.title || 'Untitled'}"</span>
              </p>
            </>
          ) : (
            <>
              <p>Are you sure you want to save changes to this topic?</p>
              <p className="mt-2 text-sm text-gray-600">
                Topic: <span className="font-semibold">"{editingTopicData.title || 'Untitled'}"</span>
              </p>
            </>
          )}
        </div>
      ),
      onConfirm: async () => {
          try {
          setSaving(true);
          
          // Save the updated topics list
          const updatedTopicsList = isNewTopic 
            ? [...topics, { ...editingTopicData, updated_at: new Date().toISOString() }]
            : topics.map(t => t.id === editingTopicData.id ? { ...editingTopicData, updated_at: new Date().toISOString() } : t);
          
          await Promise.all([
            saveHelpTopics(updatedTopicsList),
            saveHelpCategories(categories),
          ]);
          
          // Update local state
          setTopics(updatedTopicsList);

          notifications.success(isNewTopic ? "Topic created successfully!" : "Topic updated successfully!");
          
          setTopicModalOpen(false);
          setEditingTopicData(null);
          setIsNewTopic(false);
          setTopicModalErrors({});
          setConfirmDialog({ ...confirmDialog, open: false });
          
          // If new topic, select it in the viewer
          if (isNewTopic) {
            setSelectedTopicId(editingTopicData.id);
          }
        } catch (error) {
          notifications.error(error.message || "Failed to save topic.");
        } finally {
          setSaving(false);
        }
      },
      data: { topicId: editingTopicData?.id },
    });
  };

  // Handle topic modal close
  const handleCloseTopicModal = () => {
    setTopicModalOpen(false);
    setEditingTopicData(null);
    setIsNewTopic(false);
    setTopicModalErrors({});
  };

  // Update editingTopicData when topic changes in modal
  const updateEditingTopicData = (updates) => {
    setEditingTopicData(prev => ({
      ...prev,
      ...updates,
    }));
    // Clear errors when user types
    if (topicModalErrors.title && updates.title) {
      setTopicModalErrors(prev => ({ ...prev, title: "" }));
    }
  };

  const deleteTopic = (id) => {
    const topic = topics.find((t) => t.id === id);
    setConfirmDialog({
      open: true,
      type: 'deleteTopic',
      title: "Delete Topic",
      message: (
        <div>
          Are you sure you want to delete the topic{" "}
          <span className="font-semibold">"{topic?.title || 'Untitled'}"</span>?
          <p className="mt-2 text-sm text-amber-600">
            This action cannot be undone. All steps and images associated with this topic will be lost.
          </p>
        </div>
      ),
      onConfirm: () => {
        setTopics(topics.filter((topic) => topic.id !== id));
        if (selectedTopicId === id) {
          setSelectedTopicId(null);
          setEditingTopicData(null);
          setIsNewTopic(false);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
        notifications.success("Topic deleted successfully");
      },
      data: { id },
    });
  };

  const moveTopic = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === topics.length - 1)
    )
      return;

    const newTopics = [...topics];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newTopics[index], newTopics[newIndex]] = [
      newTopics[newIndex],
      newTopics[index],
    ];
    setTopics(newTopics);
  };


  // Category management
  const addCategory = () => {
    const newCategory = {
      key: "",
      name: "",
    };
    setEditingCategoryData(newCategory);
    setEditingCategoryOriginalKey(null); // New category, no original key
    setCategoryModalOpen(true);
    setCategoryModalErrors({});
  };

  // Generate category key from name
  const generateCategoryKey = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Validate category data
  const validateCategory = (categoryData) => {
    const errors = {};
    
    if (!categoryData.name || !categoryData.name.trim()) {
      errors.name = "Category name is required";
    }
    
    if (!categoryData.key || !categoryData.key.trim()) {
      errors.key = "Category key is required";
    } else {
      // Validate key format
      if (!/^[a-z0-9-]+$/.test(categoryData.key)) {
        errors.key = "Key must contain only lowercase letters, numbers, and hyphens";
      }
      
      // Check for duplicate key (excluding current category if editing)
      const existingCategory = categories.find(c => c.key === categoryData.key);
      if (existingCategory && (!editingCategoryOriginalKey || categoryData.key !== editingCategoryOriginalKey)) {
        errors.key = "This key is already in use";
      }
    }
    
    return errors;
  };

  // Handle category modal save
  const handleSaveCategory = () => {
    const errors = validateCategory(editingCategoryData);
    if (Object.keys(errors).length > 0) {
      setCategoryModalErrors(errors);
      return;
    }

    // Check if editing existing category (has original key)
    if (editingCategoryOriginalKey) {
      // Update existing category
      const oldKey = editingCategoryOriginalKey;
      const newKey = editingCategoryData.key;
      
      if (oldKey !== newKey) {
        // Update key in all topics that use this category
        const updatedTopics = topics.map(topic =>
          topic.category === oldKey
            ? { ...topic, category: newKey }
            : topic
        );
        setTopics(updatedTopics);
      }
      
      updateCategory(oldKey, { name: editingCategoryData.name, key: newKey });
    } else {
      // Add new category
      setCategories([...categories, { ...editingCategoryData }]);
    }

    setCategoryModalOpen(false);
    setEditingCategoryData(null);
    setEditingCategoryOriginalKey(null);
    setCategoryModalErrors({});
    notifications.success("Category saved successfully!");
  };

  // Handle category modal cancel
  const handleCancelCategory = () => {
    setCategoryModalOpen(false);
    setEditingCategoryData(null);
    setEditingCategoryOriginalKey(null);
    setCategoryModalErrors({});
  };

  const updateCategory = (key, updates) => {
    setCategories(
      categories.map((cat) =>
        cat.key === key ? { ...cat, ...updates } : cat
      )
    );
  };

  const deleteCategory = (key) => {
    const category = categories.find((c) => c.key === key);
    const topicCount = topics.filter(t => t.category === key).length;
    
    setConfirmDialog({
      open: true,
      type: 'deleteCategory',
      title: "Delete Category",
      message: (
        <div>
          Are you sure you want to delete the category{" "}
          <span className="font-semibold">"{category?.name || key}"</span>?
          {topicCount > 0 && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
              <p className="text-amber-800 font-medium">
                ⚠️ This category is used by {topicCount} topic{topicCount !== 1 ? 's' : ''}
              </p>
              <p className="text-amber-700 mt-1">
                Deleting it will remove the category from those topics.
              </p>
            </div>
          )}
        </div>
      ),
      onConfirm: () => {
        if (topicCount > 0) {
          // Remove category from topics
          const updatedTopics = topics.map(topic =>
            topic.category === key
              ? { ...topic, category: "" }
              : topic
          );
          setTopics(updatedTopics);
        }
        setCategories(categories.filter((cat) => cat.key !== key));
        if (editingCategory === key) setEditingCategory(null);
        setConfirmDialog({ ...confirmDialog, open: false });
        notifications.success("Category deleted successfully");
      },
      data: { key },
    });
  };

  const filteredTopics = topics.filter(
    (topic) =>
      !searchQuery ||
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white overflow-y-auto">
      {/* Header with Title, Tabs, and Actions (Option B) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold text-sky-600">
          Help Editor
        </h1>
        
        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex -mb-px border-b border-gray-200">
            <button
              onClick={() => setActiveTab("topics")}
              className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                activeTab === "topics"
                  ? "text-sky-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Topics
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "topics"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {topics.length}
                </span>
              </span>
              {activeTab === "topics" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                activeTab === "categories"
                  ? "text-sky-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categories
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "categories"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {categories.length}
                </span>
              </span>
              {activeTab === "categories" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-t-full" />
              )}
            </button>
          </div>

          {/* Action Buttons - Import, Export */}
          <div className="flex items-center gap-2">
            <label className="group bg-white border border-gray-300 hover:border-sky-400 hover:bg-sky-50 text-gray-700 hover:text-sky-700 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md">
              <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExport}
              className="group bg-white border border-gray-300 hover:border-sky-400 hover:bg-sky-50 text-gray-700 hover:text-sky-700 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages - Simple */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-sm text-red-700 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Topics Tab */}
      {activeTab === "topics" && (
        <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-4">
          {/* Left Column (30%) - Topics List */}
          <div className="bg-white border border-gray-200 rounded-lg shadow">
              {/* Search and Actions Bar */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={addTopic}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Topic
                </button>
              </div>

              {/* Topics List */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 362px)' }}>
                {filteredTopics.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">
                      {searchQuery ? "No topics found" : "No topics yet"}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={addTopic}
                        className="mt-4 bg-sky-600 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        Create First Topic
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredTopics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => setSelectedTopicId(topic.id)}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedTopicId === topic.id 
                            ? 'bg-sky-50 border-l-4 border-l-sky-500 shadow-sm' 
                            : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-sm mb-1.5 truncate ${
                              selectedTopicId === topic.id ? 'text-sky-900' : 'text-gray-900'
                            }`}>
                              {topic.title || "Untitled Topic"}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2.5 leading-relaxed">
                              {topic.description || "No description"}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
                                {categories.find(c => c.key === topic.category)?.name || topic.category || "Uncategorized"}
                              </span>
                              {topic.steps?.length > 0 && (
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {topic.steps.length} step{topic.steps.length !== 1 ? 's' : ''}
                                </span>
                              )}
                              {topic.access && topic.access.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-sky-100 text-sky-700 rounded-md">
                                  🔒 Restricted
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTopic(
                                  topics.findIndex(t => t.id === topic.id),
                                  "up"
                                );
                              }}
                              disabled={topics.findIndex(t => t.id === topic.id) === 0}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTopic(
                                  topics.findIndex(t => t.id === topic.id),
                                  "down"
                                );
                              }}
                              disabled={topics.findIndex(t => t.id === topic.id) === topics.length - 1}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTopic(topic.id);
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Delete topic"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          {/* Right Column (70%) - Topic Viewer */}
          <div className="bg-white border border-gray-200 rounded shadow">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Topic Viewer
                  </h3>
                </div>
              </div>
              {selectedTopicId ? (
                (() => {
                  const topic = topics.find(t => t.id === selectedTopicId);
                  if (!topic) {
                    setSelectedTopicId(null);
                    return null;
                  }
                  return (
                    <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                      {/* Topic Header */}
                      <div className="mb-5 pb-4 border-b border-gray-200">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h2 className="font-semibold text-lg text-gray-900 mb-2">
                              {topic.title || "Untitled Topic"}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
                                {categories.find(c => c.key === topic.category)?.name || topic.category || "Uncategorized"}
                              </span>
                              {topic.steps?.length > 0 && (
                                <span className="inline-flex items-center text-xs text-gray-600">
                                  <FileText className="w-3.5 h-3.5 mr-1" />
                                  {topic.steps.length} step{topic.steps.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => moveTopic(
                                topics.findIndex(t => t.id === topic.id),
                                "up"
                              )}
                              disabled={topics.findIndex(t => t.id === topic.id) === 0}
                              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveTopic(
                                topics.findIndex(t => t.id === topic.id),
                                "down"
                              )}
                              disabled={topics.findIndex(t => t.id === topic.id) === topics.length - 1}
                              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <button
                              onClick={() => openEditTopicModal(topic)}
                              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                              title="Edit topic"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <button
                              onClick={() => {
                                deleteTopic(topic.id);
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete topic"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Topic Content - Read-only Viewer */}
                      <div className="space-y-4">

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <div className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-700 min-h-[80px]">
                            {topic.description || <span className="text-gray-400 italic">No description provided</span>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <div className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-700">
                              {categories.find(c => c.key === topic.category)?.name || topic.category || "Uncategorized"}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                            <div className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-700">
                              {topic.tags && topic.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {topic.tags.map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">No tags</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Access Control</label>
                          <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[44px]">
                            {topic.access && topic.access.length > 0 ? (
                              topic.access.map((accessRole, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg text-sm font-medium shadow-sm"
                                >
                                  {accessRole}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500 italic flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                No restrictions (visible to all users)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-semibold text-gray-700">Steps ({topic.steps?.length || 0})</label>
                          </div>
                          <div className="space-y-3">
                            {(topic.steps || []).length === 0 ? (
                              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm text-gray-400">No steps added yet</p>
                              </div>
                            ) : (
                              (topic.steps || []).map((step, stepIndex) => (
                                <div
                                  key={stepIndex}
                                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="w-8 h-8 bg-sky-100 text-sky-700 rounded-lg text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                                      {stepIndex + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-sm text-gray-900 mb-2">
                                        {step.title || <span className="text-gray-400 italic">Untitled step</span>}
                                      </h4>
                                      <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                                        {step.description || <span className="text-gray-400 italic">No description</span>}
                                      </p>
                                      {step.image && (
                                        <div className="rounded-lg overflow-hidden border border-gray-300">
                                          <img
                                            src={step.image}
                                            alt={step.title || "Step image"}
                                            className="w-full h-40 object-cover"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Edit className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 mb-2">No Topic Selected</h3>
                  <p className="text-sm text-gray-500 mb-4">Select a topic from the list on the left to view details</p>
                  <button
                    onClick={addTopic}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Topic
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-4">
          {/* Left Column (30%) - Categories List */}
          <div className="bg-white border border-gray-200 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-semibold text-gray-800">Categories</h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  {categories.length} total
                </span>
              </div>
              <button
                onClick={addCategory}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
            {categories.length === 0 ? (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Tag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">No Categories Yet</h3>
                <p className="text-sm text-gray-500 mb-6">Create categories to organize your help topics</p>
                <button
                  onClick={addCategory}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create First Category
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                <div className="grid grid-cols-1 gap-4">
                  {categories.map((category) => {
                    const topicCount = topics.filter(t => t.category === category.key).length;
                    const isEditing = editingCategory === category.key;
                    return (
                      <div
                        key={category.key}
                        className={`group relative border rounded-xl p-5 transition-all duration-200 bg-white ${
                          isEditing 
                            ? 'border-sky-500 bg-sky-50/50 shadow-lg ring-2 ring-sky-200' 
                            : 'border-gray-200 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 shadow-sm'
                        }`}
                      >
                        {/* Header with Icon and Actions */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                              isEditing 
                                ? 'bg-sky-100 text-sky-600' 
                                : 'bg-gray-100 text-gray-600 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors'
                            }`}>
                              <Tag className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                Category Name
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={category.name || ""}
                                  onChange={(e) =>
                                    updateCategory(category.key, { name: e.target.value })
                                  }
                                  placeholder="Enter category name..."
                                  className="flex-1 text-sm font-semibold text-gray-800 border-0 bg-transparent focus:outline-none focus:ring-0 p-0 placeholder:text-gray-400"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingCategoryData({ ...category });
                                setEditingCategoryOriginalKey(category.key);
                                setCategoryModalOpen(true);
                                setCategoryModalErrors({});
                              }}
                              className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                              title="Edit in modal"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                deleteCategory(category.key);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                              title="Delete category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Category Key */}
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            Category Key
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={category.key}
                              onChange={(e) => {
                                const newKey = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                if (newKey !== category.key && !categories.find(c => c.key === newKey)) {
                                  // Update key in all topics that use this category
                                  const updatedTopics = topics.map(topic => 
                                    topic.category === category.key 
                                      ? { ...topic, category: newKey }
                                      : topic
                                  );
                                  setTopics(updatedTopics);
                                  // Update category key
                                  const updatedCategories = categories.map(cat =>
                                    cat.key === category.key
                                      ? { ...cat, key: newKey }
                                      : cat
                                  );
                                  setCategories(updatedCategories);
                                }
                              }}
                              onBlur={() => setEditingCategory(null)}
                              className="w-full text-xs font-mono border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                              placeholder="category-key"
                            />
                          ) : (
                            <div 
                              className="flex items-center gap-2 cursor-pointer group/key"
                              onClick={() => setEditingCategory(category.key)}
                            >
                              <code className="text-xs font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 group-hover/key:bg-sky-50 group-hover/key:border-sky-300 group-hover/key:text-sky-700 transition-all flex-1">
                                {category.key}
                              </code>
                              <Edit className="w-3.5 h-3.5 text-gray-400 group-hover/key:text-sky-600 transition-colors flex-shrink-0" />
                            </div>
                          )}
                        </div>

                        {/* Footer with Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-700">
                                {topicCount === 0 
                                  ? "No topics" 
                                  : `${topicCount} topic${topicCount !== 1 ? 's' : ''}`
                                }
                              </p>
                              <p className="text-xs text-gray-500">
                                {topicCount === 0 ? "Empty category" : "Active"}
                              </p>
                            </div>
                          </div>
                          {topicCount > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-sky-100 text-sky-700 rounded-lg shadow-sm">
                              In Use
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (70%) - Empty State for Categories */}
          <div className="bg-white border border-gray-200 rounded-lg shadow">
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-2">Category Details</h3>
              <p className="text-sm text-gray-500">
                Select a category from the list to view or edit details
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {topicModalOpen && editingTopicData && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-sky-50 border-b border-sky-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    {isNewTopic ? "Add Topic" : "Edit Topic"}
                  </h3>
                </div>
                <button
                  onClick={handleCloseTopicModal}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Topic Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingTopicData.title || ""}
                    onChange={(e) => updateEditingTopicData({ title: e.target.value })}
                    placeholder="Enter topic title..."
                    className={`w-full text-sm border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                      topicModalErrors.title ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    autoFocus
                  />
                  {topicModalErrors.title && (
                    <p className="mt-1 text-xs text-red-600">{topicModalErrors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingTopicData.description || ""}
                    onChange={(e) => updateEditingTopicData({ description: e.target.value })}
                    placeholder="Enter a brief description of this help topic..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all resize-none"
                    rows={3}
                  />
                </div>

                {/* Category and Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={editingTopicData.category || ""}
                      onChange={(e) => updateEditingTopicData({ category: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all bg-white ${
                        topicModalErrors.category ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    >
                      {categories.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {topicModalErrors.category && (
                      <p className="mt-1 text-xs text-red-600">{topicModalErrors.category}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      value={(editingTopicData.tags || []).join(", ")}
                      onChange={(e) =>
                        updateEditingTopicData({
                          tags: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="tag1, tag2, tag3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                {/* Access Control */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Access Control</label>
                  <div className="flex flex-wrap gap-2 mb-3 min-h-[44px] p-3 border border-gray-300 rounded-lg bg-gray-50">
                    {editingTopicData.access && editingTopicData.access.length > 0 ? (
                      editingTopicData.access.map((accessRole, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg text-sm font-medium shadow-sm"
                        >
                          {accessRole}
                          <button
                            type="button"
                            onClick={() => {
                              const newAccess = editingTopicData.access.filter((_, i) => i !== idx);
                              updateEditingTopicData({ access: newAccess });
                            }}
                            className="hover:bg-sky-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 italic flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        No restrictions (visible to all users)
                      </span>
                    )}
                  </div>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const currentAccess = editingTopicData.access || [];
                        if (!currentAccess.includes(e.target.value)) {
                          updateEditingTopicData({
                            access: [...currentAccess, e.target.value],
                          });
                        }
                        e.target.value = "";
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all bg-white"
                  >
                    <option value="">+ Add role to restrict access...</option>
                    {USER_LEVELS.filter(level => !(editingTopicData.access || []).includes(level)).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Steps */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Steps ({(editingTopicData.steps || []).length})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = [
                          ...(editingTopicData.steps || []),
                          { title: "", description: "", image: "" },
                        ];
                        updateEditingTopicData({ steps: newSteps });
                      }}
                      className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Step
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {(editingTopicData.steps || []).length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-400">No steps added yet</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Step" to create instructions</p>
                      </div>
                    ) : (
                      (editingTopicData.steps || []).map((step, stepIndex) => (
                        <div
                          key={stepIndex}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <span className="w-8 h-8 bg-sky-100 text-sky-700 rounded-lg text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                              {stepIndex + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={step.title || ""}
                                onChange={(e) => {
                                  const newSteps = [...(editingTopicData.steps || [])];
                                  newSteps[stepIndex] = { ...newSteps[stepIndex], title: e.target.value };
                                  updateEditingTopicData({ steps: newSteps });
                                }}
                                placeholder="Step title..."
                                className="w-full font-semibold border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                              />
                              <textarea
                                value={step.description || ""}
                                onChange={(e) => {
                                  const newSteps = [...(editingTopicData.steps || [])];
                                  newSteps[stepIndex] = { ...newSteps[stepIndex], description: e.target.value };
                                  updateEditingTopicData({ steps: newSteps });
                                }}
                                placeholder="Step description..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all resize-none"
                                rows={3}
                              />
                              <div>
                                {step.image ? (
                                  <div className="relative group rounded-lg overflow-hidden border border-gray-300">
                                    <img
                                      src={step.image}
                                      alt={step.title || "Step image"}
                                      className="w-full h-40 object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <label className="cursor-pointer bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 shadow-sm">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                              if (file.size > 5 * 1024 * 1024) {
                                                notifications.error("Image size must be less than 5MB");
                                                return;
                                              }
                                              if (!file.type.startsWith('image/')) {
                                                notifications.error("Please select an image file");
                                                return;
                                              }
                                              try {
                                                const stepId = `${editingTopicData.id || 'new'}-${stepIndex}`;
                                                setUploadingImages(prev => ({ ...prev, [stepId]: true }));
                                                const result = await uploadHelpImage(file);
                                                const newSteps = [...(editingTopicData.steps || [])];
                                                newSteps[stepIndex] = { ...newSteps[stepIndex], image: result.url };
                                                updateEditingTopicData({ steps: newSteps });
                                                notifications.success("Image uploaded successfully");
                                              } catch (error) {
                                                notifications.error(error.message || "Failed to upload image");
                                              } finally {
                                                const stepId = `${editingTopicData.id || 'new'}-${stepIndex}`;
                                                setUploadingImages(prev => ({ ...prev, [stepId]: false }));
                                              }
                                            }
                                            e.target.value = "";
                                          }}
                                        />
                                        Change
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newSteps = [...(editingTopicData.steps || [])];
                                          newSteps[stepIndex] = { ...newSteps[stepIndex], image: "" };
                                          updateEditingTopicData({ steps: newSteps });
                                        }}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <label className="block cursor-pointer">
                                    <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                                      uploadingImages[`${editingTopicData.id || 'new'}-${stepIndex}`]
                                        ? "border-sky-500 bg-sky-50"
                                        : "border-gray-300 bg-white hover:border-sky-400 hover:bg-sky-50"
                                    }`}>
                                      {uploadingImages[`${editingTopicData.id || 'new'}-${stepIndex}`] ? (
                                        <div className="flex flex-col items-center gap-2">
                                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                                          <p className="text-sm text-gray-600 font-medium">Uploading...</p>
                                        </div>
                                      ) : (
                                        <>
                                          <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                          <p className="text-sm text-gray-600 font-medium">Upload Image</p>
                                          <p className="text-xs text-gray-400 mt-1">Click to browse</p>
                                          <p className="text-xs text-gray-400 mt-0.5">Max size: 5MB</p>
                                        </>
                                      )}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            if (file.size > 5 * 1024 * 1024) {
                                              notifications.error("Image size must be less than 5MB");
                                              return;
                                            }
                                            if (!file.type.startsWith('image/')) {
                                              notifications.error("Please select an image file");
                                              return;
                                            }
                                            try {
                                              const stepId = `${editingTopicData.id || 'new'}-${stepIndex}`;
                                              setUploadingImages(prev => ({ ...prev, [stepId]: true }));
                                              const result = await uploadHelpImage(file);
                                              const newSteps = [...(editingTopicData.steps || [])];
                                              newSteps[stepIndex] = { ...newSteps[stepIndex], image: result.url };
                                              updateEditingTopicData({ steps: newSteps });
                                              notifications.success("Image uploaded successfully");
                                            } catch (error) {
                                              notifications.error(error.message || "Failed to upload image");
                                            } finally {
                                              const stepId = `${editingTopicData.id || 'new'}-${stepIndex}`;
                                              setUploadingImages(prev => ({ ...prev, [stepId]: false }));
                                            }
                                          }
                                          e.target.value = "";
                                        }}
                                      />
                                    </div>
                                  </label>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newSteps = (editingTopicData.steps || []).filter((_, i) => i !== stepIndex);
                                updateEditingTopicData({ steps: newSteps });
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg flex-shrink-0 transition-colors"
                              title="Delete step"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleCloseTopicModal}
                className="px-6 py-2.5 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTopicFromModal}
                disabled={saving}
                className="px-6 py-2.5 text-white rounded-lg transition-colors bg-sky-600 hover:bg-sky-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-sky-50 border-b border-sky-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-sky-600" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    {editingCategoryOriginalKey ? "Edit Category" : "Add Category"}
                  </h3>
                </div>
                <button
                  onClick={handleCancelCategory}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingCategoryData?.name || ""}
                    onChange={(e) => {
                      const newName = e.target.value;
                      const newKey = editingCategoryData?.key || generateCategoryKey(newName);
                      setEditingCategoryData({
                        ...editingCategoryData,
                        name: newName,
                        key: editingCategoryData?.key || newKey,
                      });
                      // Clear name error when typing
                      if (categoryModalErrors.name) {
                        setCategoryModalErrors({ ...categoryModalErrors, name: "" });
                      }
                    }}
                    placeholder="Enter category name..."
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                      categoryModalErrors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    autoFocus
                  />
                  {categoryModalErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{categoryModalErrors.name}</p>
                  )}
                </div>

                {/* Category Key */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Key <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingCategoryData?.key || ""}
                      onChange={(e) => {
                        const newKey = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        setEditingCategoryData({
                          ...editingCategoryData,
                          key: newKey,
                        });
                        // Clear key error when typing
                        if (categoryModalErrors.key) {
                          setCategoryModalErrors({ ...categoryModalErrors, key: "" });
                        }
                      }}
                      placeholder="category-key"
                      className={`w-full text-xs font-mono border rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                        categoryModalErrors.key ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {!editingCategoryData?.key && editingCategoryData?.name && (
                      <button
                        type="button"
                        onClick={() => {
                          const autoKey = generateCategoryKey(editingCategoryData.name);
                          setEditingCategoryData({
                            ...editingCategoryData,
                            key: autoKey,
                          });
                        }}
                        className="px-3 py-2 text-xs font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg border border-sky-200 transition-colors whitespace-nowrap"
                        title="Auto-generate key from name"
                      >
                        Auto
                      </button>
                    )}
                  </div>
                  {categoryModalErrors.key && (
                    <p className="mt-1 text-xs text-red-600">{categoryModalErrors.key}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Key must be lowercase, alphanumeric, and use hyphens for spaces
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelCategory}
                  className="px-6 py-2.5 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-6 py-2.5 text-white rounded-lg transition-colors bg-sky-600 hover:bg-sky-700 font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={() => {
          if (confirmDialog.onConfirm) {
            confirmDialog.onConfirm();
          }
        }}
        confirmText="Confirm"
        cancelText="Cancel"
        confirmColor={
          confirmDialog.type === 'deleteTopic' || 
          confirmDialog.type === 'deleteCategory'
            ? "red"
            : confirmDialog.type === 'saveTopic'
            ? "sky"
            : "sky"
        }
        icon={
          confirmDialog.type === 'import' ? (
            <AlertCircle className="w-6 h-6 text-sky-600" />
          ) : confirmDialog.type === 'saveTopic' ? (
            <Save className="w-6 h-6 text-sky-600" />
          ) : (
            <Trash2 className="w-6 h-6 text-red-600" />
          )
        }
        headerColor={
          confirmDialog.type === 'import' || confirmDialog.type === 'saveTopic' ? "sky" : "red"
        }
      />
    </div>
  );
}

