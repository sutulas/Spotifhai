import React, { useEffect, useState } from 'react';
import Login from './pages/Login';
import Main from './pages/Main';
import { testLogin } from './API/API';
import { CircularProgress } from '@mui/material';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const res = await testLogin();
      console.log("result", result);
      setResult(res);
      setLoading(false);
    };
    checkLogin();
  }, []);



  if (loading) {
    return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
      <CircularProgress />
    </div>)
  }

  return result ? <Main /> : <Login />;
}

export default App;
