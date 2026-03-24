import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {ChevronRight} from "lucide-react";

export const BgUiCopyright = (
	{bgType, bgBingCopyright, handleNextBing, isLoading,}: {
		bgType: string,
		bgBingCopyright: string,
		handleNextBing: ()=>void,
		isLoading: boolean,
	}
) => {
	return (
		<>
			{bgType === "bing" ? (
				<div className="absolute bottom-2 right-2">
					<div className="flex flex-row justify-center items-center w-fit gap-0 select-none">
						<p className="text-foreground text-sm">{bgBingCopyright}</p>
						<Button
							variant="link"
							size="icon"
							className="text-foreground"
							onClick={handleNextBing}
							disabled={isLoading}
						>
							{isLoading ? (
								<Spinner className="text-[#0078d7]"/>
							) : (
								<ChevronRight className="text-foreground"/>
							)}
						</Button>
					</div>
				</div>
			) : null
			}
		</>
	);
};