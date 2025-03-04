"use client"
import { useEffect, useState } from "react";
import styles from "./menu.module.css";
import { useMatterportContext } from "@/app/hooks/UseMatterportContext";

export const Menu = () => {
    const {teleportToOffice, navigateToOffice} = useMatterportContext();

    return (
        <div className={styles.menuContainer}>
            <div className={styles.menuOption} onClick={() => teleportToOffice()}>Teleport to Office</div>
            <div className={styles.menuOption} onClick={() => navigateToOffice()}>Navigate to Office</div>
        </div>
    );
};