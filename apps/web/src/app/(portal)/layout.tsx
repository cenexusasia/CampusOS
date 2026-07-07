import type { Metadata } from 'next';
import { PortalLayoutClient } from '@/components/portal-layout-client';

export const metadata: Metadata = {
  title: {
    template: '%s — CampusOS',
    default: 'CampusOS Portal',
  },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayoutClient>{children}</PortalLayoutClient>;
}
