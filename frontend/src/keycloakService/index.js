import Keycloak from 'keycloak-js';

let keycloak;

const getKeycloakInstance = () => {
  if (!keycloak) {
    keycloak = new Keycloak({
      url: 'http://localhost:8080/auth',
      realm: 'myrealm',
      clientId: 'frontend',
    });
  }
  return keycloak;
};

const initKeycloak = (onAuthenticatedCallback) => {
  let kc = null; 
  if(kc && kc.authenticated) {
    onAuthenticatedCallback();
    return;
  }
  kc = getKeycloakInstance();
  kc.init({
    onLoad: 'login-required',
    checkLoginIframe: true,
  }).then((authenticated) => {
    if (authenticated) {
      kc.onTokenExpired = () => {
        kc.updateToken(30).catch(() => {
          console.log('Failed to refresh token');
        });
      };
      onAuthenticatedCallback();
    } else {
      console.error("Authentication Failed");
    }
  }).catch(() => {
    console.error("Authentication Failed");
  });
};

export { initKeycloak, getKeycloakInstance };