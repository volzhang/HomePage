import {useEffect, useState} from "react";

type PersistApiLike = {
	persist: {
		hasHydrated: () => boolean;
		onFinishHydration: (fn: () => void) => () => void;
		onHydrate?: (fn: () => void) => () => void;
	};
};

// _hydrated 的等价hook
export const useStoreHydrated = <T extends PersistApiLike>(store: T): boolean => {
	const [hydrated, setHydrated] = useState(() => store.persist.hasHydrated());

	useEffect(() => {
		setHydrated(store.persist.hasHydrated());

		const unsubStart = store.persist.onHydrate?.(() => {
			setHydrated(false);
		});

		const unsubFinish = store.persist.onFinishHydration(() => {
			setHydrated(true);
		});

		return () => {
			unsubStart?.();
			unsubFinish();
		};
	}, [store]);

	return hydrated;
};