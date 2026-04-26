import { useState, useEffect, useRef, useCallback } from "react";

type ThrottledColorPickerProps = {
    value: string;
    onChange: (color: string) => void;
    delay?: number;
    className?: string;
};

export const ThrottledColorPicker = ({
                                         value,
                                         onChange,
                                         delay = 50,
                                         className,
                                     }: ThrottledColorPickerProps) => {
    const [localColor, setLocalColor] = useState(value);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingRef = useRef<string | null>(null);
    const isThrottlingRef = useRef(false);
    const isInteractingRef = useRef(false);

    const onChangeRef = useRef(onChange);

    // 保持 onChange 稳定
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // 仅在“非用户交互中”同步外部 value
    useEffect(() => {
        if (!isInteractingRef.current && value !== localColor) {
            setLocalColor(value);
        }
    }, [value]);

    const flush = useCallback(() => {
        if (pendingRef.current !== null) {
            onChangeRef.current(pendingRef.current);
            pendingRef.current = null;
        }
    }, []);

    // noinspection DuplicatedCode
    const startTimer = useCallback(() => {
        timerRef.current = setTimeout(() => {
            isThrottlingRef.current = false;
            flush();

            // 如果 flush 后又产生新值，继续下一轮
            if (pendingRef.current !== null) {
                isThrottlingRef.current = true;
                startTimer();
            }
        }, delay);
    }, [delay, flush]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newColor = e.target.value;

            isInteractingRef.current = true;
            setLocalColor(newColor);
            pendingRef.current = newColor;

            if (!isThrottlingRef.current) {
                flush(); // leading
                isThrottlingRef.current = true;
                startTimer();
            }
        },
        [flush, startTimer],
    );

    const endInteraction = useCallback(() => {
        isInteractingRef.current = false;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        isThrottlingRef.current = false;
        flush(); // 确保最后值一定提交
    }, [flush]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <input
            type="color"
            className={className}
            value={localColor}
            onChange={handleChange}
            onBlur={endInteraction}
            onMouseUp={endInteraction}
            onTouchEnd={endInteraction}
        />
    );
};