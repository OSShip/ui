'use client';

import CurrencyInput from 'react-currency-input-field';

interface CurrencyFieldProps {
  valueCents: number;
  onChangeCents: (cents: number) => void;
  disabled?: boolean;
  hasError?: boolean;
  id?: string;
}

export function CurrencyField({
  valueCents,
  onChangeCents,
  disabled,
  hasError,
  id,
}: CurrencyFieldProps) {
  const displayValue = valueCents > 0 ? valueCents / 100 : undefined;

  return (
    <div className={`currency-field${hasError ? ' currency-field-error' : ''}`}>
      <CurrencyInput
        id={id}
        className="currency-field-input"
        name="price"
        prefix="$"
        decimalsLimit={2}
        decimalScale={2}
        allowNegativeValue={false}
        disableGroupSeparators={false}
        value={displayValue}
        disabled={disabled}
        placeholder="0.00"
        onValueChange={(value) => {
          if (!value) {
            onChangeCents(0);
            return;
          }
          const dollars = Number.parseFloat(value);
          if (Number.isNaN(dollars)) return;
          onChangeCents(Math.round(dollars * 100));
        }}
      />
    </div>
  );
}
