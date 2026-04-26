import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { FloatingPanel } from "@/vol_apps/tool/animation/FloatingPanel";
import { CheckIcon, Languages } from "lucide-react";

const TRIGGER_CLASS = cn(
    "flex items-center",
    "w-34 h-9",
    "text-foreground bg-background",
    "rounded-md border shadow-xs text-sm",
    "outline-none select-none",
    "hover:bg-accent hover:text-accent-foreground",
    "dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
);

const MENU_CLASS = cn(
    "absolute px-1 py-1",
    "border bg-popover text-popover-foreground rounded-md shadow-md",
    "z-1"
);

const ITEM_CLASS = cn(
    "flex items-center justify-between",
    "px-2 h-8 min-w-32 bg-background",
    "text-sm rounded-sm",
    "hover:bg-foreground/5",
    "whitespace-nowrap"
);

export interface Option {
    label: string;
    value: string;
}

export interface LanguageUiProps {
    /** 可选项列表（必须由外部传入） */
    options: Option[];
    /** 默认选中的值（不传则默认选中第一项） */
    defaultValue?: string;
    /** 选中值变化时的回调 */
    onChange?: (value: string) => void;
}

export const MySelect = ({
                               options,
                               defaultValue,
                               onChange,
                           }: LanguageUiProps) => {
    // 内部自行管理当前选中的值
    const [selectedValue, setSelectedValue] = useState<string>(
        defaultValue ?? options[0]?.value ?? ""
    );
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    // 当外部 defaultValue 变化时同步内部状态（可选）
    useEffect(() => {
        if (defaultValue !== undefined) {
            setSelectedValue(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        if (!isOpen) return;

        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (rootRef.current?.contains(target)) return;
            setIsOpen(false);
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen]);

    const currentLabel =
        options.find((opt) => opt.value === selectedValue)?.label ?? options[0]?.label ?? "";

    const handleSelect = (value: string) => {
        setIsOpen(false);
        setSelectedValue(value);
        // 保持流畅
        setTimeout(() => onChange?.(value));
    };

    return (
        <div className="w-fit animate-fade-in-scale" ref={rootRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(TRIGGER_CLASS)}
            >
                <div className="flex items-center justify-start pl-3">
                    <Languages className="size-4 text-foreground" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <span>{currentLabel}</span>
                </div>
                <div className="flex pr-3">
          <span
              className={cn(
                  "text-[12px] transition-transform duration-150 opacity-30",
                  isOpen && "rotate-180"
              )}
          >
            ▼
          </span>
                </div>
            </button>

            <div className="flex flex-fit">
                <FloatingPanel show={isOpen}>
                    <div className={cn(MENU_CLASS, "mt-1")}>
                        <ul className="flex flex-col">
                            {options.map(({ label, value }) => (
                                <button
                                    key={value}
                                    className={cn(ITEM_CLASS)}
                                    onClick={() => handleSelect(value)}
                                >
                                    {label}
                                    {selectedValue === value ? (
                                        <CheckIcon className="size-4" />
                                    ) : (
                                        <span className="size-4" />
                                    )}
                                </button>
                            ))}
                        </ul>
                    </div>
                </FloatingPanel>
            </div>
        </div>
    );
};