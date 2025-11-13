import { useEffect, useState } from 'react';
import { ElementReaction, REACTION_VISUAL_EFFECTS } from '../types/elements';

interface ElementReactionEffectProps {
  reaction: ElementReaction;
  position: { x: number; y: number };
  onComplete: () => void;
}

export default function ElementReactionEffect({
  reaction,
  position,
  onComplete,
}: ElementReactionEffectProps) {
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(0.5);

  const reactionConfig = REACTION_VISUAL_EFFECTS[reaction];
  const reactionNames: Record<ElementReaction, string> = {
    vaporize: '蒸发',
    overload: '超载',
    electro_charged: '感电',
    crystallize: '结晶',
    melt: '融化',
    swirl: '扩散',
  };

  useEffect(() => {
    // 放大动画
    const scaleInterval = setInterval(() => {
      setScale((prev) => Math.min(prev + 0.1, 1.5));
    }, 50);

    // 淡出动画
    const fadeTimeout = setTimeout(() => {
      const fadeInterval = setInterval(() => {
        setOpacity((prev) => {
          if (prev <= 0) {
            clearInterval(fadeInterval);
            onComplete();
            return 0;
          }
          return prev - 0.1;
        });
      }, 50);
    }, 500);

    return () => {
      clearInterval(scaleInterval);
      clearTimeout(fadeTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        transition: 'all 0.1s ease-out',
      }}
    >
      {/* 反应名称 */}
      <div
        className="text-2xl font-bold whitespace-nowrap"
        style={{
          color: `#${reactionConfig.particleColor.toString(16).padStart(6, '0')}`,
          textShadow: `0 0 10px #${reactionConfig.particleColor.toString(16).padStart(6, '0')},
                       0 0 20px #${reactionConfig.particleColor.toString(16).padStart(6, '0')}`,
          WebkitTextStroke: '1px rgba(0,0,0,0.5)',
        }}
      >
        {reactionNames[reaction]}!
      </div>

      {/* 爆炸效果圈 */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: `${reactionConfig.explosionRadius * 20}px`,
          height: `${reactionConfig.explosionRadius * 20}px`,
          backgroundColor: `#${reactionConfig.particleColor.toString(16).padStart(6, '0')}`,
          opacity: 0.3,
          boxShadow: `0 0 ${reactionConfig.explosionRadius * 10}px #${reactionConfig.particleColor.toString(16).padStart(6, '0')}`,
        }}
      />
    </div>
  );
}
