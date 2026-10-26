import clsx from 'clsx';
import type {ElementType} from 'react';
import styles from './SegmentedControl.module.scss';

export interface SegmentedOption<T extends string> {
    value: T;
    /** Visible text; omit for an icon-only segment (then set `ariaLabel`). */
    label?: string;
    icon?: ElementType;
    ariaLabel?: string;
}

interface SegmentedControlProps<T extends string> {
    options: SegmentedOption<T>[];
    value: T;
    /** Called on every click, also on the selected segment. */
    onChange: (value: T) => void;
    ariaLabel: string;
    className?: string;
}

/** Row of mutually exclusive buttons; the selected one gets a tinted fill. */
export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    ariaLabel,
    className,
}: SegmentedControlProps<T>) {
    return (
        <div role="group" aria-label={ariaLabel} className={clsx(styles.rail, className)}>
            {options.map(({value: optionValue, label, icon: Icon, ariaLabel: optionLabel}) => {
                const selected = optionValue === value;
                return (
                    <button
                        key={optionValue}
                        type="button"
                        aria-pressed={selected}
                        aria-label={optionLabel}
                        title={label ? undefined : optionLabel}
                        onClick={() => onChange(optionValue)}
                        className={clsx(
                            styles.segment,
                            label ? styles.labeled : styles.iconOnly,
                            selected && styles.selected,
                        )}
                    >
                        {Icon && <Icon size={16} className={styles.icon} />}
                        {label && <span className={styles.label}>{label}</span>}
                    </button>
                );
            })}
        </div>
    );
}
