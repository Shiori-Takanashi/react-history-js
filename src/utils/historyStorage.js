// src/utils/historyStorage.js

const STORAGE_KEY = 'appHistory';

/**
 * localStorage から履歴を取得
 * @returns {Array} 保存されている履歴データ、エラー時は空配列
 */
export function getHistoryFromStorage() {
  try {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
    return [];
  }
}

/**
 * 履歴を localStorage に保存
 * @param {Array} history - 保存する履歴データ
 */
export function saveHistoryToStorage(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history to localStorage:', error);
  }
}
