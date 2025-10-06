'use client';

import {createNavigation} from 'next-intl/navigation';
import routing from '@/../next-intl.config';

const navigation = createNavigation(routing);

export const {Link, redirect, usePathname, useRouter, getPathname} = navigation;
export const {locales, localePrefix, pathnames} = routing;
