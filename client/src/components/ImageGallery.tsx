import { useState } from 'react'

interface Screenshot {
  src: string
  caption: string
}

interface ImageGalleryProps {
  screenshots: Screenshot[]
  imageDimensions?: { width: number; height: number }
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  screenshots,
  imageDimensions = { width: 400, height: 400 },
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <>
      {/* Grid Gallery */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {screenshots.map((shot, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(shot.src)}
            className="rounded-xl shadow-lg overflow-hidden flex flex-col text-left focus:outline-hidden transform transition-transform duration-300 hover:scale-105 hover:cursor-pointer"
          >
            <img
              src={shot.src}
              alt={shot.caption}
              width={imageDimensions.width}
              height={imageDimensions.height}
              className="h-auto w-full object-cover"
            />
            <p className="p-3 text-sm text-gray-700 font-medium">{shot.caption}</p>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative mx-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Expanded screenshot"
              width={imageDimensions.width * 1.5}
              height={imageDimensions.height * 1.5}
              className="rounded-lg object-contain max-h-[90vh] max-w-[90vw]"
            />
            <button
              className="absolute top-4 right-4 cursor-pointer text-white text-3xl hover:text-red-500 focus:outline-hidden"
              onClick={() => setSelectedImage(null)}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
