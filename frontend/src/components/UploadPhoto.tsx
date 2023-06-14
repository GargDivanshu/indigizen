import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { BsUpload } from "react-icons/bs";
import { RiImageAddFill } from "react-icons/ri";
import { BiReset, BiColorFill } from "react-icons/bi";
import { AiOutlineDelete } from "react-icons/ai";
import { LuClipboardSignature } from "react-icons/lu";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Stage, Layer, Image as KonvaImage, Group, Text } from "react-konva";
import axios from "axios";
import { saveAs } from "file-saver";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  IoPhonePortraitOutline,
  IoPhoneLandscapeOutline,
  IoSquareOutline,
} from "react-icons/io5";

import { DraggableItem, ImageDataProps } from "../types";
import { fileSchema, dimensionSchema } from "./../validator/index";
import { useToast } from "./ui/use-toast";
import ColorPicker from "./ColorPicker";
import { HexColorPicker } from "react-colorful";
import {
  ColorResult,
  GooglePicker,
  SketchPicker,
} from "@hello-pangea/color-picker";

import { Toggle } from "./ui/toggle";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface IImage extends HTMLImageElement {
  width: number;
  height: number;
}

const UploadPhoto = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [originalImageDimensions, setOriginalImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [newImageDimensions, setNewImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  // const [date, setDate] = useState("");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [canvas_dimensions, setCanvasDimensions] = useState({
    x: 800,
    y: 800,
  });
  const imageRef = useRef(null);
  const stageRef = useRef(null);
  const [draggableData, setDraggableData] = useState<DraggableItem[]>([
    {
      id: "title",
      value: "Title",
      position: { x: 0, y: 0 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      width: 100,
      height: 20,
      textColor: "FFFFFF",
      textSize: 18,
      isCentered: false,
    },
    {
      id: "date",
      value: "",
      position: { x: 0, y: 35 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      width: 100,
      height: 20,
      textColor: "FFFFFF",
      textSize: 18,
      isCentered: false,
    },
    {
      id: "link",
      value: "Link",
      position: { x: 0, y: 70 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      width: 100,
      height: 20,
      textColor: "FFFFFF",
      textSize: 18,
      isCentered: false,
    },
  ]);

  const [imageData, setImageData] = useState<ImageDataProps[]>([]);
  const [image, setImage] = useState<IImage | null>(null);

  const { toast } = useToast();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const getCanvasDimensions = () => {
    return {
      x: window.innerWidth * 0.7,
      y: window.innerHeight,
    };
    console.log(
      { x: window.innerWidth * 0.7, y: window.innerHeight } + "getcanvas"
    );
  };

  const fitImageToCanvas = (
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight
  ) => {
    let newWidth, newHeight, offsetX, offsetY;

    if (imageWidth <= canvasWidth && imageHeight <= canvasHeight) {
      // If the image is smaller than the canvas, center it
      newWidth = imageWidth;
      newHeight = imageHeight;
      offsetX = 0;
      offsetY = 0;
    } else {
      // If the image is larger than the canvas, fit it while maintaining aspect ratio
      const imageAspectRatio = imageWidth / imageHeight;
      const canvasAspectRatio = canvasWidth / canvasHeight;

      if (imageAspectRatio > canvasAspectRatio) {
        newWidth = canvasWidth;
        newHeight = canvasWidth / imageAspectRatio;
        offsetX = (canvasWidth - newWidth) / 2;
        offsetY = 0;
      } else {
        newWidth = canvasHeight * imageAspectRatio;
        newHeight = canvasHeight;
        offsetX = 0;
        offsetY = (canvasHeight - newHeight) / 2;
      }
    }

    return { newWidth, newHeight, offsetX, offsetY };
  };

  useEffect(() => {
    if (previewImage && imageRef.current) {
      const img = new Image();
      img.src = previewImage;
      img.onload = () => {
        setImage(img as IImage);

        const { newWidth, newHeight, offsetX, offsetY } = fitImageToCanvas(
          img.width,
          img.height,
          canvas_dimensions.x,
          canvas_dimensions.y
        );

        // setNewImageDimensions({ width: newWidth, height: newHeight });
        // console.log("New Image Dimensions:", newWidth, newHeight + "this is useEffect ")
        // setOffset({ x: offsetX, y: offsetY });

        imageRef.current.cache();
        imageRef.current.getLayer().batchDraw();
      };
    }
  }, [previewImage, canvas_dimensions, imageRef]);

  useEffect(() => {
    const updateDimensions = () => {
      setCanvasDimensions(getCanvasDimensions());
      console.log(
        { x: window.innerWidth * 0.7, y: window.innerHeight },
        "updateDimensions"
      );
    };

    updateDimensions();

    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // const captureCanvas = async (stageRef) => {
  //   const stage = stageRef.current;
  //   const dataURL = stage.toDataURL();
  //   return dataURL;
  // };

  const generatePDF = async () => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();

      // Add a new page to the document
      const page = pdfDoc.addPage();
      // Set the font and text size for the draggable text
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const textSize = 16;

      // Load the image generated by Konva
      const konvaCanvas = imageRef.current.toCanvas({ pixelRatio: 3 });
      const konvaDataUrl = konvaCanvas.toDataURL("image/jpeg", 1.0);
      const konvaBlob = await fetch(konvaDataUrl).then((response) =>
        response.blob()
      );
      const konvaArrayBuffer = await konvaBlob.arrayBuffer();

      // Load the Konva image as PDFImage
      const konvaImage = await pdfDoc.embedJpg(konvaArrayBuffer);

      const uploadedImage = imageRef.current.toCanvas({ pixelRatio: 3 });
      const isPortrait = uploadedImage.width < uploadedImage.height;

      console.log({ isPortrait }, "isPortrait");
      toast({
        title: isPortrait ? "Portrait" : "Landscape",
      });

      // Calculate the scaling factors to fit the image to the page
      const { width: pageWidth, height: pageHeight } = page.getSize();
      const imageWidth = konvaImage.width;
      const imageHeight = konvaImage.height;
      const isLandscape = imageWidth > imageHeight;

      const scaleFactor = Math.min(
        pageWidth / imageWidth,
        pageHeight / imageHeight
      );
      const scaledWidth = imageWidth * scaleFactor;
      const scaledHeight = imageHeight * scaleFactor;

      console.log("pageWidth :", pageWidth, "pageHeight :", pageHeight);
      console.log("konvaWidth :", imageWidth, " konvaHeight =", imageHeight);
      console.log("scaledWidth :", scaledWidth, "scaledHeight :", scaledHeight);

      // Calculate the position to center the image on the page
      const pageCenterX = (pageWidth - scaledWidth) / 2;
      const pageCenterY = (pageHeight - scaledHeight) / 2;

      // Rotate the PDF page if the image is in landscape orientation
      if (isLandscape) {
        page.setRotation(degrees(90));
        page.setSize(pageHeight, pageWidth);
      }

      // Draw the Konva image on the PDF page, center the image to width or height depending on page orientation
      page.drawImage(konvaImage, {
        x: pageCenterX,
        y: pageCenterY,
        width: scaledWidth,
        height: scaledHeight,
      });

      // Add the scaled draggable data to the PDF page
      // Add the unscaled draggable data to the PDF page
      for (const data of draggableData) {
        const { value, position } = data;
        const text_x = position.x;
        const text_y = position.y;

        console.log("text =", value, " text x = ", text_x);
        //console.log("position.y =", position.y, " scaling factor =", scaleFactor, " text y = ", text_y);
        page.drawText(value, {
          x: text_x,
          y: scaledHeight - text_y,
          size: textSize,
          font,
          color: rgb(0, 0, 0),
        });
      }

      // Serialize the PDF document
      const pdfBytes = await pdfDoc.save();

      // Convert the PDF bytes to a Blob
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

      // Create a download link
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(pdfBlob);
      downloadLink.download = "certificate.pdf";

      // Trigger the download
      downloadLink.click();
    } catch (error) {
      console.log("PDF generation failed:", error);
    }
  };

  const handleDownloadPDF = () => {
    generatePDF();
  };

  const getCurrentDate = () => {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    console.log("file changed");
    if (containerRef && containerRef.current &&  imageRef && imageRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const imageRect = imageRef.current.getClientRect();
      const imageWidth = containerRect.width - imageRect.width;
      const imageHeight = containerRect.height - imageRect.height;

      console.log("useEffect : widthDelta:", widthDelta, "heightDelta:", heightDelta);
      
      setDraggableData((prev) => {
        const retVal = []
        for (const data of prev) {
          retVal.push( {
            ...data,
            position: {x: data.position.x + imageWidth / 2, 
                       y: data.position.y + imageHeight / 2}
          })
        }
        console.log("useEffect retVal:", retVal);
        return retVal;
      });
    }
   
  }, [newImageDimensions]);

  const handleFileInputChange = async (event) => {
    //setSelectedFile((prevState) => null);
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const supportedTypes = ["image/jpeg", "image/png"];
    if (!supportedTypes.includes(file.type)) {
      toast({
        title: "Invalid Input File",
        description: "Only JPEG/JPG and PNG files are supported",
      });
      console.error("File type not supported");
      return;
    }

    setSelectedFile(file);
    const image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = () => {
      setOriginalImageDimensions({
        width: image.width,
        height: image.height,
      });

      const { newWidth, newHeight, offsetX, offsetY } = fitImageToCanvas(
        image.width,
        image.height,
        canvas_dimensions.x,
        canvas_dimensions.y
      );

      setNewImageDimensions({ width: newWidth, height: newHeight });
      console.log(
        "New Image Dimensions:",
        newWidth,
        newHeight + "this is handleInput "
      );
      setOffset({ x: offsetX, y: offsetY });

    }; //End of image.onload

    const reader = new FileReader();
    reader.onload = async () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    //reset the draggable data.
    setDraggableData(prevState => {
      const retVal = [];
      for (const data of prevState) {
        retVal.push( {...data,
           position: {x: 0, y: 0}})
        }
        return retVal;
    })

    //set the date as the currentDate in the draggableData
    const currentDate = getCurrentDate(); // Get the current date
    const updatedData = draggableData.map((data) => {
      if (data.id === "date") {
        return { ...data, value: currentDate }; // Update the value with the current date
      }
      return data;
    });
    setDraggableData(updatedData);
  };

  // const processImage = async (file, scalingFactor) => {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("canvasDimensions", JSON.stringify(canvas_dimensions));
  //   formData.append("scalingFactor", scalingFactor);

  //   try {
  //     const response = await fetch("http://localhost:8080/api/v1/processing", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       const processedImageBase64 = await response.text();
  //       setPreviewImage(`data:image/jpeg;base64,${processedImageBase64}`);
  //     } else {
  //       console.error("Image processing failed");
  //     }
  //   } catch (error) {
  //     console.error("Error processing image:", error);
  //     toast({
  //       title: "Error Processing Image",
  //       description: error,
  //     })
  //   }
  // };

  const [dragTimer, setDragTimer] = useState(null);

  const handleMouseDown = (event, id) => {

    
    draggableData.map((data) => {
      data.isDragging = true;
    })

    if (event.button === 0 || event.type === "touchstart") {
      event.stopPropagation();
      const clientX =
        event.type === "touchstart" ? event.touches[0].clientX : event.clientX;
      const clientY =
        event.type === "touchstart" ? event.touches[0].clientY : event.clientY;
      console.log("MouseDown:", clientX, clientY);

      // Clear existing timer if any
      if (dragTimer) {
        clearTimeout(dragTimer);
      }

      // Start timer for 1.5 seconds of inactivity
      // const timer = setTimeout(() => {
      //   setDraggableData((prev) => {
      //     return prev.map((data) => {
      //       if (data.id === id) {
      //         return {
      //           ...data,
      //           isDragging: false,
      //         };
      //       }
      //       return data;
      //     });
      //   });
      // }, 1500);
      //setDragTimer(timer);
    }
  };

  const handleMouseUp = (event, id) => {
    if (event.button === 0 || event.type === "touchend") {
      event.stopPropagation();
      console.log("MouseUp : id =", id);
      setDraggableData((prev) => {
        return prev.map((data) => {
          if (data.id === id) {
            return { ...data, isDragging: false };
          }
          return data;
        });
      });

      // Clear existing timer if any
      if (dragTimer) {
        clearTimeout(dragTimer);
      }
    }
  };
  const handleMouseMove = (event, id) => {

    console.log("MouseMove : id =", id);

    const clientX =
      event.type === "touchmove" ? event.touches[0].clientX : event.clientX;
    const clientY =
      event.type === "touchmove" ? event.touches[0].clientY : event.clientY;

    setDraggableData((prev) => {
      return prev.map((data) => {
        if (data.id === id && data.isDragging) {
          console.log("Dragging, clientX =", clientX, "clientY =", clientY);
          const offsetX = clientX - data.dragStartPosition.x;
          console.log({ offsetX }, "offsetX", { clientX }, "clientX");
          const offsetY = clientY - data.dragStartPosition.y;
          return {
            ...data,
            position: {
              x: data.position.x + offsetX,
              y: data.position.y - offsetY,
            },
            dragStartPosition: { x: clientX, y: clientY },
          };
        }
        return data;
      });
    });

    // Clear existing timer if any
    if (dragTimer) {
      clearTimeout(dragTimer);
    }

    // Start timer for 1.5 seconds of inactivity
    // const timer = setTimeout(() => {
    //   setDraggableData((prev) => {
    //     return prev.map((data) => {
    //       if (data.id === id) {
    //         return {
    //           ...data,
    //           isDragging: false,
    //         };
    //       }
    //       return data;
    //     });
    //   });
    // }, 1500);
    // setDragTimer(timer);
  };

  const handleInputChange = (event, id) => {
    const value = event.target.value;

    setDraggableData((prev) => {
      return prev.map((data) => {
        if (data.id === id) {
          return { ...data, value };
        }
        return data;
      });
    });
  };

  const handleAddField = () => {
    const newFieldId = `field${draggableData.length + 1}`;
    const newField: DraggableItem = {
      id: newFieldId,
      value: "New Field",
      position: { x: 0, y: 0 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      width: 100,
      height: 20,
      textColor: "FFFFFF",
      textSize: 18,
      isCentered: false,
    };
    setDraggableData((prevData) => [...prevData, newField]);
  };

  const handleRemoveField = (fieldId: string) => {
    setDraggableData((prevData) =>
      prevData.filter((item) => item.id !== fieldId)
    );
  };

  const handleWidthChange = (event, id) => {
    const widthInput = event.target.value;
    const width = parseInt(widthInput, 10); // Convert the input to an integer

    if (!isNaN(width)) {
      // Validate the input using the schema
      const validationResult = dimensionSchema.safeParse(width);

      if (validationResult.success) {
        const updatedData = draggableData.map((data) => {
          if (data.id === id) {
            return { ...data, width };
          }
          return data;
        });
        setDraggableData(updatedData);
      } else {
        // Handle the validation error
        console.error("Width must be an integer");
      }
    } else {
      // Handle invalid input
      console.error("Invalid width input");
      toast({
        title: "Invalid Width Input",
        description: "Width must be a positive Integer",
      });
    }
  };

  //console.log({draggableData});

  // console.log({canvas_dimensions});
  const handleHeightChange = (event, id) => {
    const heightInput = event.target.value;
    const height = parseInt(heightInput, 10);

    if (!isNaN(height)) {
      const validationResult = dimensionSchema.safeParse(height);

      if (validationResult.success) {
        const updatedData = draggableData.map((data) => {
          if (data.id === id) {
            return { ...data, height, textSize: height - 2 };
          }
          return data;
        });
        setDraggableData(updatedData);
      } else {
        console.error("Width must be an integer");
      }
    } else {
      console.error("Invalid height input");
      toast({
        title: "Invalid Height Input",
        description: "Height must be a positive Integer",
      });
    }
  };

  // function handleChange(colorResult: ColorResult, id) {
  //   // setHexValue(colorResult.hex);

  //   const updatedData = draggableData.map((data) => {
  //     if(data.id === id){
  //       return {...data, textColor: colorResult.hex}
  //     }
  //   })

  //   setDraggableData(updatedData);
  // }

  // const uploadSignature = (event) => {
  //   const file = event.target?.files?.[0];

  //   if (file && file.type === "image/png") {
  //     const validationResult = fileSchema.safeParse(file);

  //     if (validationResult.success) {
  //       setSelectedFile(file);

  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         const image = new Image();
  //         image.src = reader.result as string;
  //         image.onload = () => {
  //           const updatedData = imageData.map((data) => {
  //             return {
  //               ...data,
  //               isDragging: false,
  //               dragStartPosition: { x: 0, y: 0 },
  //               width: image.width,
  //               height: image.height,
  //               image: image,
  //             };
  //           });

  //           const newImageData = {
  //             id: `signature_${Date.now()}`,
  //             value: "",
  //             position: { x: 0, y: 0 },
  //             isDragging: false,
  //             dragStartPosition: { x: 0, y: 0 },
  //             width: image.width,
  //             height: image.height,
  //             textColor: "FFFFFF",
  //             textSize: 18,
  //             image: image,
  //           };

  //           updatedData.push(newImageData);
  //           setImageData(updatedData);
  //         };
  //       };
  //       reader.readAsDataURL(file);
  //     } else {
  //       toast({
  //         title: "Invalid Input File",
  //         description: "Only PNG files are supported",
  //       });
  //       console.error("File type not supported");
  //     }
  //   }
  // };
  // Helper function to load image asynchronously
  const loadImage = (src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  };

  const handleSave = async () => {
    try {
      const stage = stageRef.current;
      const dataURL = stage.toDataURL();
      const konvaJSON = stage.toJSON();
      const containerElements = Array.from(
        containerRef.current.children
      ) as HTMLElement[];

      // Get the dimensions of the Konva stage
      const stageWidth = stage.width();
      const stageHeight = stage.height();

      // Create a new canvas element to composite the image and draggable data
      const compositeCanvas = document.createElement("canvas");
      compositeCanvas.width = stageWidth;
      compositeCanvas.height = stageHeight;
      const compositeContext = compositeCanvas.getContext("2d");

      // Draw the image on the composite canvas
      const image = await loadImage(dataURL);
      compositeContext.drawImage(image, 0, 0, stageWidth, stageHeight);

      // Draw the draggable data text on the composite canvas
      containerElements.forEach((element) => {
        const value = element.querySelector("span")?.textContent || "";
        const positionX = parseInt(element.style.left);
        const positionY = parseInt(element.style.top);

        compositeContext.font = `${element.style.fontSize}px Arial`;
        compositeContext.fillStyle = "black";
        compositeContext.fillText(
          value,
          positionX + offset.x,
          stageHeight - (positionY + offset.y)
        );
      });

      // Generate the composite image data URL
      const compositeDataURL = compositeCanvas.toDataURL();

      // Send the composite image data and other data to the server
      const data = {
        name: selectedFile?.name,
        photo: compositeDataURL,
        konvaJSON: konvaJSON,
        draggableData: draggableData,
      };

      console.log(data);

      const response = await axios.post(
        "http://localhost:8080/api/v1/post",
        data
      );
      console.log(response.data.data[1]);

      console.log("saved");
      toast({
        title: "Saved",
        description: "Your composite image and Konva data have been saved",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative bg-blank h-screen scrollbar-macos-style">
      <div className="w-full bg-panels py-[2px] border-b-[1px] border-border">
        <input
          type="file"
          className="hidden"
          id="uploadInput"
          onChange={handleFileInputChange}
        />

        <label
          htmlFor="uploadInput"
          className="flex mx-auto w-fit my-8 py-1 items-center px-4 hover:bg-blue-800 text-white rounded-md cursor-pointer"
        >
          <BsUpload className="mr-2" />
          Upload File
        </label>
      </div>
      <div className={`bg-blank h-full text-xs text-white`}>
        <div className="relative h-full grid grid-cols-3 justify-around">
          <div className="col-span-2 h-screen">
            {previewImage ? (
              <div
                id="container"
                className={`mx-auto overflow-hidden h-[100%] w-[100%] relative`}
                ref={containerRef}
              >
                <Stage
                  className="h-[100%] w-[100%] border-8 border-red-900"
                  width={canvas_dimensions.x}
                  height={canvas_dimensions.y}
                  ref={stageRef}
                >
                  <Layer>
                    <Group x={offset.x} y={offset.y}>
                      <KonvaImage
                        ref={imageRef}
                        image={image}
                        width={newImageDimensions.width}
                        height={newImageDimensions.height}
                      />
                    </Group>
                  </Layer>
                </Stage>

                {draggableData.map((data) => {
                  console.log("dragabbleData = ", data);
                  return (
                  <div
                    key={data.id}
                    style={{
                      position: "absolute",
                      top: `${data.position.y}px`,
                      left: `${data.position.x}px`,
                      userSelect: "none",
                      zIndex: data.isDragging ? 2 : 1,
                      cursor: data.isDragging ? "grabbing" : "grab",
                    }}
                    onMouseDown={(event) => handleMouseDown(event, data.id)}
                    onMouseUp={(event) => handleMouseUp(event, data.id)}
                    onMouseMove={(event) => handleMouseMove(event, data.id)}
                    onTouchStart={(event) => handleMouseDown(event, data.id)}
                    onTouchEnd={(event) => handleMouseUp(event, data.id)}
                    onTouchMove={(event) => handleMouseMove(event, data.id)}
                  >
                    <div
                      className={`select-none `}
                      style={{
                        margin: 0,
                        cursor: "move",
                        color: `#${data.textColor}`,
                        textAlign: data.isCentered ? "center" : undefined,
                        background: "rgba(0, 0, 0, 0.5)",
                        width: `${data.width}px`,
                        height: `${data.height}px`,
                        padding: "4px 8px",
                        border: "none",
                        fontSize: `${data.textSize}px`,
                        display: "table",
                      }}
                    >
                      <span className="table-cell align-middle text-center my-auto">
                        {data.value}
                      </span>
                    </div>
                    {/* {imageData ? imageData.map(()=> {
                      return (
                        <img
                          src={imageData.image}
                          alt="Signature"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            pointerEvents: "none",
                          }}
                        />
                      )

                    }) : null} */}
                  </div>
                )}
                )}
              </div>
            ) : (
              <div
                className={`mx-auto overflow-hidden h-[100%] w-[100%] relative`}
                ref={containerRef}
              >
                <Stage
                  className="mx-auto overflow-hidden h-[90%] w-[100%] relative "
                  width={canvas_dimensions.x}
                  height={canvas_dimensions.y}
                >
                  <Layer>
                    <KonvaImage x={offset.x} y={offset.y} image={image} />
                  </Layer>
                </Stage>
              </div>
            )}
          </div>

          {previewImage ? (
            <>
              {/* <div
              className="relative grid grid-cols-1 h-[200px] space-y-1 mr-0 w-[50px]"
              >
              <button
              className="mr-0 rounded-l-md text-center bg-panels text-white py-3 hover:bg-panels/50"
              >
                <IoPhonePortraitOutline
                className="text-center mx-auto"
                />
              </button>
              <button className="rounded-l-md bg-panels text-white py-3 hover:bg-panels/50">
                <IoPhoneLandscapeOutline/>
                </button>
              <button className="rounded-l-md bg-panels text-white py-3 hover:bg-panels/50">
                2
                </button>
              </div> */}
              <div className="max-w-[364px] col-span-1 absolute overflow-y-auto px-4 right-0 pt-2 border-l-[1px] border-border h-full bg-panels">
                <div className="mx-auto">
                  <div className="flex items-center">
                    <RiImageAddFill className="mr-2" />
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md"
                      onClick={handleAddField}
                    >
                      Add Field
                    </button>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="cursor-help mr-0 rounded-md text-center border-1 text-white p-2 mx-2">
                            <IoPhonePortraitOutline
                              onClick={() => {
                                setCanvasDimensions({
                                  x: 400,
                                  y: 600,
                                });
                              }}
                              fontSize={15}
                              className=" text-center mx-auto hover:text-blue-600"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Portrait Canvas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="cursor-help mr-0 rounded-md text-center border-1 text-white p-2 mx-2">
                            <IoPhoneLandscapeOutline
                              onClick={() => {
                                setCanvasDimensions({
                                  x: 600,
                                  y: 400,
                                });
                              }}
                              fontSize={15}
                              className="text-center mx-auto hover:text-blue-600"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Landscape Canvas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="cursor-help mr-0 rounded-md text-center border-1 text-white p-2 mx-2">
                            <IoSquareOutline
                              onClick={() => {
                                setCanvasDimensions({
                                  x: 500,
                                  y: 500,
                                });
                              }}
                              fontSize={15}
                              className="text-center mx-auto hover:text-blue-600"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Square Canvas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <input
                      type="file"
                      className="hidden"
                      // onChange={uploadSignature}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            // onClick={uploadSignature}
                            className="cursor-help mr-0 rounded-md text-center border-1 text-white p-2 mx-2"
                          >
                            <LuClipboardSignature
                              onClick={() => {
                                setCanvasDimensions({
                                  x: 500,
                                  y: 500,
                                });
                              }}
                              fontSize={15}
                              className="text-center mx-auto hover:text-blue-600"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload Signature</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <Table>
                    {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                    <TableHeader>
                      <TableRow className="text-xs">
                        <TableHead className="w-[50px]">Title</TableHead>
                        <TableHead className="w-[90px]">Width</TableHead>
                        <TableHead className="w-[90px]"> Height</TableHead>
                        <TableHead className="w-[15px] text-right">
                          Reset
                        </TableHead>
                        <TableHead className="w-[15px] text-right">
                          Delete
                        </TableHead>
                        <TableHead className="w-[15px] text-right">
                          Color
                        </TableHead>
                        <TableHead className="w-[15px] text-right">
                          Center Align
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {draggableData.map((data) => (
                        <TableRow className=" text-black" key={data.id}>
                          <TableCell className="w-[195px]">
                            <input
                              type="text"
                              value={data.value}
                              onChange={(event) =>
                                handleInputChange(event, data.id)
                              }
                              className="px-2 py-1 border rounded-md w-[120px]"
                            />
                            <span className="text-[11px] text-white ml-2">
                              ({data.position.x}, {data.position.y})
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="flex">
                              <input
                                type="text"
                                value={data.width}
                                onChange={(event) =>
                                  handleWidthChange(event, data.id)
                                }
                                className="px-2 border rounded-md h-4/5 py-2 my-auto"
                                style={{ width: "50px" }}
                              />
                              <div className="flex flex-col mx-2">
                                <button
                                  // className="px-2 border rounded-md text-blue-500"
                                  onClick={() => {
                                    const newValue = data.width + 1;
                                    handleWidthChange(
                                      { target: { value: newValue } },
                                      data.id
                                    );
                                  }}
                                >
                                  <span className="text-white text-[8px]">
                                    ▲
                                  </span>
                                </button>

                                <button
                                  // className="px-2 border rounded-md text-blue-500"
                                  onClick={() => {
                                    const newValue = data.width - 1;
                                    if (newValue >= 1) {
                                      handleWidthChange(
                                        { target: { value: newValue } },
                                        data.id
                                      );
                                    } else {
                                      toast({
                                        title: "Invalid Width",
                                        description:
                                          "Width cannot be less than 1",
                                      });
                                    }
                                  }}
                                >
                                  <span className="text-white text-[8px]">
                                    ▼
                                  </span>
                                </button>
                              </div>
                            </div>
                          </TableCell>
                          {/* <span className="text-xs mx-2 justify-center m-auto">
                      Width{" "}
                    </span> */}

                          <TableCell>
                            <div className="flex">
                              <input
                                type="text"
                                value={data.height}
                                onChange={(event) =>
                                  handleHeightChange(event, data.id)
                                }
                                className="px-2 border rounded-md h-4/5 py-2 my-auto"
                                style={{ width: "50px" }}
                              />
                              <div className="flex flex-col mx-2">
                                <button
                                  // className="px-2 border rounded-md text-blue-500"
                                  onClick={() => {
                                    const newValue = data.height + 1;
                                    handleHeightChange(
                                      { target: { value: newValue } },
                                      data.id
                                    );
                                  }}
                                >
                                  <span className="text-white text-[8px]">
                                    ▲
                                  </span>
                                </button>

                                <button
                                  // className="px-2 border rounded-md text-blue-500"
                                  onClick={() => {
                                    const newValue = data.height - 1;

                                    if (newValue >= 1) {
                                      handleHeightChange(
                                        { target: { value: newValue } },
                                        data.id
                                      );
                                    } else {
                                      toast({
                                        title: "Invalid Height",
                                        description:
                                          "Height cannot be less than 1",
                                      });
                                    }
                                  }}
                                >
                                  <span className="text-white text-[8px]">
                                    ▼
                                  </span>
                                </button>
                              </div>
                            </div>
                          </TableCell>
                          {/* <span className="text-xs mx-2 justify-center m-auto">
                      Height{" "}
                    </span> */}

                          <TableCell className="text-right">
                            <button
                              className="m-auto"
                              onClick={() => {
                                const newData = draggableData.map((item) => {
                                  if (item.id === data.id) {
                                    return {
                                      ...item,
                                      position: { x: 0, y: 0 },
                                    };
                                  }
                                  return item;
                                });

                                setDraggableData(newData);
                              }}
                            >
                              <BiReset className="text-white" />
                            </button>
                          </TableCell>

                          <TableCell>
                            <button onClick={() => handleRemoveField(data.id)}>
                              <AiOutlineDelete className="text-white" />
                            </button>
                          </TableCell>

                          <TableCell>
                            <Dialog>
                              <DialogTrigger>
                                <BiColorFill className="text-white mx-auto" />
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Color Picker</DialogTitle>
                                </DialogHeader>
                                <HexColorPicker
                                  color={data.textColor}
                                  onChange={() => {
                                    const updateData = draggableData.map(
                                      (item) => {
                                        if (item.id === data.id) {
                                          return {
                                            ...item,
                                            textColor: data.textColor,
                                          };
                                        }
                                        return item;
                                      }
                                    );
                                    setDraggableData(updateData);
                                  }}
                                />
                                ;
                                {/* color={data.textColor} onChange={handleChange} */}
                              </DialogContent>
                            </Dialog>
                          </TableCell>

                          <TableCell>
                            <Toggle
                              onClick={() => {
                                const updateData = draggableData.map((item) => {
                                  if (item.id === data.id) {
                                    return {
                                      ...item,
                                      isCentered: !item.isCentered,
                                    };
                                  }
                                  return item;
                                });
                                setDraggableData(updateData);
                              }}
                              aria-label="Toggle italic text-white"
                            >
                              <span className="text-white">center</span>
                            </Toggle>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex ">
                    <button
                      onClick={() => {
                        handleSave();
                      }}
                      className="px-4 py-2 ml-2 bg-blue-500 text-white rounded-l-md"
                    >
                      Save
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button className="px-2 border-l-[1px] border-white/50 py-2 bg-blue-500 text-white rounded-r-md">
                          ▼
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Save as</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDownloadPDF}>
                          PDF{" "}
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem>Pdf</DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="absolute overflow-y-auto px-4 right-0 pt-2 border-l-[1px] border-border h-full bg-panels">
                <div className="mx-auto">
                  <div className="flex items-center">
                    <RiImageAddFill className="mr-2" />
                    <button
                      onClick={() => {
                        toast({
                          title: "No Image Selected",
                          description: "Please upload an image to continue",
                        });
                      }}
                      className="
                  cursor-not-allowed
                  px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                      Add Field
                    </button>

                    {/* portrait mode btn */}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="mr-0 rounded-md text-center border-1 text-white p-2 mx-2">
                            <IoPhonePortraitOutline
                              onClick={() => {
                                setCanvasDimensions({
                                  x: 400,
                                  y: 600,
                                });
                              }}
                              fontSize={15}
                              className="cursor-help text-center mx-auto hover:text-blue-600"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Portrait Canvas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* landscape mode btn */}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="cursor-help mr-0 rounded-md text-center border-1 text-white p-2 mx-2">
                            <IoPhoneLandscapeOutline
                              onClick={() => {
                                setCanvasDimensions({
                                  x: 600,
                                  y: 400,
                                });
                              }}
                              fontSize={15}
                              className="text-center mx-auto hover:text-blue-600"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Landscape Canvas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* square mode btn */}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="cursor-help mr-0 rounded-md text-center border-1 text-white p-2 mx-2">
                            <IoSquareOutline
                              onClick={() => {
                                setCanvasDimensions({
                                  x: 500,
                                  y: 500,
                                });
                              }}
                              fontSize={15}
                              className="text-center mx-auto hover:text-blue-600"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Square Canvas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="cursor-help mr-0 rounded-md text-center border-1 text-white p-2 mx-2">
                            <LuClipboardSignature
                              onClick={() => {
                                setCanvasDimensions({
                                  x: 500,
                                  y: 500,
                                });
                              }}
                              fontSize={15}
                              className="text-center mx-auto hover:text-blue-600"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload Signature</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <Table>
                    {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                    <TableHeader>
                      <TableRow className="text-xs">
                        <TableHead className="w-[50px]">Title</TableHead>
                        <TableHead className="w-[90px]">Width</TableHead>
                        <TableHead className="w-[90px]"> Height</TableHead>
                        <TableHead className="w-[15px] text-right">
                          Reset
                        </TableHead>
                        <TableHead className="w-[15px] text-right">
                          Delete
                        </TableHead>
                        <TableHead className="w-[15px] text-right">
                          Color
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody></TableBody>
                  </Table>

                  <button
                    onClick={() => {
                      toast({
                        title: "No Image Selected",
                        description: "Please upload an image to continue",
                      });
                    }}
                    className="cursor-not-allowed px-4 py-2 m-2 bg-blue-500 text-white rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-full bottom-0 fixed">
        {previewImage && (
          <div className="bg-panels py-[2px] text-xs flex border-t-[1px] border-border ">
            <div className=" text-white text-left border-l-[1px] px-1 border-border">
              Original Image Dimensions: {originalImageDimensions.width}px x{" "}
              {originalImageDimensions.height}px
            </div>

            <div className="text-white text-left border-l-[1px] px-1 border-border">
              New Image Dimensions: {newImageDimensions.width}px x{" "}
              {newImageDimensions.height}px
            </div>

            <div className="text-white text-left border-l-[1px] px-1 border-border">
              Offset of the image from the container: {offset.x}px, {offset.y}px
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPhoto;
