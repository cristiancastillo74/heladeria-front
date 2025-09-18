import React, { useEffect } from 'react';
import './App.css';
import Layout from './component/Layout';
import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import Products from './pages/Product';
import Cylinders from './pages/Cylinders';
import Expenses from './pages/Expenses';
import { AuthProvider } from './context/AuthContext';
import CyInvent from './pages/CyInvent';
import Sales from './pages/Sales';

function App() {
   useEffect(() => {
    // Establecer el tema al cargar la aplicación
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
     <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path='/'           element={<Dashboard/>}/>
            <Route path='/expenses'   element={<Expenses/>}/>
            <Route path='/cylinder'   element={<Cylinders/>}/>
            <Route path='/product'    element={<Products/>}/>
            <Route path='/cyInvent'   element={<CyInvent/>}/>
            <Route path='/sales'      element={<Sales/>}/>
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
