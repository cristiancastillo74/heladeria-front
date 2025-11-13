import axios from "axios";
import api from "../api/axiosConfig";

const API_URL = "/helados/product"

//obtener todos los productos
export const getProducts = async () => {
    try{
        //const response = await axios.get(API_URL);
        const response = await api.get(API_URL);
        return response.data;
    }catch(error){
        console.error('error al obtener los productos',error);
        throw error;
    }
};

//crear producto
export const saveProduct = async (product) => {
    try{
        const response = await api.post(API_URL, product);
        return response.data;
    }catch(error){
        console.error('error al guardar producto',error);
        throw error;
    }
};

//eliminar
export const deleteProduct = async (id) => {
  try {
    await api.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error al eliminar producto", error);
    throw error;
  }
};

//reportes
export const fetchProductReport = async (page = 0, size = 10) => {
  try {
    const response = await api.get("/api/reports/inventory/products", {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener el reporte de productos", error);
    throw error;
  }
};







