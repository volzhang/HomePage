import * as v from "valibot";
import {useEffect, useState} from "react";
import {useFetchTrace} from "@/vol_apps/02_hooks/http/useFetchTrace.ts";

export const SongDataSchema = v.object({
    id: v.union([v.number(), v.string()]),
    title: v.string(),
    artist: v.string(),
    album: v.string(),
    cover: v.string(),
    lyric: v.string(),
    sub_lyric: v.string(),
    link: v.string(),
    served: v.boolean(),
});

export type SongData = v.InferOutput<typeof SongDataSchema>;

const isSongData = (data: unknown): data is SongData => {
    return v.safeParse(SongDataSchema, data).success;
}

export const useNetease = () => {
    const [ID, setID] = useState<number | null>(null)
    const netease_URL = `https://api.paugram.com/netease/?id=${ID}`
    const {trace, start} = useFetchTrace(netease_URL)
    const [songData, setSongData] = useState<SongData | null>(null)

    useEffect(() => {
        if (ID == null) return;
        void start()
    }, [ID]);

    const file = trace.file

    useEffect(() => {
        const pharse = async (file: Blob | null) => {
            if (!file) return;
            const text = await file.text();
            const data = JSON.parse(text);
            if (!isSongData(data)) return;
            setSongData(data);
        }
        void pharse(file)
    }, [file]);

    return {setID, songData};
}