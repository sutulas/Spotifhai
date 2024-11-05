import React, { useEffect } from 'react';
import axios from 'axios';
import Login from './pages/Login';
import Main from './pages/Main';



const App = () => {
  const [loggedIn, setLoggedIn] = React.useState(false);

  

  if (!loggedIn) {
    return (
      <Login setLogin={() => setLoggedIn(true)} />
    )
  }
  return (<Main />)
}

export default App;




// Potenial issue: Only one user at a time??? If i login on one browser, it auto logs-in on another browser
