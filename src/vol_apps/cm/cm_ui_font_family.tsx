import {type FontItem, useCmStore} from "@/vol_apps/cm/cm_store";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useState} from "react";

export const CmUiFontFamily = () => {

	const {fontMeta, setFontMeta} = useCmStore();
	const [open, setOpen] = useState(false);
	const [fontList, setFontList] = useState<FontItem[]>([]);

	//@ts-ignore
	const loadAllFonts = async () => {
		try {
			// @ts-ignore
			const availableFonts = await window.queryLocalFonts();
			const options = availableFonts
				.map((font: FontItem) => ({
					fullName: font.fullName,
					family: font.family
				}));
			setFontList(options);
		} catch (err) {
			console.error(err);
		}
	};

	//@ts-ignore
	const loadFonts = async () => {
		try {
			// @ts-ignore
			const availableFonts = await window.queryLocalFonts();
			// 列表太长，简化
			const excludeKeywords = [
				"black",
				"ui",
				"narrow",
				"negreta",
				"cursiva",
				"math",
				"gothic",
				"code",
				"condensed",
				"semicondensed",
				"italic",
				"thin",
				"bold",
				"semibold",
				"extrabold",
				"medium",
				"light",
				"semilight",
				"extralight",
			];
			// 构建正则：\b(keyword1|keyword2|...)\b，忽略大小写
			const excludePattern = new RegExp(`\\b(${excludeKeywords.join("|")})\\b`, "i");

			const options = availableFonts
				.map((font: FontItem) => ({
					fullName: font.fullName,
					family: font.family
				}))
				.filter((item: FontItem) => !excludePattern.test(item.fullName));

			setFontList(options);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" className="w-fit" onClick={async () => await loadFonts()}>
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

