import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ShieldAlert} from "lucide-react";
import React from "react";

export const Field = ({
                          icon: Icon,
                          label,
                          id,
                          name,
                          value,
                          onChange,
                          type = "text",
                          placeholder = "Non specificato",
                          error,
                          maxLength,
                          required = false,
                          isEditing = true,
                          disabled = false, // <-- Aggiunto
                          className = ""
                      }: {
    icon?: React.ElementType;
    label: string;
    id: string;
    name?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    error?: string | null;
    maxLength?: number;
    required?: boolean;
    isEditing?: boolean;
    disabled?: boolean; // <-- Aggiunto al tipo
    className?: string;
}) => (
    <div className={`space-y-1.5 w-full ${className}`}>
        <Label
            htmlFor={id}
            className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 pl-1 cursor-pointer"
        >
            {Icon && (
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isEditing && !disabled ? 'text-red-600' : 'text-zinc-400'}`}/>
            )}
            <span>{label}</span>
            {required && <span className="text-red-600 font-bold">*</span>}
        </Label>

        {isEditing ? (
            <div className="w-full">
                <Input
                    id={id}
                    name={name || id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={disabled} // <-- Passato all'input nativo
                    className={`bg-white border-zinc-200 focus:border-red-500 focus:ring-0 font-medium h-11 rounded-xl text-sm text-zinc-900 w-full uppercase ${
                        error ? "border-red-500 focus:border-red-500" : ""
                    } ${disabled ? "bg-zinc-100 text-zinc-500 cursor-not-allowed" : ""}`}
                />
                {error && (
                    <p className="text-red-600 text-xs mt-1.5 font-medium flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0"/>
                        {error}
                    </p>
                )}
            </div>
        ) : (
            <div
                className="bg-white border border-zinc-200/80 text-zinc-900 px-4 py-3 rounded-xl min-h-[44px] flex items-center text-sm break-all w-full uppercase">
                {type === "date" && value ? new Date(value).toLocaleDateString('it-IT') : (value || placeholder)}
            </div>
        )}
    </div>
);