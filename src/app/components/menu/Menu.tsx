"use client"

import { MenuItem, ToOffice } from "@/app/types/utils";
import styles from "./menu.module.css";
import { useEffect, useRef, useState } from "react";
import { MenuOption } from "./MenuOption";
import { useMatterportContext } from "@/app/hooks/UseMatterportContext";

export const Menu = () => {
    const { sdk } = useMatterportContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
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

    const filteredItems = menuItemsData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getItems = () => {
        return filteredItems.map((item, i) => (
            <MenuOption key={item.title + i} item={item} />
        ));
    };

    const toggleMenu = () => {
        if(menuRef.current){
            menuRef.current.style.transform = isOpen ? 'translateY(-83%)' : 'translateY(0%)';
            setIsOpen(!isOpen);
        }
    }

    useEffect(() => {
        if(sdk && menuRef.current){
            sdk.App.state.subscribe((state) => {
                if(state.phase === sdk.App.Phase.PLAYING){
                    menuRef.current.style.display = 'flex';
                    toggleMenu();
                } else {
                    menuRef.current.style.display = 'none';
                }
            })
        }
    }, [menuRef, sdk])

    return (
        <div ref={menuRef} className={styles.menu}>
            <div className={styles.menuContainer}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchBar}
                />
                { getItems() }
                <div className={styles.hideBar} onClick={() => toggleMenu()}>
                    <img className={isOpen ? styles.up : ''} src="/Arrow.svg" alt=""/>
                </div>
            </div>
        </div>
    );
};