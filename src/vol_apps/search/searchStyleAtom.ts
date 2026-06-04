import * as v from "valibot";
import {createMigratePersistAtom} from "@/vol_apps/04_persist_atoms/signal.ts";

const searchStyleSchema = v.object({
    visible: v.boolean()
})

const searchStyleKey = "searchStyle"
const searchStyleInit = {visible: true}

const searchStyleAtom = createMigratePersistAtom({
    key: searchStyleKey,
    stateSchema: searchStyleSchema,
    initState: searchStyleInit,
    legacyDb: "idb",
})

export const useSearchStyleAtom = () => {
    const {visible, setVisible} = searchStyleAtom.useField("visible");
    return {visible, setVisible}
}