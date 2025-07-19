import React, { useState } from "react";
import { Upload, X, Image, Music, Shirt, Pizza } from "lucide-react";

const ContentUpload = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "music",
    description: "",
    thumbnail: null,
    contentUrl: "",
    vsTitle: "", // VS 대상 제목
    vsContentUrl: "", // VS 대상 URL
  });

  const [uploadStep, setUploadStep] = useState(1); // 1: 첫번째 콘텐츠, 2: VS 콘텐츠

  const categories = [
    { value: "music", label: "Music", icon: Music, color: "pink" },
    { value: "fashion", label: "Fashion", icon: Shirt, color: "purple" },
    { value: "food", label: "Food", icon: Pizza, color: "orange" },
  ];

  const handleImageUpload = (side) => {
    // 실제 구현시 파일 업로드 로직
    console.log(`${side} 이미지 업로드`);
  };

  const handleSubmit = () => {
    if (formData.title && formData.vsTitle && formData.description) {
      onSubmit({
        ...formData,
        createdAt: new Date().toISOString(),
        leftVotes: 0,
        rightVotes: 0,
        comments: [],
        likes: 0,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              게시물 업로드드
            </h2>
            <p className="text-gray-400">게시물을 업로드 해주세요.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 카테고리 선택 */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-3 block">
              카테고리 선택
            </label>
            <div className="grid grid-cols-3 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() =>
                      setFormData({ ...formData, category: cat.value })
                    }
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.category === cat.value
                        ? `border-${cat.color}-500 bg-${cat.color}-500/20 text-white`
                        : "border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VS 콘텐츠 입력 */}
          <div className="grid md:grid gap-12">
            {/* 왼쪽 콘텐츠 */}
            <div className="">
              <h3 className="text-lg font-semibold text-white">
                첫 번째 콘텐츠
              </h3>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="콘텐츠 제목"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  썸네일
                </label>
                <div
                  onClick={() => handleImageUpload("left")}
                  className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-pink-500 transition-colors cursor-pointer bg-gray-800/50"
                >
                  <Image className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">이미지 업로드</p>
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  콘텐츠 URL
                </label>
                <input
                  type="text"
                  value={formData.contentUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, contentUrl: e.target.value })
                  }
                  placeholder="YouTube, Spotify 링크"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 배틀 설명 */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="어떤 배틀인지 설명해주세요. 투표 기준이나 특별한 의미가 있다면 알려주세요."
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none resize-none"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !formData.title || !formData.vsTitle || !formData.description
              }
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              게시물 업로드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentUpload;
