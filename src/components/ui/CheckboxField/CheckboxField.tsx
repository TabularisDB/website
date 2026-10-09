import clsx from 'clsx';
import type {ReactNode} from 'react';
import styles from './CheckboxField.module.scss';

interface CheckboxFieldProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children: ReactNode;
    className?: string;
    'aria-describedby'?: string;
}

/** A checkbox and its label in a bordered box, sized like the filter fields next to it. */
export function CheckboxField({checked, onChange, children, className, ...rest}: CheckboxFieldProps) {
    return (
        <label className={clsx(styles.field, className)}>
            <input
                type="checkbox"
                className={styles.input}
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                {...rest}
            />
            {children}
        </label>
    );
}
