import { Spinner, Text, makeStyles, shorthands } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.gap('16px'),
    ...shorthands.padding('48px'),
  },
  text: {
    color: '#605e5c',
  },
});

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Spinner size="large" />
      <Text className={styles.text}>{message}</Text>
    </div>
  );
};
