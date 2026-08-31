"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PhoneNumberFieldsProps = {
  disabled?: boolean;
  defaultCountry?: string;
};

export function PhoneNumberFields({ disabled, defaultCountry = "IN" }: PhoneNumberFieldsProps) {
  const [countries, setCountries] = useState(() => [{
    country: defaultCountry,
    label: defaultCountry === "IN" ? "India" : defaultCountry,
    callingCode: defaultCountry === "IN" ? "91" : ""
  }]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  function loadCountries() {
    if (isLoadingCountries || countries.length > 1) return;

    setIsLoadingCountries(true);

    // This metadata is only useful when a teacher wants to change country.
    // Loading it at page startup creates a long task on the login screen.
    void import("libphonenumber-js").then(({ getCountries, getCountryCallingCode }) => {
      const names = new Intl.DisplayNames(["en"], { type: "region" });
      setCountries(getCountries()
        .map((country) => ({ country, label: names.of(country) || country, callingCode: getCountryCallingCode(country) }))
        .sort((left, right) => left.label.localeCompare(right.label)));
    }).finally(() => setIsLoadingCountries(false));
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Mobile number</Label>
      <div className="grid grid-cols-[minmax(7.5rem,0.8fr)_minmax(0,1.2fr)] gap-2">
        <select
          aria-label="Country"
          className="h-10 min-w-0 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          defaultValue={defaultCountry}
          disabled={disabled}
          name="country"
          onFocus={loadCountries}
        >
          {countries.map(({ country, label, callingCode }) => <option key={country} value={country}>{label} (+{callingCode})</option>)}
        </select>
        <Input disabled={disabled} id="phone" inputMode="tel" name="phone" autoComplete="tel-national" placeholder="98765 43210" required type="tel" />
      </div>
    </div>
  );
}
