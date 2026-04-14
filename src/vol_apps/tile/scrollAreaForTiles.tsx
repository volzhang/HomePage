import {ScrollArea} from "@/components/ui/scroll-area.js";
import {cn} from "@/lib/utils.js";
import type {PropsWithChildren} from "react";

export function ScrollAreaForTiles({children}: PropsWithChildren) {
    return (
        <>
            <style>{`
                .mask-fade {
  					mask-image: linear-gradient(
    					to bottom,
						transparent,
						rgba(0,0,0,0.0) 2px,
						rgba(0,0,0,0.2) 8px,
						rgba(0,0,0,0.4) 12px,
						rgba(0,0,0,0.6) 16px,
						rgba(0,0,0,0.8) 20px,
						black 24px,
						black calc(100% - 24px),
						rgba(0,0,0,0.9) calc(100% - 20px),
						rgba(0,0,0,0.6) calc(100% - 16px),
						rgba(0,0,0,0.4) calc(100% - 12px),
						rgba(0,0,0,0.2) calc(100% - 8px),
						rgba(0,0,0,0.0) calc(100% - 2px),
						transparent 100%
				  );
				}
            `}</style>

            <div className={cn(
                "flex flex-col mx-auto",
                "border border-border rounded-xl",
                "max-h-[75vh] w-[85%]",
                "overflow: visible"
            )}>
                <ScrollArea
                    type="scroll"
                    scrollHideDelay={500}
                    viewportClassName={cn(
                        "mask-fade",
                        "max-h-[72vh] min-h-[192px] ",
                        "max-w-full",
                        "overflow: visible!",
                    )}
                >
                    {children}
                </ScrollArea>

            </div>
        </>
    );
}
