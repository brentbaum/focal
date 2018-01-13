import {ContentBlock, EditorState, SelectionState, genKey} from "draft-js";
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
