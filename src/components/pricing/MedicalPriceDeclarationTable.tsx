'use client';

import React from 'react';

interface MedicalPriceDeclarationTableProps {
  initialContentHtml?: string;
}

export function MedicalPriceDeclarationTable({
  initialContentHtml,
}: MedicalPriceDeclarationTableProps) {
  // If initial raw HTML is provided from migrated CMS database, render it inside the enhanced responsive container
  if (initialContentHtml) {
    return (
      <div className="dc-kkg py-8 md:py-12">
        <div
          className="flatsome-content"
          dangerouslySetInnerHTML={{ __html: initialContentHtml }}
        />
      </div>
    );
  }

  return null;
}
