import React from 'react';
import { Link } from 'react-router-dom';

const LAYOUT_MAP = {
  mega: 'horizon-dropdown--mega',
  '2col': 'horizon-dropdown--2col',
  'wide-col': 'horizon-dropdown--1col horizon-dropdown--wide-col',
  'align-right': 'horizon-dropdown--1col horizon-dropdown--align-right',
};

const getDropdownModifier = (menu) => {
  if (menu?.layout) {
    return LAYOUT_MAP[menu.layout] ?? 'horizon-dropdown--1col';
  }
  return 'horizon-dropdown--1col';
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
