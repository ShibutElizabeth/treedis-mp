"use client"

import { MenuItem } from "@/app/types/utils";
import styles from "./menu.module.css";
import { useMatterportContext } from "@/app/hooks/useMatterportContext";

export const MenuOption = ({item} : {item: MenuItem}) => {
    const { toOffice } = useMatterportContext();

    return (
        <div
            className={styles.menuOption}
            onClick={() => toOffice(item.walkingStyle)}>
            {item.title}
        </div>
    );
};