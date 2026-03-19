'use client';

import { useEffect } from 'react';
import api from '@/lib/api';

export default function DynamicBranding() {
  const updateBranding = async () => {
    try {
      const response = await api.get('/settings');
      const settings = response.data;

      if (settings) {
        // Update Title
        const officeName = settings.office_name || 'Advocate Pro';
        document.title = officeName;
      }
    } catch (error: any) {
      // Silently fail for 401/unauthorized or other network errors to avoid console spam
      if (error.response?.status !== 401) {
        console.error('Error updating dynamic branding:', error);
      }
      document.title = 'Advocate Pro';
    }
  };

  useEffect(() => {
    updateBranding();

    // Listen for custom event to refresh branding
    window.addEventListener('branding-updated', updateBranding);
    return () => window.removeEventListener('branding-updated', updateBranding);
  }, []);

  return null;
}
