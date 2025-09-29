import axios from "axios";

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