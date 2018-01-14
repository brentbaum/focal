export const restoreScroll = () => {
  const lastScrolled = localStorage.getItem("lastScrolled");
  if (lastScrolled) {
    const appEditor = document.getElementsByClassName("App-editor")[0];
    setTimeout(() => {
      appEditor.scrollTop = Number(lastScrolled);
    });
  }
};
let isScrolling = null;

export const watchScroll = () => {
  const appEditor = document.getElementsByClassName("App-editor")[0];
  appEditor.addEventListener("scroll", e => {
    window.clearTimeout(this.isScrolling);
    isScrolling = setTimeout(() => {
      localStorage.setItem("lastScrolled", e.target.scrollTop);
    }, 66);
  });
};
