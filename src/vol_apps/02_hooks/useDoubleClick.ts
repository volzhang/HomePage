import { useEffect, useRef } from 'react';

export const useDoubleClick =
    ({
        open,
        handle,
        containerSelector = '#root'
     }:{
    open: boolean,
    handle: () => void,
    containerSelector: string | string[] ,
    }
) => {
    const handleRef = useRef(handle);
    handleRef.current = handle;

    // 统一转为逗号分隔的选择器字符串，例如 "#root, #hero"
    const selector = Array.isArray(containerSelector)
        ? containerSelector.join(',')
        : containerSelector;

    useEffect(() => {
        if (!open) return;
        const html = document.documentElement;

        const onDoubleClick = (e: MouseEvent) => {
            const target = e.target as Element;
            // 只接受目标元素本身匹配选择器
            if (!target.matches(selector)) return;
            handleRef.current();
        };

        html.addEventListener('dblclick', onDoubleClick);
        return () => html.removeEventListener('dblclick', onDoubleClick);
    }, [open, selector]);
}