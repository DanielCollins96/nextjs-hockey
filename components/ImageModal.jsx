import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";

export function useImageModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const openModal = useCallback((src, alt = "") => {
    setImageSrc(src);
    setImageAlt(alt);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, imageSrc, imageAlt, openModal, closeModal };
}

export default function ImageModal({ isOpen, onClose, src, alt = "" }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-6 sm:p-10 cursor-zoom-out"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 text-white hover:text-gray-300 transition-colors z-50"
        aria-label="Close modal"
      >
        <FaTimes size={28} />
      </button>

      <div
        className="relative w-[72vw] h-[62vh] sm:w-[80vw] sm:h-[75vh] max-w-3xl max-h-3xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          unoptimized
          priority
        />
      </div>

      {alt && (
        <p className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-lg font-medium bg-black bg-opacity-50 px-4 py-2 rounded">
          {alt}
        </p>
      )}
    </div>
  );
}

export function ClickableImage({ src, alt, className, containerClassName, width, height }) {
  const { isOpen, openModal, closeModal } = useImageModal();

  return (
    <>
      <div
        className={`cursor-pointer hover:opacity-80 transition-opacity ${containerClassName || ""}`}
        onClick={() => openModal(src, alt)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            openModal(src, alt);
          }
        }}
      >
        {width && height ? (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            unoptimized
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={alt}
              fill
              className={className || "object-contain"}
              unoptimized
            />
          </div>
        )}
      </div>
      <ImageModal isOpen={isOpen} onClose={closeModal} src={src} alt={alt} />
    </>
  );
}
