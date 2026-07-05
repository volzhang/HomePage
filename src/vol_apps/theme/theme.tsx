import {Button} from "@/components/ui/button";
import {Moon, Sun} from "lucide-react";
import {useEffect} from "react";
import {initStoreState, useSignal} from "@/vol_apps/04_persist_atoms";

type Theme = "dark" | "light";
export const themeStore = initStoreState({
    storeName: "theme",
    fields: { theme: "dark" as Theme},
});

export const Theme = () => {
    const {theme, setTheme, themeHydrated} = useSignal(themeStore("theme"));

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