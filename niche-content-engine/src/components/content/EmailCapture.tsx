'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface EmailCaptureProps {
  siteId: string;
  siteName: string;
  source?: string;
}

export function EmailCapture({ siteId, siteName, source = 'footer' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const { error } = await supabase
      .from('email_subscribers')
      .insert({ site_id: siteId, email, source });

    if (error) {
      // Duplicate email is expected - treat as success
      if (error.code === '23505') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } else {
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800 text-sm font-medium">You're in! We'll keep you updated.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={`Get updates from ${siteName}`}
        required
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
        style={{ ['--tw-ring-color' as string]: 'var(--color-primary)' }}
        disabled={status === 'loading'}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-opacity disabled:opacity-50"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {status === 'loading' ? 'Joining...' : 'Subscribe'}
      </button>
      {status === 'error' && (
        <p className="text-red-600 text-xs mt-1">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
