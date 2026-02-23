import {Button} from "@/components/ui/button";
import {ButtonGroup} from "@/components/ui/button-group";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem,
	SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {useSearchStore} from "@/vol_apps/search/search_store";
import {SearchIcon} from "lucide-react";
import {useTranslation} from "react-i18next";

export const SearchComponent = () => {
	const {engines, getEngineInUse, setEngineInUseByName} = useSearchStore();
	const currentEngine = getEngineInUse();
	const handleOnValueChange = (name: string) => {
		if (name === "") return; //这里有个坑，OnValueChange会在mount时自动设置为""
		setEngineInUseByName(name); //
	};
	const {t} = useTranslation("search")
	return (
		<>
			<form
				action={currentEngine.url} method="GET" target="_blank"
				className={cn(
					"animate-fade-in-scale-1000",
					"flex mt-16 mb-16 w-fit h-fit mx-auto rounded-xl",

					"transition-all duration-200 delay-0 ease-linear",
					"hover:shadow-[#0078d7]/30",
					"hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
				)}
			>
				<ButtonGroup className="w-[680px] h-14">
					<Button
						type="submit" variant="outline" aria-label="Search"
							className={cn("h-full! w-16 flex-col items-center",
								" border border-r-0 border-[#0078d7]! text-[#0078d7]! ",
								"bg-white!",
								"hover:bg-[#0078d7]!",
								"hover:text-white!"
							)}>
						<SearchIcon className={"scale-160"} strokeWidth={3}/>
					</Button>

					<Input
						name={currentEngine.param}
						className={cn("h-full! border border-r-0 border-[#0078d7]!",
							"transition-all duration-200 delay-0 ease-linear",
							"text-[17px]! font-normal pl-2",
							"text-black!",
							"bg-white!",
							"focus-visible:border-[#0078d7]",
							"focus:text-[600]",
							"focus-visible:ring-transparent",
						)}
					/>

					<Select
						value={currentEngine.name}
						onValueChange={handleOnValueChange}
					>
						<SelectTrigger className={cn(
							"h-full! w-[fit] border border-l-0",
							"border-[#0078d7] bg-white!",
							"text-[18px] text-[#0078d7] font-semibold",
							"hover:bg-[#0078d7]!",
							"hover:text-white!",
							// "focus:text-[#0078d7]",
							"focus-visible:border-[#0078d7]",
							"focus-visible:ring-transparent",
						)}
						>
							<SelectValue placeholder={t("Select Engine")}/>

						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>
									{t("Select Search Engine")}
								</SelectLabel>
								{engines.map(({id, name}) => (
									<SelectItem key={id} value={name}>{name}</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</ButtonGroup>
			</form>
		</>
	);
};