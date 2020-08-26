import * as React from "react";
import { Collector } from "tripetto-collector-rolling";
import { Editor } from "tripetto";
// import { settingsModal } from "./settings";
// import "./header.scss";
// import "bootstrap";

export default class Header extends React.Component<{
    collector: React.RefObject<Collector>;
    editor: Editor;
    reset: () => void;
}> {
    readonly state = {
        isOpen: false
    };

    private get collector(): Collector {
        if (this.props.collector.current instanceof Collector) {
            return this.props.collector.current;
        }

        throw new Error("Collector ref is not available!");
    }

    private links(dropdown: boolean): React.ReactNode {
        return (
            <>
                <a
                    href="https://gitlab.com/tripetto/examples/react-conversational"
                    target="_blank"
                    role="button"
                    className={`btn btn-sm btn-link${dropdown ? " dropdown-item" : ""}`}
                >
                    <i className="fas fa-code fa-fw mr-2" />
                    Get source
                </a>
                <a
                    href="https://gitlab.com/tripetto/examples/react-conversational/blob/master/README.md"
                    target="_blank"
                    role="button"
                    className={`btn btn-sm btn-link${dropdown ? " dropdown-item" : ""}`}
                >
                    <i className="fas fa-book-reader fa-fw mr-2" />
                    View readme
                </a>
                <a
                    href="#"
                    onClick={() => this.props.reset()}
                    role="button"
                    className={`btn btn-sm btn-link${dropdown ? " dropdown-item" : ""}`}
                >
                    <i className="fas fa-redo fa-fw mr-2" />
                    Reset demo
                </a>
            </>
        );
    }

    private controls(dropdown: boolean): React.ReactNode {
        return (
            <>
                {this.collector.view === "normal" && (
                    <>
                        <div
                            className={`btn-group controls ${dropdown ? "px-4 py-2 offset-down" : "mr-1 mr-sm-4"}`}
                            role="group"
                            aria-label="Controls"
                        >
                            <button
                                type="button"
                                className="btn btn-primary"
                                title="Restart form"
                                disabled={!this.collector.isRunning}
                                onClick={() => this.collector.restart()}
                            >
                                <i className="fas fa-redo fa-fw" />
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                title="Start form"
                                disabled={this.collector.isEmpty || (!this.collector.isStopped && !this.collector.isFinished)}
                                onClick={() => this.collector.start()}
                            >
                                <i className="fas fa-play fa-fw" />
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                title="Pause form"
                                disabled={!this.collector.isRunning}
                                onClick={() => this.collector.pause()}
                            >
                                <i className="fas fa-pause fa-fw" />
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                title="Stop form"
                                disabled={!this.collector.isRunning}
                                onClick={() => this.collector.stop()}
                            >
                                <i className="fas fa-stop fa-fw" />
                            </button>
                        </div>
                        <button
                            type="button"
                            className={`btn ${dropdown ? "btn-link btn-sm dropdown-item offset-up" : "btn-primary mr-1 mr-md-4"}`}
                            data-toggle="modal"
                            data-target="#settingsModal"
                        >
                            <i className="fas fa-cog fa-fw mr-2 d-lg-none" />
                            Settings
                        </button>
                        <div className="dropdown-divider offset-up d-lg-none" />
                    </>
                )}
                <div className={`btn-group btn-group-toggle${dropdown ? " px-4 py-2" : ""}`} data-toggle="buttons">
                    <button
                        type="button"
                        className={`btn ${this.collector.view === "normal" ? "btn-success" : "btn-secondary"}`}
                        data-toggle="button"
                        aria-pressed={this.collector.view === "normal"}
                        onClick={() => (this.collector.view = "normal")}
                    >
                        Collect
                    </button>
                    <button
                        type="button"
                        className={`btn ${this.collector.view !== "normal" ? "btn-success" : "btn-secondary"}`}
                        data-toggle="button"
                        aria-pressed={this.collector.view !== "normal"}
                        onClick={() => (this.collector.view = "preview")}
                    >
                        Preview
                    </button>
                </div>
            </>
        );
    }

    private toggleEditor(): void {
        const editor = document.getElementById("editor");

        if (editor) {
            editor.classList.toggle("show");
        }

        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    public render(): React.ReactNode {
        return (
            <>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-9 col-lg-6 d-flex align-items-center">
                            <button
                                type="button"
                                className={`btn mr-3 d-lg-none ${this.state.isOpen ? "btn-success" : "btn-secondary"}`}
                                title={this.state.isOpen ? "Close the editor" : "Open the editor"}
                                onClick={() => this.toggleEditor()}
                            >
                                Edit
                            </button>
                            <h1 className="mr-1 mr-md-3 text-truncate" onClick={() => this.props.editor.edit()}>
                                {this.collector.name || "Unnamed"}
                            </h1>
                            <div className="d-none d-lg-block text-nowrap">{this.links(false)}</div>
                        </div>
                        <div className="col-3 col-lg-6 d-flex justify-content-end align-items-center">
                            <div className="d-none d-lg-block">{this.controls(false)}</div>
                            <div className="d-lg-none">
                                <button
                                    className="btn btn-secondary dropdown-toggle"
                                    type="button"
                                    id="dropdownMenu"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    <i className="fas fa-cog fa-fw mr-1" />
                                </button>
                                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu">
                                    <h6 className="dropdown-header">Demo documentation</h6>
                                    {this.links(true)}
                                    <div className="dropdown-divider" />
                                    <h6 className="dropdown-header">Demo controls</h6>
                                    {this.controls(true)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* {settingsModal(this.collector)} */}
            </>
        );
    }
}
