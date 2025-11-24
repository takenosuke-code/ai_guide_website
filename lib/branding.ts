// lib/branding.ts
// Helper to fetch site branding from WordPress sitelogo CPT

import { wpFetch } from './wpclient';
import { SITE_BRANDING_QUERY } from './queries';

export interface SiteBranding {
  siteName: string;
  siteLogo: {
    sourceUrl: string;
    altText?: string;
  } | null;
}

export async function getSiteBranding(): Promise<SiteBranding> {
  try {
    const data = await wpFetch<{
      sitelogos: {
        nodes: Array<{
          title: string;
          homepage?: {
            sitename?: string | null;
            sitelogo?: {
              node?: {
                sourceUrl: string;
                altText?: string;
              } | null;
            } | null;
          } | null;
        }>;
      };
    }>(SITE_BRANDING_QUERY, {}, { revalidate: 3600 });

    console.log('[Branding] Raw data from WordPress:', JSON.stringify(data, null, 2));

    const firstLogo = data?.sitelogos?.nodes?.[0];
    
    if (firstLogo && firstLogo.homepage) {
      console.log('[Branding] First logo post:', {
        title: firstLogo.title,
        sitename: firstLogo.homepage.sitename,
        sitelogo: firstLogo.homepage.sitelogo,
      });

      const branding = {
        siteName: firstLogo.homepage.sitename || firstLogo.title || 'AI Plaza',
        siteLogo: firstLogo.homepage.sitelogo?.node
          ? {
              sourceUrl: firstLogo.homepage.sitelogo.node.sourceUrl,
              altText: firstLogo.homepage.sitelogo.node.altText || 'Site logo',
            }
          : null,
      };

      console.log('[Branding] Returning:', branding);
      return branding;
    } else {
      console.warn('[Branding] No sitelogo posts found in WordPress or homepage field group is empty');
    }
  } catch (error) {
    console.error('[Branding] Failed to load site branding from WordPress:', error);
  }

  // Fallback to defaults
  return {
    siteName: 'AI Plaza',
    siteLogo: null,
  };
}

