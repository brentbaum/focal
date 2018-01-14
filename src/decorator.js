import React from "react";
import {CompositeDecorator} from "draft-js";
import {regex} from "./regex";

const findWithRegex = (regex, contentBlock, callback) => {
  const text = contentBlock.getText();
  let matchArr, start;
  /*eslint-disable */
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
  /*eslint-enable */
};

const Link = ({decoratedText, children}) => (
  <a href={decoratedText} style={styles.link}>
    {children}
  </a>
);

const findRegex = re => (contentBlock, callback, contentState) => {
  findWithRegex(re, contentBlock, callback);
};

const TaskItem = ({contentState, decoratedText, entityKey, ...props}) => {
  let style =
    {
      completed: styles.completedTask,
      cancelled: styles.cancelledTask
    }[props.type] || styles.task;
  return (
    <div {...props} style={style} data-offset-key={props.offsetKey}>
      {props.children}
    </div>
  );
};

const BlockSeparator = ({children, decoratedText}) => (
  <div>
    <div
      style={{position: "absolute", top: 20, borderTop: "1px solid black"}}
    />
    {children}
  </div>
);

export const decorator = new CompositeDecorator([
  {
    strategy: findRegex(regex.link),
    component: Link
  },
  {
    strategy: findRegex(regex.blockSeparator),
    component: BlockSeparator
  },
  {
    strategy: findRegex(regex.completedTask),
    component: props => <TaskItem {...props} type="completed" />
  },
  {
    strategy: findRegex(regex.cancelledTask),
    component: props => <TaskItem {...props} type="cancelled" />
  },
  {
    strategy: findRegex(regex.task),
    component: props => <TaskItem {...props} type="empty" />
  }
]);

const flexAlign = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-start"
};

const styles = {
  link: {
    color: "#3b5998",
    textDecoration: "underline"
  },
  task: {
    ...flexAlign,
    color: "#277cd8"
  },
  completedTask: {
    ...flexAlign,
    color: "#168c2c"
  },
  cancelledTask: {
    ...flexAlign,
    color: "#555",
    textDecoration: "line-through"
  }
};
