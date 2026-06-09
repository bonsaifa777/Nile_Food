import axios from 'axios';

export const fetchCashierDashboard = async () => {
  const { data } = await axios.get('/api/cashier/dashboard');
  return data.data;
};

export const fetchPOSFoods = async (params = {}) => {
  const { data } = await axios.get('/api/cashier/foods', { params });
  return data.data;
};

export const fetchPOSCategories = async () => {
  const { data } = await axios.get('/api/cashier/categories');
  return data.data;
};

export const createPOSOrder = async (orderData) => {
  const { data } = await axios.post('/api/cashier/orders', orderData);
  return data;
};

export const fetchCashierOrders = async (params = {}) => {
  const { data } = await axios.get('/api/cashier/orders', { params });
  return data.data;
};

export const processPayment = async (orderId, paymentData) => {
  const { data } = await axios.put(`/api/cashier/orders/${orderId}/payment`, paymentData);
  return data;
};

export const voidOrder = async (orderId) => {
  const { data } = await axios.put(`/api/cashier/orders/${orderId}/void`);
  return data;
};

export const fetchCashierTables = async () => {
  const { data } = await axios.get('/api/cashier/tables');
  return data.data;
};

export const updateTableStatus = async (tableId, status) => {
  const { data } = await axios.put(`/api/cashier/tables/${tableId}/status`, { status });
  return data;
};

export const mergeTables = async (sourceId, targetId) => {
  const { data } = await axios.put(`/api/cashier/tables/${sourceId}/merge`, { targetTableId: targetId });
  return data;
};

export const fetchTableOrders = async (tableId) => {
  const { data } = await axios.get(`/api/cashier/tables/${tableId}/orders`);
  return data.data;
};

export const fetchCustomers = async (params = {}) => {
  const { data } = await axios.get('/api/cashier/customers', { params });
  return data.data;
};

export const createCustomer = async (customerData) => {
  const { data } = await axios.post('/api/cashier/customers', customerData);
  return data;
};

export const fetchCustomerOrders = async (customerId) => {
  const { data } = await axios.get(`/api/cashier/customers/${customerId}/orders`);
  return data.data;
};

export const fetchCurrentDrawer = async () => {
  const { data } = await axios.get('/api/cash-drawer/current');
  return data.data;
};

export const fetchDrawers = async (params = {}) => {
  const { data } = await axios.get('/api/cash-drawer', { params });
  return data.data;
};

export const openDrawer = async (openingBalance, notes) => {
  const { data } = await axios.post('/api/cash-drawer/open', { openingBalance, notes });
  return data;
};

export const closeDrawer = async (drawerId, closingBalance, notes) => {
  const { data } = await axios.post(`/api/cash-drawer/${drawerId}/close`, { closingBalance, notes });
  return data;
};

export const addDrawerTransaction = async (drawerId, transactionData) => {
  const { data } = await axios.post(`/api/cash-drawer/${drawerId}/transaction`, transactionData);
  return data;
};

export const fetchDrawerHistory = async (params = {}) => {
  const { data } = await axios.get('/api/cash-drawer/history', { params });
  return data.data;
};
