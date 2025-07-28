import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Plus, User, ChevronDown, Sword } from "lucide-react";

const Header = ({ user, onLogout, onCreateBattle, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({
    about: false,
    magazine: false,
    entertainment: false,
  });

  const menuItems = [
    {
      label: "About",
      path: "/about",
      hasDropdown: true,
      dropdownKey: "about",
      subItems: [
        { label: "Introduction", path: "/about/introduction" },
        { label: "Mayor", path: "/about/mayor" },
        { label: "History", path: "/about/history" },
      ],
    },
    {
      label: "Culture Magazine",
      path: "/magazine",
      hasDropdown: true,
      dropdownKey: "magazine",
      subItems: [
        { label: "Hot", path: "/magazine/hot" },
        { label: "Best", path: "/magazine/best" },
        { label: "Application", path: "/magazine/application" },
      ],
    },
    {
      label: "Entertainment",
      path: "/entertainment",
      hasDropdown: true,
      dropdownKey: "entertainment",
      subItems: [
        { label: "Artist", path: "/entertainment/artist" },
        { label: "Game", path: "/entertainment/game" },
        { label: "SVC", path: "/entertainment/svc" },
      ],
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate("/")}
            className="flex-shrink-0 flex items-center"
          >
            <h1 className="text-2xl font-bold text-white">
              <span className="text-pink-500">Battle</span> Seoul
            </h1>
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <div key={item.label} className="relative">
                <button
                  onMouseEnter={() =>
                    item.hasDropdown &&
                    setDropdownOpen({
                      ...dropdownOpen,
                      [item.dropdownKey]: true,
                    })
                  }
                  onMouseLeave={() =>
                    item.hasDropdown &&
                    setDropdownOpen({
                      ...dropdownOpen,
                      [item.dropdownKey]: false,
                    })
                  }
                  onClick={() => onNavigate(item.path)}
                  className="flex items-center gap-1 text-gray-300 hover:text-pink-400 transition-colors"
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </button>
                {item.hasDropdown && dropdownOpen[item.dropdownKey] && (
                  <div
                    onMouseEnter={() =>
                      setDropdownOpen({
                        ...dropdownOpen,
                        [item.dropdownKey]: true,
                      })
                    }
                    onMouseLeave={() =>
                      setDropdownOpen({
                        ...dropdownOpen,
                        [item.dropdownKey]: false,
                      })
                    }
                    className="absolute top-full -left-4 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2 min-w-[200px]"
                  >
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.path}
                        onClick={() => onNavigate(subItem.path)}
                        className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* --- ⭐️ [수정] 로그인 상태에 따라 UI를 다르게 표시 --- */}
            {user ? (
              // --- 로그인 했을 때 보여줄 UI ---
              <>
                <Link to="/create-battle">
                  <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Sword className="w-4 h-4" />
                    배틀 만들기
                  </button>
                </Link>
                <button
                  onClick={onCreateBattle}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  콘텐츠 업로드
                </button>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-700">
                      <img
                        src={
                          user.photoURL ||
                          `https://ui-avatars.com/api/?name=${user.email}&background=random`
                        }
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="hidden md:inline font-semibold">
                      {user.displayName || user.email.split("@")[0]}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button
                      onClick={() => onNavigate("/mypage")}
                      className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      마이페이지
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // --- 로그아웃 상태일 때 보여줄 UI ---
              <button
                onClick={() => onNavigate("/login")}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold"
              >
                로그인
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 py-4 space-y-2">
            {menuItems.map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => {
                    onNavigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-lg text-gray-300 hover:text-pink-400 transition-colors"
                >
                  {item.label}
                </button>
              </div>
            ))}
            {user && (
              <div className="border-t border-gray-700 pt-4 mt-4 space-y-4">
                <Link to="/create-battle">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Sword className="w-4 h-4" />
                    배틀 만들기
                  </button>
                </Link>
                <button
                  onClick={() => {
                    onCreateBattle();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  콘텐츠 업로드
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
