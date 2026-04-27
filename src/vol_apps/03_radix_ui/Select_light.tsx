// // components/SelectDemo.tsx
// import React from "react";
// import * as Select from "@radix-ui/react-select";
// import {CheckIcon} from "lucide-react";
// import {cn} from "@/lib/utils";
// import {RotateOnOpen} from "@/vol_apps/01_components/RotateOnOpen";
//
//
//
//
//
//
// // ---------- SelectItem 封装 ----------
// interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof Select.Item> {
//     children: React.ReactNode;
//     className?: string;
// }
//
// const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
//     ({children, className, ...props}, forwardedRef) => {
//         return (
//             <Select.Item
//                 className={cn(
//                     // 基础列表项样式
//                     "relative flex h-[25px] select-none ",
//                     "items-center rounded-[3px] ",
//                     "pl-[25px] pr-[35px] text-[13px] leading-none",
//                     "data-disabled:pointer-events-none data-disabled:text-gray-400",
//                     "data-highlighted:bg-gray-900 data-highlighted:text-white ",
//                     "data-highlighted:outline-none",
//                     className,
//                 )}
//                 {...props}
//                 ref={forwardedRef}
//             >
//                 <Select.ItemText>{children}</Select.ItemText>
//                 <Select.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
//                     <CheckIcon/>
//                 </Select.ItemIndicator>
//             </Select.Item>
//         );
//     },
// );
//
// // ---------- 组件主体 ----------
// export const SelectButton = () => {
//     const [open, setOpen] = React.useState(false);
//     return (
//         <>
//             <Select.Root open={open} onOpenChange={setOpen}>
//                 {/* 触发器 */}
//                 <Select.Trigger
//                     className={cn(
//                         "inline-flex items-center justify-center",
//                         "px-[15px] text-[13px] leading-none shadow-sm",
//                         "outline-none",
//                         "bg-background text-foreground"
//                     )}
//                     aria-label="Food"
//                 >
//                     <button onClick={() => setOpen(!open)}>
//                         <Select.Value placeholder="选择水果…"/>
//                         <RotateOnOpen open={open} className={"text-sm"}/>
//                     </button>
//                 </Select.Trigger>
//                 {/* 弹出层 */}
//                 <Select.Portal>
//                     <Select.Content position={"popper"} side={"bottom"}
//                                     className={cn(
//                                         "overflow-hidden rounded-md",
//                                         "bg-background text-foreground",
//                                         // 弹出动画
//                                         "will-change-[opacity,transform]",
//                                         "data-[side=top]:animate-slideDownAndFade ",
//                                         "data-[side=right]:animate-slideLeftAndFade ",
//                                         "data-[side=bottom]:animate-slideUpAndFade ",
//                                         "data-[side=left]:animate-slideRightAndFade",
//                                     )}
//                     >
//                         {/* 视口 */}
//                         <Select.Viewport className="p-[5px]">
//                             <Select.Group>
//                                 <Select.Label className="px-[25px] text-xs leading-[25px] text-foreground">
//                                     水果
//                                 </Select.Label>
//                                 <SelectItem value="apple">苹果</SelectItem>
//                                 <SelectItem value="banana">香蕉</SelectItem>
//                                 <SelectItem value="blueberry">蓝莓</SelectItem>
//                                 <SelectItem value="grapes">葡萄</SelectItem>
//                                 <SelectItem value="pineapple">菠萝</SelectItem>
//                             </Select.Group>
//                         </Select.Viewport>
//                     </Select.Content>
//                 </Select.Portal>
//             </Select.Root>
//         </>
//     )
// }