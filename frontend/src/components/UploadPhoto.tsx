import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { BsUpload } from "react-icons/bs";
import { RiImageAddFill } from "react-icons/ri";
import { BiReset, BiColorFill } from "react-icons/bi";
import { AiOutlineDelete } from "react-icons/ai";
import { LuClipboardSignature } from "react-icons/lu";
import { Stage, Layer, Image as KonvaImage, Group, Text } from "react-konva";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
import Jimp from "jimp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { DraggableItem, ImageDataProps } from "../types";
import { fileSchema, dimensionSchema } from "./../validator/index";
import { useToast } from "./ui/use-toast";

import { HexColorPicker } from "react-colorful";

import { Toggle } from "./ui/toggle";

import {
  Dialog,
  DialogContent,
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import { IImage } from "./../types/index";
import { FaSignature } from "react-icons/fa";
import { pdf } from "html-pdf";

const UploadPhoto = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
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
  const draggableDataRef = useRef([]);
  const groupRef = useRef(null);

  const [color, setColor] = useState("#000000");
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
      textSize: 20,
      isCentered: false,
      type: "text",
      isFixed: false,
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
      textSize: 20,
      isCentered: false,
      type: "text",
      isFixed: false,
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
      textSize: 20,
      isCentered: false,
      type: "text",
      isFixed: false,
    },
  ]);

  const formData = new FormData();

  const [imageData, setImageData] = useState<ImageDataProps[]>([]);
  const [image, setImage] = useState<IImage | null>(null);
  const [signatureImage, setSignatureImage] = useState<IImage[] | null>(null);

  const { toast } = useToast();
  const containerRef = useRef(null);

  const getCanvasDimensions = () => {
    return {
      x: window.innerWidth * 0.7,
      y: window.innerHeight,
    };
  };

  const fitImageToCanvas = (
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight
  ) => {
    let newWidth, newHeight;

    if (imageWidth <= canvasWidth && imageHeight <= canvasHeight) {
      // If the image is smaller than the canvas, center it
      newWidth = imageWidth;
      newHeight = imageHeight;
    } else {
      // If the image is larger than the canvas, fit it while maintaining aspect ratio
      const imageAspectRatio = imageWidth / imageHeight;

      if (imageWidth > imageHeight && imageWidth > canvasWidth) {
        // landscape
        newWidth = canvasWidth;
        newHeight = newWidth / imageAspectRatio;
      } else if (imageHeight > imageWidth && imageHeight > canvasHeight) {
        // portrait
        newHeight = canvasHeight;
        newWidth = newHeight * imageAspectRatio;
      }
    }
    console.log("Image new height and width", newHeight, newWidth);
    return { newWidth, newHeight };
  };

  useEffect(() => {
    // Update the clip area whenever the window is resized
    const handleResize = () => {
      if (stageRef.current && imageRef.current) {
        const imageWidth = imageRef.current.width();
        const imageHeight = imageRef.current.height();
        const visibleArea = {
          x: imageRef.current.x(),
          y: imageRef.current.y(),
          width: imageWidth,
          height: imageHeight,
        };
        stageRef.current.clip(visibleArea);
        stageRef.current.batchDraw();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  useEffect(() => {
    if (previewImage && imageRef.current) {
      const img = new Image();
      img.onload = () => {
        setImage(img as IImage);

        imageRef.current.cache();
        imageRef.current.getLayer().batchDraw();
      };
      img.src = previewImage;
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

    // return () => {
    //   window.removeEventListener("resize", handleResize);
    // };
  }, []);

  const fitCanvas2Page = (canvasW, canvasH, pageW, pageH) => {
    let newWidth = canvasW;
    let newHeight = canvasH;

    //find the constraining dimension.
    const wDiff = pageW - canvasW;
    const hDiff = pageH - canvasH;

    if (wDiff < 0 && wDiff < hDiff) {
      //width is the constraint.
      newWidth = pageW;
      newHeight = (pageW / canvasW) * canvasH;
    }

    if (hDiff < 0 && hDiff < wDiff) {
      //height is the constraint.
      newHeight = pageH;
      newWidth = (pageH / canvasH) * canvasW;
    }

    return [newWidth, newHeight];
  };

  /***************************************************************
   * Name: generatePDF
   ***************************************************************/

  const readFileData = (file) => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const imageToBlob = (image) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      canvas.toBlob((blob) => {
        resolve(blob);
      });
    });
  };

  async function convertImageToPDF(imageElement) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const imageSrc = imageElement.src;
    const imageBytes = await fetch(imageSrc).then((response) =>
      response.arrayBuffer()
    );
    const image = await pdfDoc.embedPng(imageBytes);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width: imageElement.width,
      height: imageElement.height,
    });

    return await pdfDoc.save();
  }

  const imageToBuffer = (image) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);

    // Get the canvas data as an ImageData object
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Create a new Uint8Array to hold the pixel data
    const buffer = new Uint8Array(imageData.data.length);

    // Copy the pixel data from the ImageData object to the buffer
    for (let i = 0; i < imageData.data.length; i++) {
      buffer[i] = imageData.data[i];
    }

    return buffer;
  };

  async function processImageAsync(element, sampleForm) {
    console.log(element.image.src);
    const base64Blob = element.image.src.split(',')[1]; // Replace with your base64 blob
    console.log(base64Blob, "base64Blob");
    const decodedData = window.atob(base64Blob);
    const uint8Array = new Uint8Array(decodedData.length);
  
    for (let i = 0; i < decodedData.length; ++i) {
      uint8Array[i] = decodedData.charCodeAt(i);
    }
  
    const blob = new Blob([uint8Array], {
      type: "application/octet-stream",
    });
  
    // Append the Blob object to the FormData object
    sampleForm.append("file", blob, element.value);
  }

  const sampleUpload = async () => {
    const sampleForm = new FormData();
    draggableData.map(async (element) => {
      if (element.type !== "text") {
        // const pdfBytes = await convertImageToPDF(element.image);
        try {
          await processImageAsync(element, sampleForm);
          console.log("Blob appended to FormData:", sampleForm);
        } catch (error) {
          console.error(error);
        }
      }
    });

    
    await axios
      .post("http://localhost:8443/save-certificate", sampleForm, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization:
            "8BEYKFmSROr0iUV36SjUUOu38ZDgifivsFU2SzbUKNTXUQY0b42LkveyQ0Y7t4BtypcMnvrjLJL4o5SUoaE9siUrfS3wSUi2",
        },
      })
      .then((response) => {
        console.log(response.data.message);
        console.log(formData, "formData");
      })
      .catch((error) => {
        console.error("Error uploading PDF:", error);
      });


    const pdfDoc = await PDFDocument.create();
    // const stage = imageRef.current;
    const fileData = await readFileData(selectedFile);
    const uint8Array = new Uint8Array(fileData);
    const image = await pdfDoc.embedPng(uint8Array);

    const page = pdfDoc.addPage([
      originalImageDimensions.width,
      originalImageDimensions.height,
    ]);

    // Get the dimensions of the Konva stage
    const imageWidth = originalImageDimensions.width;
    const imageHeight = originalImageDimensions.height;
    let pageHeight = page.getHeight();
    let pageWidth = page.getWidth();

    let [finalWidth, finalHeight] = fitCanvas2Page(
      imageWidth,
      imageHeight,
      pageWidth,
      pageHeight
    );

    // Calculate the scale factor to fit the image to the page width
    const scale_x = finalWidth / imageWidth;
    const scale_y = finalHeight / imageHeight;

    // Calculate the adjusted image dimensions
    const adjustedWidth = imageWidth * scale_x;
    const adjustedHeight = imageHeight * scale_y;
    const dataScale_x = finalWidth / newImageDimensions.width;
    const font = await pdfDoc.embedFont("Helvetica");
    // Draw the image on the PDF page
    page.drawImage(image, {
      x: 0,
      y: pageHeight - adjustedHeight,
      width: adjustedWidth,
      height: adjustedHeight,
    });

    const pdfBytes = await pdfDoc.save();

    // Create a blob from the PDF bytes
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    sampleForm.append("file", pdfBlob, pdfBlob.name);

    sampleForm.append("file", selectedFile, "file1");
    sampleForm.append("file", selectedFile, "file2");

  };

  const generatePDF = async () => {
    try {
      return await sampleUpload();
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      // const stage = imageRef.current;
      const fileData = await readFileData(selectedFile);
      const uint8Array = new Uint8Array(fileData);
      const image = await pdfDoc.embedPng(uint8Array);

      const page = pdfDoc.addPage([
        originalImageDimensions.width,
        originalImageDimensions.height,
      ]);

      // Get the dimensions of the Konva stage
      const imageWidth = originalImageDimensions.width;
      const imageHeight = originalImageDimensions.height;
      let pageHeight = page.getHeight();
      let pageWidth = page.getWidth();

      let [finalWidth, finalHeight] = fitCanvas2Page(
        imageWidth,
        imageHeight,
        pageWidth,
        pageHeight
      );

      // Calculate the scale factor to fit the image to the page width
      const scale_x = finalWidth / imageWidth;
      const scale_y = finalHeight / imageHeight;

      // Calculate the adjusted image dimensions
      const adjustedWidth = imageWidth * scale_x;
      const adjustedHeight = imageHeight * scale_y;
      const dataScale_x = finalWidth / newImageDimensions.width;
      const font = await pdfDoc.embedFont("Helvetica");
      // Draw the image on the PDF page
      page.drawImage(image, {
        x: 0,
        y: pageHeight - adjustedHeight,
        width: adjustedWidth,
        height: adjustedHeight,
      });

      draggableData.forEach(async (element) => {
        if (element.type === "text") {
          page.drawText(element.value, {
            x: element.position.x * dataScale_x,
            y: pageHeight - (element.position.y + element.height) * dataScale_x,
            font,
            size: element.textSize * dataScale_x,
          });
        } else {
          const image = await pdfDoc.embedPng(element.image.src);
          page.drawImage(image, {
            x: element.position.x * dataScale_x,
            y: pageHeight - (element.position.y + element.height) * dataScale_x,
            height: element.height * dataScale_x,
            width: element.width * dataScale_x,
          });
        }
      });

      // Set the font and font size

      // Draw the draggable data on the PDF page
      const draggableDataOffset = [];

      //const dataScale_y = finalHeight / (stage.height() - ;
      console.log("pageHeight =", pageHeight);

      const pdfBytes = await pdfDoc.save();

      // Create a blob from the PDF bytes
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

      formData.append("file", pdfBlob, pdfBlob.name);

      draggableData.forEach(async (element) => {
        const positionX = element.position.x * dataScale_x;
        const positionY = (element.position.y + element.height) * dataScale_x;

        console.log(
          element.value,
          "element.position.x =",
          element.position.x,
          { dataScale_x },
          "element.position.y ",
          element.position.y,
          { positionX },
          { positionY }
        );
        let y = pageHeight - positionY;

        page.drawText(element.value, {
          x: positionX,
          y: y,
          font,
          size: element.textSize * dataScale_x,
        });

        const formElements = [];

        if (element.type === "text") {
          formElements.push({
            title: element.value,
            type: element.type,
            textSize: element.textSize * dataScale_x,
            x: positionX,
            y: y,
            textColor: element.textColor,
            isCentered: element.isCentered,
            isFixed: element.isFixed,
          });
        } else {
          // formData.append("file", pdfBlob, "Image");

          const pdfBytes = await convertImageToPDF(element.image);

          // Append the PDF file to the FormData object
          formData.append("file", new Blob([pdfBytes]), element.value);

          // const imageBytes = await pdfDoc.save();

          // // Create a blob from the PDF bytes
          // const imgBlob = new Blob([imageBytes], { type: "application/pdf" });
          //     formData.append("file", imgBlob, element.value);

          formElements.push({
            title: element.value,
            type: element.type,
            imageSrc: element.image?.src,
            x: positionX,
            y: y,
            // isFixed: element.isFixed,
          });
        }
        formData.append("formElements", JSON.stringify(formElements));

        if (element.type === "image") {
          const signPdf = await pdfDoc.embedPng(element.image?.src);
          page.drawImage(signPdf, {
            x: positionX,
            y: y,
          });
        }

        draggableDataOffset.push({ x: positionX, y: pageHeight - positionY });
      });

      // Download the PDF file
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(pdfBlob);
      downloadLink.download = "generated_pdf.pdf";
      downloadLink.click();

      console.log("pdfBlob", pdfBlob);

      // console.log(fileSave, "fileSave");

      console.log("PDF generated and downloaded successfully");
      console.log("FormData contents:");
      formData.forEach((value, key) => {
        console.log(key, value);
      });
      formData.delete("file");
      formData.delete("formElements");
      // formData.delete("text");
      // formData.delete("textSize");
      // formData.delete("x");
      // formData.delete("y");
      // formData.delete("textColor");
      // formData.delete("isCentered");
      // formData.delete("isFixed");
      formData.forEach((value, key) => {
        console.log(key, value);
      });
    } catch (error) {
      console.log("myerrror " + error);
      toast({
        title: "Error",
        description: error.message,
      });
    }
  }; // end of generatePDF

  /***************************************************************
   * Name: getCurrentDate
   ***************************************************************/
  const getCurrentDate = () => {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };
  /***************************************************************
   * Name: handleFileInputChange
   ***************************************************************/
  const handleFileInputChange = async (event) => {
    setSelectedFile((prev) => null);
    const file = event.target.files[0];
    console.log(file, "file");
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

    setSelectedFile((prev) => file);
    console.log("selectedFile", selectedFile);

    const image = new Image();
    //callback for image onload completion

    image.onload = () => {
      setOriginalImageDimensions({
        width: image.width,
        height: image.height,
      });

      console.log(
        "Original image dimensions: ",
        image.width,
        image.height,
        "px"
      );

      const { newWidth, newHeight } = fitImageToCanvas(
        image.width,
        image.height,
        canvas_dimensions.x,
        canvas_dimensions.y
      );

      setNewImageDimensions({
        width: newWidth,
        height: newHeight,
      });
      setImage(image);
      console.log(
        "New Image Dimensions:",
        newWidth,
        newHeight + "this is handleInput "
      );
    }; //end of image onload
    image.src = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onload = async () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    const currentDate = "date"; // Get the current date
    const updatedData = draggableData.map((data) => {
      if (data.id === "date") {
        return { ...data, value: currentDate }; // Update the value with the current date
      }
      return data;
    });
    setDraggableData(updatedData);
  }; //end of handleFileInputChange

  /*******************************************************************
   * Name: handleInputChange
   *******************************************************************/
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

  /*******************************************************************
   * Name: handleAddField
   *******************************************************************/
  const handleAddField = () => {
    const newFieldId = `field${draggableData.length + 1}`;
    const newField: DraggableItem = {
      id: newFieldId,
      value: "New Field",
      position: {
        x: Math.random() * newImageDimensions.width,
        y: Math.random() * newImageDimensions.height,
      },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      width: 100,
      height: 20,
      textColor: "FFFFFF",
      textSize: 20,
      isCentered: false,
      type: "text",
      isFixed: false,
    };
    setDraggableData((prevData) => [...prevData, newField]);
  };

  /*******************************************************************
   * Name: handleRemoveField
   *******************************************************************/
  const handleRemoveField = (fieldId: string) => {
    setDraggableData((prevData) =>
      prevData.filter((item) => item.id !== fieldId)
    );
  };

  /*******************************************************************
   * Name: handleWidthChange
   *******************************************************************/
  // const handleWidthChange = (event, id) => {
  //   const widthInput = event.target.value;
  //   const width = parseInt(widthInput, 10); // Convert the input to an integer

  //   if (!isNaN(width)) {
  //     // Validate the input using the schema
  //     const validationResult = dimensionSchema.safeParse(width);

  //     if (validationResult.success) {
  //       const updatedData = draggableData.map((data) => {
  //         if (data.id === id) {
  //           return { ...data, width };
  //         }
  //         return data;
  //       });
  //       setDraggableData(updatedData);
  //     } else {
  //       // Handle the validation error
  //       console.error("Width must be an integer");
  //     }
  //   } else {
  //     // Handle invalid input
  //     console.error("Invalid width input");
  //     toast({
  //       title: "Invalid Width Input",
  //       description: "Width must be a positive Integer",
  //     });
  //   }
  // };

  /*******************************************************************
   * Name: handleHeightChange
   *******************************************************************/
  const handleHeightChange = (event, id) => {
    const heightInput = event.target.value;
    const height = parseInt(heightInput, 10);

    if (!isNaN(height)) {
      const validationResult = dimensionSchema.safeParse(height);

      if (validationResult.success) {
        const updatedData = draggableData.map((data) => {
          const ratio = data.height / data.width;
          if (data.id === id) {
            return data.type === "text"
              ? { ...data, height, textSize: height - 2 }
              : { ...data, height, width: height / ratio };
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

  // *******************************************************************
  //  * Name: uploadSignature
  //  *******************************************************************/

  const removeSimilarColorBackground = (imageData, referenceRGB, tolerance) => {
    const [refR, refG, refB] = referenceRGB;

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const alpha = imageData.data[i + 3];

      // Check if the pixel is similar to the reference RGB values within the given tolerance
      if (
        Math.abs(r - refR) <= tolerance &&
        Math.abs(g - refG) <= tolerance &&
        Math.abs(b - refB) <= tolerance &&
        alpha >= 252
      ) {
        // Set alpha value to 0 to make it transparent
        imageData.data[i + 3] = 0;
      }
    }

    return imageData;
  };

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  const changeImageColor = (imageData, color, id) => {
    const image = new Image();

    image.onload = () => {
      const updatedData = draggableData.map((item) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = item.width;
        canvas.height = item.height;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        var colorRGB = hexToRgb(color);
        const imageDataTemp = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        if (item.id === id) {
          for (let i = 0; i < imageDataTemp.data.length; i += 4) {
            if (imageDataTemp.data[i + 3] === 0) {
              continue;
            }
            imageDataTemp.data[i] = colorRGB.r;
            imageDataTemp.data[i + 1] = colorRGB.g;
            imageDataTemp.data[i + 2] = colorRGB.b;
            // imageDataTemp.data[i + 3] = colorRGB.a;
          }

          ctx.putImageData(imageDataTemp, 0, 0);

          const newImage = new Image();
          newImage.src = canvas.toDataURL("image/png");

          return {
            ...item,
            image: newImage,
          };
        }
        return item;
      });
      setDraggableData(updatedData);
    };
    image.src = imageData.src;
  };

  const uploadSignature = async (event) => {
    const files: FileList = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    Array.from(files).forEach((file) => {
      const image = new Image();
      image.onload = () => {
        const imgName = file.name;
        const aspectRatio = image.width / image.height;
        const maxWidth = originalImageDimensions.width / 2; // Maximum width for the draggable image
        const maxHeight = originalImageDimensions.height / 2; // Maximum height for the draggable image

        let width = image.width;
        let height = image.height;

        console.log("width", width);
        console.log("height", height);
        // Adjust the dimensions based on the aspect ratio
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const referenceRGB = [
          imageData.data[0], // Red component of the top-left pixel
          imageData.data[1], // Green component of the top-left pixel
          imageData.data[2], // Blue component of the top-left pixel
        ];
        const tolerance = 70; // Tolerance for RGB similarity

        const modifiedImageData = removeSimilarColorBackground(
          imageData,
          referenceRGB,
          tolerance
        );

        ctx.putImageData(modifiedImageData, 0, 0);

        const newImage = new Image();
        newImage.src = canvas.toDataURL("image/png");

        const newFieldId = `field${draggableData.length + 1}`;
        const newField = {
          id: newFieldId,
          value: imgName,
          textSize: 0,
          position: { x: 0, y: 0 },
          isDragging: false,
          dragStartPosition: { x: 0, y: 0 },
          width: width,
          height: height,
          isCentered: false,
          type: "image",
          image: newImage,
          isFixed: false,
        };

        console.log(newImage, "newImage");

        setDraggableData((prevData) => [...prevData, newField]);
      };
      image.src = URL.createObjectURL(file);
    });
  };

  /*******************************************************************
   * Name: loadImage
   *******************************************************************/
  // const loadImage = (src: string) => {
  //   return new Promise<HTMLImageElement>((resolve, reject) => {
  //     const image = new window.Image();
  //     image.onload = () => resolve(image);
  //     image.onerror = reject;
  //     image.src = src;
  //   });
  // };

  /*******************************************************************
   * Name: handleSave
   *******************************************************************/
  // const handleSave = async () => {
  //   try {
  //     const stage = stageRef.current.getStage();
  //     const dataURL = stage.toDataURL();
  //     const konvaJSON = stage.toJSON();

  //     // Calculate the scaling factor to maintain aspect ratio
  //     const stageWidth = stage.width();
  //     const stageHeight = stage.height();
  //     const windowWidth = window.innerWidth;
  //     const windowHeight = window.innerHeight;
  //     const scaleX = windowWidth / stageWidth;
  //     const scaleY = windowHeight / stageHeight;
  //     const scale = Math.min(scaleX, scaleY);

  //     // Calculate the composite canvas dimensions based on the scaled size
  //     const compositeCanvasWidth = stageWidth * scale;
  //     const compositeCanvasHeight = stageHeight * scale;

  //     // Create a new canvas element to composite the image and draggable dataed
  //     const compositeCanvas = document.createElement("canvas");
  //     compositeCanvas.width = compositeCanvasWidth;
  //     compositeCanvas.height = compositeCanvasHeight;
  //     const compositeContext = compositeCanvas.getContext("2d");

  //     // Calculate the visible area of the stage based on the image dimensions
  //     const imageWidth = imageRef.current.width();
  //     const imageHeight = imageRef.current.height();
  //     const visibleArea = {
  //       x: imageRef.current.x(),
  //       y: imageRef.current.y(),
  //       width: imageWidth,
  //       height: imageHeight,
  //     };

  //     // Set the visible area as the clip property of the stage
  //     stage.clip(visibleArea);

  //     // Draw the image on the composite canvas
  //     const image = await loadImage(dataURL);
  //     compositeContext.drawImage(
  //       image,
  //       0,
  //       0,
  //       stageWidth,
  //       stageHeight,
  //       0,
  //       0,
  //       compositeCanvasWidth,
  //       compositeCanvasHeight
  //     );

  //     // // Draw the draggable data text on the composite canvas
  //     // draggableData.forEach((data) => {
  //     //   const { position, value, width, height, textSize, textColor } = data;
  //     //   const x = position.x * scale;
  //     //   const y = position.y * scale;
  //     //   const rectWidth = width * scale;
  //     //   const rectHeight = height * scale;
  //     //   const fontSize = textSize * scale;

  //     //   // Fill the rectangle
  //     //   compositeContext.fillStyle = "rgba(0, 0, 0, 0)"; // Set the rectangle color to black
  //     //   compositeContext.fillRect(x, y, rectWidth, rectHeight);

  //     //   // Fill the text with the provided textColor value
  //     //   compositeContext.fillStyle = `${textColor}`; // Set the font color
  //     //   compositeContext.font = `${fontSize}px Arial`;
  //     //   compositeContext.fillText(value, x, y + fontSize);
  //     // });

  //     // Generate the composite image data URL
  //     const compositeDataURL = compositeCanvas.toDataURL();

  //     // Send the composite image data and other data to the server
  //     const data = {
  //       name: selectedFile?.name,
  //       photo: compositeDataURL,
  //       konvaJSON: konvaJSON,
  //       draggableData: draggableData,
  //       width: newImageDimensions.width,
  //       height: newImageDimensions.height,
  //     };

  //     console.log(data);

  //     const pdfDoc = await PDFDocument.create();
  //     const pngImage = await pdfDoc.embedPng(compositeDataURL);

  //     const pdfBytes = await pdfDoc.save(); // Convert the PDF document to bytes

  //     const blobPDF = new Blob([pdfBytes], { type: 'application/pdf' });

  //     formData.append('file', blobPDF, 'document.pdf');

  //     formData.append('title', selectedFile?.name.toUpperCase());

  //     formData.append('schoolId', '1');
  //     const date = getCurrentDate();
  //     formData.append('startDate', date);

  //     formData.append('fileName', selectedFile?.name.toUpperCase());
  //     // formData.append('startDate', );
  //     //formData.append('startDate', date);
  //     formData.append('category', 'General');
  //     formData.append('knobs', JSON.stringify(draggableData));

  //   // req.body.title, req.body.schoolid, req.body.startDate, req.body.category, req.body.fileName
  //     const response = await fetch("http://localhost:8443/save-certificate", {
  //       headers: {
  //         "Authorization":"8BEYKFmSROr0iUV36SjUUOu38ZDgifivsFU2SzbUKNTXUQY0b42LkveyQ0Y7t4BtypcMnvrjLJL4o5SUoaE9siUrfS3wSUi2",
  //         // "Content-Type": "multipart/form-data"
  //       },
  //       method: "POST",
  //       body: formData
  //     });
  //     const newData = await response.json();
  //     console.log("formData sent", newData);

  //     // fetchfetconsole.log(newData);

  //    formData.delete('file');
  //     formData.delete('title');
  //     formData.delete('schoolId');
  //     formData.delete('startDate');
  //     formData.delete('fileName');
  //     formData.delete('category');
  //     formData.delete('knobs');
  //   } catch (error) {
  //     console.log(error);
  //     toast({
  //       title: "Error",
  //       description: error,
  //     });
  //   }
  // };

  const handleDragStart = (e, id) => {
    const draggableData = draggableDataRef.current.find(
      (data) => data.id === id
    );
    if (draggableData) {
      draggableData.isDragging = true;
    }
  };

  const handleDragEnd = (e, id) => {
    const draggableData = draggableDataRef.current.find(
      (data) => data.id === id
    );
    if (draggableData) {
      draggableData.isDragging = false;
    }
  };

  const handleDragMove = (e, id) => {
    const draggableDataIndex = draggableData.findIndex(
      (data) => data.id === id
    );
    if (draggableDataIndex !== -1) {
      const imageNode = imageRef.current;
      const imagePosition = imageNode.getAbsolutePosition();

      const draggableDataCopy = [...draggableData];
      draggableDataCopy[draggableDataIndex].position = {
        x: e.target.x() - imagePosition.x,
        y: e.target.y() - imagePosition.y,
      };

      setDraggableData(draggableDataCopy);
    }
  };

  console.log(draggableData);

  const handleColorChange = (newColor, itemId) => {
    // Callback 1: Update color state using setColor
    setColor(newColor);

    // Callback 2: Update draggableData state using setDraggableData
    const updatedData = draggableData.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          textColor: newColor,
        };
      }
      return item;
    });
    setDraggableData(updatedData);
  };

  // console.log("draggableData =---> image" + draggableData.map((item) => {

  //     if (item.image) return {
  //       ...item,
  //     }

  // }));

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
        <div className="w-full bg-blue-800 px-4 text-white font-extralight text-xs">
          Filename:{" "}
          <input
            type="text"
            className="bg-transparent border-none outline-none w-11/12"
            value={selectedFile?.name}
          />
        </div>
      </div>

      <div className={`bg-blank h-full text-xs text-white`}>
        <div className="relative h-full grid grid-cols-3 justify-around">
          <div className="col-span-2 h-screen">
            {previewImage ? (
              <div>
                <Stage
                  width={canvas_dimensions.x}
                  height={canvas_dimensions.y}
                  ref={stageRef}
                >
                  <Layer>
                    <KonvaImage
                      image={image}
                      width={newImageDimensions.width}
                      height={newImageDimensions.height}
                      ref={imageRef}
                    />
                    {draggableData.map((data) => {
                      if (data.type === "text") {
                        return (
                          <Group
                            key={data.id}
                            x={data.position.x}
                            y={data.position.y}
                            ref={groupRef}
                            draggable
                            onDragStart={(e) => handleDragStart(e, data.id)}
                            onDragEnd={(e) => handleDragEnd(e, data.id)}
                            onDragMove={(e) => handleDragMove(e, data.id)}
                            height={data.height}
                          >
                            <Text
                              text={data.value}
                              fill={`${data.textColor}`}
                              fontSize={data.textSize}
                              height={data.textSize}
                              padding={0}
                            />
                          </Group>
                        );
                      } else {
                        return (
                          <Group
                            key={data.id}
                            x={data.position.x}
                            y={data.position.y}
                            ref={groupRef}
                            draggable
                            onDragStart={(e) => handleDragStart(e, data.id)}
                            onDragEnd={(e) => handleDragEnd(e, data.id)}
                            onDragMove={(e) => handleDragMove(e, data.id)}
                            width={data.width}
                            height={data.height}
                          >
                            <KonvaImage
                              image={data.image}
                              width={data.width}
                              height={data.height}
                              className="border-2 bg-red-400"
                            />
                          </Group>
                        );
                      }
                    })}
                  </Layer>
                </Stage>
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

                    <input
                      type="file"
                      className="hidden"
                      id="signatureInput"
                      onChange={uploadSignature}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label
                            htmlFor="signatureInput"
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
                          </label>
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
                        {/* <TableHead className="w-[90px]">Width</TableHead> */}
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

                          {/* <TableCell>
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
                          </TableCell> */}

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
                                  color={color}
                                  onChange={(newColor) =>
                                    data.type === "text"
                                      ? handleColorChange(newColor, data.id)
                                      : changeImageColor(
                                          data.image,
                                          newColor,
                                          data.id
                                        )
                                  }
                                />
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
                        generatePDF();
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
                        <DropdownMenuItem onClick={generatePDF}>
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
