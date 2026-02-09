"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "./ui/textarea";
import { cn } from "../lib/utils";

interface AIInputWithSuggestionsProps {
    id?: string;
    placeholder?: string;
    minHeight?: number;
    maxHeight?: number;
    onSubmit?: (text: string) => void;
    className?: string;
    value?: string;
    onChange?: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
}

export function AIInputWithSuggestions({
    id = "ai-input-with-actions",
    placeholder = "Enter your text here...",
    minHeight = 48,
    maxHeight = 300,
    onSubmit,
    className,
    value: externalValue,
    onChange: externalOnChange,
    onKeyDown: externalOnKeyDown,
    disabled
}: AIInputWithSuggestionsProps) {
    const [internalValue, setInternalValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const value = externalValue !== undefined ? externalValue : internalValue;

    const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        if (externalOnChange) {
            externalOnChange(newVal);
        } else {
            setInternalValue(newVal);
        }
    };

    // Simple height adjustment that doesn't trigger on every render if height is already correct
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
            textarea.style.height = `${newHeight}px`;
        }
    }, [value, minHeight, maxHeight]);

    return (
        <div className={cn("w-full py-2 sm:py-3", className)}>
            <div className="relative w-full mx-auto">
                <div className="relative border border-black/10 rounded-xl sm:rounded-2xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-black/5 transition-all overflow-hidden">
                    <Textarea
                        ref={textareaRef}
                        id={id}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={cn(
                            "w-full pr-10 pt-2 pb-2 text-base placeholder:text-zinc-400 border-none focus:ring-0 text-zinc-900 resize-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 leading-tight min-h-[38px]",
                            disabled && "opacity-50 cursor-not-allowed bg-zinc-50"
                        )}
                        style={{ height: `${minHeight}px` }}
                        value={value}
                        onChange={handleValueChange}
                        onKeyDown={(e) => {
                            if (externalOnKeyDown) {
                                externalOnKeyDown(e);
                            }
                            if (e.key === "Enter" && !e.shiftKey) {
                                if (onSubmit) {
                                    e.preventDefault();
                                    onSubmit(value);
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
