// Comprehensive End-to-End System Verification Suite
const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING FULL-STACK AUTOMATED VERIFICATION SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Health Check
  await test('Backend Health Check (/api/health)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
  });

  // 2. Fetch Public Services
  let sampleServiceSlug = '';
  await test('Public Services Catalog (/api/services)', async () => {
    const res = await fetch(`${BASE_URL}/services`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.count >= 6, true, 'Must return at least 6 services');
    sampleServiceSlug = data.data[0].slug;
  });

  // 3. Fetch Single Service by Slug
  await test(`Single Service Retrieval (/api/services/${sampleServiceSlug})`, async () => {
    const res = await fetch(`${BASE_URL}/services/${sampleServiceSlug}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.slug, sampleServiceSlug);
    assert.strictEqual(Array.isArray(data.data.features), true);
  });

  // 4. Fetch Portfolio Categories & Items
  await test('Portfolio & Categories Retrieval (/api/portfolio)', async () => {
    const [catRes, portRes] = await Promise.all([
      fetch(`${BASE_URL}/portfolio/categories`),
      fetch(`${BASE_URL}/portfolio`),
    ]);
    assert.strictEqual(catRes.status, 200);
    assert.strictEqual(portRes.status, 200);
    const catData = await catRes.json();
    const portData = await portRes.json();
    assert.strictEqual(catData.count >= 6, true);
    assert.strictEqual(portData.count >= 10, true);
  });

  // 5. Fetch Website Content
  await test('Website Content & Profile (/api/content)', async () => {
    const res = await fetch(`${BASE_URL}/content`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.company_profile);
    assert.ok(data.data.homepage_hero);
  });

  // 6. Submit Customer Contact Enquiry
  let createdEnquiryId = '';
  await test('Customer Enquiry Submission (/api/enquiries)', async () => {
    const payload = {
      full_name: 'Aditya Roy Kapoor',
      email: 'aditya.roy@test.com',
      phone: '+91 99112 33445',
      interested_service: 'Event Photography',
      message: 'Need full coverage for a 2-day corporate conclave at Grand Hyatt.',
    };
    const res = await fetch(`${BASE_URL}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.id);
    createdEnquiryId = data.data.id;
  });

  // 7. Test Customer Enquiry Validation (Negative Case)
  await test('Customer Enquiry Validation Rejection', async () => {
    const invalidPayload = { full_name: 'A', email: 'not-an-email', phone: '123' };
    const res = await fetch(`${BASE_URL}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error);
  });

  // 8. Submit Quotation Request
  let createdQuotationId = '';
  await test('Customer Quotation Submission (/api/quotations)', async () => {
    const payload = {
      full_name: 'Simran & Raj Malhotra',
      email: 'raj.simran.wedding@test.com',
      phone: '+91 98333 44556',
      event_type: 'Wedding Celebration',
      event_date: '2026-11-20',
      event_location: 'Umaid Bhawan Palace, Jodhpur',
      required_services: ['Event Photography', 'Event Management', 'Banner Design and Printing'],
      estimated_budget: '₹5,00,000 - ₹7,00,000',
      additional_requirements: 'Drone aerial capture, candid storytelling, stage truss lighting.',
    };
    const res = await fetch(`${BASE_URL}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.id);
    createdQuotationId = data.data.id;
  });

  // 9. Admin Authentication (Login & JWT Generation)
  let adminToken = '';
  await test('Admin Authentication Login (/api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@luminacreative.studio',
        password: 'AdminStudio@2026',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    adminToken = data.token;
  });

  // 10. Verify Admin Protected Operations With Token
  await test('Admin Token Verification (/api/auth/verify)', async () => {
    const res = await fetch(`${BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.role, 'super_admin');
  });

  // 11. Unauthorized Access Blocked Without Token
  await test('Protected Route Rejection on Missing Token (401)', async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    assert.strictEqual(res.status, 401);
  });

  // 12. Admin Dashboard Stats
  await test('Admin Dashboard KPIs & Metrics (/api/admin/stats)', async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.totalEnquiries >= 1);
    assert.ok(data.data.totalQuotations >= 1);
    assert.ok(data.data.totalServices >= 6);
  });

  // 13. Service CRUD (Create, Edit, Delete)
  let testServiceId = '';
  await test('Service CRUD Workflow', async () => {
    // Create
    const createRes = await fetch(`${BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Drone Aerial Cinema',
        category: 'photography',
        short_description: '4K aerial tracking shots for grand outdoor venues.',
        full_description: 'Licensed drone pilots operating dual-sensor quadcopters for cinematic aerial perspectives.',
        features: ['4K 60fps ProRes capture', 'Licensed DGCA certified pilot'],
        starting_price: '₹15,000 / day',
        turnaround_time: '2 - 3 Days',
      }),
    });
    assert.strictEqual(createRes.status, 201);
    const createData = await createRes.json();
    testServiceId = createData.data.id;

    // Edit
    const updateRes = await fetch(`${BASE_URL}/services/${testServiceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ starting_price: '₹18,000 / day' }),
    });
    assert.strictEqual(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.strictEqual(updateData.data.starting_price, '₹18,000 / day');

    // Delete
    const deleteRes = await fetch(`${BASE_URL}/services/${testServiceId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(deleteRes.status, 200);
  });

  // 14. Enquiry Status & Internal Notes Update
  await test('Enquiry Status Update & Internal Notes', async () => {
    const res = await fetch(`${BASE_URL}/enquiries/${createdEnquiryId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'in_progress',
        internal_notes: 'Spoke with client manager on WhatsApp. Sending rate card today.',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.status, 'in_progress');
    assert.strictEqual(data.data.internal_notes.includes('WhatsApp'), true);
  });

  // 15. Quotation Status & Internal Notes Update
  await test('Quotation Status Transition & Internal Notes', async () => {
    const res = await fetch(`${BASE_URL}/quotations/${createdQuotationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'quoted',
        internal_notes: 'Formal proposal deck sent via email with budget breakdown.',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.status, 'quoted');
  });

  // 16. Website Content Live Update
  await test('Website Content Customization (/api/content/company_profile)', async () => {
    const res = await fetch(`${BASE_URL}/content/company_profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        company_name: 'Lumina Creative Studio & Co.',
        tagline: 'Events Captured. Stories Created.',
        phone: '+91 98765 43210',
        email: 'contact@luminacreative.studio',
        whatsapp: '919876543210',
        address: '402, High Street Creative Enclave, Metro Boulevard, City Center',
        working_hours: 'Mon - Sat: 9:00 AM - 7:30 PM',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.company_name, 'Lumina Creative Studio & Co.');
  });

  console.log('\n======================================================');
  console.log(`🏁 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
