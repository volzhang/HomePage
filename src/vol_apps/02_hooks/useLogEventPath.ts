import { useEffect } from 'react';

type EventType = keyof HTMLElementEventMap;

/**
 * 在页面中监听指定事件，打印事件冒泡路径。
 * @param eventType 事件类型，默认为 'dblclick'，可传入 'click'、'mousedown' 等
 */
export function useLogEventPath(eventType: EventType = 'dblclick') {
    useEffect(() => {
        const handler = (e: Event) => {
            const target = e.target as Element | null;
            if (!target) return;

            console.group(`🛤️ Event Path (${eventType})`);

            let node: Element | null = target;
            let depth = 0;

            while (node) {
                const tag = node.tagName.toLowerCase();
                const id = (node as HTMLElement).id ? `#${(node as HTMLElement).id}` : '';
                const classList = [...(node as HTMLElement).classList];
                let classInfo = '';

                if (classList.length > 0) {
                    const shown = classList.slice(0, 3).join('.');
                    const more = classList.length > 3 ? '…' : '';
                    classInfo = '.' + shown + more;
                }

                console.log(`${depth}: ${tag}${id}${classInfo}`);
                node = node.parentElement;
                depth++;
            }

            console.log(`${depth}: document`);
            console.log(`${depth + 1}: window`);
            console.groupEnd();
        };

        document.addEventListener(eventType, handler);
        return () => document.removeEventListener(eventType, handler);
    }, [eventType]);
}