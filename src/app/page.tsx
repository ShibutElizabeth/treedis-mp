import MatterportOverlay from "@/app/components/matterport/MatterportOverlay";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <MatterportOverlay />
    </main>
  );
}
