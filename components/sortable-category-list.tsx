"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, GripVertical } from "lucide-react";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  color?: string;
  icon?: string;
  order: number;
  isPublicBurden?: boolean;
  parentCategoryId?: string | null;
  parentCategory?: {
    id: string;
    name: string;
  } | null;
  subCategories?: {
    id: string;
    name: string;
    type: "income" | "expense";
    order: number;
  }[];
};

type SortableCategoryListProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onReorder: (categories: Category[]) => void;
};

function SortableItem({
  category,
  onEdit,
  onDelete,
  isChild = false,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  isChild?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={isChild ? "ml-6" : ""}>
      <Card>
        <CardContent className="flex items-center justify-between py-2 px-3">
          <div className="flex items-center gap-2">
            {isChild && <span className="text-muted-foreground text-xs">└─</span>}
            <button
              className="cursor-grab active:cursor-grabbing touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="text-sm font-medium">{category.name}</span>
            {category.isPublicBurden && (
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                公的負担
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(category)}
              className="cursor-pointer h-7 w-7 p-0"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(category.id)}
              className="text-destructive hover:text-destructive cursor-pointer h-7 w-7 p-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SortableCategoryList({
  categories,
  onEdit,
  onDelete,
  onReorder,
}: SortableCategoryListProps) {
  const [items, setItems] = useState(categories);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // order値を再計算
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      onReorder(reorderedItems);
    }
  };

  // categoriesが変更されたら内部stateを更新
  if (JSON.stringify(categories) !== JSON.stringify(items)) {
    setItems(categories);
  }

  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">カテゴリーがありません</p>;
  }

  // 親カテゴリーとその子カテゴリーを階層的に並べる
  const hierarchicalItems: Array<{ category: Category; isChild: boolean }> = [];
  const parentCategories = items.filter((cat) => !cat.parentCategoryId);

  parentCategories.forEach((parent) => {
    // 親カテゴリーを追加
    hierarchicalItems.push({ category: parent, isChild: false });

    // その子カテゴリーを追加
    const children = items.filter((cat) => cat.parentCategoryId === parent.id);
    children.forEach((child) => {
      hierarchicalItems.push({ category: child, isChild: true });
    });
  });

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {hierarchicalItems.map(({ category, isChild }) => (
            <SortableItem
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
              isChild={isChild}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
