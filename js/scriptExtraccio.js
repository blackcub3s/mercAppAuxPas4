"use strict";

let tokenClient;
let gapiInited = false;
let gisInited = false;

const CLIENT_ID = '246049552174-fqcrsh2uvcpouptn1tij8t7bh686h4ad.apps.googleusercontent.com';
const API_KEY = '';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

console.log("V ACTUALITZADA ok");

function loadScript(src, onload) {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.defer = true;
  script.onload = onload;
  document.head.appendChild(script);
}

function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
  });
  gapiInited = true;
  maybeEnableButton();
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (tokenResponse) => {
      console.log('Usuari Autenticat');
      let correus = await llistarCorreus();

      for (const correu of correus) {
        const message = await gapi.client.gmail.users.messages.get({
          userId: 'me',
          id: correu.id,
          format: 'full',
        });

        const parts = message.result.payload.parts;
        if (!parts) continue;

        for (const part of parts) {
          if (part.filename && part.filename.endsWith('.pdf')) {
            const attachmentId = part.body.attachmentId;

            const attachment = await gapi.client.gmail.users.messages.attachments.get({
              userId: 'me',
              messageId: correu.id,
              id: attachmentId,
            });

            const base64Data = attachment.result.data.replace(/-/g, '+').replace(/_/g, '/');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
            const byteArray = new Uint8Array(byteNumbers);

            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = part.filename;
            link.click();
          }
        }
      }
    },
  });
  gisInited = true;
  maybeEnableButton();
}

function maybeEnableButton() {
  if (gapiInited && gisInited) {
    tokenClient.requestAccessToken();
  }
}

async function llistarCorreus() {
  const response = await gapi.client.gmail.users.messages.list({
    userId: 'me',
    q: 'from:ticket_digital@mail.mercadona.com',    //LA FUNCIO ON FEM EL FILTRE PER CORREUS
    maxResults: 1,   //Poso nomes un mail per no gastar tokens
  });

  const messages = response.result.messages;
  if (!messages || messages.length === 0) {
    console.log('No se encontraron mensajes con ese asunto.');
    return [];
  } else {
    console.log('Mensajes filtrados:', messages);
    return messages;
  }
}

window.onload = () => {
  console.log("Página cargada versio nomes javascript");
  
  // Cargar GAPI
  loadScript('https://apis.google.com/js/api.js', gapiLoaded);

  // Cargar GIS
  loadScript('https://accounts.google.com/gsi/client', gisLoaded);
};
