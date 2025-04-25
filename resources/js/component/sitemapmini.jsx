import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react'; // npm install lucide-react
import '../../css/sitemapmini.css';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="breadcrumb-modern" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {item.link ? (
              <Link to={item.link}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <ChevronRight className="breadcrumb-separator" size={16} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
