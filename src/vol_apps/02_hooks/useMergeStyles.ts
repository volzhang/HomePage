import { useMemo, type CSSProperties} from 'react';
type StyleInput = CSSProperties | undefined | null | false;

/**
 * 合并多个内联样式对象，后面的覆盖前面的。
 * - 自动过滤掉假值（undefined / null / false）
 * - 使用 useMemo 缓存结果，避免子组件不必要的重渲染
 */
export function useMergeStyles(...styles: StyleInput[]): CSSProperties {
    return useMemo(() => {
        const merged: CSSProperties = {};
        for (const style of styles) {
            if (style) {
                Object.assign(merged, style);
            }
        }
        return merged;
    }, styles);
}