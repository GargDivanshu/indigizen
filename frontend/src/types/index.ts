export interface DraggableItem {
    id: string;
    value: string;
    position: { x: number; y: number };
    isDragging: boolean;
    dragStartPosition: { x: number; y: number };
    width: number;
    height: number;
    textColor: string;
    textSize: number;
  }



export interface ImageDataProps {
    id: string;
    value: string;
    position: { x: number; y: number };
    isDragging: boolean;
    dragStartPosition: { x: number; y: number };
    width: number;
    height: number;
    textColor: string;
    textSize: number;
    image: HTMLImageElement;
    type: "image";
}  
