import {Button} from "@/components/ui/button";
import {ButtonGroup} from "@/components/ui/button-group";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn}             from "@/lib/utils";
import {createAtom}     from "@/vol_apps/atomStorage/atomStorage";
import {SEARCH_ENGINES} from "@/vol_apps/search/searchBar_atom";
import {useAtom} from "jotai";
import {SearchIcon} from "lucide-react";

const atom_engine = await createAtom("atom_engine", "bing");

export const SearchBar = () => {
	const [engine, setEngine] = useAtom(atom_engine);
	const currentEngine = SEARCH_ENGINES[engine];
	const handleOnValueChange = async (value) => {
		if (value === "") return; //这里有个坑，OnValueChange会在mount时设置""
		await setEngine(value);
	};
	return (
		<>
			<style>{`
                @keyframes fade-in-scale {
                  0% { opacity: 0; transform: scale(0.98); }
                  100% { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                  animation: fade-in-scale 0.5s ease-out;
                }
            `}</style>

			<form
				action={currentEngine.url} method="GET" target="_blank"
				className={cn("animate-fade-in-scale flex mt-16 mb-16 w-fit h-fit mx-auto rounded-xl",
					"transition-all duration-200 delay-0 ease-linear",
					"hover:shadow-[#0078d7]/30",
					"hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
				)}
			>
				<ButtonGroup className="w-[680px] h-14">
					<Button type="submit" variant="outline" aria-label="Search"
							className={cn("h-full! w-14 flex-col items-end",
								" border border-r-0 border-[#0078d7]",
								"text-[18px] text-[#0078d7] font-bold bg-white/90",
								"pointer-events-none", // pointer-events-none 禁用鼠标交互。
							)}>
						<SearchIcon className={"scale-160"} strokeWidth={3}/>
					</Button>

					<Input
						name={currentEngine.param}
						className={cn("h-full! bg-white/90 border border-r-0 border-[#0078d7]",
							"transition-all duration-200 delay-0 ease-linear",
							"placeholder:text-[16px]",
							"placeholder:text-[#0078d7]",
							"placeholder:font-[550]",
							"text-[17px]! font-normal pl-2",
							"hover:placeholder:text-black/20",
							"focus:placeholder:text-transparent",
							"focus-visible:border-[#0078d7]",
							"focus:text-[600]",
							"focus-visible:ring-transparent",
						)}
					/>

					<Select
						value={engine}
						onValueChange={handleOnValueChange}
					>
						<SelectTrigger className={cn("h-full! w-[fit] border border-l-0 border-[#0078d7] bg-white/90",
							"text-[18px] text-[#0078d7] font-semibold",
							"hover:text-[#0078d7]",
							"focus:text-[#0078d7]",
							"focus-visible:border-[#0078d7]",
							"focus-visible:ring-transparent",
						)}
						>
							<SelectValue placeholder="选择搜索引擎"/>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>选择搜索引擎</SelectLabel>
								{Object.entries(SEARCH_ENGINES).map(([key, {name}]) => (
									<SelectItem key={key} value={key}>{name}</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</ButtonGroup>
			</form>
		</>
	);
};