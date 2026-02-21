import * as React from "react";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { cn } from "@/lib/utils";

export interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

const countries = [
    { name: "Senegal", code: "+221", flag: "🇸🇳" },
    { name: "Mali", code: "+223", flag: "🇲🇱" },
    { name: "Côte d'Ivoire", code: "+225", flag: "🇨🇮" },
    { name: "Guinée", code: "+224", flag: "🇬🇳" },
    { name: "France", code: "+33", flag: "🇫🇷" },
    { name: "Maroc", code: "+212", flag: "🇲🇦" },
    { name: "Gambia", code: "+220", flag: "🇬🇲" },
    { name: "Burkina Faso", code: "+226", flag: "🇧🇫" },
    { name: "Benin", code: "+229", flag: "🇧🇯" },
    { name: "Togo", code: "+228", flag: "🇹🇬" },
];

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ value, onChange, className, placeholder, disabled }, ref) => {
        // Split value into country code and local number
        // We assume the value starts with +
        const [countryCode, setCountryCode] = React.useState("+221");
        const [localNumber, setLocalNumber] = React.useState("");

        // Initialize from value prop if it exists
        React.useEffect(() => {
            if (value && value.startsWith("+")) {
                const matchingCountry = countries.find(c => value.startsWith(c.code));
                if (matchingCountry) {
                    setCountryCode(matchingCountry.code);
                    setLocalNumber(value.slice(matchingCountry.code.length).trim());
                } else {
                    // Fallback if country code not in our list
                    const codeMatch = value.match(/^\+\d+/);
                    if (codeMatch) {
                        setCountryCode(codeMatch[0]);
                        setLocalNumber(value.slice(codeMatch[0].length).trim());
                    }
                }
            }
        }, [value]);

        const handleCountryChange = (newCode: string) => {
            setCountryCode(newCode);
            onChange(`${newCode}${localNumber}`);
        };

        const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value.replace(/\D/g, ""); // Only digits
            setLocalNumber(val);
            onChange(`${countryCode}${val}`);
        };

        return (
            <div className={cn("flex border border-input rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
                <Select value={countryCode} onValueChange={handleCountryChange} disabled={disabled}>
                    <SelectTrigger className="w-[70px] h-11 border-none bg-muted/30 px-3 rounded-none focus:ring-0">
                        <SelectValue>
                            <div className="flex items-center justify-center">
                                <span className="text-xl">{countries.find(c => c.code === countryCode)?.flag || "🌍"}</span>
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{country.flag}</span>
                                    <span className="flex-1 font-medium">{country.name}</span>
                                    <span className="text-muted-foreground text-xs">{country.code}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center h-11 px-3 bg-muted/10 border-l border-input select-none">
                    <span className="text-sm font-medium text-muted-foreground">{countryCode}</span>
                </div>
                <Input
                    type="tel"
                    ref={ref}
                    value={localNumber}
                    onChange={handleLocalNumberChange}
                    placeholder={placeholder || "77 123 45 67"}
                    disabled={disabled}
                    className="flex-1 h-11 border-none bg-background rounded-none focus-visible:ring-0"
                />
            </div>
        );
    }
);

PhoneInput.displayName = "PhoneInput";
