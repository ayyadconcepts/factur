import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Folder, FileText, Download, MoreHorizontal, Move, Star, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface DirectoryItem {
  id: string;
  type: 'folder' | 'invoice';
  name: string;
  buyer_name?: string;
  size?: string;
  created_at: string;
}

interface DirectoryTableProps {
  items: DirectoryItem[];
  onFolderClick: (id: string) => void;
  onMoveClick: (id: string, type: 'folder' | 'invoice') => void;
  onRenameFolder?: (folder: { id: string; name: string }) => void;
  onDeleteFolder?: (folder: { id: string; name: string }) => void;
}

export function DirectoryTable({
  items,
  onFolderClick,
  onMoveClick,
  onRenameFolder,
  onDeleteFolder,
}: DirectoryTableProps) {
  
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-lg">
        <Folder className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm">Ce dossier est vide</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-b-border/50">
          <TableHead>Nom</TableHead>
          <TableHead className="w-12"></TableHead>
          <TableHead className="w-24 text-right">Taille</TableHead>
          <TableHead className="w-32">Modifié</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-cream-light">
        {items.map((item) => (
          <TableRow key={item.id} className="group border-b border-border bg-cream-light hover:bg-cream-dark/40 transition-colors">
            <TableCell>
              {item.type === 'folder' ? (
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onFolderClick(item.id)}
                >
                  <Folder className="w-4 h-4 fill-muted text-muted-foreground" />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              ) : (
                <a 
                  href={`/dashboard/invoices/${item.id}`}
                  className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm">
                    {item.name}
                    {item.buyer_name ? ` (${item.buyer_name})` : ''}
                  </span>
                </a>
              )}
            </TableCell>
            <TableCell>
              <Star className="w-4 h-4 text-transparent group-hover:text-muted-foreground/30 hover:!text-yellow-400 cursor-pointer transition-colors" />
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
              {item.size || '--'}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                  }
                >
                  <MoreHorizontal className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {item.type === 'folder' ? (
                    <>
                      <DropdownMenuItem onClick={() => onRenameFolder?.({ id: item.id, name: item.name })}>
                        <Pencil className="w-4 h-4 mr-2" />
                        <span>Renommer</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDeleteFolder?.({ id: item.id, name: item.name })}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span>Supprimer</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `/api/invoices/${item.id}/pdf`;
                          link.download = `${item.name}-facturx.pdf`;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        <span>Télécharger</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onMoveClick(item.id, item.type as "folder" | "invoice")}>
                        <Move className="w-4 h-4 mr-2" />
                        <span>Déplacer</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
