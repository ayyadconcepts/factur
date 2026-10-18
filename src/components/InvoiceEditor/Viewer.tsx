"use client";

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { BBox } from '../../core/extraction/types';

// Ensure worker is configured here as well, in case this is used independently
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ViewerProps {
  file: File | string | null;
  highlightBboxes?: readonly BBox[];
}

export function Viewer({ file, highlightBboxes }: ViewerProps) {
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess(data: { numPages: number }) {
    setNumPages(data.numPages);
  }

  if (!file) {
    return <div style={{ padding: '1rem', color: '#666' }}>No PDF selected</div>;
  }

  return (
    <div className="pdf-viewer h-full w-full overflow-auto bg-muted/20 p-4" style={{ position: 'relative' }}>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages || 0), (el, index) => (
          <div key={`page_${index + 1}`} style={{ position: 'relative', marginBottom: '20px', border: '1px solid #ddd' }}>
            <Page pageNumber={index + 1} renderAnnotationLayer={false} renderTextLayer={true} />
            {highlightBboxes?.filter(b => b.page === index + 1).map((bbox, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: bbox.x0,
                  top: bbox.y0,
                  width: bbox.x1 - bbox.x0,
                  height: bbox.y1 - bbox.y0,
                  backgroundColor: 'rgba(255, 255, 0, 0.4)',
                  border: '1px solid orange',
                  pointerEvents: 'none'
                }}
              />
            ))}
          </div>
        ))}
      </Document>
    </div>
  );
}
