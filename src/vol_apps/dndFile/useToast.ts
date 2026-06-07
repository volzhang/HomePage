import { useRef } from "react";
import { toast } from "sonner";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";

export const useToast = () => {
	const { t } = useLanguage("dndFile")
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