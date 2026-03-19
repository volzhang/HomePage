import {Button} from "@/components/ui/button";
import {useCmStore} from "@/vol_apps/cm/cm_store";

export const CmUiLineNumbers = () => {
	const {enableLineNumbers, setEnableLineNumbers} = useCmStore();

	const buttonText = enableLineNumbers
		? "Line Numbers"
		: "No Numbers";

	return (
		<>
			<Button variant={"outline"} className={"w-32"}
					onClick={() => setEnableLineNumbers(!enableLineNumbers)}>
				{buttonText}
			</Button>
		</>
	);
};