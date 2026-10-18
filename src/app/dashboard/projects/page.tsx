"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/client/supabaseBrowser';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, ChevronRight } from 'lucide-react';
import { FolderTree } from './components/FolderTree';
import { DirectoryTable } from './components/DirectoryTable';
import { CreateFolderDialog } from './components/CreateFolderDialog';
import { RenameFolderDialog } from './components/RenameFolderDialog';
import { DeleteFolderDialog } from './components/DeleteFolderDialog';
import { MoveItemDialog } from './components/MoveItemDialog';
import { toast } from 'sonner';

function formatFileSize(bytes?: number | null): string {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes <= 0) {
    return '--';
  }
  if (bytes < 1024) {
    return `${bytes} o`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb >= 100 ? Math.round(kb) : kb.toFixed(1)} Ko`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(1)} Mo`;
}

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');
  const [folders, setFolders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [fetchedSizes, setFetchedSizes] = useState<Record<string, number>>({});
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(folderIdFromUrl || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (folderIdFromUrl !== undefined && folderIdFromUrl !== null) {
      setCurrentFolderId(folderIdFromUrl);
    }
  }, [folderIdFromUrl]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<{ id: string; name: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string } | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<{id: string, type: 'folder' | 'invoice'} | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [foldersRes, invoicesRes] = await Promise.all([
      supabase.from('folders').select('*').eq('user_id', user.id).order('name'),
      supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    setFolders(foldersRes.data || []);
    setInvoices(invoicesRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentFolders = folders.filter(f => (f.parent_id || null) === (currentFolderId || null));
  const currentInvoices = invoices.filter(i => (i.folder_id || null) === (currentFolderId || null));

  // Background fetch of file sizes for invoices where report.fileSize is not present
  useEffect(() => {
    const invoicesWithoutSize = currentInvoices.filter(
      (inv) => !inv.report?.fileSize && !inv.report?.file_size && !fetchedSizes[inv.id]
    );

    if (invoicesWithoutSize.length === 0) return;

    let isMounted = true;
    invoicesWithoutSize.forEach(async (inv) => {
      try {
        const res = await fetch(`/api/invoices/${inv.id}/pdf`, { method: 'HEAD' });
        const len = res.headers.get('content-length');
        if (len && isMounted) {
          const num = parseInt(len, 10);
          if (!isNaN(num) && num > 0) {
            setFetchedSizes((prev) => ({ ...prev, [inv.id]: num }));
          }
        }
      } catch {
        // Non-fatal
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentInvoices, fetchedSizes]);

  const getFolderSize = (folderId: string) => {
    const subfoldersCount = folders.filter(f => f.parent_id === folderId).length;
    const subinvoicesCount = invoices.filter(i => i.folder_id === folderId).length;
    const count = subfoldersCount + subinvoicesCount;
    return count === 0 ? '--' : `${count} élément${count > 1 ? 's' : ''}`;
  };

  const tableItems = [
    ...currentFolders.map(f => ({
      ...f,
      type: 'folder',
      size: getFolderSize(f.id),
    })),
    ...currentInvoices.map(i => {
      const sizeBytes = i.report?.fileSize || i.report?.file_size || fetchedSizes[i.id];
      return {
        ...i,
        type: 'invoice',
        name: i.number,
        buyer_name: i.buyer_name,
        size: formatFileSize(sizeBytes),
        created_at: i.created_at,
      };
    })
  ];

  // Breadcrumbs
  const getBreadcrumbs = () => {
    if (!currentFolderId) return [{ id: null, name: 'Mon Drive' }];
    const path = [];
    let curr = folders.find(f => f.id === currentFolderId);
    while (curr) {
      path.unshift({ id: curr.id, name: curr.name });
      curr = folders.find(f => f.id === curr.parent_id);
    }
    return [{ id: null, name: 'Mon Drive' }, ...path];
  };
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 flex-shrink-0 border-r bg-muted/30 p-4 flex flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <Button variant="outline" className="justify-start gap-2 h-9 font-medium bg-card hover:bg-muted" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Nouveau
          </Button>
        </div>

        <div className="flex flex-col">
          <FolderTree 
            folders={folders} 
            currentFolderId={currentFolderId} 
            onSelect={setCurrentFolderId} 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="h-14 shrink-0 border-b flex items-center px-6 gap-4 bg-background">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id || 'root'}>
                {idx > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <button 
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className={`hover:bg-muted px-2 py-1 rounded-md transition-colors ${idx === breadcrumbs.length - 1 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto overflow-hidden rounded-xl bg-card shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
              <DirectoryTable 
                items={tableItems} 
                onFolderClick={setCurrentFolderId} 
                onMoveClick={(id, type) => {
                  setItemToMove({ id, type });
                  setMoveDialogOpen(true);
                }}
                onRenameFolder={(folder) => {
                  setFolderToRename(folder);
                  setRenameDialogOpen(true);
                }}
                onDeleteFolder={(folder) => {
                  setFolderToDelete(folder);
                  setDeleteDialogOpen(true);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <CreateFolderDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
        parentId={currentFolderId}
        onSuccess={fetchData} 
      />

      <RenameFolderDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        folder={folderToRename}
        onSuccess={fetchData}
      />

      <DeleteFolderDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        folder={folderToDelete}
        onSuccess={fetchData}
      />
      
      {itemToMove?.type === 'invoice' && (
        <MoveItemDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          invoiceId={itemToMove.id}
          currentFolderId={currentFolderId}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <ProjectsPageContent />
    </Suspense>
  );
}
