import { useState } from 'react';
import { trpc } from '../lib/trpc';
import type { GameSave } from '../../../drizzle/schema';

interface SaveGameMenuProps {
  onClose: () => void;
  onLoad?: (saveId: number) => void;
  onSave?: (saveName: string) => void;
}

export default function SaveGameMenu({ onClose, onLoad, onSave }: SaveGameMenuProps) {
  const [newSaveName, setNewSaveName] = useState('');
  const [selectedSave, setSelectedSave] = useState<GameSave | null>(null);

  // 获取存档列表
  const { data: saves, isLoading, refetch } = trpc.game.listSaves.useQuery();

  // 删除存档mutation
  const deleteSaveMutation = trpc.game.deleteSave.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedSave(null);
    },
  });

  const handleSave = () => {
    if (!newSaveName.trim()) {
      alert('请输入存档名称');
      return;
    }
    onSave?.(newSaveName);
    setNewSaveName('');
    refetch();
  };

  const handleLoad = (save: GameSave) => {
    if (confirm(`确定要加载存档"${save.saveName}"吗？当前进度将会丢失。`)) {
      onLoad?.(save.id);
      onClose();
    }
  };

  const handleDelete = (save: GameSave) => {
    if (confirm(`确定要删除存档"${save.saveName}"吗？此操作不可恢复。`)) {
      deleteSaveMutation.mutate({ saveId: save.id });
    }
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-2 border-yellow-600">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-6">
          <h2 className="text-3xl font-bold text-white text-center">游戏存档</h2>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* New Save Section */}
          <div className="mb-6 bg-gray-800/50 p-4 rounded-lg border border-yellow-600/30">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">新建存档</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newSaveName}
                onChange={(e) => setNewSaveName(e.target.value)}
                placeholder="输入存档名称..."
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                maxLength={50}
              />
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded transition-colors"
              >
                保存
              </button>
            </div>
          </div>

          {/* Saves List */}
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-3">存档列表</h3>

            {isLoading ? (
              <div className="text-center text-gray-400 py-8">加载中...</div>
            ) : !saves || saves.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                暂无存档
              </div>
            ) : (
              <div className="space-y-3">
                {saves.map((save: GameSave) => (
                  <div
                    key={save.id}
                    className={`bg-gray-800 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedSave?.id === save.id
                        ? 'border-yellow-500 shadow-lg shadow-yellow-500/20'
                        : 'border-gray-700 hover:border-yellow-600/50'
                    }`}
                    onClick={() => setSelectedSave(save)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-1">
                          {save.saveName}
                        </h4>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>等级: {save.playerLevel} | 银两: {save.playerMoney}</div>
                          <div>生命值: {save.playerHealth}/{save.playerMaxHealth}</div>
                          <div>保存时间: {formatDate(save.updatedAt)}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoad(save);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded transition-colors"
                        >
                          加载
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(save);
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded transition-colors"
                          disabled={deleteSaveMutation.isPending}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 p-4 flex justify-between items-center border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {saves && saves.length > 0 && `共 ${saves.length} 个存档`}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors"
          >
            关闭 (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}
