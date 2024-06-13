import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080/auth',
  realm: 'myrealm',
  clientId: 'myapp',
});

const initOptions = {
  onLoad: 'login-required',
};

const KeycloakService = {
  init: (onAuthenticatedCallback) => {
    keycloak.init(initOptions).then((authenticated) => {
      if (!authenticated) {
        window.location.reload();
      } else {
        onAuthenticatedCallback();
      }
    }).catch((error) => {
      console.error('Failed to initialize Keycloak', error);
    });
  },
  getKeycloak: () => keycloak,
};

export default KeycloakService;
