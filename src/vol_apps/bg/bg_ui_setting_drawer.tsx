import {DrawerPortal
} from "@/components/ui/drawer"
import * as React from "react";
import {Drawer as DrawerPrimitive} from "vaul";
import {cn} from "@/lib/utils";

export function DrawerContent({
                                  className,
                                  children,
                                  ...props
                              }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
    return (
        <DrawerPortal data-slot="drawer-portal">
            {/*<DrawerOverlay />*/}
            <DrawerPrimitive.Content
                data-slot="drawer-content"
                className={cn(
                    "group/drawer-content fixed z-50 flex h-auto flex-col bg-background",
                    "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
                    "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
                    "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
                    "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
                    className
                )}
                {...props}
            >
                <div className="mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
                {children}
            </DrawerPrimitive.Content>
        </DrawerPortal>
    )
}

// export const DrawerScrollableContent = (
//     {
//         content,
//         contentClassName,
//
//         button,
//
//         // open,
//         // onOpenChange,
//     }: {
//         content?: React.ReactNode,
//         contentClassName?: string,
//
//         button?: React.ReactNode,
//         setSnap?: (snap: number | string | null) => void,
//
//         // open: boolean,
//         // onOpenChange: (open: boolean) => void,
//     }
// ) => {
//
//
//
//     return (
//         <Drawer direction="right"
//                 // onOpenChange={onOpenChange}
//                 // open={open}
//                 modal={false}
//
//         >
//             <DrawerContent className={cn(contentClassName)}>
//                 <DrawerHeader hidden><DrawerTitle/><DrawerDescription/></DrawerHeader>
//                 {content}
//                 <DrawerFooter>
//                     <DrawerClose asChild>
//                         {button}
//                     </DrawerClose>
//                 </DrawerFooter>
//             </DrawerContent>
//         </Drawer>
//     )
// }
