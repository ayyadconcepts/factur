"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/client/supabaseBrowser';
import { Search, FileText, Folder, X, Loader2, Calendar } from 'lucide-react';

interface InvoiceSearchResult {
  id: string;
  number: string;
  buyer_name: string | null;
  total_incl_vat: number | null;
  currency: string | null;
  issue_date: string | null;
  created_at: string;
}

interface FolderSearchResult {
  id: string;
  name: string;
  created_at: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceSearchResult[]>([]);
  const [folders, setFolders] = useState<FolderSearchResult[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd+K / Ctrl+K & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setInvoices([]);
      setFolders([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Search invoices by number or buyer_name
        const invoicesPromise = supabase
          .from('invoices')
          .select('id, number, buyer_name, total_incl_vat, currency, issue_date, created_at')
          .eq('user_id', user.id)
          .or(`number.ilike.%${trimmed}%,buyer_name.ilike.%${trimmed}%`)
          .order('created_at', { ascending: false })
          .limit(6);

        // Search folders by name
        const foldersPromise = supabase
          .from('folders')
          .select('id, name, created_at')
          .eq('user_id', user.id)
          .ilike('name', `%${trimmed}%`)
          .order('name', { ascending: true })
          .limit(4);

        const [invRes, foldRes] = await Promise.all([invoicesPromise, foldersPromise]);

        setInvoices(invRes.data || []);
        setFolders(foldRes.data || []);
      } catch (err) {
        console.error('Error in GlobalSearch:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectInvoice = (id: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/dashboard/invoices/${id}`);
  };

  const handleSelectFolder = (id: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/dashboard/projects?folderId=${id}`);
  };

  const hasResults = invoices.length > 0 || folders.length > 0;
  const isQuerying = query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-[220px] sm:max-w-[260px] my-1">
      <div 
        className={`flex items-center gap-2 h-8 px-2.5 rounded-md border bg-muted/30 transition-colors
          ${isOpen ? 'border-primary/50 bg-background ring-1 ring-primary/20' : 'border-border/40 hover:bg-muted/50'}`}
      >
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher..."
          className="flex-1 bg-transparent text-xs placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
        />
        {query ? (
          <button 
            type="button" 
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="text-muted-foreground hover:text-foreground p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center text-[9px] font-medium text-muted-foreground/80 bg-muted/60 px-1 py-0.5 rounded border border-border/40 select-none">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Floating Dropdown Results */}
      {isOpen && isQuerying && (
        <div className="absolute right-0 top-full mt-1.5 w-full sm:w-[340px] bg-popover text-popover-foreground border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Recherche en cours...</span>
            </div>
          ) : hasResults ? (
            <div className="max-h-[340px] overflow-y-auto p-1.5 divide-y divide-border/30">
              {/* Dossiers section */}
              {folders.length > 0 && (
                <div className="pb-1.5">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Dossiers ({folders.length})
                  </div>
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => handleSelectFolder(folder.id)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted/60 cursor-pointer transition-colors group"
                    >
                      <Folder className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span className="font-medium truncate flex-1">{folder.name}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0">Ouvrir</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Factures section */}
              {invoices.length > 0 && (
                <div className="pt-1.5">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Factures ({invoices.length})
                  </div>
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => handleSelectInvoice(inv.id)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted/60 cursor-pointer transition-colors group"
                    >
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{inv.number}</span>
                          {inv.total_incl_vat !== null && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {Number(inv.total_incl_vat).toFixed(2)} {inv.currency || '€'}
                            </span>
                          )}
                        </div>
                        {inv.buyer_name && (
                          <span className="text-xs text-muted-foreground truncate">
                            {inv.buyer_name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 px-4 text-center">
              <p className="text-sm font-medium">Aucun résultat trouvé</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aucun fichier ou dossier ne correspond à « {query} »
              </p>
            </div>
          )}

          <div className="px-3 py-1.5 bg-muted/30 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between">
            <span>Cliquez pour ouvrir</span>
            <span>Échap pour fermer</span>
          </div>
        </div>
      )}
    </div>
  );
}
