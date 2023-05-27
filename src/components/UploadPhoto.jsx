import React, { useState } from 'react';

const UploadPhoto = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: null, height: null });
  const [originalImage, setOriginalImage] = useState({ width: null, height: null });

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    // Create a preview URL for the selected image
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);

      // Create an image element to get the dimensions and resize the image
      const image = new Image();
      image.src = reader.result;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, 300, 300);
        const resizedImageURL = canvas.toDataURL('image/jpeg');

        const width = image.width;
        const height = image.height;
        // Calculate the dimensions in millimeters (assuming 300 DPI resolution)
        const widthInMillimeters = (width * 25.4) / 300;
        const heightInMillimeters = (height * 25.4) / 300;
        setImageDimensions({ width: 300, height: 300, widthInMillimeters, heightInMillimeters });
        setPreviewImage(resizedImageURL);
        setOriginalImage({ width, height });
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileInputChange} />
      {previewImage && <img src={previewImage} alt="Preview" style={{ width: '300px' }} />}
      {imageDimensions.width && (
        <div>
          <p>Dimensions (pixels): {imageDimensions.width} x {imageDimensions.height}</p>
          <p>Dimensions (millimeters): {imageDimensions.widthInMillimeters} x {imageDimensions.heightInMillimeters}</p>
        </div>
      )}
      {originalImage.width && (
        <div>
          <p>Original Image Dimensions (pixels): {originalImage.width} x {originalImage.height}</p>
        </div>
      )}
    </div>
  );
};

export default UploadPhoto;
