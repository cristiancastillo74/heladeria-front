import axios from 'axios';

const ADMIN_URL = 'http://localhost:8080/api/admin';
const CATALOG_URL = 'http://localhost:8080/api/catalog';

const createResource = (path) => ({
  list: async () => (await axios.get(`${ADMIN_URL}/${path}`)).data,
  create: async (value) => (await axios.post(`${ADMIN_URL}/${path}`, value)).data,
  update: async (id, value) => (await axios.put(`${ADMIN_URL}/${path}/${id}`, value)).data,
  remove: async (id) => axios.delete(`${ADMIN_URL}/${path}/${id}`)
});

export const branchAdminService = createResource('branches');
export const categoryAdminService = createResource('categories');
export const productStatusAdminService = createResource('product-statuses');
export const cylinderTypeAdminService = createResource('cylinder-types');

export const getProductStatuses = async () => (await axios.get(`${CATALOG_URL}/product-statuses`)).data;
export const getCylinderTypes = async () => (await axios.get(`${CATALOG_URL}/cylinder-types`)).data;
export const getProductInventoryThresholds = async () => (await axios.get(`${ADMIN_URL}/inventory-thresholds/products`)).data;
export const updateProductInventoryThreshold = async (id, threshold) =>
  (await axios.put(`${ADMIN_URL}/inventory-thresholds/products/${id}`, { threshold })).data;
export const getCylinderInventoryThresholds = async () => (await axios.get(`${ADMIN_URL}/inventory-thresholds/cylinders`)).data;
export const updateCylinderInventoryThreshold = async (id, threshold) =>
  (await axios.put(`${ADMIN_URL}/inventory-thresholds/cylinders/${id}`, { threshold })).data;