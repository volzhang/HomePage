// import {cn} from "@/lib/utils";
// import {CheckIcon} from "lucide-react";
// import {useState} from "react";
// import {useFloating} from "@/vol_apps/02_hooks/useFloating";
//
// const MENU_CLASS = cn(
//     "flex flex-col items-center border w-34",
//     "bg-background text-foreground",
//     "rounded-md shadow-md",
//     "select-none",
//     "p-1"
// );
//
// const ITEM_CLASS = cn(
//     "flex items-center justify-between w-full",
//     "h-8 bg-background text-foreground",
//     "text-sm rounded-sm",
//     "hover:bg-foreground/10",
//     "whitespace-nowrap",
//     "select-none",
//     "p-2"
// );
//
// const CHECK_ICON_CLASS = "size-4"
//
//
// type Value = string | number | boolean;
//
// export const ListItem = (
//     {
//         itemLabel,
//         itemValue,
//
//         value,
//         onValueChange,
//
//         onOpenChange,
//
//         itemClass,
//         checkIconClass,
//
//         ...Props
//     }: React.HTMLAttributes<HTMLButtonElement> & {
//         itemLabel: React.ReactNode,
//         itemValue: Value,
//
//         value: Value,
//         onValueChange: (v: Value) => void,
//
//         open: boolean,
//         onOpenChange: (open: boolean) => void,
//
//         itemClass?: string,
//         checkIconClass?: string,
//     }
// ) => {
//
//     const ITEM = cn(ITEM_CLASS, itemClass)
//     const CHECK_ICON = cn(CHECK_ICON_CLASS, checkIconClass)
//
//     return (
//         <li className={cn(Props.className)}>
//             <button className={cn(ITEM, itemClass)}
//                     onClick={(e) => {
//                         onValueChange(value);
//                         onOpenChange(false);
//                         Props?.onClick?.(e);
//                     }}>
//                 {itemLabel}
//                 {itemValue === value && <CheckIcon className={cn(CHECK_ICON, checkIconClass)}/>}
//             </button>
//         </li>
//     )
// }
//
// export const UnorderedList = (
//     {
//         ...Props
//     }: React.HTMLAttributes<HTMLUListElement> & {}
// ) => {
//
//     const [open, onOpenChange] = useState<boolean>(false);
//     const {anchorRef, floatingStyle} = useFloating({open, direction: "bottom", align: "start", offset: 0});
//
//     return (
//         <>
//             <div ref={anchorRef}>
//
//             </div>
//
//             <ul className={cn(MENU_CLASS, Props.className)} style={floatingStyle}>
//
//             </ul>
//         </>
//
//     )
// }
//
//
