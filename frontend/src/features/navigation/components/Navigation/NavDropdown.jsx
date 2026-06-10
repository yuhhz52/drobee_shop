import React from 'react';
import { Link } from 'react-router-dom';

const getDropdownModifier = (menu) => {
  switch (menu.label) {
    case 'Electric Scooters':
      return 'horizon-dropdown--2col';
    case 'Minimotors':
      return 'horizon-dropdown--mega';
    case 'Kukirin':
      return 'horizon-dropdown--2col';
    case 'Teverun':
      return 'horizon-dropdown--1col horizon-dropdown--wide-col';
    case 'Contact':
      return 'horizon-dropdown--1col horizon-dropdown--align-right';
    default:
      return 'horizon-dropdown--1col';
  }
};

const NavDropdown = ({ menu, onNavigate }) => {
  if (!menu.columns?.length) return null;

  return (
    <div
      className={`horizon-dropdown ${getDropdownModifier(menu)}`}
      role="menu"
    >
      <div className="horizon-dropdown__inner">
        {menu.columns.map((column, colIndex) => (
          <div key={column.key || column.title || colIndex} className="horizon-dropdown__col">
            {column.title && (
              <Link
                to={column.to || menu.to}
                className="horizon-dropdown__heading"
                onClick={onNavigate}
              >
                {column.title}
              </Link>
            )}
            <ul>
              {column.links?.map((link) => (
                <li key={link.key || link.label}>
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
