import api from './api';

const COMPANY_ADMIN_BASE_URL = '/companies';

const CompanyService = {
    getAllCompanies: async () => {
        try {
            const res = await api.get(COMPANY_ADMIN_BASE_URL);
            return res.data;

        } catch (error) {
            console.error('Error fetching all companies.', error.response?.data || error.message);
            throw error;
        }


    },

    getCompanyById: async (id) => {

        try {
            const res = await api.get(`${COMPANY_ADMIN_BASE_URL}/${id}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching company by ID.', error.response?.data || error.message);
            throw error;

        }

    },

    createCompany: async (company) => {
        try {
            const res = await api.post(COMPANY_ADMIN_BASE_URL, company);
            return res.data;
        } catch (error) {
            console.error('Error creating company.', error.response?.data || error.message);
            throw error;

        }


    },

    updateCompany: async (id, company) => {
        try {
            const res = await api.put(`${COMPANY_ADMIN_BASE_URL}/${id}`, company);
            return res.data;
        } catch (error) {
            console.error('Error updating company.', error.response?.data || error.message);
            throw error;

        }
    },

    deleteCompany: async (id) => {
        try {
            await api.delete(`${COMPANY_ADMIN_BASE_URL}/${id}`);
        } catch (error) {
            console.error('Error deleting company.', error.response?.data || error.message);
            throw error;
            
        }
    }
};

export default CompanyService;
