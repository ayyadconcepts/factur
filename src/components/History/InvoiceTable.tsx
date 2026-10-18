"use client";

import React from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buttonVariants } from "@/components/ui/button"

interface InvoiceRow {
  id: string;
  number: string;
  issue_date: string;
  buyer_name: string;
  total_incl_vat: number;
  currency: string;
  type_code: string;
}

export function InvoiceTable({ invoices }: { invoices: InvoiceRow[] }) {
  if (invoices.length === 0) {
    return <p className="text-muted-foreground py-4 text-center">Aucune facture trouvée.</p>;
  }

  return (
    <div className="rounded-xl overflow-hidden bg-cream-light shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
      <Table>
        <TableHeader className="bg-cream-dark/60 border-b border-border">
          <TableRow className="bg-cream-dark/60 hover:bg-cream-dark/70">
            <TableHead>Numéro</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Total TTC</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-cream-light">
          {invoices.map((inv) => (
            <TableRow key={inv.id} className="bg-cream-light hover:bg-cream-dark/40 transition-colors border-b border-border">
              <TableCell className="font-medium">{inv.number}</TableCell>
              <TableCell>{inv.issue_date}</TableCell>
              <TableCell>{inv.buyer_name}</TableCell>
              <TableCell>{inv.type_code === '381' ? 'Avoir' : 'Facture'}</TableCell>
              <TableCell className="text-right">
                {Number(inv.total_incl_vat).toFixed(2)} {inv.currency}
              </TableCell>
              <TableCell className="text-center">
                <Link href={`/history/${inv.id}`} className={buttonVariants({ variant: 'link' })}>
                  Voir détails
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
