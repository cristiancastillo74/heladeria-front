import React, { useEffect } from 'react';
import './App.css';
import Layout from './component/Layout';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import Products from './pages/Product';
import Cylinders from './pages/Cylinders';
import Expenses from './pages/Expenses';
import { AuthProvider } from './context/AuthContext';
import CyInvent from './pages/CyInvent';
import Sales from './pages/Sales';
import ProInvent from './pages/ProInvent';
import SalesReport from './pages/SalesReport';
import BalanceReport from './pages/BalanceReport';
import ProductReport from './pages/ProductReport';
import CylinderReport from './pages/CyliderReport';
import PrivateRoute from './component/PrivateRoute';
import Login from './pages/login';

function App() {
   useEffect(() => {
    // Establecer el tema al cargar la aplicación
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
     <AuthProvider>
      <Router>
        <Routes>
        <Route path="/login" element={<Login />} />
            <Route path='/reports/sales'      element={<PrivateRoute><Layout><SalesReport/>      </Layout></PrivateRoute>}/>
            <Route path='/reports/balance'    element={<PrivateRoute><Layout><BalanceReport/>    </Layout></PrivateRoute>}/>
            <Route path='/reports/products'   element={<PrivateRoute><Layout><ProductReport/>    </Layout></PrivateRoute>}/>
            <Route path='/reports/cylinders'  element={<PrivateRoute><Layout><CylinderReport/>   </Layout></PrivateRoute>}/>
            <Route path='/expenses'           element={<PrivateRoute><Layout><Expenses/>         </Layout></PrivateRoute>}/>
            <Route path='/cylinder'           element={<PrivateRoute><Layout><Cylinders/>        </Layout></PrivateRoute>}/>
            <Route path='/product'            element={<PrivateRoute><Layout><Products/>         </Layout></PrivateRoute>}/>
            <Route path='/cyInvent'           element={<PrivateRoute><Layout><CyInvent/>         </Layout></PrivateRoute>}/>
            <Route path='/proInvent'          element={<PrivateRoute><Layout><ProInvent/>        </Layout></PrivateRoute>}/>
            <Route path='/sales'              element={<PrivateRoute><Layout><Sales/>            </Layout></PrivateRoute>}/>
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
