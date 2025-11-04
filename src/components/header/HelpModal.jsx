// src/components/header/HelpModal.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, HelpCircle, X, Clock, Zap, Target, ArrowLeft, BookOpen } from "lucide-react";
import { helpTopics } from "../../data/helpData";
import { filterTopicsByUserLevel, normalizeUserLevel } from "../../utils/helpUtils";

const RECENT_TOPICS_KEY = "recentHelpTopics";
const MAX_RECENT_TOPICS = 5;

const TABS = [
  { id: 'quick-start', name: 'Quick Start', icon: Zap },
  { id: 'context', name: 'For This Page', icon: Target },
  { id: 'recent', name: 'Recent', icon: Clock },
  { id: 'all', name: 'Search All', icon: Search }
];

export default function HelpModal({ userLevel = "public", isOpen = false, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [helpSearchQuery, setHelpSearchQuery] = useState("");
  const [recentTopics, setRecentTopics] = useState([]);
  const [activeTab, setActiveTab] = useState('quick-start');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Load recent topics from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_TOPICS_KEY);
    if (stored) {
      try {
        setRecentTopics(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading recent topics:", e);
      }
    }
  }, []);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        if (modalRef.current) {
          const firstInput = modalRef.current.querySelector('input');
          if (firstInput) {
            firstInput.focus();
          }
        }
      }, 100);
    } else {
      // Return focus to previous element when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleHelpSearch = (e) => setHelpSearchQuery(e.target.value);

  const accessibleTopics = filterTopicsByUserLevel(
    helpTopics,
    normalizeUserLevel(userLevel)
  );
  
  const filteredHelpSuggestions = accessibleTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(helpSearchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(helpSearchQuery.toLowerCase())
  );

  // Get context-sensitive help based on current route with improved matching
  const getContextHelp = () => {
    const path = location.pathname;
    
    // Enhanced route mapping with keywords and tags
    const contextMap = {
      '/': { keywords: ['Dashboard'], tags: ['dashboard', 'home', 'overview'], priority: 1 },
      '/map': { keywords: ['Map'], tags: ['map', 'location', 'geography', 'polygon'], priority: 1 },
      '/establishments': { keywords: ['Establishment'], tags: ['establishment', 'business', 'add', 'edit'], priority: 1 },
      '/inspections': { keywords: ['Inspection'], tags: ['inspection', 'inspect', 'monitor', 'create'], priority: 1 },
      '/inspection/new': { keywords: ['Inspection', 'Create'], tags: ['inspection', 'create', 'new'], priority: 2 },
      '/inspection/': { keywords: ['Inspection'], tags: ['inspection', 'view', 'edit'], priority: 1 },
      '/users': { keywords: ['User Management', 'User'], tags: ['user', 'admin', 'management', 'role'], priority: 1 },
      '/billing': { keywords: ['Billing'], tags: ['billing', 'payment', 'legal', 'records'], priority: 1 },
      '/system-config': { keywords: ['System Configuration', 'Settings'], tags: ['system', 'config', 'settings', 'admin'], priority: 1 },
      '/database-backup': { keywords: ['Backup & Restore', 'Database'], tags: ['database', 'backup', 'restore', 'export', 'admin'], priority: 1 },
      '/notifications': { keywords: ['Notification'], tags: ['notification', 'alert', 'message'], priority: 1 },
      '/help': { keywords: ['Help'], tags: ['help', 'guide', 'support'], priority: 1 },
      '/profile': { keywords: ['Profile'], tags: ['profile', 'account', 'user', 'settings'], priority: 1 },
      '/change-password': { keywords: ['Password'], tags: ['password', 'security', 'change'], priority: 2 },
    };
    
    // Find matching route
    let matchedContext = null;
    let matchedPriority = 0;
    
    for (const [route, config] of Object.entries(contextMap)) {
      if (path.startsWith(route) && config.priority >= matchedPriority) {
        matchedContext = config;
        matchedPriority = config.priority;
      }
    }
    
    if (!matchedContext) return [];
    
    // Score and filter topics based on relevance
    const scoredTopics = accessibleTopics.map(topic => {
      let score = 0;
      const topicText = `${topic.title} ${topic.description} ${topic.category}`.toLowerCase();
      const topicTags = (topic.tags || []).map(t => t.toLowerCase());
      
      // Check keywords (highest weight)
      matchedContext.keywords.forEach(keyword => {
        if (topic.title.toLowerCase().includes(keyword.toLowerCase())) score += 10;
        if (topic.description.toLowerCase().includes(keyword.toLowerCase())) score += 5;
        if (topic.category?.toLowerCase().includes(keyword.toLowerCase())) score += 7;
      });
      
      // Check tags (medium weight)
      matchedContext.tags.forEach(tag => {
        if (topicTags.includes(tag)) score += 8;
        if (topicText.includes(tag)) score += 3;
      });
      
      return { topic, score };
    });
    
    // Filter topics with score > 0 and sort by score
    return scoredTopics
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.topic);
  };

  const contextHelp = getContextHelp();

  // Add topic to recent topics
  const addToRecentTopics = (topic) => {
    const updated = [
      topic,
      ...recentTopics.filter(t => t.id !== topic.id)
    ].slice(0, MAX_RECENT_TOPICS);
    
    setRecentTopics(updated);
    localStorage.setItem(RECENT_TOPICS_KEY, JSON.stringify(updated));
  };

  const handleHelpSuggestionClick = (topic) => {
    addToRecentTopics(topic);
    setSelectedTopic(topic);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedTopic(null);
  };

  const handleOpenFullHelpPage = () => {
    onClose();
    navigate("/help");
  };

  // Highlight search terms in text
  const highlightText = (text, query) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 text-gray-900">{part}</mark>
        : part
    );
  };

  // Get topics filtered by tab
  const getTopicsForTab = () => {
    if (activeTab === 'quick-start') {
      return accessibleTopics.filter(topic => topic.category === 'getting-started');
    } else if (activeTab === 'context') {
      return contextHelp;
    } else if (activeTab === 'recent') {
      return recentTopics;
    } else {
      return filteredHelpSuggestions;
    }
  };

  const tabTopics = getTopicsForTab();

  if (!isOpen) return null;

  return (
    <>
      {/* Help Modal - Centered overlay with backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg bg-gray-100/50 transition-all duration-300 ease-out"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
        >
          <div 
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full md:w-[90vw] md:max-w-3xl md:max-h-[80vh] md:min-h-[65vh] flex flex-col bg-white md:rounded-xl shadow-2xl border border-gray-200 transform transition-all duration-300 ease-out scale-100 opacity-100 animate-modalEntry"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 md:rounded-t-xl bg-sky-50">
              <h2 
                id="help-modal-title"
                className="flex items-center text-lg font-semibold text-sky-700"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Help Center
                <span className="ml-2 text-xs font-normal text-gray-500 hidden md:inline">
                  (ESC to close)
                </span>
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-1.5 transition-all duration-200 rounded-full hover:bg-gray-200"
                aria-label="Close help center"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search bar - Only show in list view */}
            {viewMode === 'list' && (
              <div className="px-4 py-3 bg-gray-50">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={helpSearchQuery}
                  onChange={handleHelpSearch}
                    className="w-full py-2 pl-10 pr-4 text-sm transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    aria-label="Search help topics"
                />
                </div>
              </div>
            )}

            {/* Tab Navigation - Only show in list view */}
            {viewMode === 'list' && (
              <div className="flex border-b border-gray-200 bg-white px-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.id === 'all') {
                          setHelpSearchQuery('');
                        }
                      }}
                      className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                        activeTab === tab.id
                          ? 'border-sky-600 text-sky-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
            </div>
            )}

            {/* Content Area - List or Detail View */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {viewMode === 'list' ? (
                /* LIST VIEW */
                <div className="px-4 py-3 space-y-4">
                  {tabTopics.length > 0 ? (
                    <ul className="space-y-2">
                      {tabTopics.map((topic, index) => (
                      <li
                        key={topic.id}
                          onClick={() => handleHelpSuggestionClick(topic)}
                          className="help-topic-card p-3 transition-all duration-200 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-sky-50 hover:border-sky-300 hover:shadow-sm"
                          role="button"
                          tabIndex={0}
                          onKeyPress={(e) => e.key === 'Enter' && handleHelpSuggestionClick(topic)}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="text-sm font-semibold text-gray-900">
                            {activeTab === 'all' && helpSearchQuery 
                              ? highlightText(topic.title, helpSearchQuery)
                              : topic.title
                            }
                        </div>
                        <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                            {activeTab === 'all' && helpSearchQuery
                              ? highlightText(topic.description, helpSearchQuery)
                              : topic.description
                            }
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                    <div className="py-12 text-center text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-medium">
                        {activeTab === 'recent' 
                          ? 'No recent topics yet'
                          : activeTab === 'context'
                          ? 'No help available for this page'
                          : activeTab === 'quick-start'
                          ? 'No quick start guides found'
                          : 'No topics found'
                        }
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {activeTab === 'all' && 'Try different keywords'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* DETAIL VIEW */
                <div className="flex flex-col h-full">
                  {/* Breadcrumb & Back Button */}
                  <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <button
                      onClick={handleBackToList}
                      className="flex items-center text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to Topics
                    </button>
                    <span className="ml-3 text-xs text-gray-400">
                      {TABS.find(t => t.id === activeTab)?.name} › {selectedTopic?.title}
                    </span>
                  </div>

                  {/* Topic Content */}
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {selectedTopic && (
                      <div className="max-w-3xl">
                        {/* Topic Title */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                          {selectedTopic.title}
                        </h2>
                        
                        {/* Topic Description */}
                        <p className="text-base text-gray-700 mb-6 leading-relaxed">
                          {selectedTopic.description}
                        </p>

                        {/* Steps */}
                        {selectedTopic.steps && selectedTopic.steps.length > 0 && (
                          <div className="space-y-6">
                            {selectedTopic.steps.map((step, index) => (
                              <div 
                                key={index} 
                                className="border-l-4 border-sky-500 pl-4 pb-4"
                              >
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-sm font-bold mr-2">
                                    {index + 1}
                                  </span>
                                  {step.title}
                                </h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                  {step.description}
                                </p>
                                {step.image && (
                                  <img
                                    src={step.image}
                                    alt={step.title}
                                    className="rounded-lg border border-gray-200 w-full max-w-2xl shadow-sm"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 md:rounded-b-xl">
              <button
                onClick={handleOpenFullHelpPage}
                className="flex items-center justify-center w-full py-2 text-sm font-medium transition-all duration-200 rounded-lg text-sky-600 hover:text-sky-700 hover:bg-sky-50"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Open Full Help Page (Optional)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
