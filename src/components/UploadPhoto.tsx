import * as React from 'react';
import { useState, useRef, useEffect } from "react";
import { BsUpload } from "react-icons/bs";
import { RiImageAddFill } from "react-icons/ri";
import { BiReset, BiColorFill } from "react-icons/bi";
import {AiOutlineDelete} from 'react-icons/ai'
import {DraggableItem} from '../types'
import { fileSchema, dimensionSchema } from './../validator/index';
import { useToast } from './ui/use-toast';
import ColorPicker from './ColorPicker';
import { HexColorPicker } from "react-colorful";


import { ColorResult, GooglePicker, SketchPicker } from "@hello-pangea/color-picker";


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"


import {


  Table,
  TableBody,
  // TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"




const UploadPhoto = () => {
  


  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
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

  // console.log(selectedFile)
  const [draggableData, setDraggableData] = useState<DraggableItem[]>([
    {
      id: "title",
      value: "Title",
      position: { x: 0, y: 0 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      width: 100,
      height: 20,
      textColor: "#FFFFFF",
    },
    {
      id: "date",
      value: "",
      position: { x: 0, y: 35 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      width: 100,
      height: 20,
      textColor: "#FFFFFF",
    },
    {
      id: "link",
      value: "Link",
      position: { x: 0, y: 70 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      width: 100,
      height: 20,
      textColor: "#FFFFFF",
    },
  ]);

  const { toast } = useToast()
  const containerRef = useRef(null);
  const canvasRef = useRef(null);



  useEffect(() => {
    if (previewImage) {
      const image = new Image();
      image.src = previewImage;
      image.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const aspectRatio = image.width / image.height;
        let width, height;
        if (aspectRatio > 1) {
          width = 300;
          height = width / aspectRatio;
        } else {
          height = 300;
          width = height * aspectRatio;
        }

        canvas.width = 300;
        canvas.height = 300;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, width, height);

        // Set the original image dimensions
        setOriginalImageDimensions({
          width: image.width,
          height: image.height,
        });
        setNewImageDimensions({ width: width, height: height });
      };
    }
  }, [previewImage]);

  

  const getCurrentDate = () => {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  // const calculateImageOffset = () => {
  //   const containerElement = containerRef.current;
  //   const containerRect = containerElement.getBoundingClientRect();
  //   const imageRect = canvasRef.current.getBoundingClientRect();

  //   const offsetX = imageRect.left - containerRect.left;
    
  //   const offsetY = imageRect.top - containerRect.top;
  //   setOffset({ x: offsetX, y: offsetY });
  //   console.log("Image Offset:", offsetX, offsetY);
  // };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
  
    if (file) {
      // Validate the selected file using the schema
      const validationResult = fileSchema.safeParse(file);
  
      if (validationResult.success) {
        setSelectedFile(file);
  
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
  
        const currentDate = getCurrentDate(); // Get the current date
        const updatedData = draggableData.map((data) => {
          if (data.id === "date") {
            return { ...data, value: currentDate }; // Update the value with the current date
          }
          return data;
        });
        setDraggableData(updatedData);
      } else {
        
        toast({
          title: "Invalid Input File",
          description: "Only JPEG/JPG and PNG files are supported",
        })
        console.error("File type not supported");
      }
    }
  };

  const handleMouseDown = (event, id) => {
    if (event.button === 0 || event.type === "touchstart") {
      event.stopPropagation();
      const clientX =
        event.type === "touchstart" ? event.touches[0].clientX : event.clientX;
      const clientY =
        event.type === "touchstart" ? event.touches[0].clientY : event.clientY;
      const updatedData = draggableData.map((data) => {
        if (data.id === id) {
          return {
            ...data,
            isDragging: true,
            dragStartPosition: { x: clientX, y: clientY },
          };
        }
        return data;
      });
      setDraggableData(updatedData);
    }
  };

  const handleMouseUp = (event, id) => {
    if (event.button === 0 || event.type === "touchend") {
      event.stopPropagation();
      const updatedData = draggableData.map((data) => {
        if (data.id === id) {
          return { ...data, isDragging: false };
        }
        return data;
      });
      setDraggableData(updatedData);
    }
  };

  const handleMouseMove = (event, id) => {
    const clientX =
      event.type === "touchmove" ? event.touches[0].clientX : event.clientX;
    const clientY =
      event.type === "touchmove" ? event.touches[0].clientY : event.clientY;
    const updatedData = draggableData.map((data) => {
      if (data.id === id && data.isDragging) {
        const offsetX = clientX - data.dragStartPosition.x;
        const offsetY = clientY - data.dragStartPosition.y;
        return {
          ...data,
          position: {
            x: data.position.x + offsetX,
            y: data.position.y + offsetY,
          },
          dragStartPosition: { x: clientX, y: clientY },
        };
      }
      return data;
    });
    setDraggableData(updatedData);
  };

  const handleInputChange = (event, id) => {
    const value = event.target.value;
    const updatedData = draggableData.map((data) => {
      if (data.id === id) {
        return { ...data, value };
      }
      return data;
    });
    setDraggableData(updatedData);
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
      textColor: "#FFFFFF",
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
      })
    }
  };

  const handleHeightChange = (event, id) => {
    const heightInput = event.target.value;
    const height = parseInt(heightInput, 10);

    if(!isNaN(height)){
       const validationResult = dimensionSchema.safeParse(height);

      if (validationResult.success) {
        const updatedData = draggableData.map((data) => {
          if (data.id === id) {
            return { ...data, height };
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
      })
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
        <div className="relative h-full grid grid-cols-2 justify-around">
          <div>
            {previewImage && (
              <div
                className="mx-auto overflow-hidden relative w-[300px] h-[300px]"
                ref={containerRef}
              >
                <canvas
                  ref={canvasRef}
                  // style={{ width: "100%", height: "100%"}}
                  className="bg-black/50 h-full w-full "
                />
                {draggableData.map((data) => (
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
                    <input
                      type="text"
                      value={data.value}
                      className="select-none"
                      style={{
                        margin: 0,
                        color: `${data.textColor}`,
                        background: "rgba(0, 0, 0, 0.5)",
                        width: `${data.width}px`,
                        height: `${data.height}px`,
                        padding: "4px 8px",
                        border: "none",
                      }}
                      readOnly
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          
            {previewImage && (
              <div className="absolute overflow-y-auto px-4 right-0 pt-2 border-l-[1px] border-border h-full bg-panels">
              <div className="mx-auto">
                <div className="flex items-center">
                  <RiImageAddFill className="mr-2" />
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={handleAddField}
                  >
                    Add Field
                  </button>
                </div>

                <Table>
                    {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                    <TableHeader>
                <TableRow  className="text-xs">
                  <TableHead className="w-[50px]">Title</TableHead>
                  <TableHead className="w-[90px]">Width</TableHead>
                  <TableHead className="w-[90px]"> Height</TableHead>
                  <TableHead className="w-[15px] text-right">Reset</TableHead>
                  <TableHead className="w-[15px] text-right">Delete</TableHead>
                  <TableHead className="w-[15px] text-right">Color</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              
                {draggableData.map((data) => (

                  


                  <TableRow className=" text-black" key={data.id}>
                    

                   <TableCell className="w-[195px]">
                    <input
                      type="text"
                      value={data.value}
                      onChange={(event) => handleInputChange(event, data.id)}
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
                        onChange={(event) => handleWidthChange(event, data.id)}
                        className="px-2 border rounded-md"
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
                          <span className="text-white text-[8px]">▲</span>
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

                            }
                            else {
                              toast({
                                title: "Invalid Width",
                                description: "Width cannot be less than 1",
                              });
                            }
                          }}
                        >

                          <span className="text-white text-[8px]">▼</span>
                        </button>
                      </div>
                    </div>
                    </TableCell>
                    {/* <span className="text-xs mx-2 justify-center m-auto">
                      Width{" "}
                    </span> */}

                < TableCell>
                    <div className="flex">
                      <input
                        type="text"
                        value={data.height}
                        onChange={(event) => handleHeightChange(event, data.id)}
                        className="px-2 border rounded-md"
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
                          <span className="text-white text-[8px]">▲</span>
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
                            } 
                            else {
                              toast({
                                title: "Invalid Height",
                                description: "Height cannot be less than 1",
                              });
                            }
                          }}
                        >
                          <span className="text-white text-[8px]">▼</span>
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
              <AiOutlineDelete 
              className="text-white"
              />
             
            </button>
                    </TableCell>

                    <TableCell>
                      <Dialog>
                      <DialogTrigger>
                        <BiColorFill
                      className="text-white mx-auto"
                      />
                      </DialogTrigger>
                      <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Color Picker</DialogTitle>
                        </DialogHeader>
                        <SketchPicker />
                        {/*  color={data.textColor} onChange={handleChange} */}
                      </DialogContent>
                      </Dialog>
                    </TableCell>
                    
                  </TableRow>
                  

                
                ))}
                </TableBody>
                  </Table>

                <button className="px-4 py-2 mx-2 bg-blue-500 text-white rounded-md">
                  Save
                </button>
              </div>
              </div>
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
