import axios from "axios";
import ProInvent from "../pages/ProInvent";

const API_URL = "http://localhost:8080/helados/productInventory";

export const getProInvents = async () => {
    try{
        const response = await axios.get(API_URL);
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

export const saveProInvent = async (ProInvent) => {
    try{
        const response = await axios.post(API_URL, ProInvent);
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

export const deleteProInvent = async (id) => {
    try{
        await axios.delete(`${API_URL}/${id}`);
    }catch(error){
        console.log(error);
        throw error;
    }
}