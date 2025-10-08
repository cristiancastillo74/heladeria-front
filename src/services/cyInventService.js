import axios from "axios";

const API_URL ="http://localhost:8080/helados/cyInventory";

//obtener el inventario de cilindros
export const getCyInvent = async () => {
    try{
        const result = await axios.get(API_URL);
        return result.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

//obtener solo los cilindors diferentes de vacios
export const getCyInventDisponiblesCondicional = async () => {
    try{
        const result = await axios.get(API_URL+"/buy");
        return result.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

//crear o editar  un inventario de cilindro
export const saveInvent = async (cyInvent) => {
    try{
        const response = await axios.post(API_URL,cyInvent);
        return response;
    }catch(error){
        console.log(error);
        throw error;
    }
};

//eliminar ciInvent
export const deleteCyInvent = async (id) => {
    try{
        await axios.delete(`${API_URL}/${id}`);
    }catch(error){
        console.log(error);
        throw error;
    }
};