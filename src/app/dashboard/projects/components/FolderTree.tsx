import React, { useState } from 'react';
import { Folder, ChevronRight, ChevronDown } from 'lucide-react';

interface FolderTreeProps {
  folders: any[];
  currentFolderId: string | null;
  onSelect: (id: string | null) => void;
}

export function FolderTree({ folders, currentFolderId, onSelect }: FolderTreeProps) {
  const rootFolders = folders.filter(f => !f.parent_id);
  const getChildren = (parentId: string) => folders.filter(f => f.parent_id === parentId);

  const renderFolder = (folder: any, level: number) => {
    const children = getChildren(folder.id);
    const isSelected = currentFolderId === folder.id;
    const [expanded, setExpanded] = useState(level < 1 || isSelected);

    return (
      <div key={folder.id} className="flex flex-col">
        <div 
          className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-sm mb-1
            ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}
          `}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        >
          {children.length > 0 ? (
            <div onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="p-0.5 hover:bg-muted-foreground/20 rounded">
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </div>
          ) : (
            <div className="w-4.5 h-4.5" />
          )}
          <div className="flex flex-1 items-center gap-2" onClick={() => onSelect(folder.id)}>
            <Folder className={`w-4 h-4 ${isSelected ? 'fill-primary/20 text-primary' : ''}`} />
            <span className="truncate">{folder.name}</span>
          </div>
        </div>
        {expanded && children.map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-sm mb-1
          ${currentFolderId === null ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}
        `}
        onClick={() => onSelect(null)}
      >
        <div className="w-4.5 h-4.5" />
        <Folder className={`w-4 h-4 ${currentFolderId === null ? 'fill-primary/20 text-primary' : ''}`} />
        <span className="truncate">Mon Drive</span>
      </div>
      <div className="pl-2">
        {rootFolders.map(f => renderFolder(f, 0))}
      </div>
    </div>
  );
}
