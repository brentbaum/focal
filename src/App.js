import {TaskEditor} from "./Editor";
import {getTopTask, getTaskLists, toggleTaskBlock} from "./taskParser";
import {getSavedState} from "./db";
import * as React from "react";
import {TaskList} from "./TaskList";
import {EditorState} from "draft-js";
import {handleKeyCommand} from "./commands";
import {getTextSelection} from "./utils";
import {restoreScroll, watchScroll} from "./scroll";
import {connect} from "redux-zero/react";
import actions from "./actions";
import {Button} from "semantic-ui-react";

const Overlay = ({title, onClose, children}) => (
  <div
    style={{
      position: "absolute",
      overflow: "auto",
      background: "white",
      display: "flex",
      flexDirection: "column",
      zIndex: 5,
      left: 40,
      top: 32,
      right: 40,
      bottom: 32
    }}>
    <div
      style={{
        padding: "0px 40px",
        minHeight: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
      <span>{title}</span>
      <Button basic color="black" size="tiny" onClick={() => onClose()}>
        Close
      </Button>
    </div>
    <div style={{flex: 1}}>{children}</div>
  </div>
);

class AppComponent extends React.Component {
  state = {dirty: false, overlayType: null};
  componentWillMount() {
    getSavedState().then(state => {
      this.onChange(state);

      restoreScroll();
    });
    document.addEventListener("copy", this.handleCopy);
    document.addEventListener("paste", this.handlePaste);
  }

  componentDidMount() {
    watchScroll();
  }
  handleCopy = e => {
    const {editorState} = this.props;
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const text = getTextSelection(content, selection);
    e.clipboardData.setData("text/plain", text);

    e.preventDefault();
  };
  handlePaste = e => {
    e.preventDefault();
  };
  onChange = editorState => {
    const {taskLists, blanks, meetings} = getTaskLists(editorState), // []
      topTask = getTopTask(taskLists),
      metaState = {topTask, taskLists, blanks, meetings};
    this.props.setEditorState(editorState);
    this.props.setMetaState(metaState);
  };

  /* Change text from [ ] => [√] */

  setOverlay = overlayType => {
    this.setState({overlayType});
  };

  render() {
    const {dirty, overlayType} = this.state,
      {editorState, metaState} = this.props,
      {topTask = {}, taskLists = [], blanks, meetings} = metaState;

    return (
      <div className="App">
        <header className="App-header">
          <span>{topTask ? topTask.text : "<new task>"} </span>
          {dirty && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "#777",
                borderRadius: "50%",
                width: 10,
                height: 10
              }}
            />
          )}
        </header>
        <div className="App-content">
          <div className="App-editor" style={{flex: 5}}>
            <TaskEditor
              topTask={topTask}
              blanks={blanks}
              editorState={editorState}
              onChange={editorState => {
                this.onChange(editorState);
              }}
              markDirty={dirty => this.setState({dirty})}
              handleKeyCommand={command => {
                if (command === "myeditor-save") {
                  this.setState({dirty: false});
                }
                if (command === "myeditor-show-editor") {
                  this.setOverlay(null);
                }
                if (command === "myeditor-show-tasks") {
                  this.setOverlay("tasks");
                }
                if (command === "myeditor-show-meetings") {
                  this.setOverlay("meetings");
                }
                return handleKeyCommand(this.onChange, editorState, command);
              }}
            />
          </div>
          {overlayType === "tasks" && (
            <Overlay title="Tasks" onClose={() => this.setOverlay(null)}>
              {taskLists.map((list, index) => (
                <TaskList
                  topTask={topTask}
                  isActive={index === 0}
                  taskList={list}
                  onTaskClick={task =>
                    this.onChange(toggleTaskBlock(editorState, task.blockKey))
                  }
                />
              ))}
            </Overlay>
          )}
          {overlayType === "meetings" && (
            <Overlay title="Meetings" onClose={() => this.setOverlay(null)}>
              {meetings.map((list, index) => (
                <TaskList
                  meetings={meetings}
                  isActive={index === 0}
                  taskList={list}
                  onTaskClick={task =>
                    this.onChange(toggleTaskBlock(editorState, task.blockKey))
                  }
                />
              ))}
            </Overlay>
          )}
        </div>
      </div>
    );
  }
}
const mapToProps = ({editorState, metaState}) => ({editorState, metaState});
export const App = connect(mapToProps, actions)(AppComponent);
