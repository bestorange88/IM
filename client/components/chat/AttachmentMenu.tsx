import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image, File } from "lucide-react";

interface AttachmentMenuProps {
  onFileSelect: (file: File) => void;
  onClose: () => void;
}

export default function AttachmentMenu({ onFileSelect, onClose }: AttachmentMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (type: 'image' | 'file') => {
    if (type === 'image') {
      imageInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleCamera = () => {
    // TODO: Implement camera capture
    console.log("Camera capture not implemented yet");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onClose} />
      <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg border max-w-md mx-auto z-40">
        <div className="grid grid-cols-3 gap-4 p-4">
          <Button
            variant="ghost"
            className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
            onClick={handleCamera}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-gray-700">拍照</span>
          </Button>
          
          <Button
            variant="ghost"
            className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
            onClick={() => handleFileSelect('image')}
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Image className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-gray-700">相册</span>
          </Button>
          
          <Button
            variant="ghost"
            className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
            onClick={() => handleFileSelect('file')}
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <File className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-gray-700">文件</span>
          </Button>
        </div>
      </div>
      
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}