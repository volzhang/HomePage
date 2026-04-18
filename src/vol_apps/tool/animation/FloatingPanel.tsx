import {cn} from "@/lib/utils";

/**
 * 注意：
 * - 由于有 origin-top：位置布局相关样式需要写在外层
 *
 * @param show - 控制显示
 * @param children - 渲染对象
 */
export const FloatingPanel = ({
                                  show,
                                  children
                              }: {
    show: boolean;
    children: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "transition-all duration-200 ease-in-out origin-top z-20",
                show
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
            )}
        >
            {children}
        </div>
    );
};