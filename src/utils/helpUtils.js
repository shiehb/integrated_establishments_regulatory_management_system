/**
 * Utility functions for help system filtering
 */

/**
 * Filters help topics based on user level access
 * @param {Array} topics - Array of help topics
 * @param {string} userLevel - Current user's level/role
 * @returns {Array} Filtered array of help topics
 */
export const filterTopicsByUserLevel = (topics, userLevel) => {
  if (!topics || !userLevel) return topics || [];
  
  return topics.filter(topic => {
    // If access array is empty, topic is available to all users
    if (!topic.access || topic.access.length === 0) {
      return true;
    }
    
    // Check if user level is in the access array
    return topic.access.includes(userLevel);
  });
};

/**
 * Filters help categories based on user level access
 * @param {Array} categories - Array of help categories
 * @param {Array} filteredTopics - Already filtered topics
 * @returns {Array} Filtered categories with only accessible topics
 */
export const filterCategoriesByUserLevel = (categories, filteredTopics) => {
  if (!categories || !filteredTopics) return categories || [];
  
  const filteredTopicIds = new Set(filteredTopics.map(topic => topic.id));
  
  return categories.map(category => ({
    ...category,
    items: category.items.filter(topic => filteredTopicIds.has(topic.id))
  })).filter(category => category.items.length > 0); // Remove empty categories
};

/**
 * Maps user level to normalized format for access checking
 * @param {string} userLevel - Raw user level from props/state
 * @returns {string} Normalized user level
 */
export const normalizeUserLevel = (userLevel) => {
  if (!userLevel) return 'public';
  
  // Map common variations to standard format
  const levelMap = {
    'public': 'public',
    'admin': 'admin',
    'division chief': 'Division Chief',
    'section chief': 'Section Chief', 
    'unit head': 'Unit Head',
    'monitoring personnel': 'Monitoring Personnel',
    'legal unit': 'Legal Unit'
  };
  
  return levelMap[userLevel.toLowerCase()] || userLevel;
};
