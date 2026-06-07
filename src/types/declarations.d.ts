declare module "jspdf" {
  import { jsPDF } from "jspdf";
  export default jsPDF;
  export * from "jspdf";
}

declare module "html2canvas" {
  interface Html2CanvasOptions {
    allowTaint?: boolean;
    backgroundColor?: string;
    canvas?: HTMLCanvasElement;
    foreignObjectRendering?: boolean;
    imageTimeout?: number;
    logging?: boolean;
    onclone?: (document: Document) => void;
    proxy?: string;
    removeContainer?: boolean;
    scale?: number;
    useCORS?: boolean;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    scrollX?: number;
    scrollY?: number;
    windowWidth?: number;
    windowHeight?: number;
  }
  function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;
  export default html2canvas;
}
