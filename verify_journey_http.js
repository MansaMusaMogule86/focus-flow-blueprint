
import http from 'http';

function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data }); // Plain text or error
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function verify() {
    console.log('--- STARTING HTTP VERIFICATION ---');
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    const password = 'password123';

    // 1. Register
    console.log(`\n1. Registering user: ${email}...`);
    const regRes = await request('POST', '/auth/register', { email, password, name: 'Test User' });

    if (regRes.status !== 201 && regRes.status !== 200) {
        console.error('Registration failed:', regRes);
        return;
    }
    const { token, user } = regRes.data;
    console.log('✓ Registered successfully. User ID:', user.id);

    // 2. Get Path
    console.log('\n2. Fetching Path...');
    const pathRes = await request('GET', '/path', null, token);
    const { steps } = pathRes.data;
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
    const completeRes = await request('POST', `/path/${step1.id}/complete`, { vaultItemId: 'dummy-vault-id' }, token);

    if (completeRes.status !== 200) {
        console.error('Complete Step 1 failed:', completeRes);
        return;
    }
    console.log('✓ Step 1 completed.', completeRes.data);

    // 4. Verify Step 2 Unlocks
    console.log('\n4. Verifying Step 2 Unlock...');
    const pathRes2 = await request('GET', '/path', null, token);
    const steps2 = pathRes2.data.steps;
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
