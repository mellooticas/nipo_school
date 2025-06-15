// features/admin/pages/QRCodeManager.jsx
import React from 'react';
import { AdminQRManager } from '../components/AdminQRManager';

export const QRCodeManager = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout container padrão do admin */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/admin" className="text-gray-500 hover:text-gray-700">
                Admin
              </a>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium">QR Codes</span>
            </li>
          </ol>
        </nav>

        {/* Componente principal */}
        <AdminQRManager />
        
      </div>
    </div>
  );
};