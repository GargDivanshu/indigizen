import * as React from 'react';
import './App.css';
import UploadPhoto from './components/UploadPhoto';

const App: React.FC = () => {
  return (
    <div className="bg-blank h-screen">
      <div className="pt-3 w-full bg-panels">
      <h1 className="text-center text-3xl text-blue-500 font-bold ">Upload Photo and Preview</h1>
      <UploadPhoto />
      </div>
    </div>
  );
}

export default App;
