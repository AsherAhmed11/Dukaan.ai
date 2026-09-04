/**
 * Screen 2: Review / Edit Screen
 *
 * UX flow:
 *  - Fetches draft Business by :id (GET /api/business/mine or by ID)
 *  - Renders all AI-generated fields as editable form inputs
 *  - "Save Changes" → PUT /api/business/:id
 *  - "Publish" → PUT /api/business/:id/publish → redirects to /site/:slug
 *
 * TODO (Phase 2): fetch business data, render editable fields, wire publish
 */
function ReviewScreen() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Review & Edit Your Business Page</h1>
      <p style={{ color: '#666' }}>
        [Screen 2 placeholder — editable fields for businessName, tagline, about, services,
        location, contact, hours, themeColor + Publish button go here]
      </p>
    </div>
  );
}

export default ReviewScreen;
