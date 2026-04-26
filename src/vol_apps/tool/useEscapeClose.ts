// useEscapeClose.ts
import { useEffect } from 'react';

/**
 * 监听 ESC 键关闭的 Hook
 * @param isOpen 当前是否打开（控制监听生效状态）
 * @param onClose 关闭时的回调函数
 */
export const useEscapeClose = (isOpen: boolean, onClose: () => void) => {
    useEffect(() => {
        if (!isOpen) return; // 只在打开时监听

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]); // 依赖 isOpen 和 onClose
};