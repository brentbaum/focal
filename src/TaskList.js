import React from "react";
import {Checkbox} from "semantic-ui-react";
import {withState} from "recompose";

export const TaskListComponent = ({
  taskList,
  onTaskClick,
  showCompleted,
  isActive,
  toggleActive,
  topTask = {}
}) => {
  return (
    <ul style={{listStyle: "none", marginTop: 8}}>
      <li className="task-list-title" onClick={() => toggleActive(!isActive)}>
        {taskList.title} {taskList.taskCount > 0 && `(${taskList.taskCount})`}
      </li>
      {isActive &&
        taskList.items.filter(item => item.type !== "incomplete").map(
          item =>
            item.task ? (
              <li
                key={item.blockKey}
                onClick={() => onTaskClick(item)}
                className="task-list__task"
                style={{
                  textDecoration:
                    item.type === "cancelled" ? "line-through" : "",
                  fontWeight:
                    item.blockKey === topTask.blockKey ? "bold" : "inherit"
                }}>
                <span className="task-item--status">
                  <Checkbox
                    checked={item.type === "completed"}
                    disabled={item.type === "cancelled"}
                  />
                </span>
                <span>{item.text}</span>
              </li>
            ) : (
              <li className="task-list__item" key={item.blockKey}>
                {item.text}
              </li>
            )
        )}
    </ul>
  );
};

export const TaskList = withState(
  "isActive",
  "toggleActive",
  props => props.isActive
)(TaskListComponent);
