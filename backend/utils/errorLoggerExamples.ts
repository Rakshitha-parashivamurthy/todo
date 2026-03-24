/**
 * ERROR LOGGING USAGE EXAMPLES
 * 
 * This file shows how to use the enhanced error logging system
 * throughout your Todo App project
 */

import {
  logError,
  logInfo,
  logWarning,
  logPerformance,
  ErrorSeverity,
  ErrorCategory
} from './errorLogger';
import { addTaskToFirestore, deleteTaskFromFirestore } from '../../repos/firestoreTasks';
import { useStore } from '../../store'; // Add this import

// ============================================
// EXAMPLE 1: Firebase Operations (store.ts)
// ============================================

export const addTaskExample = async (taskData: any) => {
  const startTime = performance.now();

  try {
    // Your existing code...
    const response = await addTaskToFirestore(taskData, 'mock-company-id');
    
    const duration = performance.now() - startTime;
    logPerformance('addTaskToFirestore', duration, true);
    logInfo('Task created successfully', { taskData });
    
  } catch (err) {
    const duration = performance.now() - startTime;
    
    logError('addTaskToFirestore', err, {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.FIRESTORE,
      payload: { taskData } // Include data that failed
    });

    logPerformance('addTaskToFirestore', duration, false);
  }
};

// ============================================
// EXAMPLE 2: Data Validation (store.ts)
// ============================================

export const updateTaskExample = (id: string, updates: any) => {
  try {
    // Validate inputs
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid task ID: must be non-empty string');
    }

    if (!updates || Object.keys(updates).length === 0) {
      logWarning('updateTask called with empty updates', { id });
      return;
    }

    // Proceed with update...
    logInfo('Task updated', { id, updateCount: Object.keys(updates).length });

  } catch (err) {
    logError('updateTask', err, {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.VALIDATION,
      payload: { id, updates }
    });
  }
};

// ============================================
// EXAMPLE 3: Authentication Issues (App.tsx)
// ============================================

export const handleAuthError = (err: any) => {
  let category = ErrorCategory.AUTHENTICATION;
  let severity = ErrorSeverity.HIGH;

  if (err?.code === 'auth/user-not-found') {
    severity = ErrorSeverity.MEDIUM;
  } else if (err?.code === 'auth/network-request-failed') {
    category = ErrorCategory.NETWORK;
  }

  logError('auth', err, {
    severity,
    category,
    payload: { code: err?.code }
  });
};

// ============================================
// EXAMPLE 4: Async Operations with try-catch
// ============================================

export const deleteTaskExample = async (taskId: string) => {
  try {
    await deleteTaskFromFirestore(taskId);
    logInfo('Task deleted', { taskId });
  } catch (err) {
    logError('deleteTaskFromFirestore', err, {
      severity: err.message?.includes('unauthorized') 
        ? ErrorSeverity.CRITICAL 
        : ErrorSeverity.HIGH,
      category: ErrorCategory.FIRESTORE,
      payload: { taskId }
    });
  }
};

// ============================================
// EXAMPLE 5: Complex State Updates
// ============================================

export const toggleTaskExample = (taskId: string) => {
  try {
    const task = useStore.getState().tasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const isNowCompleted = !task.completed;
    
    logInfo('Task toggled', {
      taskId,
      newStatus: isNowCompleted ? 'completed' : 'active'
    });

    // Proceed with state update...

  } catch (err) {
    logError('toggleTask', err, {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UI,
      payload: { taskId }
    });
  }
};

// ============================================
// HOW TO USE IN YOUR PROJECT
// ============================================

// STEP 1: Import at the top of your file
// import { logError, logInfo, ErrorSeverity, ErrorCategory } from '../utils/errorLogger';

// STEP 2: Wrap operations in try-catch
// * try {
// *   // Your code
// * } catch (err) {
// *   logError('functionName', err, {
// *     severity: ErrorSeverity.MEDIUM,
// *     category: ErrorCategory.FIRESTORE,
// *     payload: { /* data that failed */ }
// *   });
// * }
// 
// STEP 3: View logs in two places:
//   A) Browser Console (DevTools)
//   B) Firestore: users/{uid}/errors/{errorId}
//
// SEVERITY GUIDE:
//   🟡 LOW      - User can continue using app (non-blocking)
//   🟠 MEDIUM   - Feature broken, needs user action (retry)
//   🔴 HIGH     - Major feature broken, app mostly works
//   ⛔ CRITICAL - App is broken, needs immediate fix
//
// CATEGORY GUIDE:
//   - firestore: Database operations (read/write failures)
//   - auth: Authentication/authorization issues
//   - validation: Input validation failures
//   - network: Network request failures
//   - ui: UI/rendering issues
//   - unknown: Unclassified errors
