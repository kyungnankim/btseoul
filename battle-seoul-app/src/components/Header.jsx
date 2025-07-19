import React, { useState } from "react";
import { Menu, X, Plus, User, ChevronDown } from "lucide-react";

const Header = ({
  user,
  onLogout,
  onCreateBattle,
  currentPage,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({
    about: false,
    magazine: false,
    entertainment: false,
  });

  const isActive = (path) => currentPage === path;

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
    <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate("/")} className="flex items-center">
            <h1 className="text-2xl font-bold">
              <span className="text-pink-500">Battle</span> Seoul
            </h1>
          </button>

          {/* Desktop Navigation */}
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
                  className={`flex items-center gap-1 text-gray-300 hover:text-pink-400 transition-colors py-6 ${
                    isActive(item.path) ? "text-pink-400" : ""
                  }`}
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Dropdown Menu */}
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
                    className="absolute top-full left-0 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2 min-w-[200px]"
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

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Create Battle Button */}
            <button
              onClick={onCreateBattle}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              게시물 업로드
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="hidden md:inline">
                  {user?.name || "사용자"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* User Dropdown */}
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
                  onClick={() => onNavigate(item.path)}
                  className="block w-full text-left py-2 text-gray-300 hover:text-pink-400 transition-colors"
                >
                  {item.label}
                </button>
                {item.subItems && (
                  <div className="ml-4 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.path}
                        onClick={() => {
                          onNavigate(subItem.path);
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left py-1 text-sm text-gray-400 hover:text-pink-400 transition-colors"
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => {
                onCreateBattle();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors mt-4"
            >
              <Plus className="w-4 h-4" />
              게시물 업로드
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
