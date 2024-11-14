import type { ReactNode } from "react";
import styles from "./styles.module.scss";

export default function Layout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <div className={styles.container}>
      <main>{children}</main>
    </div>
  );
}
