import axios from "axios";
import ProInvent from "../pages/ProInvent";
import api from "../api/axiosConfig";

const API_URL = "/helados/productInventory";

export const getProInvents = async () => {
    try{
        const response = await api.get(API_URL);
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

export const saveProInvent = async (ProInvent) => {
    try{
        const response = await api.post(API_URL, ProInvent);
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

export const deleteProInvent = async (id) => {
    try{
        await api.delete(`${API_URL}/${id}`);
    }catch(error){
        console.log(error);
        throw error;
    }
}