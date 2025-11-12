import { useEffect, useState } from 'react';

export interface DamageNumberData {
  id: string;
  damage: number;
  x: number;
  y: number;
  isCritical: boolean;
  isSkill: boolean;
}

interface DamageNumberProps {
  damageNumber: DamageNumberData;
  onComplete: (id: string) => void;
}

export function DamageNumber({ damageNumber, onComplete }: DamageNumberProps) {
  const [opacity, setOpacity] = useState(1);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1秒动画
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 向上飘动
      setOffsetY(-progress * 50);
      // 淡出
      setOpacity(1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete(damageNumber.id);
      }
    };

    animate();
  }, [damageNumber.id, onComplete]);

  // 根据伤害类型选择颜色和大小
  const getStyle = () => {
    let color = '#ffffff';
    let fontSize = '20px';
    let fontWeight = 'normal';
    let textShadow = '0 0 4px rgba(0,0,0,0.8)';

    if (damageNumber.isCritical) {
      color = '#ff3333';
      fontSize = '28px';
      fontWeight = 'bold';
      textShadow = '0 0 8px rgba(255,51,51,0.8), 0 0 12px rgba(255,51,51,0.6)';
    } else if (damageNumber.isSkill) {
      color = '#00ffff';
      fontSize = '24px';
      fontWeight = 'bold';
      textShadow = '0 0 6px rgba(0,255,255,0.8)';
    }

    return {
      position: 'absolute' as const,
      left: `${damageNumber.x}px`,
      top: `${damageNumber.y + offsetY}px`,
      color,
      fontSize,
      fontWeight,
      textShadow,
      opacity,
      pointerEvents: 'none' as const,
      userSelect: 'none' as const,
      transform: 'translate(-50%, -50%)',
      fontFamily: 'Arial, sans-serif',
    };
  };

  return (
    <div style={getStyle()}>
      {damageNumber.isCritical && '暴击! '}
      {damageNumber.damage}
    </div>
  );
}

export default DamageNumber;
