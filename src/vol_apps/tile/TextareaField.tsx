import {cn} from "@/lib/utils";
import React, {type Ref, useEffect, useRef, useState} from "react";
import {useMergeRefsLoose} from "../02_hooks/01_useMergeRefs";

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** 失焦或 Enter 时提交 */
    onCommit?: (value: string) => void;
    /** 按 Enter 后自动聚焦的目标元素 */
    enterFocusRef?: React.RefObject<HTMLElement | null>;
    /** 实时转换（如补全协议），结果直接显示在输入框 */
    transform?: (input: string) => string;
    /** 每次输入变化时实时回调（已应用 transform 的值） */
    onLiveChange?: (value: string) => void;

    ref?: Ref<HTMLTextAreaElement>;
}

export const TextareaField = ({
                                  onCommit,
                                  enterFocusRef,
                                  transform,
                                  onLiveChange,
                                  value,
                                  defaultValue,
                                  onInput,
                                  onKeyDown,
                                  onBlur,
                                  ref,
                                  ...props
                              }: TextareaFieldProps) => {


    const internalRef = useRef<HTMLTextAreaElement>(null);

    // 合并内部和外部 ref，内部 ref 用于防抖/高度自适应，外部 ref 用于聚焦等
    const mergedRef = useMergeRefsLoose(internalRef, ref);

    const isControlled = value !== undefined;
    const initial = (isControlled ? value : defaultValue) ?? "";
    const [localValue, setLocalValue] = useState<string>(String(initial));
    const isInteracting = useRef(false);

    // 外部 value 同步（仅非交互期间）
    useEffect(() => {
        if (!isControlled) return;
        if (!isInteracting.current && value !== localValue) {
            setLocalValue((value as string) ?? "");
        }
    }, [value, isControlled]);

    // 高度自适应
    const adjustHeight = () => {
        const el = internalRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    };

    useEffect(() => {
        adjustHeight();
    }, [localValue]);

    const commit = (val: string) => {
        isInteracting.current = false;
        onCommit?.(val);
    };

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const rawValue = e.currentTarget.value;
        let nextValue: string;
        if (transform) {
            nextValue = transform(rawValue);
        } else {
            nextValue = rawValue;
        }

        isInteracting.current = true;
        setLocalValue(nextValue);
        adjustHeight();
        onInput?.(e);

        // 实时通知外部
        onLiveChange?.(nextValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            if (e.shiftKey) {
                e.stopPropagation();
            } else {
                e.preventDefault();
                e.stopPropagation();
                const val = e.currentTarget.value;
                isInteracting.current = false;
                commit(val);
                e.currentTarget.blur();
                // 聚焦到 OK 按钮
                if (enterFocusRef?.current) {
                    setTimeout(() => {
                        enterFocusRef.current?.focus();
                    }, 0);
                }
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.blur();
        }
        onKeyDown?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        commit(e.currentTarget.value);
        onBlur?.(e);
    };

    return (
        <textarea
            {...props}
            ref={mergedRef}
            rows={1}
            wrap="soft"
            value={localValue}
            className={cn(props.className)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
        />
    );
}
