'use client';

import { useState } from 'react';
import { toastError } from '@/lib/toast';

export function useFormFeedback() {
  const [hasError, setHasError] = useState(false);

  function reportError(err: unknown, fallback?: string) {
    setHasError(true);
    toastError(err, fallback);
  }

  function clearError() {
    setHasError(false);
  }

  return {
    hasError,
    fieldClass: hasError ? 'input-error' : undefined,
    btnClass: hasError ? 'btn btn-error' : 'btn',
    secondaryBtnClass: hasError ? 'btn secondary btn-error-outline' : 'btn secondary',
    formClass: hasError ? 'form form-error' : 'form',
    reportError,
    clearError,
  };
}
