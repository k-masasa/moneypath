/**
 * シンプルなメモリベースのレート制限実装
 * 本番環境でRedisなどに移行する場合は、このファイルを差し替える
 */

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

// メモリストア（IPアドレスごとのリクエスト回数を記録）
const store = new Map<string, RateLimitRecord>();

// 定期的に古いレコードをクリーンアップ（メモリリーク防止）
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}, 60000); // 1分ごとにクリーンアップ

export type RateLimitConfig = {
  maxRequests: number; // 最大リクエスト数
  windowSeconds: number; // 時間枠（秒）
};

export type RateLimitResult = {
  success: boolean; // レート制限内かどうか
  limit: number; // 最大リクエスト数
  remaining: number; // 残りリクエスト数
  reset: number; // リセット時刻（Unixタイムスタンプ）
};

/**
 * レート制限をチェック
 * @param identifier - 識別子（IPアドレスなど）
 * @param config - レート制限の設定
 * @returns レート制限の結果
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // 既存のレコードを取得または新規作成
  let record = store.get(identifier);

  if (!record || now > record.resetTime) {
    // 新規またはリセット時刻を過ぎている場合
    record = {
      count: 0,
      resetTime: now + windowMs,
    };
    store.set(identifier, record);
  }

  // リクエストをカウント
  record.count++;

  // レート制限チェック
  const success = record.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - record.count);

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: Math.floor(record.resetTime / 1000), // 秒単位に変換
  };
}

/**
 * 認証系API用のレート制限設定（厳しめ）
 */
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5, // 5回まで
  windowSeconds: 60, // 1分間
};

/**
 * 一般API用のレート制限設定（緩め）
 */
export const API_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100, // 100回まで
  windowSeconds: 60, // 1分間
};
