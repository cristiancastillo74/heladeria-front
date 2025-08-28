import React, { useEffect, useState } from 'react'
import { getExpenses } from '../services/expenseService';
import PaginatedTable from '../component/PaginatedTable';
import { SaveIcon } from '../assets/icons';

const Expenses = () => {
    const [expense,     setExpense]         = useState([]);
    const [isLoading, setIsLoading]         = useState(true);
    const [isError,     setIsError]         = useState(null);
    //const [isEditing, setIsEditing]         = useState(false);

    useEffect(() => {
        const fetchExpenses = async () =>{
            try{
                const data = await getExpenses();
                setExpense(data);
                console.log(data);
            }catch(err){
                setIsError('error');
                console.log(err);
            }finally{
                setIsLoading(false);
            }
        };
        fetchExpenses();
    },[]);

    if(isLoading) return <p className='text-center mt-10'>Cargando Productos..</p>
    if(isError)   return <p className='text-center mt-10 text-red-500'>{isError}</p>
    return (
    <div className='p-10'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Registro de gastos</h1>
        <PaginatedTable
            columns={['ID','GASTO','MONTO','QUIEN REALIZO EL GASTO','FECHA','ACCIONES']}
            data={expense}
            renderRow={(ex) => (
                <tr key={ex.id} className='hover:bg-base-300'>
                    <td className='text-center'>{ex.id}</td>
                    <td className='text-center'>{ex.descripcion}</td>
                    <td className='text-center'>{ex.amount}</td>
                    <td className='text-center'>{ex.user.firstName} {ex.user.lastName}</td>
                    <td className='text-center'>{ex.createdAt}</td>
                    <td></td>
                </tr>
            )}
            extraAction={
                <button className='btn btn-outline btn-primary'
                >
                    <SaveIcon className="w-5 h-5 text-current " />
                    Registrar Gasto</button>
            }
            filasPorPagina={10}

        />
    </div>
  );
};

export default Expenses