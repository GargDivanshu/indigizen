// const handleMouseDown = (event, id) => {
//     if (event.button === 0 || event.type === "touchstart") {
//       event.stopPropagation();
//       const clientX =
//         event.type === "touchstart" ? event.touches[0].clientX : event.clientX;
//       const clientY =
//         event.type === "touchstart" ? event.touches[0].clientY : event.clientY;
//       const updatedData = draggableData.map((data) => {
//         if (data.id === id) {
//           return {
//             ...data,
//             isDragging: true,
//             dragStartPosition: { x: clientX, y: clientY },
//           };
//         }
//         return data;
//       });
//       setDraggableData(updatedData);
//     }
//   };

//   const handleMouseUp = (event, id) => {
//     if (event.button === 0 || event.type === "touchend") {
//       event.stopPropagation();
//       const updatedData = draggableData.map((data) => {
//         if (data.id === id) {
//           return { ...data, isDragging: false };
//         }
//         return data;
//       });
//       setDraggableData(updatedData);
//     }
//   };

//   const handleMouseMove = (event, id) => {
//     const clientX =
//       event.type === "touchmove" ? event.touches[0].clientX : event.clientX;
//     const clientY =
//       event.type === "touchmove" ? event.touches[0].clientY : event.clientY;
//     const updatedData = draggableData.map((data) => {
//       if (data.id === id && data.isDragging) {
//         const offsetX = clientX - data.dragStartPosition.x;
//         const offsetY = clientY - data.dragStartPosition.y;
//         return {
//           ...data,
//           position: {
//             x: data.position.x + offsetX,
//             y: data.position.y + offsetY,
//           },
//           dragStartPosition: { x: clientX, y: clientY },
//         };
//       }
//       return data;
//     });
//     setDraggableData(updatedData);
//   };