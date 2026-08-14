import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

interface InfoFieldProps {
    icon: React.ElementType;
    label: string;
    id: string;
    value: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditing: boolean;
    type?: string;
    maxLength?: number;
    required?: boolean;
}

export const InfoField = ({
                              icon: Icon,
                              label,
                              id,
                              value,
                              handleChange,
                              isEditing,
                              type = "text",
                              maxLength,
                              required = false
                          }: InfoFieldProps) => (
    <div className="space-y-1.5 w-full">
        <Label htmlFor={id} className="text-zinc-500 text-xs font-medium flex items-center gap-1.5 pl-1 cursor-pointer">
            <Icon className={`h-3.5 w-3.5 shrink-0 ${isEditing ? 'text-red-600' : 'text-zinc-400'}`}/>
            <span>{label}</span>
            {required && <span className="text-red-600 font-bold">*</span>}
        </Label>
        {isEditing ? (
            <div className="w-full">
                <Input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    maxLength={maxLength}
                    className="bg-white border-zinc-200 focus:border-red-500 focus:ring-0 font-medium h-11 rounded-xl text-sm text-zinc-900 uppercase w-full"
                />
            </div>
        ) : (
            <div
                className="bg-white border border-zinc-200/80 text-zinc-900 px-4 py-3 rounded-xl min-h-[44px] flex items-center font-medium text-sm break-all uppercase w-full">
                {value || "N/D"}
            </div>
        )}
    </div>
);