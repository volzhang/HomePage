import * as v from "valibot";
import {useEffect, useState} from "react";
import {useFetchTrace} from "@/vol_apps/02_hooks/http/useFetchTrace";

const SongDataSchema = v.object({
    id: v.number(),
    title: v.string(),
    artist: v.string(),
    album: v.string(),
    cover: v.string(),
    lyric: v.string(),
    sub_lyric: v.string(),
    link: v.string(),
    cached: v.boolean(),
});

export type SongData = v.InferOutput<typeof SongDataSchema>;

const isSongData = (data: unknown): data is SongData => {
    return v.safeParse(SongDataSchema, data).success;
}

const extractJsonFromAcgmApi = (rawText: string) => {
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) return null;
    const jsonString = rawText.slice(firstBrace, lastBrace + 1);
    return JSON.parse(jsonString);
}

const paugram_URL = new URL("https://api.paugram.com/acgm/")

export const useAcgmApi = () => {
    const [songData, setSongData] = useState<SongData | null>(null)
    const {trace: acgm, start: getSongData} = useFetchTrace(paugram_URL)
    const file = acgm.file

    useEffect(() => {
        void getSongData()
    }, []);

    useEffect(() => {
        const pharse = async (file: Blob | null) => {
            if (!file) return;
            const rawText = await file.text();
            const extractJson = extractJsonFromAcgmApi(rawText);
            if (!isSongData(extractJson)) return
            setSongData(extractJson)
        }
        void pharse(file)
    }, [file])

    return {songData, getSongData};
}

