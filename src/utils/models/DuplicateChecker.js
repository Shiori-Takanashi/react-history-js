// src/utils/models/DuplicateChecker.js

const DEFAULT_DUPLICATE_WINDOW = 120; // ms

/**
 * 重複チェック用のクラス
 * ページアクセスの重複を検出する
 */
export class DuplicateChecker {
  constructor() {
    this.lastPath = "";
    this.lastKey = "";
    this.lastTime = 0;
  }

  /**
   * 現在のパスと前回のパスが重複しているかチェック
   * @param {string} path - 現在のパス
   * @param {string} key - ナビゲーションキー
   * @param {number} window - 重複判定のウィンドウ（ms）
   * @returns {boolean} 重複している場合は true
   */
  isDuplicate(path, key = "", window = DEFAULT_DUPLICATE_WINDOW) {
    const now = Date.now();
    const isSamePath = this.lastPath === path;
    const isSameKey = this.lastKey === key;
    const withinWindow = now - this.lastTime < window;

    return isSamePath && isSameKey && withinWindow;
  }

  /**
   * 前回のアクセス情報を更新
   * @param {string} path - パス
   * @param {string} key - ナビゲーションキー
   */
  update(path, key = "") {
    this.lastPath = path;
    this.lastKey = key;
    this.lastTime = Date.now();
  }

  /**
   * リセット
   */
  reset() {
    this.lastPath = "";
    this.lastKey = "";
    this.lastTime = 0;
  }
}

/**
 * DuplicateChecker のインスタンスを作成
 * @returns {DuplicateChecker}
 */
export const createDuplicateChecker = () => new DuplicateChecker();

/**
 * 新しい履歴エントリを作成
 * @param {string} path - ページパス
 * @returns {Object} 履歴エントリ { path, timestamp }
 */
export function createHistoryEntry(path) {
  return {
    path,
    timestamp: Date.now(),
  };
}
