/**
 * Screen 3: Public Business Page
 *
 * Route: /site/:slug
 * Auth: NONE — fully public
 *
 * UX flow:
 *  - Fetches published Business by slug (GET /api/business/:slug)
 *  - Renders the live mini-website: hero, about, services list, contact, hours
 *  - Mobile-first layout (Pakistani SMB customers browse on phones)
 *  - themeColor applied as accent colour
 *
 * TODO (Phase 2): full mobile-first render with themeColor, services grid, WhatsApp CTA
 */
function PublicSitePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Business Page</h1>
      <p style={{ color: '#666' }}>
        [Screen 3 placeholder — public mobile-first business page renders here]
      </p>
    </div>
  );
}

export default PublicSitePage;
