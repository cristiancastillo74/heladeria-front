import axios from "axios";

const API_URL = "http://localhost:8080/enum/category"

export const getCategories = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data; // ["CONO","VASO","LITRO","OTRO"]
    } catch (error) {
        console.error("Error al obtener categorías", error);
        throw error;
    }
};