import { useState, useEffect } from "react";

export const useUserActivation = () => {
    const [hasInteracted, setHasInteracted] = useState(() => {
        // 初始判断（刷新后依然有效）
        return navigator.userActivation?.hasBeenActive ?? false;
    });

    useEffect(() => {
        // 如果已经激活，直接返回
        if (navigator.userActivation?.hasBeenActive) {
            setHasInteracted(true);
            return;
        }

        const markAsInteracted = () => {
            setHasInteracted(true);
        };

        // 常见用户交互事件
        const events = ['click', 'touchstart', 'keydown', 'mousedown', 'pointerdown'];

        events.forEach(event => {
            document.addEventListener(event, markAsInteracted, {
                once: true,   // 只监听一次
                passive: true
            });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, markAsInteracted);
            });
        };
    }, []);

    return hasInteracted;
};