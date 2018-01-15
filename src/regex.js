export const regex = {
  task: /(\[\]|\[(.+)\]).+$/g,
  emptyTask: /(\[\]|\[ \]).+$/g,
  completedTask: /\[√\].+$/g,
  meeting: /\$\$/g,
  cancelledTask: /\[X\].+$/g,
  header: /#\s(.+)/g,
  link: /(http:\/\/|https:\/\/)(.+)\s/g
};
