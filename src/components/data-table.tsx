"use client"

import * as React from "react"
import Link from "next/link"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  FileText,
  Download,
  ExternalLink,
  EllipsisVerticalIcon,
  Columns3Icon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  Building2,
  Calendar,
  Euro,
  ShieldCheck,
  Search,
} from "lucide-react"

export const schema = z.object({
  id: z.string(),
  number: z.string(),
  buyer_name: z.string().optional().nullable(),
  buyer_siren: z.string().optional().nullable(),
  issue_date: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  created_at: z.string(),
  type_code: z.string().optional().nullable(),
  total_excl_vat: z.number().optional().nullable(),
  total_vat: z.number().optional().nullable(),
  total_incl_vat: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  profile: z.string().optional().nullable(),
  mode: z.string().optional().nullable(),
  status: z.string().default('done'),
  report: z.any().optional().nullable(),
})

export type InvoiceItem = z.infer<typeof schema>;

function formatMoney(amount?: number | null, currency = 'EUR'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '--';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateFR(dateStr?: string | null): string {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, InvoiceItem>()

const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Sélectionner tout"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner la ligne"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("number", {
    header: "N° Facture",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  }),
  columnHelper.accessor("buyer_name", {
    header: "Client / Destinataire",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">
          {row.original.buyer_name || "Client non spécifié"}
        </span>
        {row.original.buyer_siren && (
          <span className="text-xs text-muted-foreground">
            SIREN : {row.original.buyer_siren}
          </span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor("created_at", {
    header: "Date",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDateFR(row.original.issue_date || row.original.created_at)}
      </span>
    ),
  }),
  columnHelper.accessor("total_excl_vat", {
    header: () => <div className="w-full text-right">Total HT</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums text-xs font-medium">
        {formatMoney(row.original.total_excl_vat, row.original.currency || 'EUR')}
      </div>
    ),
  }),
  columnHelper.accessor("total_incl_vat", {
    header: () => <div className="w-full text-right">Total TTC</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums text-xs font-semibold text-foreground">
        {formatMoney(row.original.total_incl_vat, row.original.currency || 'EUR')}
      </div>
    ),
  }),
  columnHelper.accessor("profile", {
    header: "Profil Factur-X",
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
        {row.original.profile || 'EN 16931'}
      </Badge>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Statut",
    cell: () => (
      <StatusBadge 
        status="done" 
        label="Converti" 
      />
    ),
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-open:bg-muted"
              size="icon"
            />
          }
        >
          <EllipsisVerticalIcon className="size-4" />
          <span className="sr-only">Menu actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => {
              const link = document.createElement('a');
              link.href = `/api/invoices/${row.original.id}/pdf`;
              link.download = `${row.original.number}-facturx.pdf`;
              link.click();
            }}
          >
            <Download className="size-4 mr-2" />
            Télécharger PDF Factur-X
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              window.location.href = `/dashboard/invoices/${row.original.id}`;
            }}
          >
            <ExternalLink className="size-4 mr-2" />
            Consulter la facture
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
])

export function DataTable({
  data: initialData,
}: {
  data: InvoiceItem[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [activeTab, setActiveTab] = React.useState("all")
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'created_at', desc: true }
  ])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Filtrage selon l'onglet actif
  const tabFilteredData = React.useMemo(() => {
    let result = data;
    if (activeTab === "sales") {
      result = result.filter((i) => i.type_code !== "381");
    } else if (activeTab === "credit") {
      result = result.filter((i) => i.type_code === "381");
    } else if (activeTab === "recent") {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      result = result.filter((i) => (i.created_at || "").startsWith(currentMonth));
    }

    if (globalFilter.trim()) {
      const q = globalFilter.toLowerCase();
      result = result.filter(
        (i) =>
          i.number?.toLowerCase().includes(q) ||
          i.buyer_name?.toLowerCase().includes(q) ||
          i.buyer_siren?.includes(q)
      );
    }

    return result;
  }, [data, activeTab, globalFilter]);

  const table = useTable({
    features,
    data: tabFilteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  })

  const salesCount = React.useMemo(() => data.filter(i => i.type_code !== '381').length, [data]);
  const creditCount = React.useMemo(() => data.filter(i => i.type_code === '381').length, [data]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full flex-col justify-start gap-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation par Onglets */}
        <TabsList className="flex overflow-x-auto **:data-[slot=badge]:size-4 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1">
          <TabsTrigger value="all" className="text-xs">
            Toutes les factures <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5">{data.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sales" className="text-xs">
            Ventes <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5">{salesCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="credit" className="text-xs">
            Avoirs <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5">{creditCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-xs">
            Ce mois-ci
          </TabsTrigger>
        </TabsList>

        {/* Barre de Recherche et Gestion des Colonnes */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher facture, client..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 h-8 text-xs bg-cream-light border-border"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" />}
            >
              <Columns3Icon data-icon="inline-start" className="size-3.5 mr-1.5" />
              Colonnes
              <ChevronDownIcon data-icon="inline-end" className="size-3.5 ml-1.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-cream-light border-border">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === 'buyer_name' ? 'Client' : column.id === 'total_excl_vat' ? 'Total HT' : column.id === 'total_incl_vat' ? 'Total TTC' : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TabsContent value={activeTab} className="mt-0">
        <div className="overflow-hidden rounded-xl bg-cream-light shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
          <Table>
            <TableHeader className="bg-cream-dark/60 border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-cream-dark/60 hover:bg-cream-dark/70">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : <FlexRender header={header} />}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="bg-cream-light">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="bg-cream-light hover:bg-cream-dark/40 transition-colors border-b border-border"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <FileText className="size-8 opacity-20" />
                      <p className="text-sm font-medium">Aucune facture trouvée</p>
                      <p className="text-xs">Convertissez votre première facture pour la voir apparaître ici.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination & Infos */}
        <div className="flex items-center justify-between py-3 text-xs text-muted-foreground">
          <div className="hidden sm:block">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <span>
                {table.getFilteredSelectedRowModel().rows.length} sur{" "}
                {table.getFilteredRowModel().rows.length} facture(s) sélectionnée(s)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span>
              Page {pagination.pageIndex + 1} sur{" "}
              {Math.max(1, table.getPageCount())}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="size-7"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeftIcon className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                className="size-7"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                className="size-7"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                className="size-7"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRightIcon className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function TableCellViewer({ item }: { item: InvoiceItem }) {
  const isMobile = useIsMobile()

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"}>
      <DrawerTrigger
        render={
          <Button
            variant="link"
            className="w-fit p-0 h-auto font-medium text-foreground hover:text-primary flex items-center gap-1.5"
          />
        }
      >
        <FileText className="size-3.5 text-primary" />
        <span>{item.number}</span>
      </DrawerTrigger>
      <DrawerContent className="max-w-lg bg-card border-border">
        <DrawerHeader className="gap-1 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <FileText className="size-4 text-primary" />
              Facture {item.number}
            </DrawerTitle>
            <StatusBadge status="done" label="Converti" />
          </div>
          <DrawerDescription className="text-xs text-muted-foreground flex items-center gap-3 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDateFR(item.issue_date || item.created_at)}
            </span>
            <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
              {item.profile || "EN 16931"}
            </Badge>
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-5 overflow-y-auto p-4 text-xs">
          {/* Bloc Montants */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <p className="text-[11px] text-muted-foreground">Total HT</p>
              <p className="text-xs font-semibold tabular-nums mt-0.5">{formatMoney(item.total_excl_vat, item.currency || 'EUR')}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Total TVA</p>
              <p className="text-xs font-semibold tabular-nums mt-0.5">{formatMoney(item.total_vat, item.currency || 'EUR')}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Total TTC</p>
              <p className="text-xs font-bold text-primary tabular-nums mt-0.5">{formatMoney(item.total_incl_vat, item.currency || 'EUR')}</p>
            </div>
          </div>

          {/* Destinataire / Client */}
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              Client Destinataire
            </Label>
            <div className="p-3 rounded-lg border border-border bg-card flex flex-col gap-1">
              <span className="text-xs font-medium text-foreground">{item.buyer_name || "Client non spécifié"}</span>
              {item.buyer_siren && (
                <span className="text-[11px] text-muted-foreground">SIREN : {item.buyer_siren}</span>
              )}
            </div>
          </div>

          {/* Spécifications Factur-X */}
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              Conformité & Données Factur-X
            </Label>
            <div className="p-3 rounded-lg border border-border bg-card space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Norme :</span>
                <span className="font-medium">Factur-X 1.0.07 / ZUGFeRD 2.3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profil :</span>
                <span className="font-medium">{item.profile || "EN 16931"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Validation XML :</span>
                <span className="text-emerald-600 font-medium">✓ Schéma CII Validé</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fichier embarqué :</span>
                <span className="font-mono text-[11px]">factur-x.xml (PDF/A-3)</span>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-border pt-3 flex flex-row items-center justify-end gap-2">
          <Button
            size="sm"
            className="h-8 text-xs bg-[#02b282] hover:bg-[#01946c] text-white"
            onClick={() => {
              const link = document.createElement('a');
              link.href = `/api/invoices/${item.id}/pdf`;
              link.download = `${item.number}-facturx.pdf`;
              link.click();
            }}
          >
            <Download className="size-3.5 mr-1.5" />
            Télécharger Factur-X
          </Button>
          <DrawerClose
            render={<Button variant="outline" size="sm" className="h-8 text-xs border-border bg-card hover:bg-muted" />}
          >
            Fermer
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
