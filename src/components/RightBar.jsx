import { useState, useEffect } from "react";
import RightBarCard from "./RightBarCard";
import ExperimentalRightBarCard from "./ExperimentalRightBarCard";
import { findFileByName } from "../utils";

const RightBar = ({ passages }) => {

  if(passages.length != 0){
    return (
      <div className=" list-group list-title-right">
        <a href="#" className="list-group-item list-group-item-action disabled list-title" aria-current="true">
          Fuentes
        </a>
        <div className="card-group2">
          {passages
            .sort((a, b) => b.score - a.score) // Sort passages by score in descending order
            .slice(0, 3) // Take the top 3 passages
            .map((passage, index) => {
              //const dataOriginal = findFileByName(passage.document);
              let  archivo_original = null;
              let  URL_archivo_original = null;

              //if(dataOriginal && dataOriginal.archivo_original && dataOriginal.URL_archivo_original){
              //  archivo_original = dataOriginal.archivo_original;
              //  URL_archivo_original = dataOriginal.URL_archivo_original;
              //} else {

              URL_archivo_original = passage.url;
              console.log("if nuevo");
              console.log(archivo_original);

              if (passage.document === null){ 
                archivo_original = passage.displayname;
              } else {
                archivo_original = passage.document;
              }

              URL_archivo_original = passage.url;
              console.log("if nuevo");
              console.log(archivo_original);
              //}

              return (
                <ExperimentalRightBarCard
                  key={index} // Use a unique key for each item when mapping
                  cardTitle={archivo_original}
                  cardText={passage.passage}
                  cardScore={passage.score}
                  url={URL_archivo_original}
                />
              );
            })
          }
        </div>
      </div>
    );
  }
  else{
    return (
        <div className="list-group list-title-right">
          <a href="#" className="list-group-item list-group-item-action disabled list-title" aria-current="true">
            Fuentes
          </a>
      
          <div className="card-group2">
            <div className="card" >
                <div className="card-body">
                    <div className="card-title-container">
                        <h6 className="card-title-empty">No se ha realizado ninguna búsqueda de momento</h6>
                    </div>
                </div>
            </div>
          </div>
        </div>
    );
  }
}

export default RightBar;