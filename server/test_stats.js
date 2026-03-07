// Native fetch used
async function testStats() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'adminpassword' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        if (!token) {
            console.error('Login failed:', loginData);
            return;
        }

        console.log('Login successful. Token obtained.');

        // 2. Fetch Stats
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsRes.json();

        if (statsRes.ok) {
            console.log('Stats fetch successful!');
            console.log('KPIs:', statsData.kpis);
            console.log('Financial Trend (first 3):', statsData.financialData.trend.slice(0, 3));
            console.log('Buyer Contribution:', statsData.buyerData.contribution);
        } else {
            console.error('Stats fetch failed:', statsData);
        }
    } catch (err) {
        console.error('Error testing stats:', err.message);
    }
}

testStats();
