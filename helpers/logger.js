const process = require("node:process");

const MAX_PROGRESS_BAR_LENGTH = 50;

class Logger {
  constructor(noRecords) {
    this.progress = {
      noRecords: noRecords,
      current: 0,
      bar: "",
    };
  }

  showProgress(current) {
    this.progress.current = current;
    const progress = current / this.progress.noRecords;
    const currentBarLength = Math.round(progress * MAX_PROGRESS_BAR_LENGTH);
    const emptyBarSpace = MAX_PROGRESS_BAR_LENGTH - currentBarLength;

    const progressBar = `[${"=".repeat(currentBarLength)}${
      currentBarLength != MAX_PROGRESS_BAR_LENGTH ? ">" : ""
    }${" ".repeat(emptyBarSpace)}] ${(progress * 100).toFixed(2)}%\n`;
    this.progress.bar = progressBar;

    process.stdout.write(progressBar);
  }

  log(msg) {
    process.stdout.write(msg + "\n");
  }

  clearLine(n) {
    for (let i = 0; i < n; i++) {
      process.stdout.moveCursor(0, -1);
      process.stdout.clearLine(0);
    }
  }
}

module.exports = Logger;
