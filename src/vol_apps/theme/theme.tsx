import {Button} from "@/components/ui/button";
import {Moon, Sun} from "lucide-react";
import {useEffect} from "react";
import {createSignalCfg, useSignal} from "@/vol_apps/04_persist_atoms/signal";

type Theme = "dark" | "light";
export const themeSignalCfg = createSignalCfg("theme", "theme", "dark" as Theme);

export const Theme = () => {
    const {theme, setTheme, themeHydrated} = useSignal(...themeSignalCfg)

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
    }, [theme])
    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    return (
        <>
            {
                themeHydrated &&
                <Button
                    className={"animate-fade-in-scale"}
                    variant={"outline"}
                    size={"icon"}
                    onClick={toggleTheme}>
                    {theme === "light" ? <Sun/> : <Moon/>}
                </Button>
            }
        </>
    );

};