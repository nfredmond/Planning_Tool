import React, { createContext, useContext, useState, useEffect } from 'react';
import { Button, Menu, MenuItem, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { Translate, KeyboardArrowDown, AutoAwesome } from '@mui/icons-material';

// Language options
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' }
];

// Create a context for language settings
const LanguageContext = createContext({
  currentLanguage: 'en',
  detectedLanguage: null,
  setLanguage: () => {},
  translate: () => {},
  isAutoDetectEnabled: false,
  toggleAutoDetect: () => {}
});

// Translation API hooks
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState(true);
  const [detectionNotification, setDetectionNotification] = useState(false);
  
  // Initialize language from browser or localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const savedAutoDetect = localStorage.getItem('autoDetectEnabled');
    
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Get browser language
      const browserLang = navigator.language.split('-')[0];
      
      // Check if browser language is supported
      if (SUPPORTED_LANGUAGES.some(lang => lang.code === browserLang)) {
        setCurrentLanguage(browserLang);
        localStorage.setItem('preferredLanguage', browserLang);
      }
    }
    
    if (savedAutoDetect !== null) {
      setIsAutoDetectEnabled(savedAutoDetect === 'true');
    }
  }, []);
  
  // Load translations for current language
  useEffect(() => {
    const loadTranslations = async () => {
      if (currentLanguage === 'en') {
        setTranslations({});
        return;
      }
      
      setIsLoading(true);
      
      try {
        // In a real application, fetch from actual translation files
        // For demo, we'll simulate API call with mock translations
        // const response = await fetch(`/api/translations/${currentLanguage}`);
        // const data = await response.json();
        
        // Mock translations for demonstration
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockTranslations = getMockTranslations(currentLanguage);
        
        setTranslations(mockTranslations);
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTranslations();
  }, [currentLanguage]);
  
  // Set language and save preference
  const setLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
  };
  
  // Toggle auto-detection
  const toggleAutoDetect = () => {
    setIsAutoDetectEnabled(!isAutoDetectEnabled);
    localStorage.setItem('autoDetectEnabled', !isAutoDetectEnabled ? 'true' : 'false');
  };
  
  // Translate text
  const translate = (key, defaultText) => {
    if (currentLanguage === 'en') return defaultText;
    
    return translations[key] || defaultText;
  };
  
  // Detect language from text
  const detectLanguage = async (text) => {
    if (!isAutoDetectEnabled || !text || text.length < 10) return;
    
    try {
      // In a real application, call a language detection API
      // For demo, we'll simulate API call with mock detection
      // const response = await fetch('/api/detect-language', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text })
      // });
      // const data = await response.json();
      
      // Mock language detection
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Randomly pick a language other than current for demo
      const filteredLangs = SUPPORTED_LANGUAGES.filter(lang => 
        lang.code !== currentLanguage && ['es', 'fr', 'de', 'zh'].includes(lang.code)
      );
      const detectedLang = filteredLangs[Math.floor(Math.random() * filteredLangs.length)];
      
      if (detectedLang && detectedLang.code !== currentLanguage) {
        setDetectedLanguage(detectedLang);
        setDetectionNotification(true);
      }
    } catch (error) {
      console.error('Error detecting language:', error);
    }
  };
  
  // Switch to detected language
  const switchToDetectedLanguage = () => {
    if (detectedLanguage) {
      setLanguage(detectedLanguage.code);
      setDetectedLanguage(null);
      setDetectionNotification(false);
    }
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setDetectionNotification(false);
  };
  
  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        detectedLanguage,
        setLanguage,
        translate,
        isLoading,
        isAutoDetectEnabled,
        toggleAutoDetect,
        detectLanguage,
        switchToDetectedLanguage
      }}
    >
      {children}
      
      <Snackbar
        open={detectionNotification}
        autoHideDuration={10000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={handleCloseNotification}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={switchToDetectedLanguage}
            >
              Switch to {detectedLanguage?.nativeName}
            </Button>
          }
        >
          We detected your comments are in {detectedLanguage?.name}. Would you like to switch?
        </Alert>
      </Snackbar>
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => useContext(LanguageContext);

// Language selector component
export const LanguageSelector = ({ variant = 'dropdown' }) => {
  const { 
    currentLanguage, 
    setLanguage, 
    isAutoDetectEnabled, 
    toggleAutoDetect 
  } = useLanguage();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode);
    handleClose();
  };
  
  // Find current language object
  const currentLangObj = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
  
  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className="language-selector dropdown">
        <Button
          variant="outlined"
          startIcon={<Translate />}
          endIcon={<KeyboardArrowDown />}
          onClick={handleClick}
          size="small"
          color="inherit"
        >
          {currentLangObj?.nativeName || 'English'}
        </Button>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'language-button',
          }}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              selected={currentLanguage === lang.code}
            >
              {lang.nativeName} - {lang.name}
            </MenuItem>
          ))}
          
          <MenuItem>
            <div className="auto-detect-option">
              <label>
                <input
                  type="checkbox"
                  checked={isAutoDetectEnabled}
                  onChange={toggleAutoDetect}
                />
                Auto-detect language
              </label>
              <Tooltip title="Automatically detects the language of user comments and offers to switch">
                <IconButton size="small">
                  <AutoAwesome fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </MenuItem>
        </Menu>
      </div>
    );
  }
  
  // Icon variant
  return (
    <div className="language-selector icon">
      <Tooltip title={`Language: ${currentLangObj?.name || 'English'}`}>
        <IconButton
          onClick={handleClick}
          color="inherit"
        >
          <Translate />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            selected={currentLanguage === lang.code}
          >
            {lang.nativeName} - {lang.name}
          </MenuItem>
        ))}
        
        <MenuItem>
          <div className="auto-detect-option">
            <label>
              <input
                type="checkbox"
                checked={isAutoDetectEnabled}
                onChange={toggleAutoDetect}
              />
              Auto-detect language
            </label>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
};

// Translatable text component
export const TranslatableText = ({ 
  translationKey, 
  children, 
  component = 'span',
  onTextEntered = null,
  ...props
}) => {
  const { translate, detectLanguage } = useLanguage();
  
  // Handle text entry for language detection
  useEffect(() => {
    if (onTextEntered && typeof children === 'string') {
      detectLanguage(children);
    }
  }, [children, detectLanguage, onTextEntered]);
  
  const translatedText = translationKey ? 
    translate(translationKey, children) : 
    children;
  
  switch (component) {
    case 'div':
      return <div {...props}>{translatedText}</div>;
    case 'p':
      return <p {...props}>{translatedText}</p>;
    case 'h1':
      return <h1 {...props}>{translatedText}</h1>;
    case 'h2':
      return <h2 {...props}>{translatedText}</h2>;
    case 'h3':
      return <h3 {...props}>{translatedText}</h3>;
    case 'h4':
      return <h4 {...props}>{translatedText}</h4>;
    case 'li':
      return <li {...props}>{translatedText}</li>;
    case 'button':
      return <button {...props}>{translatedText}</button>;
    case 'label':
      return <label {...props}>{translatedText}</label>;
    default:
      return <span {...props}>{translatedText}</span>;
  }
};

// Comment language detector
export const CommentLanguageDetector = ({ children }) => {
  const { detectLanguage } = useLanguage();
  
  const handleCommentChange = (e) => {
    detectLanguage(e.target.value);
  };
  
  return (
    <div className="comment-language-detector">
      {React.cloneElement(children, {
        onChange: (e) => {
          // Call original onChange if it exists
          if (children.props.onChange) {
            children.props.onChange(e);
          }
          
          handleCommentChange(e);
        }
      })}
    </div>
  );
};

// Mock translations for demonstration
const getMockTranslations = (langCode) => {
  const translations = {
    es: {
      'welcome': '¡Bienvenido a TransportVoice!',
      'project.description': 'Una plataforma para la participación de la comunidad en proyectos de transporte',
      'feedback.submit': 'Enviar comentarios',
      'feedback.placeholder': 'Comparta sus ideas sobre este proyecto...',
      'project.details': 'Detalles del proyecto',
      'nav.home': 'Inicio',
      'nav.projects': 'Proyectos',
      'nav.about': 'Acerca de',
      'nav.contact': 'Contacto',
      'filter.all': 'Todos',
      'filter.active': 'Activos',
      'filter.completed': 'Completados',
      'sort.recent': 'Más recientes',
      'sort.popular': 'Más populares',
      'button.view': 'Ver',
      'button.edit': 'Editar',
      'button.delete': 'Eliminar',
      'button.save': 'Guardar',
      'button.cancel': 'Cancelar',
      'button.submit': 'Enviar',
      'comment.reply': 'Responder',
      'comment.edit': 'Editar',
      'comment.delete': 'Eliminar',
      'comment.report': 'Reportar',
      'login': 'Iniciar sesión',
      'signup': 'Registrarse',
      'logout': 'Cerrar sesión',
      'profile': 'Perfil',
      'settings': 'Configuración'
    },
    fr: {
      'welcome': 'Bienvenue sur TransportVoice !',
      'project.description': 'Une plateforme pour l\'engagement communautaire dans les projets de transport',
      'feedback.submit': 'Soumettre des commentaires',
      'feedback.placeholder': 'Partagez vos réflexions sur ce projet...',
      'project.details': 'Détails du projet',
      'nav.home': 'Accueil',
      'nav.projects': 'Projets',
      'nav.about': 'À propos',
      'nav.contact': 'Contact',
      'filter.all': 'Tous',
      'filter.active': 'Actifs',
      'filter.completed': 'Terminés',
      'sort.recent': 'Plus récents',
      'sort.popular': 'Plus populaires',
      'button.view': 'Voir',
      'button.edit': 'Modifier',
      'button.delete': 'Supprimer',
      'button.save': 'Enregistrer',
      'button.cancel': 'Annuler',
      'button.submit': 'Soumettre',
      'comment.reply': 'Répondre',
      'comment.edit': 'Modifier',
      'comment.delete': 'Supprimer',
      'comment.report': 'Signaler',
      'login': 'Se connecter',
      'signup': 'S\'inscrire',
      'logout': 'Se déconnecter',
      'profile': 'Profil',
      'settings': 'Paramètres'
    },
    de: {
      'welcome': 'Willkommen bei TransportVoice!',
      'project.description': 'Eine Plattform für die Beteiligung der Gemeinschaft an Verkehrsprojekten',
      'feedback.submit': 'Feedback einreichen',
      'feedback.placeholder': 'Teilen Sie Ihre Gedanken zu diesem Projekt...',
      'project.details': 'Projektdetails',
      'nav.home': 'Startseite',
      'nav.projects': 'Projekte',
      'nav.about': 'Über uns',
      'nav.contact': 'Kontakt',
      'filter.all': 'Alle',
      'filter.active': 'Aktiv',
      'filter.completed': 'Abgeschlossen',
      'sort.recent': 'Neueste',
      'sort.popular': 'Beliebteste',
      'button.view': 'Ansehen',
      'button.edit': 'Bearbeiten',
      'button.delete': 'Löschen',
      'button.save': 'Speichern',
      'button.cancel': 'Abbrechen',
      'button.submit': 'Absenden',
      'comment.reply': 'Antworten',
      'comment.edit': 'Bearbeiten',
      'comment.delete': 'Löschen',
      'comment.report': 'Melden',
      'login': 'Anmelden',
      'signup': 'Registrieren',
      'logout': 'Abmelden',
      'profile': 'Profil',
      'settings': 'Einstellungen'
    },
    zh: {
      'welcome': '欢迎使用TransportVoice！',
      'project.description': '一个用于交通项目社区参与的平台',
      'feedback.submit': '提交反馈',
      'feedback.placeholder': '分享您对该项目的想法...',
      'project.details': '项目详情',
      'nav.home': '首页',
      'nav.projects': '项目',
      'nav.about': '关于',
      'nav.contact': '联系我们',
      'filter.all': '全部',
      'filter.active': '活跃的',
      'filter.completed': '已完成',
      'sort.recent': '最新',
      'sort.popular': '最受欢迎',
      'button.view': '查看',
      'button.edit': '编辑',
      'button.delete': '删除',
      'button.save': '保存',
      'button.cancel': '取消',
      'button.submit': '提交',
      'comment.reply': '回复',
      'comment.edit': '编辑',
      'comment.delete': '删除',
      'comment.report': '举报',
      'login': '登录',
      'signup': '注册',
      'logout': '退出',
      'profile': '个人资料',
      'settings': '设置'
    },
    ar: {
      'welcome': 'مرحبًا بك في TransportVoice!',
      'project.description': 'منصة لمشاركة المجتمع في مشاريع النقل',
      'feedback.submit': 'إرسال التعليقات',
      'feedback.placeholder': 'شارك أفكارك حول هذا المشروع...',
      'project.details': 'تفاصيل المشروع',
      'nav.home': 'الصفحة الرئيسية',
      'nav.projects': 'المشاريع',
      'nav.about': 'حول',
      'nav.contact': 'اتصل بنا',
      'filter.all': 'الكل',
      'filter.active': 'نشط',
      'filter.completed': 'مكتمل',
      'sort.recent': 'الأحدث',
      'sort.popular': 'الأكثر شعبية',
      'button.view': 'عرض',
      'button.edit': 'تعديل',
      'button.delete': 'حذف',
      'button.save': 'حفظ',
      'button.cancel': 'إلغاء',
      'button.submit': 'إرسال',
      'comment.reply': 'رد',
      'comment.edit': 'تعديل',
      'comment.delete': 'حذف',
      'comment.report': 'إبلاغ',
      'login': 'تسجيل الدخول',
      'signup': 'إنشاء حساب',
      'logout': 'تسجيل الخروج',
      'profile': 'الملف الشخصي',
      'settings': 'الإعدادات'
    }
  };
  
  return translations[langCode] || {};
};

// Example usage component
export const MultiLanguageDemo = () => {
  return (
    <LanguageProvider>
      <div className="multi-language-demo">
        <header className="demo-header">
          <TranslatableText component="h1" translationKey="welcome">
            Welcome to TransportVoice!
          </TranslatableText>
          <TranslatableText component="p" translationKey="project.description">
            A platform for community engagement in transportation projects
          </TranslatableText>
          <LanguageSelector variant="dropdown" />
        </header>
        
        <div className="demo-content">
          <div className="navigation">
            <ul>
              <li>
                <TranslatableText translationKey="nav.home">Home</TranslatableText>
              </li>
              <li>
                <TranslatableText translationKey="nav.projects">Projects</TranslatableText>
              </li>
              <li>
                <TranslatableText translationKey="nav.about">About</TranslatableText>
              </li>
              <li>
                <TranslatableText translationKey="nav.contact">Contact</TranslatableText>
              </li>
            </ul>
          </div>
          
          <div className="main-content">
            <div className="project-card">
              <img src="https://via.placeholder.com/600x300" alt="Project" />
              <div className="card-content">
                <TranslatableText component="h3">Bike Lane Expansion Project</TranslatableText>
                <TranslatableText component="p">
                  This project aims to expand the bike lane network in the downtown area,
                  creating safer routes for cyclists and promoting sustainable transportation.
                </TranslatableText>
                
                <div className="card-actions">
                  <button>
                    <TranslatableText translationKey="button.view">View</TranslatableText>
                  </button>
                  <button>
                    <TranslatableText translationKey="feedback.submit">Submit Feedback</TranslatableText>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="comment-section">
              <TranslatableText component="h3">Community Feedback</TranslatableText>
              
              <div className="comment-form">
                <CommentLanguageDetector>
                  <textarea 
                    placeholder="Share your thoughts on this project..."
                  />
                </CommentLanguageDetector>
                
                <button>
                  <TranslatableText translationKey="button.submit">Submit</TranslatableText>
                </button>
              </div>
              
              <div className="comments-list">
                <div className="comment">
                  <div className="comment-header">
                    <span className="user-name">Maria Rodriguez</span>
                    <span className="comment-date">2 days ago</span>
                  </div>
                  <p className="comment-text">
                    Me encanta esta propuesta. Necesitamos más carriles para bicicletas en el centro.
                    Sería más seguro para todos.
                  </p>
                  <div className="comment-actions">
                    <button>
                      <TranslatableText translationKey="comment.reply">Reply</TranslatableText>
                    </button>
                  </div>
                </div>
                
                <div className="comment">
                  <div className="comment-header">
                    <span className="user-name">Thomas Schmidt</span>
                    <span className="comment-date">3 days ago</span>
                  </div>
                  <p className="comment-text">
                    Ich unterstütze dieses Projekt voll und ganz. Die Erweiterung des Radwegenetzes
                    würde die Stadt viel fahrradfreundlicher machen.
                  </p>
                  <div className="comment-actions">
                    <button>
                      <TranslatableText translationKey="comment.reply">Reply</TranslatableText>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .multi-language-demo {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .demo-header {
          text-align: center;
          margin-bottom: 30px;
          position: relative;
        }
        
        .demo-header h1 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .demo-header p {
          margin: 0 0 20px 0;
          color: #666;
        }
        
        .language-selector {
          position: absolute;
          top: 0;
          right: 0;
        }
        
        .navigation ul {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0 0 20px 0;
          background-color: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .navigation li {
          padding: 12px 20px;
          cursor: pointer;
        }
        
        .navigation li:hover {
          background-color: #e0e0e0;
        }
        
        .project-card {
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }
        
        .project-card img {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .card-content {
          padding: 20px;
        }
        
        .card-content h3 {
          margin: 0 0 15px 0;
          color: #333;
        }
        
        .card-content p {
          margin: 0 0 20px 0;
          color: #666;
          line-height: 1.5;
        }
        
        .card-actions {
          display: flex;
          gap: 10px;
        }
        
        .card-actions button {
          padding: 8px 16px;
          background-color: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .card-actions button:hover {
          background-color: #0056b3;
        }
        
        .comment-section {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .comment-section h3 {
          margin: 0 0 20px 0;
          color: #333;
        }
        
        .comment-form {
          margin-bottom: 30px;
        }
        
        .comment-form textarea {
          width: 100%;
          height: 100px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          font-family: inherit;
          resize: vertical;
        }
        
        .comment-form button {
          padding: 8px 16px;
          background-color: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .comment {
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .user-name {
          font-weight: bold;
          color: #333;
        }
        
        .comment-date {
          color: #888;
          font-size: 0.9em;
        }
        
        .comment-text {
          margin: 0 0 10px 0;
          color: #444;
          line-height: 1.4;
        }
        
        .comment-actions button {
          background: none;
          border: none;
          color: #0066cc;
          cursor: pointer;
          padding: 0;
          font-size: 0.9em;
        }
        
        .comment-actions button:hover {
          text-decoration: underline;
        }
        
        .auto-detect-option {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        /* RTL support for Arabic */
        [dir="rtl"] .language-selector {
          right: auto;
          left: 0;
        }
        
        @media (max-width: 768px) {
          .demo-header {
            padding-top: 40px;
          }
          
          .language-selector {
            position: static;
            margin-bottom: 20px;
          }
          
          .navigation ul {
            flex-wrap: wrap;
          }
          
          .navigation li {
            flex: 1 0 50%;
            text-align: center;
          }
        }
      `}</style>
    </LanguageProvider>
  );
};

export default MultiLanguageDemo;
