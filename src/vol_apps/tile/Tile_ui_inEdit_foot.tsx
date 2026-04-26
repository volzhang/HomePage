import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import type {TileLogic} from "@/vol_apps/tile/useTileLogic";

export const Tile_ui_inEdit_foot = (
    {
        ok_ref,
        handleOk,
    }: TileLogic) => {
    return (
        <div className="flex items-center w-full px-6 pb-8 pt-12">
            <Button ref={ok_ref}
                    variant={"secondary"}
                    className={cn("w-full h-12 text-xl font-bold ",
                        "hover:bg-sBlue hover:text-white",
                    )}
                    onClick={handleOk}>
                OK
            </Button>
        </div>
    )
}