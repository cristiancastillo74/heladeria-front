import axios from "axios";

const API_URL = "http://localhost:8080/helados/sale"


export const saveSales = async (sale, userId, branchId) => {
    try{
        const response = await axios.post(API_URL, sale, {
            params: {
                userId: userId,
                branchId: branchId
            }
        });
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
};