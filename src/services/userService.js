import axios from "axios";

const API_URL = 'http://localhost:8080/helados/user';

const getUsers = async () => {
    try {
        const users = await axios.get(API_URL);
        return users.data;
    }catch(error){
        console.log('error');
        throw error;
    }

};
