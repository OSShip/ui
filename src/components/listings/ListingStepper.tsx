'use client';

interface ListingStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  disabled?: boolean;
}

export function ListingStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  suffix = '',
  disabled,
}: ListingStepperProps) {
  return (
    <div className="listing-stepper">
      <button
        type="button"
        className="listing-stepper-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease"
      >
        −
      </button>
      <span className="listing-stepper-value">
        {value}
        {suffix && <small>{suffix}</small>}
      </span>
      <button
        type="button"
        className="listing-stepper-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
