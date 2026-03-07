import React, { createContext, useContext, useState, useEffect } from 'react';

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/company");
                const data = await res.json();
                if (data && data.name) {
                    setCompany(data);
                } else {
                    // Fallback if no approved record exists
                    setCompany({
                        name: "V R fashions",
                        description: "Premier manufacturer of cotton-related apparel, specialized in banian cloth, specialty collections, and custom designed t-shirts.",
                        location: "85, 86, VIVEKANANDHA NAGAR, KOVILVALI, TIRUPUR-641606"
                    });
                }
            } catch (err) {
                console.error("Error fetching global company data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, []);

    return (
        <CompanyContext.Provider value={{ company, loading }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
