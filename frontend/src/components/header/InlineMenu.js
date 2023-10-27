import * as React from 'react';

import HeaderButton from './HeaderButton';
import SearchBar from './SearchBar';

export default function InlineMenu (props)
{
    return (
        <div className="hidden md:flex w-auto flex-row flex-auto items-stretch justify-items-stretch gap-4">
            <HeaderButton to="create">new</HeaderButton>
            <HeaderButton to="starred">starred</HeaderButton>
            <SearchBar/>
        </div>
    )
}