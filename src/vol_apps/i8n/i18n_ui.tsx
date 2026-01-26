import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useI18nStore} from "@/vol_apps/i8n/i18n_store";
import { Languages } from "lucide-react";
import {useTranslation} from "react-i18next";

const items = [
	{ label: "English", value: "en" },
	{ label: "简体中文", value: "cn" }
]

export const I18nUi = () => {
	const {language, setLanguage} = useI18nStore();
	const {t} = useTranslation("common");
	return (
		<Select value={language} onValueChange={setLanguage}>
			<SelectTrigger className="text-white border-none focus-visible:ring-transparent">
				{/*{t("Language")} :*/}
				<Languages color={"#c8c8c8"} size={32}/>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>
						{t("Select Language")}
					</SelectLabel>
					{items.map((item) => (
						<SelectItem key={item.value} value={item.value}>
							{item.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	)
}