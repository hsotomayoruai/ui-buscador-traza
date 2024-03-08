import { useState, useEffect } from "react";

import "./App.css";
import { WebChatContainer, setEnableDebug } from "@ibm-watson/assistant-web-chat-react";
import { getObjectByPath, getAllNestedKeys, changeNeuralSeekLastKey, normalizePassages } from "./utils.js";
import LeftBar from "./components/LeftBar";
import RightBar from "./components/RightBar";
import Header from "./components/Header";
import DiscoveryRightBar from "./components/DiscoveryRightBar";

setEnableDebug(true);


function onBeforeRender(instance, setInstance) {
  setInstance(instance);
  instance.restartConversation();
}

function onAfterRender(instance, setScore, setAnswer, setDocument, setDiscoveryPassages, setDiscoveryConfidence) {
  instance.changeView({ mainWindow: true, launcher: false });
  instance.on({ type: "send", handler: (event) => sendHandler(event) });
  instance.on({ type: "receive", handler: (event) => receiveHandler(event, setScore, setAnswer, setDocument, setDiscoveryPassages, setDiscoveryConfidence) });
}

function sendHandler(event) {
  const messageSent = event.data.input.text;
  console.log(messageSent);
}

function receiveHandler(event, setScore, setAnswer, setDocument, setDiscoveryPassages, setDiscoveryConfidence) {
  console.log(event.data);
  const eventsKeysArrays = [event.data.output.debug].map((event) => getAllNestedKeys(event));

  let isThereScore = false;
  let scoreKey;
  let serviceResponse;
  let serviceFound = false;

  eventsKeysArrays.forEach((eventKeyArray) => {
    eventKeyArray.forEach((eventKey) => {
      // Given that it ends in .score it will go the deepest possible
      // Meaning it will not detect a .score.something
      if (eventKey.includes(".score")) {  
        isThereScore = true;
        scoreKey = eventKey;
      } else if (eventKey.includes(import.meta.env.VITE_SERVICE_STEP_RESULTS) && serviceFound === false) {
        serviceResponse = eventKey;
        console.log(serviceResponse);
        serviceFound = true;
      }
    });
  });

  if (isThereScore || serviceFound) {
    console.log(event.data.output.debug);
    if (isThereScore) {
      const scoreData = getObjectByPath(event.data.output.debug, scoreKey);
      console.log(scoreData);
      const passagesKey = changeNeuralSeekLastKey(scoreKey, "passage");
      console.log(passagesKey);
      const passagesData = getObjectByPath(event.data.output.debug, passagesKey);
      console.log(passagesData);
  
      const documentKey = changeNeuralSeekLastKey(scoreKey, "document");
      const documentData = getObjectByPath(event.data.output.debug, documentKey);
      console.log(documentData);
      setScore(scoreData);
      setAnswer(passagesData);
      setDocument(documentData);
    }

    console.log(serviceResponse+".body.passages");
    const discoveryPassagesArray = getObjectByPath(event.data.output.debug, serviceResponse+".body.passages");
    const discoveryScore = parseFloat(getObjectByPath(event.data.output.debug, serviceResponse+".body.confidence"))*100;
    console.log(discoveryPassagesArray);
    console.log(discoveryScore);
    setDiscoveryPassages(discoveryPassagesArray);
    setDiscoveryConfidence(discoveryScore);
  }
}

function App() {
  const [instance, setInstance] = useState(null);
  const [score, setScore] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [neural_document, setDocument] = useState(null);
  const [passages, setPassages] = useState([]);
  const [webChatOptions, setWebChatOptions] = useState(null);
  const [discoveryPassages, setDiscoveryPassages] = useState([]);
  const [discoveryConfidence, setDiscoveryConfidence] = useState(null);

  useEffect(() => {
    // RENDER FAVICON
    const faviconPath = import.meta.env.VITE_FAVICON;

    if (faviconPath) {
        const faviconLink = document.getElementById('favicon-link');
        faviconLink.href = faviconPath;
    }

    // PLACE CHAT IN THE MIDDLE
    const placeChat = () => {

      const customElement = document.querySelector('.webchat-container');
      
      // Realiza las operaciones que necesitas con customElement
      const webChatOptions = {
        integrationID: import.meta.env.VITE_ASSISTANT_INTEGRATION_ID,
        region: import.meta.env.VITE_ASSISTANT_REGION,
        serviceInstanceID: import.meta.env.VITE_ASSISTANT_SERVICE_INSTANCE_ID,
        element: customElement,
      };

      setWebChatOptions(webChatOptions);
    };

    sessionStorage.clear();
    
    const tiempoEspera = 1000; // 2000 milisegundos = 2 segundos
    const timeoutId = setTimeout(placeChat, tiempoEspera);

    // Limpia el temporizador si el componente se desmonta antes de que se cumplan los 2 segundos
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="gral-container">
      <Header logo={import.meta.env.VITE_HEADER_LOGO} />
      <div className="elements-container">
        <div className="left-column">
          <LeftBar instance={instance} answer={answer} className="consultas" />
        </div>
        <div className="center-column">
          <div className="webchat-container">
          {webChatOptions !== null && (
            <WebChatContainer
              id="esteId"
              config={webChatOptions}
              onBeforeRender={(instance) => onBeforeRender(instance, setInstance)}
              onAfterRender={(instance) => onAfterRender(instance, setScore, setAnswer, setDocument, setDiscoveryPassages, setDiscoveryConfidence)}
            />
          )}
          </div>
        </div>
        <div className="right-column">
          {/*<RightBar passages={passages} receiveHandler={(event) => receiveHandler(event, setScore)} />*/}
          <DiscoveryRightBar passages={discoveryPassages} confidence={discoveryConfidence} />
        </div>
      </div>
    </div>
  );
}

export default App;