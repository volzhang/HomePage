import {useShuffledIndex} from "@/vol_apps/02_hooks/random/useShuffledIndex";
import {useCallback, useEffect, useRef} from "react";
import {useNetease} from "@/vol_apps/acgm/useNetease";

const AcgmList:number[] = [
    27719865,   //  My Dear...  花澤香菜
    515455490,  //  しっかり者   百石元
    28411764,   //  涙はらはら   大空直美
    4921206,    // Platonic prison  花澤香菜
    617019,  //  圣闘士星矢』より::ペガサス幻想
    31168317,   //  ぎゅっとして欲しいんだ 悠木碧
    529668945,  //  Laura Shigihara
    31680680,   //  星屑の砂時計
    448317236,  //  Sora no Kanatade    森口博子
    5121168,   //  canta per me
    29482201,   //  花惑い
    2643819192, //  The Hampsterdance Song Hampton the Hampster

    589809, //  トルキア    菅野よう子
    4882076,    //  華のワルツ   石田勝範
    4882079,    //  御殿  石田勝範
    22746144,   //  未来へ Kiroro
    26137335,   //  LET IT OUT

    2681993618, //  Animal Instinct The Cranberries
    1340120530, //  All Over Now    The Cranberries

    417798678,  //  Heroes  Scala & Kolacny Brothers

    4164331,    //  Bye Bye Bye Lovestoned
    3879841,    //  Playground Love Air
    26934542,    //  Alone in Kyoto

    4226232,    //  Don't Look Back In Anger    Oasis
    1869084629, //  Somewhere Only We Know  Kean
    28191803,   //  Mirrors Justin Timberlake
    4132379,    //  I Hate Myself for Loving You    Joan Jett & the Blackhearts
    538795835,  //  I Know You (Anton Ishutin Remix)

    1888475146, //  Going The Distance
    1986415,    //  Time Only Knows
    26167062,   //  I'm In Control
    417287, //  In Memories "KO.TO.WA.RI"
    1070927,    //  I was Born for This
    26211091,   //  Crysis 3 - New York Memories
    1887166305, //  Never Fade Away
    32063379,   //  Kaer Morhen Marcin Przybyłowicz
    32063396,   //  The Fields of Ard Skellig   Marcin Przybyłowicz
]

export const useMyList = () => {
    const {get} = useShuffledIndex({length: AcgmList.length, random: false});
    const currentRef = useRef(-1);

    const {songData, setID} = useNetease()

    const getNextSongData = useCallback(()=>{
        const index = get(currentRef.current);
        setID(AcgmList[index])
        currentRef.current ++
    }, [get])

    useEffect(() => {
        getNextSongData()
    },[])

    return {songData, getNextSongData};
}