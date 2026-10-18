import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: { id: string; name: string } | null;
  onSuccess: () => void;
}

export function DeleteFolderDialog({ open, onOpenChange, folder, onSuccess }: DeleteFolderDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!folder) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/folders/${folder.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      toast.success("Dossier supprimé");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression du dossier");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Supprimer le dossier</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            Êtes-vous sûr de vouloir supprimer le dossier <strong className="text-foreground">« {folder?.name} »</strong> ? Les factures qu&apos;il contient ne seront pas supprimées et resteront accessibles dans votre espace.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Annuler
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
