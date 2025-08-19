import axios from "axios";

const API_URL = "http://localhost:8080/helados/product"

//obtener todos los productos
export const getProducts = async () => {
    try{
        const response = await axios.get(API_URL);
        return response.data;
    }catch(error){
        console.error('error al obtener los productos',error);
        throw error;
    }
}