console.log("HEY");
/*inicialitzo el client*/
gapi.load('client:auth2', initClient);

//INICIALITZO EL CLIENT 
function initClient() {
    gapi.client.init({
        apiKey: '',
        clientId: '246049552174-fqcrsh2uvcpouptn1tij8t7bh686h4ad.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
        scope: 'https://www.googleapis.com/auth/gmail.readonly'
    }).then(() => {
        // Inicia sesión
        gapi.auth2.getAuthInstance().signIn().then(() => {
            console.log('Usuari Autenticat');
            llistarCorreus();
        });
    });
}

//
function llistarCorreus() {
    gapi.client.gmail.users.messages.list({
        userId: 'me',
        maxResults: 1
    }).then(function(response) {
        const messages = response.result.messages;
        if (!messages || messages.length === 0) {
            console.log('No se encontraron mensajes.');
        } else {
            console.log('Mensajes:', messages);
        }
    });
}
