import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {SquarePen, X} from "lucide-react";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {cmStore} from "@/vol_apps/cm/cm_atom.ts";
import {themeStore} from "@/vol_apps/theme/theme.tsx";

export const CmOpen = () => {
    const {setIsVisible} = useSignal(cmStore("isVisible"))
    const {themeHydrated} = useSignal(themeStore("theme"));

    return (
        <>
            {
                themeHydrated &&
                <Button variant="outline" size={"icon"}
                        onClick={() => setIsVisible(true)}
                        className={"animate-fade-in-scale"}
                >
                    <SquarePen/>
                </Button>
            }
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