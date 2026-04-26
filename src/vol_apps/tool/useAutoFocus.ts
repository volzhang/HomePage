// hooks/useAutoFocus.ts
import { useEffect, type RefObject } from 'react';

export const useAutoFocus = (isOpen: boolean, ref: RefObject<HTMLElement | null>) => {
    useEffect(() => {
        if (isOpen && ref.current) {
            ref.current.focus();
        }
    }, [isOpen]);
};