import { Composition } from "remotion";
import { Film } from "./Film";
import { DURATION, FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition id="Film" component={Film} durationInFrames={DURATION * FPS} fps={FPS} width={W} height={H} />
  );
};
