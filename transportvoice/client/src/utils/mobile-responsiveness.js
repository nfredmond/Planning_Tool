import React, { useState, useEffect } from 'react';

// ============== RESPONSIVE LAYOUT COMPONENTS ==============

/**
 * Responsive Container that adapts to different screen sizes
 */
export const ResponsiveContainer = ({ children, fluid = false, className = '', ...props }) => {
  return (
    <div 
      className={`responsive-container ${fluid ? 'fluid' : ''} ${className}`} 
      {...props}
    >
      {children}
      
      <style jsx>{`
        .responsive-container {
          width: 100%;
          padding-right: 15px;
          padding-left: 15px;
          margin-right: auto;
          margin-left: auto;
        }
        
        /* Container breakpoints */
        @media (min-width: 576px) {
          .responsive-container:not(.fluid) {
            max-width: 540px;
          }
        }
        @media (min-width: 768px) {
          .responsive-container:not(.fluid) {
            max-width: 720px;
          }
        }
        @media (min-width: 992px) {
          .responsive-container:not(.fluid) {
            max-width: 960px;
          }
        }
        @media (min-width: 1200px) {
          .responsive-container:not(.fluid) {
            max-width: 1140px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Responsive Grid System
 */
export const Row = ({ children, className = '', ...props }) => {
  return (
    <div className={`row ${className}`} {...props}>
      {children}
      
      <style jsx>{`
        .row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -15px;
          margin-left: -15px;
        }
      `}</style>
    </div>
  );
};

export const Col = ({ 
  children, 
  xs = 12, 
  sm, 
  md, 
  lg, 
  xl,
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`
        col 
        col-xs-${xs}
        ${sm ? `col-sm-${sm}` : ''} 
        ${md ? `col-md-${md}` : ''} 
        ${lg ? `col-lg-${lg}` : ''} 
        ${xl ? `col-xl-${xl}` : ''}
        ${className}
      `} 
      {...props}
    >
      {children}
      
      <style jsx>{`
        .col {
          position: relative;
          width: 100%;
          padding-right: 15px;
          padding-left: 15px;
        }
        
        /* Extra small devices (phones) */
        .col-xs-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
        .col-xs-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
        .col-xs-3 { flex: 0 0 25%; max-width: 25%; }
        .col-xs-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
        .col-xs-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
        .col-xs-6 { flex: 0 0 50%; max-width: 50%; }
        .col-xs-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
        .col-xs-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
        .col-xs-9 { flex: 0 0 75%; max-width: 75%; }
        .col-xs-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
        .col-xs-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
        .col-xs-12 { flex: 0 0 100%; max-width: 100%; }
        
        /* Small devices (tablets) */
        @media (min-width: 576px) {
          .col-sm-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
          .col-sm-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
          .col-sm-3 { flex: 0 0 25%; max-width: 25%; }
          .col-sm-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
          .col-sm-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
          .col-sm-6 { flex: 0 0 50%; max-width: 50%; }
          .col-sm-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
          .col-sm-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
          .col-sm-9 { flex: 0 0 75%; max-width: 75%; }
          .col-sm-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
          .col-sm-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
          .col-sm-12 { flex: 0 0 100%; max-width: 100%; }
        }
        
        /* Medium devices (desktops) */
        @media (min-width: 768px) {
          .col-md-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
          .col-md-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
          .col-md-3 { flex: 0 0 25%; max-width: 25%; }
          .col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
          .col-md-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
          .col-md-6 { flex: 0 0 50%; max-width: 50%; }
          .col-md-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
          .col-md-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
          .col-md-9 { flex: 0 0 75%; max-width: 75%; }
          .col-md-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
          .col-md-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
          .col-md-12 { flex: 0 0 100%; max-width: 100%; }
        }
        
        /* Large devices (large desktops) */
        @media (min-width: 992px) {
          .col-lg-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
          .col-lg-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
          .col-lg-3 { flex: 0 0 25%; max-width: 25%; }
          .col-lg-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
          .col-lg-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
          .col-lg-6 { flex: 0 0 50%; max-width: 50%; }
          .col-lg-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
          .col-lg-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
          .col-lg-9 { flex: 0 0 75%; max-width: 75%; }
          .col-lg-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
          .col-lg-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
          .col-lg-12 { flex: 0 0 100%; max-width: 100%; }
        }
        
        /* Extra large devices */
        @media (min-width: 1200px) {
          .col-xl-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
          .col-xl-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
          .col-xl-3 { flex: 0 0 25%; max-width: 25%; }
          .col-xl-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
          .col-xl-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
          .col-xl-6 { flex: 0 0 50%; max-width: 50%; }
          .col-xl-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
          .col-xl-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
          .col-xl-9 { flex: 0 0 75%; max-width: 75%; }
          .col-xl-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
          .col-xl-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
          .col-xl-12 { flex: 0 0 100%; max-width: 100%; }
        }
      `}</style>
    </div>
  );
};

/**
 * ResponsiveCard component that adapts to different screen sizes
 */
export const ResponsiveCard = ({ 
  title, 
  children, 
  footer,
  className = '',
  ...props 
}) => {
  return (
    <div className={`responsive-card ${className}`} {...props}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
      
      <style jsx>{`
        .responsive-card {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          background-color: white;
          margin-bottom: 16px;
          width: 100%;
        }
        
        .card-header {
          padding: 16px;
          font-weight: bold;
          border-bottom: 1px solid #eee;
        }
        
        .card-body {
          padding: 16px;
        }
        
        .card-footer {
          padding: 16px;
          border-top: 1px solid #eee;
          background-color: #f9f9f9;
        }
        
        @media (max-width: 768px) {
          .responsive-card {
            border-radius: 0;
            box-shadow: none;
            border: 1px solid #eee;
          }
          
          .card-header, .card-body, .card-footer {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

// ============== RESPONSIVE NAVIGATION COMPONENTS ==============

/**
 * Hamburger Menu for mobile navigation
 */
export const HamburgerMenu = ({ 
  items, 
  logo, 
  className = '',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.hamburger-menu')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);
  
  return (
    <div className={`hamburger-menu ${className}`} {...props}>
      <div className="menu-header">
        {logo && <div className="logo">{logo}</div>}
        <button 
          className={`menu-toggle ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      <div className={`menu-content ${isOpen ? 'open' : ''}`}>
        <nav>
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                <a 
                  href={item.url} 
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                      setIsOpen(false);
                    }
                  }}
                >
                  {item.icon && <span className="item-icon">{item.icon}</span>}
                  <span className="item-text">{item.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <style jsx>{`
        .hamburger-menu {
          position: relative;
          z-index: 1000;
        }
        
        .menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .logo {
          display: flex;
          align-items: center;
        }
        
        .menu-toggle {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 30px;
          height: 21px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 10;
        }
        
        .menu-toggle span {
          display: block;
          width: 100%;
          height: 3px;
          background-color: #333;
          border-radius: 3px;
          transition: all 0.3s;
        }
        
        .menu-toggle.open span:nth-child(1) {
          transform: translateY(9px) rotate(45deg);
        }
        
        .menu-toggle.open span:nth-child(2) {
          opacity: 0;
        }
        
        .menu-toggle.open span:nth-child(3) {
          transform: translateY(-9px) rotate(-45deg);
        }
        
        .menu-content {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background-color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s;
        }
        
        .menu-content.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        li {
          border-bottom: 1px solid #eee;
        }
        
        li:last-child {
          border-bottom: none;
        }
        
        a {
          display: flex;
          align-items: center;
          padding: 16px;
          color: #333;
          text-decoration: none;
          transition: background-color 0.3s;
        }
        
        a:hover {
          background-color: #f5f5f5;
        }
        
        .item-icon {
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }
        
        @media (min-width: 992px) {
          .menu-header {
            padding: 16px 32px;
          }
          
          .menu-toggle {
            display: none;
          }
          
          .menu-content {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
            box-shadow: none;
            display: flex;
            justify-content: flex-end;
          }
          
          ul {
            display: flex;
          }
          
          li {
            border-bottom: none;
            margin-left: 8px;
          }
          
          a {
            padding: 8px 16px;
            border-radius: 4px;
          }
          
          a:hover {
            background-color: #f0f0f0;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Bottom Navigation Bar for mobile
 */
export const BottomNavigation = ({ items, className = '', ...props }) => {
  return (
    <div className={`bottom-navigation ${className}`} {...props}>
      {items.map((item, index) => (
        <a 
          key={index}
          href={item.url}
          className={item.active ? 'active' : ''}
          onClick={(e) => {
            if (item.onClick) {
              e.preventDefault();
              item.onClick();
            }
          }}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-label">{item.label}</div>
        </a>
      ))}
      
      <style jsx>{`
        .bottom-navigation {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: white;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        
        a {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 0;
          color: #666;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        a.active {
          color: #0066cc;
        }
        
        .nav-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }
        
        .nav-label {
          font-size: 12px;
        }
        
        @media (min-width: 768px) {
          .bottom-navigation {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Tab Bar component that adapts between desktop tabs and mobile dropdown
 */
export const ResponsiveTabs = ({ 
  tabs, 
  activeTab, 
  onChange,
  className = '',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleTabChange = (tab) => {
    onChange(tab);
    setIsOpen(false);
  };
  
  const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label || '';
  
  return (
    <div className={`responsive-tabs ${className}`} {...props}>
      {/* Mobile dropdown */}
      <div className="mobile-tabs">
        <button 
          className="dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {activeTabLabel}
          <span className={`arrow ${isOpen ? 'up' : 'down'}`}></span>
        </button>
        
        {isOpen && (
          <div className="dropdown-menu">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-item ${tab.id === activeTab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Desktop tabs */}
      <div className="desktop-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${tab.id === activeTab ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      
      <style jsx>{`
        .responsive-tabs {
          margin-bottom: 16px;
        }
        
        .mobile-tabs {
          display: none;
        }
        
        .desktop-tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
        }
        
        .tab-item {
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }
        
        .tab-item:hover {
          color: #333;
        }
        
        .tab-item.active {
          color: #0066cc;
          border-bottom-color: #0066cc;
        }
        
        .tab-icon {
          margin-right: 8px;
        }
        
        @media (max-width: 768px) {
          .mobile-tabs {
            display: block;
            position: relative;
            z-index: 100;
          }
          
          .desktop-tabs {
            display: none;
          }
          
          .dropdown-toggle {
            width: 100%;
            padding: 12px 16px;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            text-align: left;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
          }
          
          .arrow {
            border: solid #666;
            border-width: 0 2px 2px 0;
            display: inline-block;
            padding: 3px;
            margin-left: 8px;
          }
          
          .arrow.down {
            transform: rotate(45deg);
          }
          
          .arrow.up {
            transform: rotate(-135deg);
          }
          
          .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 4px 4px;
            z-index: 10;
          }
          
          .dropdown-menu .tab-item {
            width: 100%;
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          
          .dropdown-menu .tab-item:last-child {
            border-bottom: none;
          }
          
          .dropdown-menu .tab-item.active {
            background-color: #f5f5f5;
            border-left: 3px solid #0066cc;
            border-bottom: 1px solid #eee;
          }
        }
      `}</style>
    </div>
  );
};

// ============== RESPONSIVE FORM COMPONENTS ==============

/**
 * Responsive form that adapts layout based on screen size
 */
export const ResponsiveForm = ({ 
  children, 
  onSubmit,
  className = '',
  ...props 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };
  
  return (
    <form 
      className={`responsive-form ${className}`} 
      onSubmit={handleSubmit}
      {...props}
    >
      {children}
      
      <style jsx>{`
        .responsive-form {
          width: 100%;
        }
        
        @media (max-width: 768px) {
          .responsive-form {
            padding: 0 8px;
          }
        }
      `}</style>
    </form>
  );
};

/**
 * Responsive form field with label
 */
export const FormField = ({ 
  label, 
  id, 
  error,
  children,
  stacked = false,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`form-field ${stacked ? 'stacked' : ''} ${error ? 'has-error' : ''} ${className}`}
      {...props}
    >
      {label && (
        <label htmlFor={id}>{label}</label>
      )}
      <div className="field-input">
        {children}
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <style jsx>{`
        .form-field {
          margin-bottom: 16px;
          display: flex;
          flex-wrap: wrap;
        }
        
        .form-field:not(.stacked) {
          align-items: center;
        }
        
        .form-field:not(.stacked) label {
          flex: 0 0 25%;
          max-width: 25%;
          padding-right: 16px;
        }
        
        .form-field:not(.stacked) .field-input {
          flex: 0 0 75%;
          max-width: 75%;
        }
        
        .form-field.stacked {
          flex-direction: column;
        }
        
        .form-field.stacked label {
          margin-bottom: 8px;
        }
        
        label {
          font-weight: 500;
          color: #333;
        }
        
        .field-input {
          position: relative;
          width: 100%;
        }
        
        .error-message {
          color: #d32f2f;
          font-size: 12px;
          margin-top: 4px;
        }
        
        .form-field.has-error :global(input),
        .form-field.has-error :global(select),
        .form-field.has-error :global(textarea) {
          border-color: #d32f2f;
        }
        
        @media (max-width: 768px) {
          .form-field:not(.stacked) {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .form-field:not(.stacked) label,
          .form-field:not(.stacked) .field-input {
            flex: 0 0 100%;
            max-width: 100%;
            padding-right: 0;
          }
          
          .form-field:not(.stacked) label {
            margin-bottom: 8px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Responsive form input
 */
export const Input = React.forwardRef(({ 
  type = 'text', 
  className = '',
  ...props 
}, ref) => {
  return (
    <>
      <input 
        type={type} 
        className={`responsive-input ${className}`} 
        ref={ref}
        {...props} 
      />
      
      <style jsx>{`
        .responsive-input {
          display: block;
          width: 100%;
          padding: 8px 12px;
          font-size: 16px;
          line-height: 1.5;
          color: #333;
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .responsive-input:focus {
          border-color: #0066cc;
          outline: 0;
          box-shadow: 0 0 0 0.2rem rgba(0, 102, 204, 0.25);
        }
        
        @media (max-width: 768px) {
          .responsive-input {
            font-size: 16px; /* Prevents zoom on iOS */
            padding: 12px;
          }
        }
      `}</style>
    </>
  );
});

/**
 * Responsive button that adapts to mobile
 */
export const Button = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props 
}) => {
  return (
    <>
      <button 
        className={`
          responsive-button 
          ${variant} 
          ${size} 
          ${fullWidth ? 'full-width' : ''}
          ${className}
        `} 
        {...props}
      >
        {children}
      </button>
      
      <style jsx>{`
        .responsive-button {
          display: inline-block;
          font-weight: 400;
          text-align: center;
          white-space: nowrap;
          vertical-align: middle;
          user-select: none;
          border: 1px solid transparent;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          border-radius: 0.25rem;
          transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          cursor: pointer;
        }
        
        .responsive-button:focus {
          outline: 0;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        .primary {
          color: #fff;
          background-color: #0066cc;
          border-color: #0066cc;
        }
        
        .primary:hover {
          background-color: #0056b3;
          border-color: #004fa6;
        }
        
        .secondary {
          color: #333;
          background-color: #f0f0f0;
          border-color: #ccc;
        }
        
        .secondary:hover {
          background-color: #e0e0e0;
          border-color: #bbb;
        }
        
        .success {
          color: #fff;
          background-color: #28a745;
          border-color: #28a745;
        }
        
        .success:hover {
          background-color: #218838;
          border-color: #1e7e34;
        }
        
        .danger {
          color: #fff;
          background-color: #dc3545;
          border-color: #dc3545;
        }
        
        .danger:hover {
          background-color: #c82333;
          border-color: #bd2130;
        }
        
        .small {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          border-radius: 0.2rem;
        }
        
        .medium {
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          border-radius: 0.25rem;
        }
        
        .large {
          padding: 0.5rem 1rem;
          font-size: 1.25rem;
          border-radius: 0.3rem;
        }
        
        .full-width {
          width: 100%;
        }
        
        .responsive-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .responsive-button {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          
          .small {
            padding: 0.375rem 0.625rem;
          }
          
          .large {
            padding: 0.625rem 1.25rem;
          }
        }
      `}</style>
    </>
  );
};

// ============== RESPONSIVE UTILITY COMPONENTS ==============

/**
 * Visibility component to show/hide elements based on viewport size
 */
export const Visibility = ({ 
  children,
  mobile = true,
  tablet = true, 
  desktop = true,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`
        visibility 
        ${mobile ? '' : 'hide-mobile'} 
        ${tablet ? '' : 'hide-tablet'} 
        ${desktop ? '' : 'hide-desktop'}
        ${className}
      `}
      {...props}
    >
      {children}
      
      <style jsx>{`
        .visibility {
          display: block;
        }
        
        @media (max-width: 576px) {
          .hide-mobile {
            display: none !important;
          }
        }
        
        @media (min-width: 577px) and (max-width: 991px) {
          .hide-tablet {
            display: none !important;
          }
        }
        
        @media (min-width: 992px) {
          .hide-desktop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Component to handle touch events better for mobile
 */
export const TouchableArea = ({ 
  children, 
  onPress, 
  className = '',
  activeClass = 'active',
  ...props 
}) => {
  const [isActive, setIsActive] = useState(false);
  const touchStartRef = useRef(null);
  
  const handleTouchStart = (e) => {
    setIsActive(true);
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };
  
  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    
    // Calculate distance moved
    const dx = Math.abs(e.touches[0].clientX - touchStartRef.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartRef.current.y);
    
    // If moved too far, cancel the press
    if (dx > 10 || dy > 10) {
      setIsActive(false);
      touchStartRef.current = null;
    }
  };
  
  const handleTouchEnd = (e) => {
    if (isActive && onPress) {
      onPress(e);
    }
    setIsActive(false);
    touchStartRef.current = null;
  };
  
  return (
    <div 
      className={`touchable-area ${isActive ? activeClass : ''} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onPress} // For desktop compatibility
      {...props}
    >
      {children}
      
      <style jsx>{`
        .touchable-area {
          cursor: pointer;
          touch-action: manipulation;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          transition: opacity 0.2s;
        }
        
        .touchable-area.active {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

/**
 * Usage example component
 */
export const MobileResponsiveExample = () => {
  const [activeTab, setActiveTab] = useState('home');
  
  const navigationItems = [
    { text: 'Home', url: '#home', icon: '🏠', onClick: () => console.log('Home clicked') },
    { text: 'Products', url: '#products', icon: '🛍️' },
    { text: 'Services', url: '#services', icon: '🔧' },
    { text: 'About', url: '#about', icon: '📄' },
    { text: 'Contact', url: '#contact', icon: '📞' }
  ];
  
  const bottomNavItems = [
    { label: 'Home', url: '#home', icon: '🏠', active: activeTab === 'home', onClick: () => setActiveTab('home') },
    { label: 'Search', url: '#search', icon: '🔍', active: activeTab === 'search', onClick: () => setActiveTab('search') },
    { label: 'Cart', url: '#cart', icon: '🛒', active: activeTab === 'cart', onClick: () => setActiveTab('cart') },
    { label: 'Profile', url: '#profile', icon: '👤', active: activeTab === 'profile', onClick: () => setActiveTab('profile') }
  ];
  
  const tabs = [
    { id: 'tab1', label: 'Overview', icon: '📊' },
    { id: 'tab2', label: 'Details', icon: '📋' },
    { id: 'tab3', label: 'Settings', icon: '⚙️' }
  ];
  
  return (
    <ResponsiveContainer>
      <HamburgerMenu items={navigationItems} logo={<strong>LOGO</strong>} />
      
      <Row>
        <Col xs={12} md={6}>
          <ResponsiveCard title="Responsive Layout Example">
            <p>This card demonstrates responsive layout components.</p>
            <p>It will adapt to different screen sizes.</p>
          </ResponsiveCard>
        </Col>
        
        <Col xs={12} md={6}>
          <ResponsiveCard title="Touch Friendly Components">
            <TouchableArea onPress={() => alert('Touched!')}>
              <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                Touch or Click Me!
              </div>
            </TouchableArea>
          </ResponsiveCard>
        </Col>
      </Row>
      
      <ResponsiveTabs 
        tabs={tabs} 
        activeTab="tab1" 
        onChange={(tabId) => console.log(`Tab changed to ${tabId}`)} 
      />
      
      <Row>
        <Col xs={12} md={8}>
          <ResponsiveForm onSubmit={() => alert('Form submitted!')}>
            <FormField label="Name" id="name">
              <Input id="name" placeholder="Enter your name" />
            </FormField>
            
            <FormField label="Email" id="email" error="Please enter a valid email">
              <Input id="email" type="email" placeholder="Enter your email" />
            </FormField>
            
            <FormField label="Message" id="message" stacked>
              <textarea 
                id="message" 
                rows="4" 
                placeholder="Enter your message"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              ></textarea>
            </FormField>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="secondary">Cancel</Button>
              <Button type="submit">Submit</Button>
            </div>
          </ResponsiveForm>
        </Col>
        
        <Col xs={12} md={4}>
          <Visibility mobile={false}>
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <h3>Desktop Only Content</h3>
              <p>This content is hidden on mobile devices.</p>
            </div>
          </Visibility>
          
          <Visibility desktop={false}>
            <div style={{ padding: '16px', backgroundColor: '#f0f0f0', borderRadius: '8px', marginTop: '16px' }}>
              <h3>Mobile Only Content</h3>
              <p>This content is hidden on desktop devices.</p>
            </div>
          </Visibility>
        </Col>
      </Row>
      
      <BottomNavigation items={bottomNavItems} />
    </ResponsiveContainer>
  );
};

export default {
  ResponsiveContainer,
  Row,
  Col,
  ResponsiveCard,
  HamburgerMenu,
  BottomNavigation,
  ResponsiveTabs,
  ResponsiveForm,
  FormField,
  Input,
  Button,
  Visibility,
  TouchableArea,
  MobileResponsiveExample
};
