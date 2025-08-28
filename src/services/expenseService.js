import axios from "axios";

const API_URL = 'http://localhost:8080/helados/expenses';

export const getExpenses = async () =>{
    try{
        const response = await axios.get(API_URL);
        //console.log(response.data);
        return response.data;
    }catch(error){
        console.log('we cant get expenses',error);
        throw error;
    }
};