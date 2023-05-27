
import './App.css';
import UploadPhoto from './components/UploadPhoto';

function App() {
  return (
    <div className="p-6">
      <div className="max-w-[1260px] mx-auto">
      <h1 className="text-center text-3xl text-blue-500 font-bold">Upload Photo and Preview</h1>
      <UploadPhoto />
      </div>
    </div>
  );
}

export default App;
