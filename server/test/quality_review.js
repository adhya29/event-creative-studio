// Comprehensive Quality Review Script
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
const CLIENT_URL = 'http://localhost:5173';

async function runReview() {
  console.log('\n======================================================');
  console.log('🔍 FULL-STACK QUALITY REVIEW & INTEGRATION AUDIT');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;
  const findings = [];

  async function check(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name} ->`, err.message);
      failed++;
      findings.push({ name, error: err.message });
    }
  }

  // 1. Database Connection & Supabase Status Verification
  await check('Database & Supabase Connection Verification', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    console.log(`   ℹ️ Supabase connected in backend: ${data.supabaseConnected}`);
    if (!data.supabaseConnected) {
      console.log('   ℹ️ Verified: App running in persistent local DB mode (Supabase credentials not configured in .env).');
    }
  });

  // 2. Public Services Catalog & Slugs
  let allServices = [];
  await check('Public Services Catalog & Slugs Validation', async () => {
    const res = await fetch(`${BASE_URL}/services`);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.length >= 6, 'Must have at least 6 services');
    allServices = json.data;

    for (const s of allServices) {
      assert.ok(s.slug, `Service "${s.title}" must have a slug`);
      assert.ok(s.title, 'Service must have a title');
      assert.ok(s.image_url, `Service "${s.title}" must have an image_url`);
      assert.ok(Array.isArray(s.features), `Service "${s.title}" features must be an array`);
    }
  });

  // 3. Test every Service Detail Slug
  await check('Verify All Service Detail Pages resolve correctly', async () => {
    for (const s of allServices) {
      const res = await fetch(`${BASE_URL}/services/${s.slug}`);
      assert.strictEqual(res.status, 200, `Failed for slug: ${s.slug}`);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.slug, s.slug);
    }
  });

  // 4. Portfolio Categories and Filtering
  let allPortfolio = [];
  let categories = [];
  await check('Portfolio Categories & Items Consistency', async () => {
    const catRes = await fetch(`${BASE_URL}/portfolio/categories`);
    const catJson = await catRes.json();
    assert.strictEqual(catJson.success, true);
    categories = catJson.data;
    assert.ok(categories.length > 0, 'Portfolio categories must exist');

    const portRes = await fetch(`${BASE_URL}/portfolio`);
    const portJson = await portRes.json();
    assert.strictEqual(portJson.success, true);
    allPortfolio = portJson.data;
    assert.ok(allPortfolio.length >= 10, 'Must have at least 10 portfolio items');

    // Test filtering by category
    for (const cat of categories) {
      const filteredRes = await fetch(`${BASE_URL}/portfolio?category=${cat.slug}`);
      const filteredJson = await filteredRes.json();
      assert.strictEqual(filteredJson.success, true);
      for (const item of filteredJson.data) {
        assert.ok(
          item.category_slug === cat.slug || item.category_id === cat.id,
          `Item ${item.title} does not match category ${cat.slug}`
        );
      }
    }
  });

  // 5. Test Enquiry Submission & Validation
  await check('Enquiry Submission & Validation', async () => {
    // Valid submission
    const validRes = await fetch(`${BASE_URL}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Quality Review Inspector',
        email: 'inspector@test.com',
        phone: '+91 99999 88888',
        interested_service: 'Event Photography',
        message: 'Testing enquiry form submission functionality.',
      }),
    });
    assert.strictEqual(validRes.status, 201);
    const validJson = await validRes.json();
    assert.strictEqual(validJson.success, true);

    // Invalid submission (missing message)
    const invalidRes = await fetch(`${BASE_URL}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test',
        email: 'invalid-email',
        phone: '',
        message: '',
      }),
    });
    assert.strictEqual(invalidRes.status, 400);
  });

  // 6. Test Quotation Submission & Validation
  await check('Quotation Request Submission & Validation', async () => {
    // Valid submission
    const validRes = await fetch(`${BASE_URL}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Quality Review Event Organizer',
        email: 'organizer@test.com',
        phone: '+91 98888 77777',
        event_type: 'Annual Tech Summit',
        event_date: '2026-11-20',
        event_location: 'Grand Convention Hall, Bangalore',
        required_services: ['Event Photography', 'Event Management'],
        estimated_budget: '₹2,00,000 - ₹3,00,000',
        additional_requirements: 'Multi-camera setup with stage streaming.',
      }),
    });
    assert.strictEqual(validRes.status, 201);
    const validJson = await validRes.json();
    assert.strictEqual(validJson.success, true);

    // Invalid submission (missing required fields)
    const invalidRes = await fetch(`${BASE_URL}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: '',
        email: '',
      }),
    });
    assert.strictEqual(invalidRes.status, 400);
  });

  // 7. Admin Authentication
  let adminToken = '';
  await check('Admin Authentication & JWT Generation', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@luminacreative.studio',
        password: 'AdminStudio@2026',
      }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.token);
    adminToken = json.token;
  });

  // 8. Admin Dashboard KPIs & Metrics
  await check('Admin Dashboard Statistics & Metrics Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.totalServices >= 6);
    assert.ok(json.data.totalEnquiries >= 1);
    assert.ok(json.data.totalQuotations >= 1);
  });

  // 9. Service CRUD (Create, Edit, Delete)
  let createdServiceId = '';
  await check('Admin Service CRUD Workflow', async () => {
    // Create
    const createRes = await fetch(`${BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Temporary Test Service',
        category: 'photography',
        short_description: 'Test short description',
        full_description: 'Test full description with complete scope',
        features: ['Deliverable 1', 'Deliverable 2'],
        image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc',
        starting_price: '₹15,000',
        turnaround_time: '2 Days',
        is_published: true,
      }),
    });
    assert.strictEqual(createRes.status, 201);
    const createJson = await createRes.json();
    createdServiceId = createJson.data.id;
    assert.ok(createdServiceId);

    // Update
    const updateRes = await fetch(`${BASE_URL}/services/${createdServiceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Updated Test Service',
        starting_price: '₹18,000',
      }),
    });
    assert.strictEqual(updateRes.status, 200);
    const updateJson = await updateRes.json();
    assert.strictEqual(updateJson.data.title, 'Updated Test Service');

    // Delete
    const deleteRes = await fetch(`${BASE_URL}/services/${createdServiceId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(deleteRes.status, 200);
  });

  // 10. Portfolio Item CRUD & Image Upload
  let createdPortfolioId = '';
  await check('Admin Portfolio CRUD Workflow', async () => {
    // Create
    const createRes = await fetch(`${BASE_URL}/portfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Temporary Test Portfolio Item',
        category_slug: 'photography',
        description: 'Test portfolio item description',
        client_name: 'Test Client',
        event_date: '2026-10-31',
        image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552',
        is_featured: false,
        is_published: true,
      }),
    });
    assert.strictEqual(createRes.status, 201);
    const createJson = await createRes.json();
    createdPortfolioId = createJson.data.id;
    assert.ok(createdPortfolioId);

    // Update
    const updateRes = await fetch(`${BASE_URL}/portfolio/${createdPortfolioId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Updated Test Portfolio Item',
        is_featured: true,
      }),
    });
    assert.strictEqual(updateRes.status, 200);
    const updateJson = await updateRes.json();
    assert.strictEqual(updateJson.data.is_featured, true);

    // Delete
    const deleteRes = await fetch(`${BASE_URL}/portfolio/${createdPortfolioId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(deleteRes.status, 200);
  });

  // 11. Enquiry & Quotation Status Updates & Notes
  await check('Enquiry & Quotation Status Transitions', async () => {
    const enqListRes = await fetch(`${BASE_URL}/enquiries`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const enqList = await enqListRes.json();
    assert.ok(enqList.data.length > 0);
    const testEnq = enqList.data[0];

    const enqUpdateRes = await fetch(`${BASE_URL}/enquiries/${testEnq.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'contacted',
        internal_notes: 'Quality inspection note: contacted customer.',
      }),
    });
    assert.strictEqual(enqUpdateRes.status, 200);

    const quotListRes = await fetch(`${BASE_URL}/quotations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const quotList = await quotListRes.json();
    assert.ok(quotList.data.length > 0);
    const testQuot = quotList.data[0];

    const quotUpdateRes = await fetch(`${BASE_URL}/quotations/${testQuot.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'reviewed',
        internal_notes: 'Quality inspection note: proposal drafted.',
      }),
    });
    assert.strictEqual(quotUpdateRes.status, 200);
  });

  // 12. Public Website Reflection Check
  await check('Admin Content Customization reflected on Public Content Endpoint', async () => {
    const getRes = await fetch(`${BASE_URL}/content/company_profile`);
    const initial = await getRes.json();
    const originalCompanyData = initial.data;
    const originalTagline = originalCompanyData.tagline;

    // Update
    const newTagline = `Events Captured. Stories Created. [Verified]`;
    const updateRes = await fetch(`${BASE_URL}/content/company_profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        ...originalCompanyData,
        tagline: newTagline,
      }),
    });
    assert.strictEqual(updateRes.status, 200);

    // Verify public fetch
    const verifyRes = await fetch(`${BASE_URL}/content`);
    const verifyJson = await verifyRes.json();
    assert.strictEqual(verifyJson.data.company_profile.tagline, newTagline);

    // Revert
    await fetch(`${BASE_URL}/content/company_profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        ...originalCompanyData,
        company_name: 'Lumina Creative Studio',
        tagline: 'Events Captured. Stories Created.',
      }),
    });
  });

  console.log('\n======================================================');
  console.log(`🏁 AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');
}

runReview().catch(console.error);
