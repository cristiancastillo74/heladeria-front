import axios from "axios";

const API_URL = "http://localhost:8080/helados/cylinder";

//obtener cylinders
export const getCylinder = async () =>{
    try{
        const response = await axios.get(API_URL);
        return response.data;
    }catch(error){
        console.error("error",error);
        throw error;
    }
};

//guardar cylinder
export const saveCylinder = async (cylinder) =>{
    try{
        const response = await axios.post(API_URL,cylinder);
        return response;
    }catch(error){
        console.error("error",error);
        throw error;
    }
};

//eliminar cylinder

export const deleteCylinder = async (id) =>{
    try{
        await axios.delete(`${API_URL}/${id}`);
    }catch(error){
        console.log("error",error);
        throw error;
    }
}