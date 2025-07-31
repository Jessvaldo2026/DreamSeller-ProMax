// Type declarations for PDF generation libraries
declare module 'jspdf' {
  export default class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string);
    
    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
    };
    
    setFontSize(size: number): void;
    setFont(fontName: string, fontStyle?: string): void;
    setTextColor(r: number, g: number, b: number): void;
    setFillColor(r: number, g: number, b: number): void;
    setDrawColor(r: number, g: number, b: number): void;
    
    text(text: string, x: number, y: number): void;
    rect(x: number, y: number, width: number, height: number, style?: string): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    
    addImage(imageData: string, format: string, x: number, y: number, width: number, height: number): void;
    addPage(): void;
    save(filename: string): void;
  }
}

declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
    allowTaint?: boolean;
  }
  
  export default function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
}