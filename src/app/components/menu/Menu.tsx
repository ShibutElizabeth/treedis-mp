"use client"

import { MenuItem, ToOffice } from "@/app/types/utils";
import styles from "./menu.module.css";
import { JSX } from "react";
import { MenuOption } from "./MenuOption";

export const Menu = () => {
    const menuItemsData: MenuItem[] = [
        {
            title: 'Teleport to office',
            walkingStyle: ToOffice.TELEPORT
        },
        {
            title: 'Navigate to office',
            walkingStyle: ToOffice.NAVIGATE
        }
    ];

    const getItems = () => {
        const menuItems: JSX.Element[] = [];
        menuItemsData.forEach((item, i) => {
            menuItems.push(
                <MenuOption key={item.title + i} item={item} />
            )
        });

        return menuItems;
    }

    return (
        <div className={styles.menuContainer}>
            { getItems() }
        </div>
    );
};