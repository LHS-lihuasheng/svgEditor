"use client"

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMPONENT_TEMPLATES } from './atomicComponent';
import { ComponentType } from "@/types/core";

interface ComponentSelectorProps {
  onSelect: (type: ComponentType) => void;
}

export function ComponentSelector({ onSelect }: ComponentSelectorProps) {
  // 将模板分类
  const categorizedTemplates: Record<string, typeof COMPONENT_TEMPLATES> = Object.entries(COMPONENT_TEMPLATES).reduce(
    (acc, [key, template]) => {
      const category = template.category || '基础';
      if (!acc[category]) {
        acc[category] = {};
      }
      acc[category][key] = template;
      return acc;
    },
    {} as Record<string, typeof COMPONENT_TEMPLATES>
  );

  // 确保基础和动画分类始终存在并排在前面
  const orderedCategories = ['基础', '容器', '形状', '动画', ...Object.keys(categorizedTemplates).filter(
    cat => !['基础', '容器', '形状', '动画'].includes(cat)
  )];
  
  return (
    <Tabs defaultValue="基础" className="w-full">
      <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${orderedCategories.length}, 1fr)` }}>
        {orderedCategories.map(category => (
          <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
        ))}
      </TabsList>
      
      {orderedCategories.map(category => (
        <TabsContent key={category} value={category} className="pt-4">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(categorizedTemplates[category] || {}).map(([type, template]) => (
              <Button
                key={type}
                variant="outline"
                className="flex flex-col h-auto py-4"
                onClick={() => onSelect(type as ComponentType)}
              >
                <span className="text-xl mb-1">{template.icon}</span>
                <span className="text-xs">{template.label}</span>
              </Button>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
} 