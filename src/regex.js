export const regex = {
  task: /(\[\]|\[(.+)\]).+$/g,
  emptyTask: /(\[\]|\[ \]).+$/g,
  completedTask: /\[√\].+$/g,
  cancelledTask: /\[X\].+$/g,
  header: /#\s(.+)/g,
  link: /(http:\/\/|https:\/\/)(.+)\s/g,
  blockSeparator: /\n\n/g
};
