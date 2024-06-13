import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Messages from './components/Messages';
import KeycloakService from './KeycloakService';

function App() {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    KeycloakService.init(() => {
      setKeycloak(KeycloakService.getKeycloak());
      setAuthenticated(true);
    });
  }, []);

  if (!keycloak) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div>
        <Switch>
          <Route path="/messages">
            {authenticated ? <Messages /> : <Redirect to="/login" />}
          </Route>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Redirect from="/" to="/messages" />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
