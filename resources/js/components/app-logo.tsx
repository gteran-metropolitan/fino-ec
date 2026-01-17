import { FlowerTulipIcon } from '@phosphor-icons/react';

import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex size-8 items-center justify-center">
                <FlowerTulipIcon size={36} weight="thin" />{' '}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-light text-gray-600 dark:text-gray-300">
                    FINO
                </span>
                <span className="truncate leading-tight font-extralight text-gray-400 dark:text-gray-300 text-xs">
                    Ecuador
                </span>
            </div>
        </>
    );
}
