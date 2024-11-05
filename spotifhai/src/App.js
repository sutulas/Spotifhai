import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './pages/Login';
import Main from './pages/Main';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return (
      <Login setLogin={() => setLoggedIn(true)} />
    );
  }
  
  return <Main />;
}

export default App;
