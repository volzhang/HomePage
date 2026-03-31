import {useState, type InputHTMLAttributes, useEffect, useRef} from "react";

interface UseEditableInputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    initialValue?: string;
    handleSubmit?: () => void;
    handleEscape?: () => void;
}

export function useEditableInput({
                                     initialValue = "",
                                     handleSubmit,
                                     handleEscape,
                                     style,
                                     onChange,
                                     onBlur,
                                     onKeyDown,
                                     ...inputProps
                                 }: UseEditableInputProps) {

    const [inputString, setInputString] = useState(initialValue);
    const [inputSize, setInputSize] = useState<{ width: number; height: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        handleSubmit?.();
        onBlur?.(e);
    };

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") handleEscape?.();
        onKeyDown?.(e);
    };

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputString(e.currentTarget.value);
        onChange?.(e);
    };

    const [inputWidth, setInputWidth] = useState(0);

    useEffect(() => {
        if (!inputRef.current) return;
        const span = document.createElement("span");
        span.style.visibility = "hidden";
        span.style.position = "absolute";
        span.style.font = getComputedStyle(inputRef.current).font;
        span.innerText = inputString || " ";
        document.body.appendChild(span);
        setInputWidth(span.offsetWidth + 32); // 16 = padding buffer
        document.body.removeChild(span);
    }, [inputString]);

    const inputPropsResult: InputHTMLAttributes<HTMLInputElement> = {
        value: inputString,
        onChange: handleOnChange,
        onBlur: handleOnBlur,
        onKeyDown: handleOnKeyDown,
        style: {
            // width: inputString.length * 8 + 36,
            width: inputWidth,
            height: inputSize?.height ?? undefined,
            ...style,
        },
        ...inputProps
    };

    return {
        inputProps: inputPropsResult,
        inputString,
        inputSize,
        inputRef,
        inputWidth,

        setInputString,
        setInputSize
    };
}