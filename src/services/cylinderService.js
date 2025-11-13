import axios from "axios";
import api from "../api/axiosConfig";

const API_URL = "/helados/cylinder";

//obtener cylinders
export const getCylinder = async () =>{
    try{
        const response = await api.get(API_URL);
        return response.data;
    }catch(error){
        console.error("error",error);
        throw error;
    }
};

//guardar cylinder
export const saveCylinder = async (cylinder) =>{
    try{
        const response = await api.post(API_URL,cylinder);
        return response;
    }catch(error){
        console.error("error",error);
        throw error;
    }
};

//eliminar cylinder

export const deleteCylinder = async (id) =>{
    try{
        await api.delete(`${API_URL}/${id}`);
    }catch(error){
        console.log("error",error);
        throw error;
    }
}