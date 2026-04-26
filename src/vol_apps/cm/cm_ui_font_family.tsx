import {type FontItem, useCmStore} from "@/vol_apps/cm/cm_store";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useState} from "react";
import { cn } from "@/lib/utils";
import {loadFonts} from "@/vol_apps/tool/action/loadFonts";

export const CmUiFontFamily = ({className}:{className?:string}) => {

	const {fontMeta, setFontMeta} = useCmStore();
	const [open, setOpen] = useState(false);
	const [fontList, setFontList] = useState<FontItem[]>([]);

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant={"outline"} className={cn(className)}
							onClick={async () => setFontList(await loadFonts())}>
						{fontMeta.fullName}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-75 p-0" align="start">
					<Command>
						<CommandInput placeholder="search font ..."/>
						<CommandList className="max-h-160 overflow-y-auto">
							<CommandEmpty>No font found.</CommandEmpty>
							<CommandGroup heading="Font List">
								{fontList.length > 0
									? fontList.map((item) => (
										<CommandItem key={item.fullName} onSelect={() => {
											setFontMeta(item);
											setOpen(false);
										}}>
											{item.fullName}
										</CommandItem>
									))
									: <CommandItem onSelect={() => {
										// setFontMeta(item);
										setOpen(false);
									}}>
										{fontMeta.fullName}
									</CommandItem>
								}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</>
	);
};

