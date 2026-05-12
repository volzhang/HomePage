import { useRef } from "react";
import { toast } from "sonner";
import {useLanguageStore} from "@/vol_apps/language/language_store";

export const useToast = () => {
	const { t } = useLanguageStore("dndFile")
	const toastId = useRef<string | number | null>(null);

	const dismissToast = () => {
		if (toastId.current) toast.dismiss(toastId.current);
		toastId.current = null;
	};

	const waitingToast = {
		message: t("Waiting for file release"),
		data: { duration: Infinity }
	};

	const updateOrCreateToast = (content: string, type: "success" | "error") => {
		const options = {
			id: toastId.current ?? undefined,
			duration: 3000,
		};
		if (type === "success") {
			toastId.current = toast.success(content, options);
		} else {
			toastId.current = toast.error(content, options);
		}
	};

	return {
		toastId,
		dismissToast,
		waitingToast,
		updateOrCreateToast,
	};
};