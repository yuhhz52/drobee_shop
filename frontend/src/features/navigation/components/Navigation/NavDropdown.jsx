import React from 'react';
import { Link } from 'react-router-dom';

const getDropdownModifier = (menu) => {
  switch (menu.label) {
    case 'Electric Scooters':
      return 'vepace-dropdown--2col';
    case 'Minimotors':
      return 'vepace-dropdown--mega';
    case 'Kukirin':
      return 'vepace-dropdown--2col';
    case 'Teverun':
      return 'vepace-dropdown--1col vepace-dropdown--wide-col';
    case 'Contact':
      return 'vepace-dropdown--1col vepace-dropdown--align-right';
    default:
      return 'vepace-dropdown--1col';
  }
};

const NavDropdown = ({ menu, onNavigate }) => {
  if (!menu.columns?.length) return null;

  return (
    <div
      className={`vepace-dropdown ${getDropdownModifier(menu)}`}
      role="menu"
    >
      <div className="vepace-dropdown__inner">
        {menu.columns.map((column, colIndex) => (
          <div key={column.title || colIndex} className="vepace-dropdown__col">
            {column.title && (
              <Link
                to={column.to || menu.to}
                className="vepace-dropdown__heading"
                onClick={onNavigate}
              >
                {column.title}
              </Link>
            )}
            <ul>
              {column.links?.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} onClick={onNavigate}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavDropdown;
