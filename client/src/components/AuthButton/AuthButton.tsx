import styles from './AuthButton.module.css'
import {useAuth} from "../../providers/AuthContext.tsx";

const AuthButton = () => {
    const {isAdmin, login, logout} = useAuth();

    return (
        <div className={styles.authButtonWrapper}>
            {isAdmin ? (
                <button className={styles.authButton} onClick={logout}>
                    Выйти (администратор)
                </button>
            ) : (
                <button className={styles.authButton} onClick={login}>
                    Войти как администратор
                </button>
            )}
        </div>
    );
};

export default AuthButton;
