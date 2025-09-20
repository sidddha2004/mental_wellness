import { Waves } from "./waves-background";

export function WavesDemo(): JSX.Element {
  return (
    <div className="relative w-full h-[800px] bg-background/80 rounded-lg overflow-hidden">
      <div className="absolute inset-0">
        <Waves
          lineColor="rgba(10, 108, 108, 0.2)"
          backgroundColor="transparent"
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={15} // Increased xGap to stretch waves horizontally
          yGap={20} // Increased yGap to stretch waves vertically
        />
      </div>
    </div>
  );
}