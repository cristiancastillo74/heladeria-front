import axios from 'axios';

const USERS_URL = 'http://localhost:8080/api/users';
const BRANCHES_URL = 'http://localhost:8080/api/branches';

export const getUsers = async () => (await axios.get(USERS_URL)).data;
export const getAssignableRoles = async () => (await axios.get(`${USERS_URL}/roles`)).data;
export const getUserBranches = async () => (await axios.get(BRANCHES_URL)).data;
export const createUser = async (user) => (await axios.post(USERS_URL, user)).data;
export const updateUser = async (id, user) => (await axios.put(`${USERS_URL}/${id}`, user)).data;
export const deleteUser = async (id) => axios.delete(`${USERS_URL}/${id}`);
