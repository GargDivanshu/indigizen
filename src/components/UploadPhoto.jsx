import React, { useState, useRef, useEffect } from "react";
import { BsUpload } from "react-icons/bs";
import { RiImageAddFill } from "react-icons/ri";

const UploadPhoto = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [draggableData, setDraggableData] = useState([
    {
      id: "title",
      value: "Title",
      position: { x: 0, y: 0 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
    },
    {
      id: "date",
      value: "",
      position: { x: 0, y: 35 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
    },
    {
      id: "link",
      value: "Link",
      position: { x: 0, y: 70 },
      isDragging: false,
      dragStartPosition: { x: 0, y: 0 },
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
      };
    }
  }, [previewImage]);

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (event, id) => {
    if (event.button === 0 || event.type === "touchstart") {
      event.stopPropagation();
      const clientX = event.type === "touchstart" ? event.touches[0].clientX : event.clientX;
      const clientY = event.type === "touchstart" ? event.touches[0].clientY : event.clientY;
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
    const clientX = event.type === "touchmove" ? event.touches[0].clientX : event.clientX;
    const clientY = event.type === "touchmove" ? event.touches[0].clientY : event.clientY;
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

  return (
    <div>
      <input type="file" className="hidden" id="uploadInput" onChange={handleFileInputChange} />

      <label
        htmlFor="uploadInput"
        className="flex mx-auto w-fit my-8 items-center px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer"
      >
        <BsUpload className="mr-2" />
        Upload File
      </label>
      <div className="grid md:grid-cols-2 sm:grid-cols-1 justify-center my-5">
        {previewImage && (
          <div
            className="mx-auto overflow-hidden relative w-[300px] h-[300px]"
            ref={containerRef}
          >
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
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
                    padding: "4px 8px",
                    border: "none",
                  }}
                  readOnly
                />
              </div>
            ))}
          </div>
        )}

        {previewImage && (
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
            {draggableData.map((data) => (
              <div className="my-2" key={data.id}>
                <input
                  type="text"
                  value={data.value}
                  onChange={(event) => handleInputChange(event, data.id)}
                  className="px-2 py-1 border rounded-md"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPhoto;
