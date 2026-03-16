import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useCmStore} from "@/vol_apps/cm/cm_store";
import {SquarePen, X } from "lucide-react";

export const CmOpen = () => {
	const {setIsVisible} = useCmStore();
	return (
		<>
			<Button variant="outline" size={"icon"}
					onClick={()=>{setIsVisible(true)}}
			>
				<SquarePen/>
			</Button>
		</>
	);
};

export const CmClose = ({className}:{className:string}) => {
	const {setIsVisible} = useCmStore();
	return (
		<>
			<Button variant="outline" size={"icon"} className={cn(className)}
					onClick={()=>{setIsVisible(false)}}
			>
				<X />
			</Button>
		</>
	);
};