import {Button} from "@/components/ui/button";
import {useCmStore} from "@/vol_apps/cm/cm_store";
import {useLanguageAtom} from "@/vol_apps/language/languageAtom.ts";


export const CmUiLineWrapping = () => {
	const {t} = useLanguageAtom()

	const {enableLineWrapping, setEnableLineWrapping} = useCmStore();

	const buttonText = enableLineWrapping
		? t("Word Wrap")
		: t("No Wrap");

	return (
		<>
			<Button variant={"outline"} className={"w-30"}
					onClick={() => setEnableLineWrapping(!enableLineWrapping)}
			>
				{buttonText}
			</Button>
		</>
	);
};