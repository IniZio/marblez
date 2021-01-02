import React from "react";
import ReactDOM from "react-dom";
import "reflect-metadata";
import { createApolloClient } from "./apollo/client";
import App from "./App";


async function bootstrap() {
  const client = await createApolloClient();
  ReactDOM.render(<App client={client} />, document.getElementById("root")!);
}

bootstrap();
