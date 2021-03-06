import {
  ContentBlock,
  EditorState,
  SelectionState,
  Modifier,
  RichUtils,
  genKey
} from "draft-js";
import {List} from "immutable";
export const insertNewBlock = (editorState, direction = "after") => {
  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const currentBlock = contentState.getBlockForKey(selection.getEndKey());

  const blockMap = contentState.getBlockMap();
  // Split the blocks
  const blocksBefore = blockMap.toSeq().takeUntil(function(v) {
    return v === currentBlock;
  });
  const blocksAfter = blockMap
    .toSeq()
    .skipUntil(function(v) {
      return v === currentBlock;
    })
    .rest();
  const newBlockKey = genKey();
  let newBlocks =
    direction === "before"
      ? [
          [
            newBlockKey,
            new ContentBlock({
              key: newBlockKey,
              type: "unstyled",
              text: "",
              characterList: List()
            })
          ],
          [currentBlock.getKey(), currentBlock]
        ]
      : [
          [currentBlock.getKey(), currentBlock],
          [
            newBlockKey,
            new ContentBlock({
              key: newBlockKey,
              type: "unstyled",
              text: "",
              characterList: List()
            })
          ]
        ];
  const newBlockMap = blocksBefore
    .concat(newBlocks, blocksAfter)
    .toOrderedMap();
  const newSelection = SelectionState.createEmpty(newBlockKey).merge({
    anchorOffset: 0,
    focusOffset: 0
  });
  const newContentState = contentState.merge({
    blockMap: newBlockMap,
    selectionBefore: selection,
    selectionAfter: selection
  });
  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    "insert-fragment"
  );
  return EditorState.forceSelection(newEditorState, newSelection);
};

export const swapBlocks = (editorState, direction = "up") => {
  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const currentBlock = contentState.getBlockForKey(selection.getEndKey());

  const blockMap = contentState.getBlockMap();
  // Split the blocks
  let blocksBefore = blockMap.toSeq().takeUntil(function(v) {
    return v === currentBlock;
  });
  let blocksAfter = blockMap
    .toSeq()
    .skipUntil(function(v) {
      return v === currentBlock;
    })
    .rest();
  let otherBlock = null;
  if (direction === "up") {
    otherBlock = blocksBefore.last();
    blocksBefore = blocksBefore.butLast();
  } else {
    otherBlock = blocksAfter.first();
    blocksAfter = blocksAfter.rest();
  }
  let newBlocks =
    direction === "up"
      ? [
          [currentBlock.getKey(), currentBlock],
          [otherBlock.getKey(), otherBlock]
        ]
      : [
          [otherBlock.getKey(), otherBlock],
          [currentBlock.getKey(), currentBlock]
        ];
  const newBlockMap = blocksBefore
    .concat(newBlocks, blocksAfter)
    .toOrderedMap();

  const newSelection = selection;
  const newContentState = contentState.merge({
    blockMap: newBlockMap,
    selectionBefore: selection,
    selectionAfter: selection
  });
  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    "insert-fragment"
  );
  return EditorState.forceSelection(newEditorState, newSelection);
};

export const insertCharacter = (editorState, character) => {
  let content = editorState.getCurrentContent();

  // Retrieve the focused block
  const selection = editorState.getSelection();
  const length = selection.getStartOffset() - selection.getEndOffset();

  if (length === 0) {
    content = Modifier.insertText(content, selection, character);
  }
  let nextState = EditorState.push(editorState, content);
  nextState = EditorState.forceSelection(
    nextState,
    content.getSelectionAfter()
  );
  return nextState;
};

export const toggleListState = editorState => {
  return RichUtils.toggleBlockType(editorState, "unordered-list-item");
};

export const getTextSelection = (contentState, selection, blockDelimiter) => {
  blockDelimiter = blockDelimiter || "\n";
  var startKey = selection.getStartKey();
  var endKey = selection.getEndKey();
  var blocks = contentState.getBlockMap();

  var lastWasEnd = false;
  var selectedBlock = blocks
    .skipUntil(function(block) {
      return block.getKey() === startKey;
    })
    .takeUntil(function(block) {
      var result = lastWasEnd;

      if (block.getKey() === endKey) {
        lastWasEnd = true;
      }

      return result;
    });

  return selectedBlock
    .map(function(block) {
      var key = block.getKey();
      var text = block.getText();

      var start = 0;
      var end = text.length;

      if (key === startKey) {
        start = selection.getStartOffset();
      }
      if (key === endKey) {
        end = selection.getEndOffset();
      }

      text = text.slice(start, end);
      return text;
    })
    .join(blockDelimiter);
};
