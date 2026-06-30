import {Button} from "@/components/ui/button";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {cmStore} from "@/vol_apps/cm/cm_atom.ts";


export const CmUiLineNumbers = () => {
	const {t} = useLanguage()

	const {enableLineNumbers, setEnableLineNumbers} = useSignal(cmStore("enableLineNumbers"));

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