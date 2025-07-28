// src/components/MediaPlayerModal.jsx

import React, { useEffect, useRef } from "react";
import { X, ExternalLink, Youtube, Instagram } from "lucide-react";

const MediaPlayerModal = ({ isOpen, onClose, contentData }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !contentData) return null;

  const {
    contentType,
    title,
    description,
    youtubeId,
    youtubeUrl,
    instagramUrl,
    creatorName,
  } = contentData;

  const renderYouTubePlayer = () => {
    if (!youtubeId) return null;

    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  };

  const renderInstagramEmbed = () => {
    if (!instagramUrl) return null;

    // Instagram 임베드 URL 생성
    const embedUrl = `${instagramUrl}embed/`;

    return (
      <div className="relative w-full max-w-md mx-auto">
        <iframe
          src={embedUrl}
          className="w-full h-[600px] border-none"
          frameBorder="0"
          scrolling="no"
          allowTransparency="true"
          title={title}
        />
      </div>
    );
  };

  const renderImageViewer = () => {
    return (
      <div className="relative w-full max-w-4xl mx-auto">
        <img
          src={contentData.imageUrl}
          alt={title}
          className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
        />
      </div>
    );
  };

  const getContentIcon = () => {
    switch (contentType) {
      case "youtube":
        return <Youtube className="w-5 h-5 text-red-500" />;
      case "instagram":
        return <Instagram className="w-5 h-5 text-pink-500" />;
      default:
        return null;
    }
  };

  const getOriginalLink = () => {
    switch (contentType) {
      case "youtube":
        return youtubeUrl;
      case "instagram":
        return instagramUrl;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {getContentIcon()}
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              {creatorName && (
                <p className="text-sm text-gray-400">by {creatorName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 원본 링크로 이동 버튼 */}
            {getOriginalLink() && (
              <a
                href={getOriginalLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                title="원본 링크에서 보기"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}

            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 미디어 콘텐츠 */}
        <div className="p-6">
          {contentType === "youtube" && renderYouTubePlayer()}
          {contentType === "instagram" && renderInstagramEmbed()}
          {contentType === "image" && renderImageViewer()}

          {/* 설명 */}
          {description && (
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">설명</h3>
              <p className="text-gray-400 leading-relaxed">{description}</p>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="mt-6 flex justify-center gap-4">
            {getOriginalLink() && (
              <a
                href={getOriginalLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {getContentIcon()}
                원본에서 보기
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayerModal;
