import axios from "axios";
import api from "../api/axiosConfig";

const API_URL = '/helados/expenses';

export const getExpenses = async () =>{
    try{
        const response = await api.get(API_URL);
        //console.log(response.data);
        return response.data;
    }catch(error){
        console.log('we cant get expenses',error);
        throw error;
    }
};

export const saveExpense = async (expense) => {
    try{
        const response = await api.post(API_URL,expense);
        return response.data;
    }catch(error){
        throw error;
    }
}

export const deleteExpense = async (id) =>{
    try{
        await api.delete(`${API_URL}/${id}`);
    }catch(error){
        console.log('error al eliminar');
        throw error;
    }
}

export const getTypeExpenses = async () =>{
    try{
        const response = await api.get(`${API_URL}/typeExpenses`);
        return response.data;
    }catch(error){
        console.log('error al obtener los tipos de gastos');
        throw error;
    }
};