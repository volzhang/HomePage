import {Button} from "@/components/ui/button";
import {useCmStore} from "@/vol_apps/cm/cm_store";
import {useLanguageAtom} from "@/vol_apps/language/languageAtom.ts";


export const CmUiLineNumbers = () => {
	const {t} = useLanguageAtom()

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