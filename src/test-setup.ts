import "jest-preset-angular/setup-jest";
import "@angular/localize/init";

Object.defineProperty(window, "CSS", { value: null });
Object.defineProperty(document, "doctype", {
  value: "<!DOCTYPE html>",
});
Object.defineProperty(document.body.style, "transform", {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});
