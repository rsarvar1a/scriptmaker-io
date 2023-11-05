import * as React from "react";

import Branding from './Branding.js';
import HeaderSocial from './HeaderSocial.js';
import BurgerMenu from './BurgerMenu.js';
import InlineMenu from './InlineMenu.js';

import discord from "./discord.svg";
import github from "./github.svg";
import paypal from "./paypal.svg";

export default function Header (props)
{
    return (
        <div className="h-[5vh] md:h-14 p-2 gap-4 flex flex-row items-stretch justify-items-stretch border-b-2 border-slate-500 text-slate-100 bg-slate-950">
            <div className="w-auto md:w-1/3 flex-initial md:flex-shrink flex flex-row items-center justify-items-start gap-4">
                <InlineMenu/>
                <BurgerMenu/>
            </div>
            <div className="self-end justify-self-end w-auto flex-1 flex flex-row-reverse items-center justify-items-end gap-4 pr-2">
                <Branding />
                <HeaderSocial to="https://discord.gg/botc" logo={discord}/>
                <HeaderSocial to="https://github.com/rsarvar1a/scriptmaker-io" logo={github}/>
                <HeaderSocial to="https://www.paypal.com/donate/?business=HGE39H9AP9NRJ&no_recurring=0&item_name=Thank+you+for+helping+me+with+hosting+costs%21&currency_code=CAD" logo={paypal}/>
            </div>
        </div>
    )
}