import React from "react";

export const TaskList = ({taskList}) => {
  return (
    <ul style={{listStyle: "none"}}>
      {taskList.map(task => (
        <li
          style={{
            height: 28,
            textAlign: "left",
            display: "flex",
            alignItems: "center"
          }}>
          <span>{task.text}</span>
        </li>
      ))}
    </ul>
  );
};
