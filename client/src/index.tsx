import React from "react";
import ReactDOM from "react-dom";
import "reflect-metadata";
import { createApolloClient } from "./apollo/client";
import App from "./App";


async function bootstrap() {
  const client = await createApolloClient();
  ReactDOM.render(<React.StrictMode><App client={client} /></React.StrictMode>, document.getElementById("root")!);
}

bootstrap();
