// AudioContext.tsx
import { createContext, useContext } from "react";
import { useAudioState } from "@/vol_apps/02_hooks/audio/useAudioState";

type AudioContextType = ReturnType<typeof useAudioState>;
const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
    const audioState = useAudioState(); // 只调用一次，全局共享
    return (
        <AudioContext.Provider value={audioState}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudioContext = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error("useAudioContext must be used within AudioProvider");
    }
    return context;
};