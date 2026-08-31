"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    let active = true;

    // The full international phone metadata is substantial. It is only needed
    // after this field has painted, so keep it out of the login critical path.
    void import("libphonenumber-js").then(({ getCountries, getCountryCallingCode }) => {
      if (!active) return;
      const names = new Intl.DisplayNames(["en"], { type: "region" });
      setCountries(getCountries()
        .map((country) => ({ country, label: names.of(country) || country, callingCode: getCountryCallingCode(country) }))
        .sort((left, right) => left.label.localeCompare(right.label)));
    });

    return () => { active = false; };
  }, []);

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
        >
          {countries.map(({ country, label, callingCode }) => <option key={country} value={country}>{label} (+{callingCode})</option>)}
        </select>
        <Input disabled={disabled} id="phone" inputMode="tel" name="phone" autoComplete="tel-national" placeholder="98765 43210" required type="tel" />
      </div>
    </div>
  );
}
