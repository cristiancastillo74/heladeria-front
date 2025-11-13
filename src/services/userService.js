import axios from "axios";
import api from "../api/axiosConfig";

const API_URL = '/helados/user';

const getUsers = async () => {
    try {
        const users = await api.get(API_URL);
        return users.data;
    }catch(error){
        console.log('error');
        throw error;
    }

};
