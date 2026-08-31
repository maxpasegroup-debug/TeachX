"use client";

import { useEffect, useState } from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PhoneNumberFieldsProps = {
  disabled?: boolean;
  defaultCountry?: string;
};

export function PhoneNumberFields({ disabled, defaultCountry = "IN" }: PhoneNumberFieldsProps) {
  const [countryLabels, setCountryLabels] = useState<Record<string, string>>({});

  // Keep the server and first browser render identical. Locale-aware country
  // names and sorting can differ between Node and Chromium and cause hydration
  // failures on the sign-in and sign-up pages.
  const countries = getCountries().map((country) => ({
    country,
    label: countryLabels[country] ?? country,
    callingCode: getCountryCallingCode(country)
  }));

  useEffect(() => {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    setCountryLabels(Object.fromEntries(getCountries().map((country) => [country, names.of(country) || country])));
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
