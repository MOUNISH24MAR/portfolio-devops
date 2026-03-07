// Native fetch used
async function testReport() {
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

        // 2. Fetch Report
        const reportRes = await fetch('http://localhost:5000/api/admin/report', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reportData = await reportRes.json();

        if (reportRes.ok) {
            console.log('--- OPERATIONAL PERFORMANCE REPORT ---');
            console.log('Title:', reportData.title);
            console.log('Generated At:', reportData.generatedAt);
            reportData.sections.forEach(s => {
                console.log(`\n[${s.title}]`);
                console.log(s.content);
            });
            console.log('\n[KEY OBSERVATIONS]');
            reportData.keyObservations.forEach(o => console.log(`- ${o}`));
            console.log('\n[RECOMMENDATIONS]');
            reportData.recommendations.forEach(r => console.log(`- ${r}`));
        } else {
            console.error('Report fetch failed:', reportData);
        }
    } catch (err) {
        console.error('Error testing report:', err.message);
    }
}

testReport();
