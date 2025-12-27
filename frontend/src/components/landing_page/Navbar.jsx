import React, { useState } from 'react';
import {
  NavbarButton,
  NavbarLogo,
  NavBody,
  NavItems,
  Navbar,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu
} from '../ui/NavbarComponents';

const Navbar2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { name: 'Home', link: '#' },
    { name: 'About', link: '#' },
    { name: 'Services', link: '#' },
    { name: 'Contact', link: '#' }
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="secondary">Login</NavbarButton>
            <NavbarButton variant="primary">Book a call</NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle />
          </MobileNavHeader>

          <MobileNavMenu>
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton variant="primary" className="w-full">
                Login
              </NavbarButton>
              <NavbarButton variant="primary" className="w-full">
                Book a call
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Navbar */}
    </div>
  );
};

export default Navbar2;
