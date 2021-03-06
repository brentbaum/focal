import {regex} from "./regex";

import {SelectionState, EditorState, Modifier} from "draft-js";

export const testRegex = (regex, text) => {
  const result = regex.test(text);
  regex.lastIndex = 0;
  return result;
};

export const getTaskType = row => {
  if (testRegex(regex.emptyTask, row)) return "empty";
  if (testRegex(regex.completedTask, row)) return "completed";
  if (testRegex(regex.cancelledTask, row)) return "cancelled";
  return "not-task";
};

export const getTaskText = text => {
  const index = text.indexOf("] ");
  if (index > -1) {
    return text.substring(text.indexOf("] ") + 2);
  }
  return text;
};

const hasBlankNeighbor = (array, index) =>
  (index > 0 && array[index - 1].empty) ||
  (index < array.length - 1 && array[index + 1].empty);

export const getTaskLists = editorState => {
  const blockMap = editorState.getCurrentContent().getBlockMap();
  const [_, sections, blanks] = blockMap
    .map(({text}, blockKey) => {
      if (testRegex(regex.task, text)) {
        const taskText = getTaskText(text);
        return {
          text: taskText,
          type: getTaskType(text),
          task: true,
          blockKey
        };
      }
      if (text.trim() === "") {
        return {
          empty: true,
          blockKey
        };
      }
      return {
        text,
        blockKey
      };
    })
    /* 
       Split into task lists based off white space. 
       Label allgap blocks. 
    */
    .reduce(
      ([count, acc, blanks], item, key, map) => {
        if (item.empty) {
          const index = map.keySeq().indexOf(key);
          const updatedBlanks = hasBlankNeighbor(map.toArray(), index)
            ? {
                ...blanks,
                [item.blockKey]: true
              }
            : blanks;
          return [count + 1, acc, updatedBlanks];
        }
        const splitAcc = count > 1 ? [[]].concat(acc) : acc;
        const [head, ...rest] = splitAcc;
        if (head) {
          const updatedHead = head.concat([item]);
          return [0, [updatedHead, ...rest], blanks];
        }
        return [0, splitAcc, blanks];
      },
      [0, [], {}]
    );

  const lists = sections
      .map(items => {
        const title =
            items.length > 0 && !items[0].task ? items[0].text : "Tasks",
          taskCount = items.filter(i => i.task).length;
        return {title, items, taskCount};
      })
      .filter(a => a.items.length > 0),
    taskLists = lists.filter(l => l.taskCount > 0);
  /* Combine adjacent non-task items? */

  const meetings = lists
    .filter(t => t.title.indexOf("$$") === 0)
    .map(meeting => {
      console.log(meeting.title, meeting.title.indexOf("$$") + 2);
      return {
        ...meeting,
        items: meeting.items.slice(1),
        title: meeting.title.slice(meeting.title.indexOf("$$") + 2).trim()
      };
    });

  return {taskLists, blanks, meetings};
};

export const getNextTaskType = taskType =>
  ({
    empty: "completed",
    completed: "cancelled",
    cancelled: "empty",
    "not-task": "empty"
  }[taskType]);

export const getTaskPrefix = type =>
  ({
    empty: "[ ] ",
    completed: "[√] ",
    cancelled: "[X] ",
    "not-task": ""
  }[type]);

export const toggleTaskBlock = (editorState, blockKey) => {
  const content = editorState.getCurrentContent(),
    block = content.getBlockForKey(blockKey),
    text = block.text;
  const selection = editorState.getSelection();
  const type = getTaskType(text),
    nextType = getNextTaskType(type),
    taskText = getTaskText(text),
    prefix = getTaskPrefix(nextType),
    nextText = prefix + taskText;
  const blockSelection = SelectionState.createEmpty(blockKey).merge({
      anchorOffset: 0,
      focusOffset: block.text.length
    }),
    contentState = Modifier.replaceText(content, blockSelection, nextText);
  /* TODO - if last type was not-todo, then increment selection by 4 forward. */
  const stateWithToggledContent = EditorState.push(editorState, contentState),
    updatedSelection =
      type === "not-task"
        ? selection.merge({
            anchorOffset: selection.focusOffset + 4,
            focusOffset: selection.focusOffset + 4
          })
        : selection,
    updatedState = EditorState.acceptSelection(
      stateWithToggledContent,
      updatedSelection
    );
  return updatedState;
};
export const toggleCurrentTask = editorState => {
  const selection = editorState.getSelection();
  const blockKey = selection.getStartKey();
  return toggleTaskBlock(editorState, blockKey);
};

export const getTopTask = lists => {
  if (lists.length === 0) {
    return {text: "Get after it.", blockKey: null};
  }
  const [head, ...rest] = lists;
  const f = head.items.find(task => task.type === "empty");
  return f ? f : getTopTask(rest);
};
