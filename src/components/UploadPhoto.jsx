import React, { useState, useEffect } from 'react';

const UploadPhoto = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: null, height: null });

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.src = reader.result;
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 300;
          canvas.height = 300;
          ctx.drawImage(image, 0, 0, 300, 300);

          const resizedImageURL = canvas.toDataURL('image/jpeg');
          const width = 300;
          const height = 300;
          const widthInMillimeters = (width * 25.4) / 300;
          const heightInMillimeters = (height * 25.4) / 300;

          setImageDimensions({ width, height, widthInMillimeters, heightInMillimeters });
          setPreviewImage(resizedImageURL);
        };
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [selectedFile]);

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
    </div>
  );
};

export default UploadPhoto;
