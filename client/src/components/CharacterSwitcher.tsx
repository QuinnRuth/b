import { Character } from '../types/characters';
import { ELEMENT_CONFIGS } from '../types/elements';

interface CharacterSwitcherProps {
  characters: Character[];
  activeCharacter: Character;
  onSwitch: (character: Character) => void;
}

export default function CharacterSwitcher({
  characters,
  activeCharacter,
  onSwitch,
}: CharacterSwitcherProps) {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
      {characters.map((char, index) => {
        const elementConfig = ELEMENT_CONFIGS[char.element.elementType];
        const isActive = char.id === activeCharacter.id;

        return (
          <button
            key={char.id}
            onClick={() => onSwitch(char)}
            className={`relative w-20 h-24 rounded-lg border-2 transition-all ${
              isActive
                ? 'border-yellow-400 scale-110 shadow-lg'
                : 'border-gray-600 opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: `#${elementConfig.color.toString(16).padStart(6, '0')}33`,
            }}
          >
            {/* 角色头像/图标 */}
            <div className="flex flex-col items-center justify-center h-full p-2">
              <div className="text-3xl mb-1">{elementConfig.icon}</div>
              <div className="text-xs text-white font-bold text-center">
                {char.name}
              </div>
              <div className="text-xs text-gray-300">{char.title}</div>
            </div>

            {/* 快捷键提示 */}
            <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
              {index + 1}
            </div>

            {/* 爆发能量条 */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(char.element.burstEnergy / char.element.maxBurstEnergy) * 100}%`,
                  backgroundColor: `#${elementConfig.color.toString(16).padStart(6, '0')}`,
                }}
              />
            </div>

            {/* 激活指示器 */}
            {isActive && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-yellow-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
