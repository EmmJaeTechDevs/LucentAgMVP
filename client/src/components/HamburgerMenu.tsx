import React, { useState, useRef, useEffect } from "react";
import { Menu, X, Settings, Package, Users } from "lucide-react";
import { Link } from "wouter";

interface HamburgerMenuProps {
  userType?: "buyer" | "farmer";
}

export function HamburgerMenu({ userType = "buyer" }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = userType === "buyer" ? [
    {
      icon: Settings,
      label: "Settings",
      href: "/buyer-profile",
      testId: "menu-settings"
    },
    {
      icon: Package,
      label: "My Orders",
      href: "/buyer-orders",
      testId: "menu-orders"
    },
    {
      icon: Users,
      label: "Communities",
      href: "/communities",
      testId: "menu-communities"
    }
  ] : [
    {
      icon: Settings,
      label: "Settings",
      href: "/farmer-profile",
      testId: "menu-settings"
    },
    {
      icon: Package,
      label: "My Orders",
      href: "/check-orders",
      testId: "menu-orders"
    },
    {
      icon: Users,
      label: "Communities",
      href: "/communities",
      testId: "menu-communities"
    }
  ];

  return (
    <>
      <div className="relative">
        {/* Hamburger Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          data-testid="hamburger-button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            data-testid="hamburger-menu"
          >
            <div className="py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    data-testid={item.testId}
                  >
                    <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {item.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}