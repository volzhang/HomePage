import {useKeyEscapeToClose} from "../02_hooks/useKeyEscapeToClose";
import {useFocusOutsideToClose} from "@/vol_apps/02_hooks/useFocusOutsideToClose";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/useClickOutsideToClose";
import {useMergeRefs} from "@/vol_apps/02_hooks/useMergeRefs";
import {useFloating} from "../02_hooks/useFloating";
import {UnorderedList} from "./UnorderedList";

/**
 * Select 受控下拉选择器
 * - 点击触发器可控制弹出/关闭浮层
 * - 浮层使用 useFloating 自动定位在触发器下方
 * - 支持点击外部区域、焦点离开、按下 Escape 键关闭浮层
 *
 * @param  props
 * @param  props.open - 控制弹窗显示/隐藏
 * @param  props.onOpenChange - 弹窗切换回调
 * @param  props.value - 当前选中的值
 * @param  props.onValueChange - 选中值变化回调（关闭弹窗后异步触发）
 * @param  props.options - 可选项数组
 * @param  props.trigger - 触发展开浮层的 React 元素（会绑定 ref 和事件）
 * @returns - 包含触发器引用容器与弹出浮层列表的包裹元素
 */

export const Select =
    ({
         open,
         onOpenChange,
         value,
         onValueChange,
         options,
         trigger
     }: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        value: string;
        onValueChange: (value: string) => void;
        options: { label: string; value: string; }[];
        trigger: React.ReactNode;
    }) => {

        const {focusRef} = useFocusOutsideToClose({open, onClose:() => onOpenChange(false)});
        const {insideRef} = useClickOutsideToClose({open, onClose:() => onOpenChange(false)});
        const rootRef = useMergeRefs(focusRef, insideRef,)

        const {anchorRef, floatingStyle} = useFloating({open, direction: "bottom"});

        useKeyEscapeToClose(open, () => onOpenChange(false));

        const handleSelect = (value: string) => {
            onOpenChange(false)
            // NOTE: 实测 requestAnimationFrame 无法解决卡顿，保留 setTimeout
            setTimeout(() => onValueChange(value));
        };

        return (
            <div className={"w-fit h-fit"} ref={rootRef}>
                <div className={"w-fit h-fit animate-fade-in-scale"} ref={anchorRef}>
                    {trigger}
                </div>
                <div style={floatingStyle}>
                    <UnorderedList value={value} options={options} handleSelect={handleSelect}/>
                </div>
            </div>

        );
    };