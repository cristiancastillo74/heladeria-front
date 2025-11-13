import axios from "axios";
import api from "../api/axiosConfig";

const API_URL = "/enum/category"

export const getCategories = async () => {
    try {
        const response = await api.get(API_URL);
        return response.data; // ["CONO","VASO","LITRO","OTRO"]
    } catch (error) {
        console.error("Error al obtener categorías", error);
        throw error;
    }
};