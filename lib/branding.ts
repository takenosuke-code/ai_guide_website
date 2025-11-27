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

    // Filter out the megaphone post - find the one that's NOT "megaphone" (case insensitive)
    const brandingPost = data?.sitelogos?.nodes?.find(
      (post) => post.title.toLowerCase() !== 'megaphone' && post.homepage
    ) || data?.sitelogos?.nodes?.find((post) => post.homepage);
    
    if (brandingPost && brandingPost.homepage) {
      console.log('[Branding] Selected logo post:', {
        title: brandingPost.title,
        sitename: brandingPost.homepage.sitename,
        sitelogo: brandingPost.homepage.sitelogo,
      });

      const branding = {
        siteName: brandingPost.homepage.sitename || brandingPost.title || 'AI Plaza',
        siteLogo: brandingPost.homepage.sitelogo?.node
          ? {
              sourceUrl: brandingPost.homepage.sitelogo.node.sourceUrl,
              altText: brandingPost.homepage.sitelogo.node.altText || 'Site logo',
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

// Get megaphone icon for blue cards
export async function getMegaphoneIcon(): Promise<{
  sourceUrl: string;
  altText?: string;
} | null> {
  try {
    const data = await wpFetch<{
      sitelogos: {
        nodes: Array<{
          title: string;
          homepage?: {
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

    // Find the megaphone post
    const megaphonePost = data?.sitelogos?.nodes?.find(
      (post) => post.title.toLowerCase() === 'megaphone' && post.homepage?.sitelogo?.node
    );
    
    if (megaphonePost?.homepage?.sitelogo?.node) {
      return {
        sourceUrl: megaphonePost.homepage.sitelogo.node.sourceUrl,
        altText: megaphonePost.homepage.sitelogo.node.altText || 'Megaphone icon',
      };
    }
  } catch (error) {
    console.error('[Branding] Failed to load megaphone icon from WordPress:', error);
  }

  return null;
}

