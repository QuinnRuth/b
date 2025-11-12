import { useState } from 'react';
import { Item, ItemType, ItemRarity, InventoryItem, Equipment } from '../types/items';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface InventoryProps {
  inventory: InventoryItem[];
  equipment: Equipment;
  onUseItem: (item: Item) => void;
  onEquipItem: (item: Item) => void;
  onUnequipItem: (slot: string) => void;
  onClose: () => void;
}

const rarityColors: Record<ItemRarity, string> = {
  [ItemRarity.COMMON]: 'text-gray-400',
  [ItemRarity.UNCOMMON]: 'text-green-400',
  [ItemRarity.RARE]: 'text-blue-400',
  [ItemRarity.EPIC]: 'text-purple-400',
  [ItemRarity.LEGENDARY]: 'text-orange-400',
};

const typeNames: Record<ItemType, string> = {
  [ItemType.CONSUMABLE]: '丹药',
  [ItemType.WEAPON]: '武器',
  [ItemType.ARMOR]: '装备',
  [ItemType.MATERIAL]: '材料',
};

export default function Inventory({
  inventory,
  equipment,
  onUseItem,
  onEquipItem,
  onUnequipItem,
  onClose,
}: InventoryProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeTab, setActiveTab] = useState<ItemType | 'all'>('all');

  const filteredInventory =
    activeTab === 'all'
      ? inventory
      : inventory.filter((invItem) => invItem.item.type === activeTab);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl w-[90%] max-w-6xl h-[80%] flex flex-col border-2 border-yellow-600">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-600/50">
          <h2 className="text-2xl font-bold text-yellow-400">背包系统</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-yellow-400 hover:bg-yellow-400/20"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧：装备栏 */}
          <div className="w-1/4 p-4 border-r border-yellow-600/50">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">当前装备</h3>
            <div className="space-y-3">
              {/* 武器槽 */}
              <div className="bg-gray-800/50 p-3 rounded border border-yellow-600/30">
                <div className="text-sm text-gray-400 mb-1">武器</div>
                {equipment.weapon ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{equipment.weapon.icon}</span>
                      <div>
                        <div className={`font-bold ${rarityColors[equipment.weapon.rarity]}`}>
                          {equipment.weapon.name}
                        </div>
                        {equipment.weapon.stats?.attack && (
                          <div className="text-xs text-red-400">
                            攻击 +{equipment.weapon.stats.attack}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUnequipItem('weapon')}
                      className="text-xs"
                    >
                      卸下
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">未装备</div>
                )}
              </div>

              {/* 身体槽 */}
              <div className="bg-gray-800/50 p-3 rounded border border-yellow-600/30">
                <div className="text-sm text-gray-400 mb-1">身体</div>
                {equipment.body ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{equipment.body.icon}</span>
                      <div>
                        <div className={`font-bold ${rarityColors[equipment.body.rarity]}`}>
                          {equipment.body.name}
                        </div>
                        {equipment.body.stats?.defense && (
                          <div className="text-xs text-blue-400">
                            防御 +{equipment.body.stats.defense}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUnequipItem('body')}
                      className="text-xs"
                    >
                      卸下
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">未装备</div>
                )}
              </div>
            </div>

            {/* 属性总览 */}
            <div className="mt-6 bg-gray-800/50 p-3 rounded border border-yellow-600/30">
              <h4 className="text-sm font-bold text-yellow-400 mb-2">属性加成</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">攻击力:</span>
                  <span className="text-red-400">
                    +{(equipment.weapon?.stats?.attack || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">防御力:</span>
                  <span className="text-blue-400">
                    +{(equipment.body?.stats?.defense || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">生命值:</span>
                  <span className="text-green-400">
                    +
                    {(equipment.weapon?.stats?.health || 0) +
                      (equipment.body?.stats?.health || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 中间：物品列表 */}
          <div className="flex-1 flex flex-col">
            {/* 分类标签 */}
            <div className="flex gap-2 p-4 border-b border-yellow-600/50">
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveTab('all')}
                size="sm"
              >
                全部
              </Button>
              <Button
                variant={activeTab === ItemType.CONSUMABLE ? 'default' : 'outline'}
                onClick={() => setActiveTab(ItemType.CONSUMABLE)}
                size="sm"
              >
                丹药
              </Button>
              <Button
                variant={activeTab === ItemType.WEAPON ? 'default' : 'outline'}
                onClick={() => setActiveTab(ItemType.WEAPON)}
                size="sm"
              >
                武器
              </Button>
              <Button
                variant={activeTab === ItemType.ARMOR ? 'default' : 'outline'}
                onClick={() => setActiveTab(ItemType.ARMOR)}
                size="sm"
              >
                装备
              </Button>
              <Button
                variant={activeTab === ItemType.MATERIAL ? 'default' : 'outline'}
                onClick={() => setActiveTab(ItemType.MATERIAL)}
                size="sm"
              >
                材料
              </Button>
            </div>

            {/* 物品网格 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-6 gap-3">
                {filteredInventory.map((invItem, index) => (
                  <div
                    key={index}
                    className={`bg-gray-800/50 p-3 rounded border-2 cursor-pointer transition-all hover:scale-105 ${
                      selectedItem?.id === invItem.item.id
                        ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
                        : 'border-gray-700'
                    }`}
                    onClick={() => setSelectedItem(invItem.item)}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-1">{invItem.item.icon}</div>
                      <div
                        className={`text-xs font-bold ${rarityColors[invItem.item.rarity]}`}
                      >
                        {invItem.item.name}
                      </div>
                      {invItem.item.stackable && (
                        <div className="text-xs text-gray-400 mt-1">
                          x{invItem.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {filteredInventory.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  该分类暂无物品
                </div>
              )}
            </div>
          </div>

          {/* 右侧：物品详情 */}
          <div className="w-1/4 p-4 border-l border-yellow-600/50">
            {selectedItem ? (
              <div>
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{selectedItem.icon}</div>
                  <h3 className={`text-xl font-bold ${rarityColors[selectedItem.rarity]}`}>
                    {selectedItem.name}
                  </h3>
                  <div className="text-sm text-gray-400 mt-1">
                    {typeNames[selectedItem.type]}
                  </div>
                </div>

                <div className="bg-gray-800/50 p-3 rounded border border-yellow-600/30 mb-4">
                  <p className="text-sm text-gray-300">{selectedItem.description}</p>
                </div>

                {/* 属性 */}
                {selectedItem.stats && (
                  <div className="bg-gray-800/50 p-3 rounded border border-yellow-600/30 mb-4">
                    <h4 className="text-sm font-bold text-yellow-400 mb-2">属性</h4>
                    <div className="space-y-1 text-sm">
                      {selectedItem.stats.attack && (
                        <div className="text-red-400">攻击 +{selectedItem.stats.attack}</div>
                      )}
                      {selectedItem.stats.defense && (
                        <div className="text-blue-400">
                          防御 +{selectedItem.stats.defense}
                        </div>
                      )}
                      {selectedItem.stats.health && (
                        <div className="text-green-400">
                          生命 +{selectedItem.stats.health}
                        </div>
                      )}
                      {selectedItem.stats.speed && (
                        <div className="text-yellow-400">
                          速度 +{selectedItem.stats.speed}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 效果 */}
                {selectedItem.effect && (
                  <div className="bg-gray-800/50 p-3 rounded border border-yellow-600/30 mb-4">
                    <h4 className="text-sm font-bold text-yellow-400 mb-2">效果</h4>
                    <div className="text-sm text-gray-300">
                      {selectedItem.effect.type === 'heal' && `恢复${selectedItem.effect.value}点生命值`}
                      {selectedItem.effect.type === 'energy' && `恢复${selectedItem.effect.value}点内力`}
                      {selectedItem.effect.type === 'buff' &&
                        `${selectedItem.effect.duration}秒内攻击力+${selectedItem.effect.value}`}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="space-y-2">
                  {selectedItem.type === ItemType.CONSUMABLE && (
                    <Button
                      className="w-full"
                      onClick={() => onUseItem(selectedItem)}
                    >
                      使用
                    </Button>
                  )}
                  {(selectedItem.type === ItemType.WEAPON ||
                    selectedItem.type === ItemType.ARMOR) && (
                    <Button
                      className="w-full"
                      onClick={() => onEquipItem(selectedItem)}
                    >
                      装备
                    </Button>
                  )}
                  <div className="text-center text-sm text-gray-400 mt-4">
                    价值: {selectedItem.price} 银两
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                选择一个物品查看详情
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
