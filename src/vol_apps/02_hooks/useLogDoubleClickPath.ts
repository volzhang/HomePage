import { useEffect } from 'react';

/**
 * 双击页面后，在控制台打印事件冒泡路径。
 * 只输出每个元素最通用的信息：tag、id、前3个类名
 */
export function useLogDoubleClickPath() {
    useEffect(() => {
        const onDoubleClick = (e: MouseEvent) => {
            console.group('PATH:');
            let node: Element | null = e.target as Element;
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

        document.addEventListener('dblclick', onDoubleClick);
        return () => document.removeEventListener('dblclick', onDoubleClick);
    }, []);
}