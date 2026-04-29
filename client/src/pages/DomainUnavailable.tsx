import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

/**
 * Shown when a visitor lands on a custom-domain hostname that exists in the
 * system but has been deactivated by an administrator.
 */
const DomainUnavailable: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-md w-full">
      <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900">Page Not Available</h1>

      <p className="mt-3 text-slate-500 leading-relaxed">
        This page is temporarily unavailable. The organisation may have paused
        their online presence. Please check back later or contact them directly.
      </p>

      {/* <div className="mt-8 text-xs text-slate-400">
        Powered by{' '}
        <Link
          to="/"
          className="underline hover:text-slate-600"
        >
          Church Flow
        </Link>
      </div> */}
    </div>
  </div>
);

export default DomainUnavailable;
