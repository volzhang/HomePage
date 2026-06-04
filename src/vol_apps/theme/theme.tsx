import {Button} from "@/components/ui/button";
import {useEffect} from "react";
import {Moon, Sun} from "lucide-react";
import {themeAtom} from "@/vol_apps/theme/themeAtom.ts";

export const Theme = () => {
	const {theme, setTheme, themeHydrated} = themeAtom.useField("theme")

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [theme]);

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