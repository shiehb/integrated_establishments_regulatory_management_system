// API Optimization Test Utility
// This file can be used to test and monitor API call optimizations

import apiCache from '../services/apiCache';

export const testApiOptimization = () => {
  console.log('🧪 Testing API Optimization...');
  
  // Test cache functionality
  const testData = { test: 'data', timestamp: Date.now() };
  const testKey = 'test_endpoint';
  const testParams = { page: 1, size: 10 };
  
  // Test cache set/get
  apiCache.set(testKey, testParams, testData, 1000); // 1 second TTL
  const cached = apiCache.get(testKey, testParams);
  
  if (cached && cached.test === testData.test) {
    console.log('✅ Cache set/get working correctly');
  } else {
    console.log('❌ Cache set/get failed');
  }
  
  // Test cache expiration
  setTimeout(() => {
    const expired = apiCache.get(testKey, testParams);
    if (!expired) {
      console.log('✅ Cache expiration working correctly');
    } else {
      console.log('❌ Cache expiration failed');
    }
  }, 1100);
  
  // Test cache stats
  const stats = apiCache.getStats();
  console.log('📊 Cache stats:', stats);
  
  // Test pattern clearing
  apiCache.set('inspections_test', {}, testData);
  apiCache.set('users_test', {}, testData);
  apiCache.clearByPattern('inspections');
  
  const afterClear = apiCache.getStats();
  console.log('📊 Cache stats after pattern clear:', afterClear);
  
  return {
    cacheWorking: cached && cached.test === testData.test,
    stats: apiCache.getStats()
  };
};

export const monitorApiCalls = () => {
  let callCount = 0;
  let cacheHits = 0;
  
  // Override console.log to monitor API calls
  const originalLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    if (message.includes('🌐 API call')) {
      callCount++;
    } else if (message.includes('🚀 Cache hit')) {
      cacheHits++;
    }
    originalLog(...args);
  };
  
  return {
    getStats: () => ({ callCount, cacheHits }),
    reset: () => { callCount = 0; cacheHits = 0; }
  };
};

// Performance monitoring
export const measurePerformance = (fn, label) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  return result;
};

export default {
  testApiOptimization,
  monitorApiCalls,
  measurePerformance
};
