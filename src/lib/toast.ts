import { toast } from 'sonner';

function humanizeError(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseApiError(err: unknown, fallback = 'Something went wrong'): string {
  if (!(err instanceof Error)) return fallback;
  let raw = err.message.trim();
  if (!raw) return fallback;

  for (let i = 0; i < 3; i++) {
    try {
      const parsed = JSON.parse(raw) as { error?: string; message?: string };
      const next = parsed.error || parsed.message;
      if (!next) break;
      if (next === raw) break;
      raw = next.trim();
    } catch {
      break;
    }
  }

  if (raw.startsWith('{') || raw.startsWith('[')) return fallback;
  if (raw.length > 140) return `${raw.slice(0, 140)}…`;
  return humanizeError(raw);
}

export function toastError(err: unknown, fallback?: string) {
  toast.error(parseApiError(err, fallback), {
    classNames: {
      toast: 'osship-toast osship-toast-error',
      title: 'osship-toast-title',
      description: 'osship-toast-desc',
    },
  });
}

export function toastSuccess(message: string, description?: string) {
  toast.success(message, {
    description,
    classNames: {
      toast: 'osship-toast osship-toast-success',
      title: 'osship-toast-title',
      description: 'osship-toast-desc',
    },
  });
}

export function toastInfo(message: string, description?: string) {
  toast(message, {
    description,
    classNames: {
      toast: 'osship-toast osship-toast-info',
      title: 'osship-toast-title',
      description: 'osship-toast-desc',
    },
  });
}
