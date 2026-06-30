import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {SquarePen, X} from "lucide-react";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {cmStore} from "@/vol_apps/cm/cm_atom.ts";

export const CmOpen = () => {
    const {setIsVisible} = useSignal(cmStore("isVisible"))
    return (
        <>
            <Button variant="outline" size={"icon"}
                    className={"animate-fade-in-scale"}
                    onClick={() => {
                        setIsVisible(true)
                    }}
            >
                <SquarePen/>
            </Button>
        </>
    );
};

export const CmClose = ({className}: { className: string }) => {
    const {setIsVisible} = useSignal(cmStore("isVisible"))

    return (
        <>
            <Button variant="outline" size={"icon"} className={cn(className)}
                    onClick={() => {
                        setIsVisible(false)
                    }}
            >
                <X/>
            </Button>
        </>
    );
};