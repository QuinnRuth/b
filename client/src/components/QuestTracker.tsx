import { ActiveQuest, QuestStatus } from '../types/quests';

interface QuestTrackerProps {
  activeQuests: ActiveQuest[];
}

export default function QuestTracker({ activeQuests }: QuestTrackerProps) {
  const inProgressQuests = activeQuests.filter(
    (q) => q.status === QuestStatus.IN_PROGRESS
  );

  if (inProgressQuests.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 w-80 max-h-96 overflow-y-auto">
      <div className="bg-black/70 border-2 border-amber-600 rounded-lg p-4">
        <h3 className="text-amber-500 font-bold text-lg mb-3 border-b border-amber-600/50 pb-2">
          任务追踪
        </h3>
        
        {inProgressQuests.map((quest) => (
          <div key={quest.id} className="mb-4 last:mb-0">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-amber-400 font-semibold text-sm">
                {quest.type === 'main' && '【主线】'}
                {quest.type === 'side' && '【支线】'}
                {quest.title}
              </h4>
            </div>
            
            <div className="space-y-1">
              {quest.objectives.map((objective) => (
                <div
                  key={objective.id}
                  className={`text-xs flex items-center justify-between ${
                    objective.completed ? 'text-green-400' : 'text-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {objective.completed ? '✓' : '○'} {objective.description}
                  </span>
                  <span className="text-amber-500 font-mono">
                    {objective.current}/{objective.required}
                  </span>
                </div>
              ))}
            </div>
            
            {quest.objectives.every((obj) => obj.completed) && (
              <div className="mt-2 text-green-400 text-xs font-semibold animate-pulse">
                → 返回任务发布者领取奖励
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
