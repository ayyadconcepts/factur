import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { createClient } from '@/client/supabaseBrowser';
import { toast } from 'sonner';

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  currentFolderId: string | null;
  onSuccess: () => void;
}

export function MoveItemDialog({ open, onOpenChange, invoiceId, currentFolderId, onSuccess }: MoveItemDialogProps) {
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedFolderId(null);
      fetchFolders();
    }
  }, [open]);

  const fetchFolders = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from('folders').select('*').order('name');
    setFolders(data || []);
    setIsLoading(false);
  };

  const handleMove = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: selectedFolderId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur");
      }
      onSuccess();
      onOpenChange(false);
      toast.success("Déplacé avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du déplacement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build tree
  const rootFolders = folders.filter(f => !f.parent_id);
  const getChildren = (parentId: string) => folders.filter(f => f.parent_id === parentId);

  const renderFolder = (folder: any, level: number) => {
    const children = getChildren(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isCurrent = currentFolderId === folder.id;

    return (
      <div key={folder.id} className="flex flex-col">
        <div 
          className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-sm
            ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}
            ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
          onClick={() => !isCurrent && setSelectedFolderId(folder.id)}
        >
          {children.length > 0 ? <ChevronDown className="w-4 h-4" /> : <div className="w-4 h-4" />}
          <Folder className={`w-4 h-4 ${isSelected ? 'fill-primary/20 text-primary' : ''}`} />
          <span>{folder.name}</span>
          {isCurrent && <span className="text-xs ml-auto">(Actuel)</span>}
        </div>
        {children.map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Déplacer vers...</DialogTitle>
          <DialogDescription className="sr-only">Choisir un dossier de destination</DialogDescription>
        </DialogHeader>
        <div className="py-2 max-h-[300px] overflow-y-auto border rounded-md p-2">
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="flex flex-col gap-1">
              <div 
                className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-sm
                  ${selectedFolderId === null ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}
                  ${currentFolderId === null ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => currentFolderId !== null && setSelectedFolderId(null)}
              >
                <div className="w-4 h-4" />
                <Folder className={`w-4 h-4 ${selectedFolderId === null ? 'fill-primary/20 text-primary' : ''}`} />
                <span>Mon Drive (Racine)</span>
                {currentFolderId === null && <span className="text-xs ml-auto">(Actuel)</span>}
              </div>
              {rootFolders.map(f => renderFolder(f, 0))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleMove} disabled={isSubmitting || selectedFolderId === currentFolderId || (selectedFolderId === null && currentFolderId === null)}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Déplacer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
