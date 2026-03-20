import {Button} from "@/components/ui/button";
import {useCmStore} from "@/vol_apps/cm/cm_store";
import {useTranslation} from "react-i18next";

export const CmUiLineNumbers = () => {
	const {t} = useTranslation("codemirror")

	const {enableLineNumbers, setEnableLineNumbers} = useCmStore();

	const buttonText = enableLineNumbers
		? t("Line Numbers")
		: t("No Numbers");

	return (
		<>
			<Button variant={"outline"} className={"w-32"}
					onClick={() => setEnableLineNumbers(!enableLineNumbers)}>
				{buttonText}
			</Button>
		</>
	);
};