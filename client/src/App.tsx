import React, { FC, useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-boost";
import { ThemeProvider, CSSReset, Button, Flex, Box  } from "@chakra-ui/core";
import { Collector, ICollectorSnapshot } from 'tripetto-collector-rolling';
import { Export, ISnapshot, Instance } from "tripetto-collector";
import { Editor, IDefinition, IEditorChangeEvent, IEditorEditEvent, IEditorReadyEvent } from "tripetto";

import "tripetto-collector-rolling/editor/es5";

import './App.scss'

import demoDefinition from './demo.json';

import { theme } from './theme'
import Counter from "./Counter/Counter";
import OverviewScreen from './screens/Overview';
import Header from './components/Header';

const App: FC<{ client: ApolloClient<any> }> = ({ client }) => {
    const [snapshot, setSnapshot] = useState<ISnapshot<ICollectorSnapshot>>();
    const [definition, setDefinition] = useState<IDefinition>(demoDefinition as any);
    useEffect(
        () => {
            // Create the editor.
            const editor = new Editor({
                element: document.getElementById("editor"),
                fonts: "fonts/",
                // disableSaveButton: true,
            //   disableRestoreButton: true,
                disableClearButton: false,
                disableCloseButton: true,
                supportURL: false,
                disableOpenCloseAnimation: true,
                showTutorial: false,
                zoom: "fit-horizontal",
            });
            
            editor.open(definition);
            
            // Wait until the editor is ready!
            editor.hook("OnReady", "synchronous", (editorEvent: IEditorReadyEvent) => {
                const header = React.createRef<Header>();
                const collector = React.createRef<Collector>();
            
                // Render the collector component and feed the initial definition from the editor.
                ReactDOM.render(
                    <Collector
                        ref={collector}
                        definition={editorEvent.definition}
                        // snapshot={snapshot}
                        onChange={() => {
                            if (header.current) {
                                header.current.forceUpdate();
                            }
                        }}
                        onEditRequest={(nodeId: string) => editor.edit(nodeId)}
                        onFinish={(i: Instance) => {
                            // Output the collected data to the console for demo purposes.
                            console.dir(Export.fields(i));
            
                            // Output can also be exported as CSV for your convenience.
                            console.dir(Export.CSV(i));
                        }}
                        onPaused={(s: ISnapshot<ICollectorSnapshot>) => {
                            // Store the snapshot in the local store, so we can restore it on browser refresh.
                            setSnapshot(s);
                        }}
                    />,
                    document.getElementById("collector")
                );
            
                // Render the header component.
                ReactDOM.render(
                    <Header
                        ref={header}
                        editor={editor}
                        collector={collector}
                        reset={() => {
                            // localStorage.removeItem(DEFINITION);
                            // localStorage.removeItem(SNAPSHOT);
            
                            if (collector.current) {
                                collector.current.restart();
                            }
                        }}
                    />,
                    document.getElementById("header")
                );
            
                // Store the definition in the local store upon each editor change and reload the collector
                editor.hook("OnChange", "synchronous", (changeEvent: IEditorChangeEvent) => {
                    // Store the definition in the persistent local store
                    setDefinition(changeEvent.definition);
            
                    // Reload the collector with the new definition
                    if (collector.current) {
                        collector.current.reload(changeEvent.definition);
                    }
                });
            
                editor.hook("OnEdit", "synchronous", (editEvent: IEditorEditEvent) => {
                    // if (collector.current && collector.current.view !== "normal" && editEvent.data.type === "node" && editEvent.data.ref.id) {
                    //     collector.current.requestPreview(editEvent.data.ref.id);
                    // }
                    if (collector.current && collector.current.view !== "normal" && editEvent.type === "node" && editEvent.id) {
                        collector.current.requestPreview(editEvent.id);
                    }
                });
            
                const fnResize = () => {
                    editor.resize();
            
                    if (collector.current) {
                        collector.current.resize();
                    }
                };
            
                // When the host window resizes, we should notify the editor and collector component about that.
                window.addEventListener("resize", () => fnResize());
                window.addEventListener("orientationchange", () => fnResize());
            });
        },
        []
    );
    
    return (
        <ApolloProvider client={client}>
            <ThemeProvider theme={theme}>
            <CSSReset />
            <Button data-feedbackok-trigger="l4xncog">Give Feedback</Button>
            {/* <OverviewScreen /> */}
            <div id="header"></div>
            <Box overflow="hidden">
                <Box flex={1} right="50%" id="editor"></Box>
                <Box flex={1} left="50%" id="collector"></Box>
            </Box>      
            </ThemeProvider>
        </ApolloProvider>
    )
};

export default App;
