"use client";

import styles from "./menu.module.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { MenuOption } from "./MenuOption";
import { useMatterportContext } from "@/app/components/matterport/hooks/useMatterportContext";
import { menuItemsData } from "@/app/utils/data";

export const Menu = () => {
    const { sdk } = useMatterportContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const filteredItems = menuItemsData.filter(({ title }) =>
        title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMenu = useCallback(() => {
        if (menuRef.current) {
            menuRef.current.style.transform = isOpen ? "translateY(-83%)" : "translateY(0%)";
            setIsOpen((prev) => !prev);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!sdk || !menuRef.current) return;

        const handleAppState = (state: { phase: string }) => {
            const menuElement = menuRef.current!;
            if (state.phase === sdk.App.Phase.PLAYING) {
                menuElement.style.display = "flex";
                toggleMenu();
            } else {
                menuElement.style.display = "none";
            }
        };

        const subscription = sdk.App.state.subscribe(handleAppState);
        
        return () => {
            subscription.cancel();
        };
    }, [sdk, menuRef.current]);

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
                {filteredItems.map((item) => (
                    <MenuOption key={item.title} item={item} />
                ))}
                <div className={styles.hideBar} onClick={toggleMenu}>
                    <img className={isOpen ? styles.up : ""} src="/Arrow.svg" alt="Toggle menu" />
                </div>
            </div>
        </div>
    );
};
