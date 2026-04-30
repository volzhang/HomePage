import {useKeyEscapeToClose} from "../02_hooks/useKeys";
import {useFocusOutsideToClose} from "@/vol_apps/02_hooks/useFocusOutsideToClose";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/useClickOutsideToClose";
import {useMergeRefs} from "../02_hooks/01_useMergeRefs";
import {UnorderedList} from "./UnorderedList";
import { cloneElement } from "react";
import {useFloating} from "@/vol_apps/02_hooks/useFloating";

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
        trigger: React.ReactElement;
    }) => {


        const {focusOutsideRef} = useFocusOutsideToClose({open, onClose:() => onOpenChange(false)});
        const {clickOutsideRef} = useClickOutsideToClose({open, onClose:() => onOpenChange(false)});

        const {anchorRef, floatingStyle} = useFloating({open, direction: "bottom"});


        useKeyEscapeToClose(open, () => onOpenChange(false));
        // const spaceRef = useKeySpaceToToggle(open, ()=>{onOpenChange(true)});
        // const enterRef = useKeyEnterToToggle(open, ()=>{onOpenChange(true)})

        const rootRef = useMergeRefs(focusOutsideRef, clickOutsideRef,)
        const triggerRef = anchorRef

        const handleSelect = (value: string) => {
            onOpenChange(false)
            // NOTE: 实测 requestAnimationFrame 无法解决卡顿，保留 setTimeout
            setTimeout(() => onValueChange(value));
        };

        const anchoredTrigger = cloneElement(trigger, { ref: triggerRef } as any);

        return (
            <div className={"w-fit h-fit"} ref={rootRef}>
                {anchoredTrigger}
                    <UnorderedList
                        style={floatingStyle}
                        value={value}
                        options={options}
                        handleSelect={handleSelect}
                    />
            </div>
        );
    };