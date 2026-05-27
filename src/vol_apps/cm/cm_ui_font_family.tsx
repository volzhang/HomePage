import {type FontItem, useCmStore} from "@/vol_apps/cm/cm_store";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useState} from "react";
import { cn } from "@/lib/utils";
import {loadFonts} from "@/vol_apps/tool/action/loadFonts";
import {useLanguageStore} from "@/vol_apps/language/language_store";

const FONT_DEFAULT = {
	fullName: "monospace",
	family: `monospace`
}

export const CmUiFontFamily = ({className}:{className?:string}) => {

	const {t} = useLanguageStore()
	const {fontMeta, setFontMeta} = useCmStore();
	// noinspection DuplicatedCode
	const [open, setOpen] = useState(false);
	const [fontList, setFontList] = useState<FontItem[]>([]);

	const handleOpen = async () => {
		try {
			const loadedFonts = await loadFonts();
			// 把 System Default 放在第一位
			const newList: FontItem[] = [FONT_DEFAULT, ...loadedFonts];
			setFontList(newList);
		} catch (error) {
			console.error("加载字体失败", error);
			setFontList([FONT_DEFAULT]);
		}
	};


	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant={"outline"} className={cn(className)}
							onClick={handleOpen}>
						{fontMeta.fullName}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-75 p-0" align="start">
					<Command>
						<CommandInput placeholder={t("search font ...")}/>
						<CommandList className="max-h-200 overflow-y-auto">
							<CommandEmpty>{t("No font found")}</CommandEmpty>
							<CommandGroup heading={t("Font List")}>
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

