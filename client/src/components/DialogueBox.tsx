import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export interface DialogueOption {
  text: string;
  nextDialogueId?: string;
  action?: () => void;
}

export interface Dialogue {
  id: string;
  speaker: string;
  avatar?: string;
  text: string;
  options?: DialogueOption[];
}

interface DialogueBoxProps {
  dialogue: Dialogue;
  onOptionSelect: (option: DialogueOption) => void;
  onClose: () => void;
}

export function DialogueBox({ dialogue, onOptionSelect, onClose }: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    
    let currentIndex = 0;
    const typingSpeed = 50; // 每个字50ms

    const typeInterval = setInterval(() => {
      if (currentIndex < dialogue.text.length) {
        setDisplayedText(dialogue.text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [dialogue]);

  const handleSkip = () => {
    setDisplayedText(dialogue.text);
    setIsTyping(false);
  };

  return (
    <div className="fixed inset-0 flex items-end justify-center p-4 pointer-events-none">
      <div className="w-full max-w-3xl bg-black/80 backdrop-blur-sm border-2 border-amber-600 rounded-lg p-6 pointer-events-auto">
        {/* 角色信息 */}
        <div className="flex items-center gap-4 mb-4">
          {dialogue.avatar && (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl">
              {dialogue.avatar}
            </div>
          )}
          <div className="text-xl font-bold text-amber-400">{dialogue.speaker}</div>
        </div>

        {/* 对话文本 */}
        <div 
          className="text-white text-lg leading-relaxed mb-6 min-h-[80px]"
          onClick={isTyping ? handleSkip : undefined}
          style={{ cursor: isTyping ? 'pointer' : 'default' }}
        >
          {displayedText}
          {isTyping && <span className="animate-pulse">▌</span>}
        </div>

        {/* 对话选项 */}
        {!isTyping && dialogue.options && dialogue.options.length > 0 && (
          <div className="flex flex-col gap-2">
            {dialogue.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left bg-amber-900/20 hover:bg-amber-800/40 border-amber-700 text-white"
                onClick={() => onOptionSelect(option)}
              >
                {option.text}
              </Button>
            ))}
          </div>
        )}

        {/* 继续按钮（无选项时） */}
        {!isTyping && (!dialogue.options || dialogue.options.length === 0) && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="bg-amber-900/20 hover:bg-amber-800/40 border-amber-700 text-white"
              onClick={onClose}
            >
              继续 (空格)
            </Button>
          </div>
        )}

        {/* 提示文字 */}
        {isTyping && (
          <div className="text-sm text-gray-400 text-right">
            点击跳过...
          </div>
        )}
      </div>
    </div>
  );
}

export default DialogueBox;
