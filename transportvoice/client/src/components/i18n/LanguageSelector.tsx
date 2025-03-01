import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Menu, 
  MenuItem, 
  Typography, 
  IconButton, 
  Tooltip, 
  Badge,
  Divider, 
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettings } from '../../hooks/useSettings';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LanguageSelector: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { i18n, t } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const open = Boolean(anchorEl);

  const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  ];

  useEffect(() => {
    // Check if the browser language is supported
    const detectBrowserLanguage = () => {
      if (!settings.autoDetectLanguage) return;
      
      const browserLang = navigator.language.split('-')[0];
      const isSupported = languages.some(lang => lang.code === browserLang);
      
      if (isSupported && browserLang !== i18n.language) {
        i18n.changeLanguage(browserLang);
        updateSettings({ preferredLanguage: browserLang });
      }
    };

    detectBrowserLanguage();
  }, [i18n, settings.autoDetectLanguage, updateSettings]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    updateSettings({ preferredLanguage: languageCode });
    handleClose();
  };

  const handleAutoDetectToggle = () => {
    updateSettings({ autoDetectLanguage: !settings.autoDetectLanguage });
  };

  const handleTranslateCurrentPage = () => {
    // Implement translation of current page content
    // This would typically involve an API call or triggering the translation service
    console.log('Translating current page content');
    handleClose();
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === i18n.language) || languages[0];
  };

  return (
    <>
      <Tooltip title={t('common.changeLanguage')}>
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          color="inherit"
        >
          <Badge
            color="secondary"
            variant="dot"
            invisible={!settings.autoDetectLanguage}
          >
            <LanguageIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('common.selectLanguage')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('common.currentLanguage')}: {getCurrentLanguage().name} ({getCurrentLanguage().nativeName})
          </Typography>
        </Box>
        
        <Divider />
        
        <Box sx={{ maxHeight: 260, overflow: 'auto' }}>
          {languages.map((language) => (
            <MenuItem 
              key={language.code} 
              onClick={() => handleLanguageChange(language.code)}
              selected={i18n.language === language.code}
            >
              <ListItemIcon>
                <Typography fontSize="1.2rem">{language.flag}</Typography>
              </ListItemIcon>
              <ListItemText>
                {language.name} <Typography component="span" variant="body2" color="text.secondary">({language.nativeName})</Typography>
              </ListItemText>
              {i18n.language === language.code && (
                <CheckIcon fontSize="small" color="primary" />
              )}
            </MenuItem>
          ))}
        </Box>
        
        <Divider />
        
        <Box sx={{ px: 2, py: 1 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={settings.autoDetectLanguage}
                onChange={handleAutoDetectToggle}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AutoAwesomeIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{t('common.autoDetectLanguage')}</Typography>
              </Box>
            }
          />
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleTranslateCurrentPage}>
          <ListItemIcon>
            <TranslateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.translateCurrentPage')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSelector; 