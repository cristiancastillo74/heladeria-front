import React, { useEffect } from 'react';
import './App.css';
import Layout from './component/Layout';
import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import Products from './pages/Product';

function App() {
   useEffect(() => {
    // Establecer el tema al cargar la aplicación
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/'         element={<Dashboard/>}/>
          <Route path='/product'  element={<Products/>}/>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
