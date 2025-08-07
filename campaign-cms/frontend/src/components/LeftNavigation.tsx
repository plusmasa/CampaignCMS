import React from 'react';
import {
  makeStyles,
  shorthands,
  Text,
  Button,
} from '@fluentui/react-components';
import {
  Send24Regular,
  Handshake24Regular,
  DataTrending24Regular,
  ImageMultiple24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  nav: {
    width: '80px',
    height: '100vh',
    backgroundColor: 'var(--colorNeutralBackground2)',
    borderRight: '1px solid var(--colorNeutralStroke2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.padding('16px', '0'),
    ...shorthands.gap('16px'),
  },
  navItem: {
    width: '64px',
    height: '64px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.gap('4px'),
    cursor: 'pointer',
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('none'),
    backgroundColor: 'transparent',
    ...shorthands.padding('8px'),
    '&:hover': {
      backgroundColor: 'var(--colorNeutralBackground1Hover)',
    },
  },
  activeNavItem: {
    backgroundColor: 'var(--colorBrandBackground2)',
    color: 'var(--colorBrandForeground2)',
    '&:hover': {
      backgroundColor: 'var(--colorBrandBackground2Hover)',
    },
  },
  navLabel: {
    fontSize: '10px',
    fontWeight: '400',
    lineHeight: '12px',
    textAlign: 'center',
  },
});

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  onClick?: () => void;
}

interface LeftNavigationProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

export const LeftNavigation: React.FC<LeftNavigationProps> = ({
  activeItem = 'campaigns',
  onItemClick,
}) => {
  const styles = useStyles();

  const navigationItems: NavigationItem[] = [
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: <Send24Regular />,
      onClick: () => onItemClick?.('campaigns'),
    },
    {
      id: 'partners',
      label: 'Partners',
      icon: <Handshake24Regular />,
      onClick: () => onItemClick?.('partners'),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <DataTrending24Regular />,
      onClick: () => onItemClick?.('analytics'),
    },
    {
      id: 'media',
      label: 'Media Library',
      icon: <ImageMultiple24Regular />,
      onClick: () => onItemClick?.('media'),
    },
  ];

  return (
    <nav className={styles.nav}>
      {navigationItems.map((item) => (
        <Button
          key={item.id}
          className={`${styles.navItem} ${
            activeItem === item.id ? styles.activeNavItem : ''
          }`}
          appearance="subtle"
          onClick={item.onClick}
          title={item.label}
        >
          {item.icon}
          <Text className={styles.navLabel} size={100}>
            {item.label}
          </Text>
        </Button>
      ))}
    </nav>
  );
};
