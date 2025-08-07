import { 
  Title1, 
  Text,
  makeStyles,
  shorthands
} from '@fluentui/react-components';

const useStyles = makeStyles({
  header: {
    ...shorthands.padding('24px', '32px'),
    ...shorthands.borderBottom('1px', 'solid', '#e0e0e0'),
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  title: {
    marginBottom: '4px',
  },
  subtitle: {
    color: '#605e5c',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
});

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const styles = useStyles();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Title1 className={styles.title}>{title}</Title1>
        {subtitle && (
          <Text className={styles.subtitle}>{subtitle}</Text>
        )}
      </div>
      {actions && (
        <div className={styles.actions}>
          {actions}
        </div>
      )}
    </header>
  );
};
