import * as v from "valibot";
import {createAutoMigrationAtom} from "@/vol_apps/04_persist_atoms/createAtom.ts";

const searchStyleSchema = v.object({
    visible: v.boolean()
})

const searchStyleKey = "searchStyle"
const searchStyleInit = {visible: true}

const _useSearchStyleAtom = createAutoMigrationAtom({
    key: searchStyleKey,
    stateSchema: searchStyleSchema,
    initState: searchStyleInit,
    legacy: "idb",
})

export const useSearchStyleAtom = () => {
    const {hydrated, visible, setVisible} = _useSearchStyleAtom()
    return {hydrated, visible, setVisible}
}