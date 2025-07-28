// 3. pages/About.jsx - About 페이지
import React from "react";
import { Routes, Route } from "react-router-dom";

const Introduction = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <h1 className="text-4xl font-bold text-white mb-8">
      What is Battle Seoul?
    </h1>
    <div className="prose prose-invert max-w-none">
      <p className="text-lg text-gray-300 leading-relaxed">
        Battle Seoul은 트렌드 시뮬레이션을 통해 음악, 음식, 패션 등 서울 내 문화
        트렌드를 예측하고 다양한 서울의 라이프스타일을 여러분과 함께 만들어
        갑니다.
      </p>
    </div>
  </div>
);

const Mayor = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <h1 className="text-4xl font-bold text-white mb-8">Mayor</h1>
    <div className="bg-gray-800/50 rounded-2xl p-8">
      <div className="flex items-center gap-6">
        <img
          src="/images/default.jpg"
          alt="Mayor"
          className="w-48 h-48 rounded-lg object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold mb-2">Mayor Name</h2>
          <p className="text-gray-400 mb-4">시장의 한마디</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Past</p>
            <ul className="list-disc list-inside text-gray-300">
              <li>시장의 과거 명예들</li>
              <li>MICO 회사 소개</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const History = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <h1 className="text-4xl font-bold text-white mb-8">History</h1>
    <div className="space-y-6">
      {[
        { year: "2025", event: "Mc mrrr 시장 취임" },
        { year: "2024", event: "Battle Seoul 리뉴얼" },
        { year: "2023", event: "Battle Seoul 런칭" },
        { year: "2022", event: "Battle Seoul 개발" },
      ].map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-24 text-2xl font-bold text-pink-500">
            {item.year}
          </div>
          <div className="flex-1 h-px bg-gray-700"></div>
          <div className="text-gray-300">{item.event}</div>
        </div>
      ))}
    </div>
  </div>
);

const About = () => (
  <Routes>
    <Route path="introduction" element={<Introduction />} />
    <Route path="mayor" element={<Mayor />} />
    <Route path="history" element={<History />} />
    <Route index element={<Introduction />} />
  </Routes>
);

export default About;
