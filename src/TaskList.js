import React from "react";
import {Checkbox} from "semantic-ui-react";
import {withState} from "recompose";

export const TaskListComponent = ({
  taskList,
  onTaskClick,
  showCompleted,
  isActive,
  toggleActive
}) => {
  return (
    <ul style={{listStyle: "none", marginTop: 8}}>
      <li className="task-list-title" onClick={() => toggleActive(!isActive)}>
        Tasks ({taskList.length})
      </li>
      {isActive &&
        taskList.filter(task => task.type !== "incomplete").map(task => (
          <li
            onClick={() => onTaskClick(task)}
            className="task-item"
            style={{
              textDecoration: task.type === "cancelled" ? "line-through" : ""
            }}>
            <span className="task-item--status">
              <Checkbox
                checked={task.type === "completed"}
                disabled={task.type === "cancelled"}
              />
            </span>
            <span>{task.text}</span>
          </li>
        ))}
    </ul>
  );
};

export const TaskList = withState(
  "isActive",
  "toggleActive",
  props => props.isActive
)(TaskListComponent);
