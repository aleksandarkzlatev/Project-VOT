import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Messages from './components/Messages';


import Keycloak from 'keycloak-js';


let initOptions = {
  url: 'http://localhost:8080/',
  realm: 'myrealm',
  clientId: 'frontend',
}

let kc = new Keycloak(initOptions);

kc.init({
  onLoad: 'login-required', // Supported values: 'check-sso' , 'login-required'
  checkLoginIframe: true,
}).then((auth) => {
  if (!auth) {
  } else {
    /* Remove below logs if you are using this on production */
    console.info("Authenticated");
    console.log('auth', auth)
    console.log('Keycloak', kc)
    console.log('Access Token', kc.token)

    kc.onTokenExpired = () => {
      console.log('token expired')
    }
  }
}, () => {
  /* Notify the user if necessary */
  console.error("Authentication Failed");
});

const handleLogout = () => {
  kc.logout();
};

function App() {
  return (
    <Router>
      <div>
        <button onClick={handleLogout}>Logout</button>
        <Routes>
          <Route path="/messages" element={<Messages />} />
          <Route path="*" element={<Navigate to="/messages" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;