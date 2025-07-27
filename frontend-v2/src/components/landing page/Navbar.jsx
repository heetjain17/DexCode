// import { Link } from '@tanstack/react-router';
// import React from 'react';
// import { Button } from '@/components/ui/button';

// const Navbar = () => {
//   const links = [
//     {
//       title: 'About',
//       href: '#'
//     },
//     {
//       title: 'Pricing',
//       href: '#'
//     },
//     {
//       title: 'Playlists',
//       href: '#'
//     }
//   ];
//   return (
//     <nav className="max-w-7xl px-12 py-4 m-auto select-none">
//       <div className="flex justify-between items-center">
//         <div
//           style={{ fontFamily: 'logo-font' }}
//           className="text-4xl font-normal text-neutral-300"
//         >
//           <Link to="/">
// <span className="text-red-700">DEX</span>CODE
//           </Link>
//         </div>
//         <div className="flex gap-5 items-center">
//           {links.map(link => (
//             <Link
//               key={link.title}
//               to={link.href}
//               className=" text-neutral-200 text-xl transition duration-200 ease-out hover:text-neutral-300 active:text-neutral-400"
//             >
//               {link.title}
//             </Link>
//           ))}
//           <Button className="text-xl bg-red-500 transition duration-200 ease-out hover:bg-red-600 active:bg-red-700 text-neutral-200 py-2">
//             <Link to={"/login"}>

//             Login
//             </Link>
//           </Button>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

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
