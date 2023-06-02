import React, { useState, useRef, useEffect } from "react";
import { BsUpload } from "react-icons/bs";
import { RiImageAddFill } from "react-icons/ri";
import { GrPowerReset } from "react-icons/gr";

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
  const [date, setDate] = useState("");
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [draggableData, setDraggableData] = useState([
    {
      id: "title",
      value: "Title",
      position: { x: 0, y: 0 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      width: 100,
      height: 20,
    },
    {
      id: "date",
      value: "",
      position: { x: 0, y: 35 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      width: 100,
      height: 20,
    },
    {
      id: "link",
      value: "Link",
      position: { x: 0, y: 70 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
      width: 100,
      height: 20,
    },
  ]);

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

  const calculateImageOffset = () => {
    const containerElement = containerRef.current;
    const containerRect = containerElement.getBoundingClientRect();
    const imageRect = canvasRef.current.getBoundingClientRect();

    const offsetX = imageRect.left - containerRect.left;
    setOffset({ x: offsetX, y: offsetY });
    const offsetY = imageRect.top - containerRect.top;

    console.log("Image Offset:", offsetX, offsetY);
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
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
    const newField = {
      id: newFieldId,
      value: "New Field",
      position: { x: 0, y: 0 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
    };
    setDraggableData((prevData) => [...prevData, newField]);
  };

  const handleWidthChange = (event, id) => {
    const width = event.target.value;
    const updatedData = draggableData.map((data) => {
      if (data.id === id) {
        return { ...data, width };
      }
      return data;
    });
    setDraggableData(updatedData);
  };

  const handleHeightChange = (event, id) => {
    const height = event.target.value;
    const updatedData = draggableData.map((data) => {
      if (data.id === id) {
        return { ...data, height };
      }
      return data;
    });
    setDraggableData(updatedData);
  };

  return (
    <div className="relative bg-blank h-screen">
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
      <div className={`bg-blank h-full text-sm text-white`}>
        <div className="relative h-full grid grid-cols-2 justify-around">
          <div>
            {previewImage && (
              <div
                className="mx-auto overflow-hidden relative w-[300px] h-[300px]"
                ref={containerRef}
              >
                <canvas
                  ref={canvasRef}
                  style={{ width: "100%", height: "100%" }}
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
                        color: "white",
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

          <div className="absolute px-4 right-0 pt-2 border-l-[1px] border-border h-full bg-panels">
            {previewImage && (
              <div className="mx-auto h-full">
                <div className="flex items-center">
                  <RiImageAddFill className="mr-2" />
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={handleAddField}
                  >
                    Add Field
                  </button>
                </div>
                {draggableData.map((data) => (
                  <div className="my-2 flex" key={data.id}>
                    <button
                      className="border-2 border-blue-500 rounded-md h-fit text-center my-auto mr-2 text-blue-500 hover:bg-blue-500 hover:text-white"
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
                      <GrPowerReset fontSize="1rem" className="m-auto" />
                    </button>
                    <input
                      type="text"
                      value={data.value}
                      onChange={(event) => handleInputChange(event, data.id)}
                      className="px-2 py-1 border rounded-md"
                    />
                    <span className="text-sm mx-2 min-w-[60px]">
                      ({data.position.x}, {data.position.y})
                    </span>
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
                          className="px-2 border rounded-md text-blue-500"
                          onClick={() => {
                            const newValue = parseInt(data.width) + 1;
                            handleWidthChange(
                              { target: { value: newValue } },
                              data.id
                            );
                          }}
                        >
                          ▲
                        </button>

                        <button
                          className="px-2 border rounded-md text-blue-500"
                          onClick={() => {
                            const newValue = parseInt(data.width) - 1;
                            handleWidthChange(
                              { target: { value: newValue } },
                              data.id
                            );
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <span className="text-sm mx-2 justify-center m-auto">
                      Width{" "}
                    </span>
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
                          className="px-2 border rounded-md text-blue-500"
                          onClick={() => {
                            const newValue = parseInt(data.height) + 1;
                            handleHeightChange(
                              { target: { value: newValue } },
                              data.id
                            );
                          }}
                        >
                          ▲
                        </button>

                        <button
                          className="px-2 border rounded-md text-blue-500"
                          onClick={() => {
                            const newValue = parseInt(data.height) - 1;
                            handleHeightChange(
                              { target: { value: newValue } },
                              data.id
                            );
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <span className="text-sm mx-2 justify-center m-auto">
                      Height{" "}
                    </span>
                  </div>
                ))}

                <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        {previewImage && (
          <div className="bg-panels py-[2px] text-xs flex border-t-[1px] border-border">
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
