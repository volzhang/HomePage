// components/SelectDemo.tsx
import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------- SelectItem 封装 ----------
interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof Select.Item> {
    children: React.ReactNode;
    className?: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
    ({ children, className, ...props }, forwardedRef) => {
        return (
            <Select.Item
                className={cn(
                    // 基础列表项样式
                    'relative flex h-[25px] select-none ',
                    'items-center rounded-[3px] ',
                    'pl-[25px] pr-[35px] text-[13px] leading-none',
                    'data-disabled:pointer-events-none data-disabled:text-gray-400',
                    'data-highlighted:bg-gray-900 data-highlighted:text-white ',
                    'data-highlighted:outline-none',
                    className,
                )}
                {...props}
                ref={forwardedRef}
            >
                <Select.ItemText>{children}</Select.ItemText>
                <Select.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
                    <CheckIcon />
                </Select.ItemIndicator>
            </Select.Item>
        );
    },
);

// ---------- 组件主体 ----------
export const SelectDemo = () => (
    <Select.Root>
        {/* 触发器 */}
        <Select.Trigger 
            className={cn(
                'inline-flex h-[35px] items-center justify-center gap-[5px] rounded bg-white px-[15px] text-[13px] leading-none shadow-sm',
                'outline-none hover:bg-gray-50',
                'focus:shadow-[0_0_0_2px] focus:shadow-black',
                'data-placeholder:text-gray-400',
                "bg-background text-foreground"
            )}
            aria-label="Food"
        >
            <Select.Value placeholder="选择水果…" />
            <Select.Icon className="text-gray-600">
                <ChevronDownIcon />
            </Select.Icon>
        </Select.Trigger>

        {/* 弹出层 */}
        <Select.Portal>
            <Select.Content
                className={cn(
                    'overflow-hidden rounded-md bg-white shadow-[0px_10px_38px_-10px_rgba(22,23,24,0.35),0px_10px_20px_-15px_rgba(22,23,24,0.2)]',
                    // 弹出动画
                    'will-change-[opacity,transform]'+
                    'data-[side=top]:animate-slideDownAndFade '+
                    'data-[side=right]:animate-slideLeftAndFade '+
                    'data-[side=bottom]:animate-slideUpAndFade '+
                    'data-[side=left]:animate-slideRightAndFade',
                )}
            >
                {/* 向上滚动按钮 */}
                <Select.ScrollUpButton className="flex h-[25px] cursor-default items-center justify-center bg-white text-gray-600">
                    <ChevronUpIcon />
                </Select.ScrollUpButton>

                {/* 视口 */}
                <Select.Viewport className="p-[5px]">
                    {/* 组1：水果 */}
                    <Select.Group>
                        <Select.Label className="px-[25px] text-xs leading-[25px] text-gray-500">
                            水果
                        </Select.Label>
                        <SelectItem value="apple">苹果</SelectItem>
                        <SelectItem value="banana">香蕉</SelectItem>
                        <SelectItem value="blueberry">蓝莓</SelectItem>
                        <SelectItem value="grapes">葡萄</SelectItem>
                        <SelectItem value="pineapple">菠萝</SelectItem>
                    </Select.Group>

                    <Select.Separator className="m-[5px] h-px bg-gray-200" />

                    {/* 组2：蔬菜 */}
                    <Select.Group>
                        <Select.Label className="px-[25px] text-xs leading-[25px] text-gray-500">
                            蔬菜
                        </Select.Label>
                        <SelectItem value="aubergine">茄子</SelectItem>
                        <SelectItem value="broccoli">西兰花</SelectItem>
                        <SelectItem value="carrot" disabled>
                            胡萝卜
                        </SelectItem>
                        <SelectItem value="courgette">西葫芦</SelectItem>
                        <SelectItem value="leek">大葱</SelectItem>
                    </Select.Group>

                    <Select.Separator className="m-[5px] h-px bg-gray-200" />

                    {/* 组3：肉类 */}
                    <Select.Group>
                        <Select.Label className="px-[25px] text-xs leading-[25px] text-gray-500">
                            肉类
                        </Select.Label>
                        <SelectItem value="beef">牛肉</SelectItem>
                        <SelectItem value="chicken">鸡肉</SelectItem>
                        <SelectItem value="lamb">羊肉</SelectItem>
                        <SelectItem value="pork">猪肉</SelectItem>
                    </Select.Group>
                </Select.Viewport>

                {/* 向下滚动按钮 */}
                <Select.ScrollDownButton className="flex h-[25px] cursor-default items-center justify-center bg-white text-gray-600">
                    <ChevronDownIcon />
                </Select.ScrollDownButton>
            </Select.Content>
        </Select.Portal>
    </Select.Root>
);