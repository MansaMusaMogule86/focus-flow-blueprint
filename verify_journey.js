
const API_BASE = 'http://localhost:3001/api';

async function verify() {
    console.log('--- STARTING VERIFICATION ---');
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    const password = 'password123';

    // 1. Register
    console.log(`\n1. Registering user: ${email}...`);
    const regRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: 'Test User' })
    });

    if (!regRes.ok) {
        console.error('Registration failed:', await regRes.text());
        return;
    }
    const { token, user } = await regRes.json();
    console.log('✓ Registered successfully. User ID:', user.id);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Get Path
    console.log('\n2. Fetching Path...');
    const pathRes = await fetch(`${API_BASE}/path`, { headers });
    const { steps } = await pathRes.json();
    console.log('✓ Path fetched. Steps:', steps.length);

    const step1 = steps.find(s => s.stepNumber === 1);
    const step2 = steps.find(s => s.stepNumber === 2);

    console.log(`Step 1 Status: ${step1.status}`);
    console.log(`Step 2 Status: ${step2.status}`);

    if (step1.status !== 'unlocked' && step1.status !== 'in_progress') {
        console.error('Step 1 should be unlocked/in_progress!');
        return;
    }
    if (step2.status !== 'locked') {
        console.error('Step 2 should be locked!');
        return;
    }

    // 3. Complete Step 1
    console.log('\n3. Completing Step 1...');
    const completeRes = await fetch(`${API_BASE}/path/${step1.id}/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ vaultItemId: 'dummy-vault-id' }) // Mock vault item
    });

    if (!completeRes.ok) {
        console.error('Complete Step 1 failed:', await completeRes.text());
        return;
    }
    const completeData = await completeRes.json();
    console.log('✓ Step 1 completed.', completeData);

    // 4. Verify Step 2 Unlocks
    console.log('\n4. Verifying Step 2 Unlock...');
    const pathRes2 = await fetch(`${API_BASE}/path`, { headers });
    const steps2 = (await pathRes2.json()).steps;
    const step2Updated = steps2.find(s => s.stepNumber === 2);

    console.log(`Step 2 Status: ${step2Updated.status}`);

    if (step2Updated.status !== 'unlocked') {
        console.error('❌ Step 2 did not unlock!');
    } else {
        console.log('✓ Step 2 UNLOCKED successfully.');
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
}

verify().catch(console.error);
