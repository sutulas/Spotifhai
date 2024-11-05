import React, { useEffect } from 'react';
import axios from 'axios';
import Login from './pages/Login';
import Main from './pages/Main';

const App = () => {
  const [loggedIn, setLoggedIn] = React.useState(
    () => localStorage.getItem('loggedIn') === 'true' // Check initial login state from localStorage
  );

  // Update localStorage whenever loggedIn changes
  useEffect(() => {
    localStorage.setItem('loggedIn', loggedIn);
  }, [loggedIn]);

  if (!loggedIn) {
    return (
      <Login setLogin={() => setLoggedIn(true)} />
    );
  }
  
  return <Main />;
}

export default App;
