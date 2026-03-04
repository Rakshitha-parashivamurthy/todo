import { getFirestore, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../firebase';

const _db = getFirestore();

/**
 * Error severity levels for categorization
 */
export enum ErrorSeverity {
  LOW = 'low',           // Non-critical, user can continue
  MEDIUM = 'medium',     // Affects feature, user should retry
  HIGH = 'high',         // Critical, feature broken
  CRITICAL = 'critical'  // App broken, needs immediate attention
}

/**
 * Error categories for grouping
 */
export enum ErrorCategory {
  FIRESTORE = 'firestore',
  AUTHENTICATION = 'auth',
  VALIDATION = 'validation',
  NETWORK = 'network',
  UI = 'ui',
  UNKNOWN = 'unknown'
}

/**
 * Enhanced error log structure
 */
interface ErrorLog {
  fn: string;                    // Function name where error occurred
  message: string;               // Error message
  stack?: string | null;         // Stack trace
  payload?: string | null;       // Data that caused error
  severity: ErrorSeverity;       // How critical is this error
  category: ErrorCategory;       // Type of error
  userId?: string;               // User ID
  timestamp: string;             // ISO timestamp
  createdAt: any;                // Firestore timestamp
  userAgent?: string;            // Browser info
  url?: string;                  // Page URL where error occurred
}

/**
 * Log error to console AND Firestore
 * 
 * @param fn - Function name where error occurred
 * @param error - The error object
 * @param options - Additional options
 * 
 * @example
 * try {
 *   await updateTask(id, updates);
 * } catch (err) {
 *   logError('updateTask', err, {
 *     severity: ErrorSeverity.MEDIUM,
 *     category: ErrorCategory.FIRESTORE,
 *     payload: { id, updates }
 *   });
 * }
 */
export async function logError(
  fn: string,
  error: unknown,
  options?: {
    payload?: any;
    severity?: ErrorSeverity;
    category?: ErrorCategory;
  }
) {
  const errorMsg = (error as any)?.message || String(error);
  const errorStack = (error as any)?.stack || null;
  const severity = options?.severity || ErrorSeverity.MEDIUM;
  const category = options?.category || ErrorCategory.UNKNOWN;

  // 🖥️ CONSOLE LOG WITH VISUAL INDICATOR
  const severityEmoji = {
    [ErrorSeverity.LOW]: '🟡',
    [ErrorSeverity.MEDIUM]: '🟠',
    [ErrorSeverity.HIGH]: '🔴',
    [ErrorSeverity.CRITICAL]: '⛔'
  };

  console.error(
    `${severityEmoji[severity]} [${fn}] ${category.toUpperCase()}: ${errorMsg}`,
    options?.payload || ''
  );

  // 💾 SAVE TO FIRESTORE FOR PERSISTENT LOGGING
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.warn('⚠️ Not authenticated - error not persisted');
      return;
    }

    const errorLog: ErrorLog = {
      fn,
      message: errorMsg,
      stack: errorStack,
      payload: options?.payload ? JSON.stringify(options.payload) : null,
      severity,
      category,
      userId: uid,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const errorId = crypto.randomUUID();
    await setDoc(doc(_db, 'users', uid, 'errors', errorId), errorLog);
    console.log(`✅ Error #${errorId.slice(0, 8)} logged to Firestore`);
  } catch (firestoreError) {
    console.error('❌ Failed to persist error to Firestore:', firestoreError);
  }
}

/**
 * Log info message (success, milestones)
 */
export function logInfo(message: string, data?: any) {
  console.log(`ℹ️ ${message}`, data || '');
}

/**
 * Log warning (non-blocking issues)
 */
export function logWarning(message: string, data?: any) {
  console.warn(`⚠️ ${message}`, data || '');
}

/**
 * Log performance metrics
 */
export async function logPerformance(
  functionName: string,
  duration: number,
  isSuccess: boolean
) {
  const status = isSuccess ? '✅' : '❌';
  console.log(`${status} ${functionName} completed in ${duration}ms`);

  // Optionally save to Firestore for analytics
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await setDoc(doc(_db, 'users', uid, 'metrics', `${functionName}-${Date.now()}`), {
      functionName,
      duration,
      isSuccess,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Failed to log performance metric:', err);
  }
}
