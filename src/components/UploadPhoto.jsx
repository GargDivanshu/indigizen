import React, { useState, useRef } from "react";
import { BsUpload } from "react-icons/bs";
import { RiImageAddFill } from "react-icons/ri";

const UploadPhoto = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: null,
    height: null,
  });
  const [originalImage, setOriginalImage] = useState({
    width: null,
    height: null,
  });

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

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);

      const image = new Image();
      image.src = reader.result;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, 300, 300);
        const resizedImageURL = canvas.toDataURL("image/jpeg");

        const width = image.width;
        const height = image.height;

        const widthInMillimeters = (width * 25.4) / 300;
        const heightInMillimeters = (height * 25.4) / 300;
        setImageDimensions({
          width: 300,
          height: 300,
          widthInMillimeters,
          heightInMillimeters,
        });
        setPreviewImage(resizedImageURL);
        setOriginalImage({ width, height });

        const currentDate = getCurrentDate();
        const updatedData = draggableData.map((data) => {
          if (data.id === "date") {
            return { ...data, value: currentDate };
          }
          return data;
        });
        setDraggableData(updatedData);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (event, id) => {
    if (event.button === 0) {
      event.stopPropagation();
      const updatedData = draggableData.map((data) => {
        if (data.id === id) {
          return {
            ...data,
            isDragging: true,
            dragStartPosition: { x: event.clientX, y: event.clientY },
          };
        }
        return data;
      });
      setDraggableData(updatedData);
    }
  };

  const handleMouseUp = (event, id) => {
    if (event.button === 0) {
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
    const updatedData = draggableData.map((data) => {
      if (data.id === id && data.isDragging) {
        const offsetX = event.clientX - data.dragStartPosition.x;
        const offsetY = event.clientY - data.dragStartPosition.y;
        return {
          ...data,
          position: {
            x: data.position.x + offsetX,
            y: data.position.y + offsetY,
          },
          dragStartPosition: { x: event.clientX, y: event.clientY },
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

  const getCurrentDate = () => {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear().toString().substr(-2);
    return `${day}-${month}-${year}`;
  };

  return (
    <div>
     

<input
  type="file"
  className="hidden"
  id="uploadInput"
  onChange={handleFileInputChange}
/>

<label htmlFor="uploadInput" className="flex mx-auto w-fit my-8 items-center px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer">
  <BsUpload className="mr-2" />
  Upload File
</label>
<div className="grid md:grid-cols-2 sm:grid-cols-1 justify-center my-5">
      {previewImage && (
        <div
          className="mx-auto overflow-hidden relative w-[300px] h-[300px]"
          ref={containerRef}
        >
          <img
            src={previewImage}
            alt="Preview"
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
        <form className=" my-5 flex flex-col w-fit h-fit p-3 m-3 mx-auto bg-blue-500 rounded-md my-auto">
          <span className="text-white my-3">Make changes here</span>
          <label>
            <span className="text-xl font-semibold text-white">Title:</span>
            <input
              type="text"
              className="bg-blue-500 text-white mx-2 border-emphasis outline-none"
              value={draggableData.find((data) => data.id === "title").value}
              onChange={(event) => handleInputChange(event, "title")}
            />
          </label>
          <br />
          <label>
            <span className="text-xl font-semibold text-white">Date:</span>
            <input
              className="bg-blue-500  text-white mx-2 border-emphasis outline-none"
              type="text"
              value={draggableData.find((data) => data.id === "date").value}
              onChange={(event) => handleInputChange(event, "date")}
            />
          </label>
          <br />
          <label>
            <span className="text-xl font-semibold text-white">Link:</span>
            <input
              className="bg-blue-500  text-white mx-2 border-emphasis outline-none"
              type="text"
              value={draggableData.find((data) => data.id === "link").value}
              onChange={(event) => handleInputChange(event, "link")}
            />
          </label>
        </form>
      )}

</div>
    </div>
  );
};

export default UploadPhoto;
