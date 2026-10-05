import { useCallback, useEffect, useState } from "react";
import { useAudioPlayer } from "expo-audio";

type LivePlayback = {
  current: number;
  duration: number;
  paused: boolean;
};

export function useChatPlayback() {
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [live, setLive] = useState<LivePlayback>({ current: 0, duration: 0, paused: true });

  useEffect(() => {
    const timer = setInterval(() => {
      const duration = player.duration;
      const current = player.currentTime;
      const finished = duration > 0 && current >= duration - 0.25 && !player.paused;
      if (finished) {
        player.pause();
        void player.seekTo(0);
      }
      setLive({
        current: finished ? 0 : current,
        duration,
        paused: finished ? true : player.paused,
      });
    }, 250);

    return () => {
      clearInterval(timer);
      player.pause();
    };
  }, [player]);

  const stop = useCallback(() => {
    player.pause();
    setLive((value) => ({ ...value, paused: true }));
  }, [player]);

  const toggle = useCallback(
    (key: string, url: string) => {
      const ended = live.duration > 0 && live.current >= live.duration - 0.25;
      if (activeKey === key && !live.paused && !ended) {
        player.pause();
        setLive((value) => ({ ...value, paused: true }));
        return;
      }

      if (activeKey !== key) {
        player.pause();
        player.replace(url);
        setActiveKey(key);
      }
      if (ended || (activeKey === key && live.current <= 0.05 && live.duration > 0 && live.paused)) {
        void player.seekTo(0);
      }
      player.play();
      setLive((value) => ({ ...value, paused: false }));
    },
    [activeKey, live, player],
  );

  return { activeKey, live, stop, toggle };
}
