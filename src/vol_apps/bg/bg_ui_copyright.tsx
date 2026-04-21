import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {ChevronRight} from "lucide-react";
import type {BgType} from "@/vol_apps/bg/bg_store";
import {cn} from "@/lib/utils";

export const BgUiCopyright = (
    {bgType, copyright, handleNextBing, copyrightIsLoading,}: {
        bgType: BgType,
        copyright: string,
        handleNextBing: () => void,
        copyrightIsLoading: boolean,
    }
) => {
    return (
        <div className={"z-0"}>
            {bgType === "bing" ? (
                <div className="fixed bottom-2 right-2">
                    <div className={cn("flex flex-row justify-center items-center",
						"w-fit gap-0")}>
                        <p className={cn(
							"px-4 py-2 rounded-sm",
							"bg-background/10 hover:bg-background",
							"transition-colors duration-300 ease-in-out",
							"text-foreground text-sm"
						)}>{copyright}</p>
						<Button
							variant="link"
							className={"text-foreground group bg-background/0 hover:bg-background"}
							onClick={handleNextBing}
							disabled={copyrightIsLoading}
							aria-label={"Next Wallpaper"}
						>
							{copyrightIsLoading ? (
								<Spinner className="text-sBlue"/>
							) : (
								<ChevronRight className={"text-foreground"}/>
							)}
						</Button>
                    </div>
                </div>
            ) : null
            }
        </div>
    );
};